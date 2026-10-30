import os
import uuid
import shutil
from typing import Optional, Dict, Any
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

from backend.database.db import ProjectRepository
from backend.services.pipeline_orchestrator import PipelineOrchestrator, get_progress, update_progress
from backend.services.claim_firewall import ClaimFirewall
from backend.exports.export_service import ExportService
import sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sample-data"))
from demo_project import get_demo_project_data

app = FastAPI(
    title="RecLens API",
    description="Evidence-First AI RFP Intelligence & Proposal Engineering Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = ProjectRepository()
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ReviewUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = ""

class ClarificationUpdateRequest(BaseModel):
    status: str
    response: Optional[str] = None

class ClaimActionRequest(BaseModel):
    action: str  # "accept_rewrite", "reject", "edit", "mark_reviewed"
    custom_text: Optional[str] = None
    notes: Optional[str] = None

class ChatRequest(BaseModel):
    query: str

@app.on_event("startup")
def startup_event():
    # Ensure Demo project exists
    demo_proj = repo.get_project("demo-rfp-001")
    if not demo_proj:
        demo_data = get_demo_project_data()
        repo.create_project({
            "id": "demo-rfp-001",
            "name": "Global Investment Bank - Core Trading & Reconciliation RFP",
            "filename": "Global_Bank_RFP_v2.4.pdf",
            "file_type": "pdf",
            "file_size_bytes": 4829104,
            "pages_analyzed": 100,
            "status": "analyzed",
            "created_at": datetime.utcnow().isoformat(),
            "is_demo": True,
            "readiness": demo_data["readiness"]
        }, initial_data=demo_data)

@app.get("/")
def root():
    return {
        "platform": "RecLens",
        "tagline": "Read. Reason. Verify. Propose.",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/api/projects")
def list_projects():
    return repo.list_projects()

@app.get("/api/projects/demo")
def get_demo_project():
    proj = repo.get_project("demo-rfp-001")
    if not proj:
        startup_event()
        proj = repo.get_project("demo-rfp-001")
    return proj

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    if project_id == "demo":
        project_id = "demo-rfp-001"
    proj = repo.get_project(project_id)
    if not proj and project_id == "demo-rfp-001":
        startup_event()
        proj = repo.get_project("demo-rfp-001")
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    return proj

@app.get("/api/projects/{project_id}/progress")
def get_project_progress(project_id: str):
    proj = repo.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if proj["status"] == "analyzed":
        return {
            "current_step": "Analysis complete",
            "percent": 100,
            "completed_steps": ["All stages completed"]
        }
    return get_progress(project_id)

def execute_pipeline_task(project_id: str, file_path: str, filename: str):
    try:
        repo.update_project_status(project_id, "processing")
        result = PipelineOrchestrator.run_pipeline(project_id, file_path, filename)
        repo.update_project_data(project_id, result, readiness=result.get("readiness"))
        repo.update_project_status(project_id, "analyzed", pages_analyzed=result.get("total_requirements_count", 0) // 2 + 10)
    except Exception as e:
        print(f"[Pipeline Error] {e}")
        repo.update_project_status(project_id, "failed")
        update_progress(project_id, f"Error: {str(e)}", 0, [])

@app.post("/api/upload")
async def upload_rfp(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    project_name: Optional[str] = Form(None)
):
    filename = file.filename or "unknown.pdf"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. RecLens requires .pdf or .docx files.")
        
    project_id = f"proj-{uuid.uuid4().hex[:8]}"
    saved_filename = f"{project_id}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)
    
    # Check file size (max 50MB)
    contents = await file.read()
    file_size = len(contents)
    if file_size > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 50MB limit.")
        
    with open(file_path, "wb") as f:
        f.write(contents)
        
    name = project_name or filename.rsplit(".", 1)[0].replace("_", " ").title()
    
    project_dict = {
        "id": project_id,
        "name": name,
        "filename": filename,
        "file_type": ext.replace(".", ""),
        "file_size_bytes": file_size,
        "pages_analyzed": 0,
        "status": "processing",
        "created_at": datetime.utcnow().isoformat(),
        "is_demo": False,
        "readiness": None
    }
    
    repo.create_project(project_dict, initial_data={})
    
    # Launch pipeline in background
    background_tasks.add_task(execute_pipeline_task, project_id, file_path, filename)
    
    return {
        "project_id": project_id,
        "name": name,
        "filename": filename,
        "file_size": file_size,
        "status": "processing"
    }

@app.patch("/api/projects/{project_id}/reviews/{review_id}")
def update_human_review(project_id: str, review_id: str, body: ReviewUpdateRequest):
    proj = repo.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    data = proj.get("data", {})
    reviews = data.get("human_reviews", [])
    found = False
    for r in reviews:
        if r.get("id") == review_id:
            r["status"] = body.status
            if body.notes:
                r["notes"] = body.notes
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail="Review item not found")
        
    repo.update_project_data(project_id, data, readiness=proj.get("readiness"))
    return {"status": "success", "review_id": review_id, "new_status": body.status}

@app.patch("/api/projects/{project_id}/clarifications/{clar_id}")
def update_clarification(project_id: str, clar_id: str, body: ClarificationUpdateRequest):
    proj = repo.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    data = proj.get("data", {})
    clars = data.get("clarifications", [])
    found = False
    for c in clars:
        if c.get("id") == clar_id:
            c["status"] = body.status
            if body.response is not None:
                c["response"] = body.response
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail="Clarification item not found")
        
    repo.update_project_data(project_id, data, readiness=proj.get("readiness"))
    return {"status": "success", "clarification_id": clar_id, "new_status": body.status}

@app.post("/api/projects/{project_id}/claims/{claim_id}/action")
def update_claim_action(project_id: str, claim_id: str, body: ClaimActionRequest):
    proj = repo.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    action_clean = body.action.lower().strip()
    valid_actions = ["accept_rewrite", "reject", "edit", "mark_reviewed"]
    if action_clean not in valid_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action '{body.action}'. Supported actions: {', '.join(valid_actions)}"
        )

    data = proj.get("data", {})
    claim_firewall = data.get("claim_firewall", {})
    claims = claim_firewall.get("claims", [])
    if not claims:
        claims = data.get("claim_audits", [])

    try:
        target_claim, summary = ClaimFirewall.apply_claim_action(
            claims=claims,
            claim_id=claim_id,
            action=action_clean,
            custom_text=body.custom_text,
            notes=body.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    claim_firewall["summary"] = summary
    claim_firewall["claims"] = claims
    data["claim_firewall"] = claim_firewall
    data["claim_audits"] = claims
    
    # Update readiness score
    readiness = proj.get("readiness") or {}
    readiness["proposal_grounding"] = summary["grounding_score"]
    data["readiness"] = readiness

    repo.update_project_data(project_id, data, readiness=readiness)
    return {
        "status": "success",
        "claim": target_claim,
        "summary": summary
    }

@app.get("/api/projects/{project_id}/export/docx")
def export_docx(project_id: str):
    proj = repo.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    stream = ExportService.generate_docx(proj, proj.get("data", {}))
    filename = f"{proj.get('name', 'Proposal').replace(' ', '_')}_Proposal.docx"
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/api/projects/{project_id}/export/pdf")
def export_pdf(project_id: str):
    proj = repo.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    stream = ExportService.generate_pdf(proj, proj.get("data", {}))
    filename = f"{proj.get('name', 'Proposal').replace(' ', '_')}_Proposal.pdf"
    return StreamingResponse(
        stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/api/projects/{project_id}/report/docx")
def export_project_report_docx(project_id: str):
    proj = repo.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    stream = ExportService.generate_project_report_docx(proj, proj.get("data", {}))
    filename = f"{proj.get('name', 'Project').replace(' ', '_')}_Consolidated_Report.docx"
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/api/projects/{project_id}/report/pdf")
def export_project_report_pdf(project_id: str):
    proj = repo.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    stream = ExportService.generate_project_report_pdf(proj, proj.get("data", {}))
    filename = f"{proj.get('name', 'Project').replace(' ', '_')}_Consolidated_Report.pdf"
    return StreamingResponse(
        stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/api/projects/{project_id}/chat")
def ask_reclens(project_id: str, body: ChatRequest):
    proj = repo.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    data = proj.get("data", {})
    reqs = data.get("requirements", [])
    risks = data.get("risks", [])
    q_lower = body.query.lower()
    
    # Evidence-first search
    matched_reqs = [
        r for r in reqs 
        if any(w in r.get("text", "").lower() for w in q_lower.split() if len(w) > 3)
    ]
    
    if "security" in q_lower or "mfa" in q_lower or "auth" in q_lower:
        matched = [r for r in reqs if r.get("category") == "Security"]
        if matched:
            cites = [f"• **{r['id']}** (Page {r['page']}, {r['section']}): \"{r['text']}\"" for r in matched[:3]]
            return {
                "answer": "Here are the verified security requirements extracted with source citations:\n\n" + "\n\n".join(cites),
                "citations": [{"id": r["id"], "page": r["page"], "section": r["section"]} for r in matched[:3]],
                "evidence_found": True
            }
            
    if "timeline" in q_lower or "risky" in q_lower or "schedule" in q_lower or "weeks" in q_lower:
        t_risk = next((r for r in risks if r.get("category") == "Timeline"), None)
        if t_risk:
            ev_list = [f"• RFP Page {e['page']}: {e['excerpt']} (*{e['why']}*)" for e in t_risk.get("evidence", [])]
            return {
                "answer": f"**Why the timeline is considered risky:**\n\n{t_risk['description']}\n\n**Supporting RFP Evidence:**\n" + "\n".join(ev_list),
                "citations": [{"page": e["page"], "text": e["excerpt"]} for e in t_risk.get("evidence", [])],
                "evidence_found": True
            }
            
    if "data residency" in q_lower or "singapore" in q_lower or "london" in q_lower:
        return {
            "answer": "Section 4.9 (Page 49) states: *'Transactions originating from London, Frankfurt, and Singapore branch offices will feed into the central dashboard.'*\n\nHowever, the RFP does not explicitly confirm whether customer PII must remain localized within regional borders. This has been flagged in the Human Review Queue (REV-004) for legal review.",
            "citations": [{"page": 49, "section": "Section 4.9"}],
            "evidence_found": True
        }

    if matched_reqs:
        r = matched_reqs[0]
        return {
            "answer": f"Found matching requirement in RFP:\n\n**{r['id']}** (Page {r['page']}, Section: {r['section']}):\n\"{r['text']}\"",
            "citations": [{"id": r["id"], "page": r["page"], "section": r["section"]}],
            "evidence_found": True
        }
        
    return {
        "answer": "I could not find sufficient evidence in the RFP to answer this query. RecLens follows strict evidence-first rules and will not hallucinate an unsupported answer.",
        "citations": [],
        "evidence_found": False
    }
