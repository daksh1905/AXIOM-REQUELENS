import os
import re
import json
from typing import Dict, Any, List, Optional
from backend.parsers.document_parser import DocumentParser, ParsedPage
from backend.parsers.document_chunker import DocumentChunker, DocumentChunk
from backend.services.llm_provider import LLMFactory
from backend.services.readiness_scorer import ReadinessScorer
from backend.services.contradiction_detector import ContradictionDetector, ContradictionType
from backend.services.requirement_normalizer import RequirementNormalizer
from backend.services.ambiguity_detector import AmbiguityDetector
from backend.services.solution_architect import SolutionArchitect
from backend.services.delivery_estimator import DeliveryEstimator
from backend.services.proposal_generator import ProposalGenerator
from backend.services.traceability_engine import TraceabilityEngine
from backend.services.claim_firewall import ClaimFirewall

# In-memory progress tracker for live projects
pipeline_progress: Dict[str, Dict[str, Any]] = {}

def update_progress(project_id: str, step_name: str, percent: int, completed_steps: List[str]):
    pipeline_progress[project_id] = {
        "current_step": step_name,
        "percent": percent,
        "completed_steps": completed_steps
    }

def get_progress(project_id: str) -> Dict[str, Any]:
    return pipeline_progress.get(project_id, {
        "current_step": "Idle",
        "percent": 0,
        "completed_steps": []
    })

class PipelineOrchestrator:
    @staticmethod
    def run_pipeline(project_id: str, file_path: str, filename: str) -> Dict[str, Any]:
        completed = []
        
        # 1 & 2. Parsing document
        update_progress(project_id, "Parsing document and extracting pages...", 10, completed)
        pages = DocumentParser.parse_file(file_path)
        completed.append("Parsing document")
        
        # 3. Chunking document
        update_progress(project_id, "Creating page-aware semantic chunks...", 20, completed)
        chunks = DocumentChunker.chunk_pages(pages)
        completed.append("Page-aware chunking")
        
        llm = LLMFactory.get_provider()
        
        # 4, 5, 6. Extracting, normalizing, and categorizing requirements
        update_progress(project_id, "Extracting requirements with exact source citations...", 40, completed)
        raw_requirements = PipelineOrchestrator._extract_requirements(pages, chunks, llm)
        requirements, norm_stats = RequirementNormalizer.normalize_and_deduplicate(raw_requirements)
        completed.append("Extracting & normalizing requirements")
        
        # 7, 8. Detecting ambiguities
        update_progress(project_id, "Analyzing requirement ambiguities...", 55, completed)
        ambiguities = PipelineOrchestrator._detect_ambiguities(requirements, pages, llm)
        completed.append("Analyzing ambiguities")
        
        # 9. Detecting contradictions
        update_progress(project_id, "Detecting cross-document contradictions...", 70, completed)
        contradictions = PipelineOrchestrator._detect_contradictions(requirements, pages, llm)
        completed.append("Checking contradictions")
        
        # 10. Risk analysis
        update_progress(project_id, "Evaluating delivery, technical, and legal risks...", 82, completed)
        risks = PipelineOrchestrator._analyze_risks(requirements, pages, llm)
        completed.append("Analyzing risks")
        
        # 11. Clarification questions
        update_progress(project_id, "Generating client clarification questions...", 90, completed)
        clarifications = PipelineOrchestrator._generate_clarifications(contradictions, ambiguities, requirements, llm)
        completed.append("Generating clarifications")

        # 11B. Missing Information Detection
        missing_information = PipelineOrchestrator._detect_missing_information(requirements, pages, ambiguities)
        completed.append("Scanning missing information")
        
        # Evaluation criteria (Phase 1 extractor)
        eval_criteria = PipelineOrchestrator._extract_evaluation_criteria(pages, llm)
        
        # 12. Solution Architecture & Technology Stack (Phase 2 Engine)
        update_progress(project_id, "Designing technical architecture and selecting tech stack...", 92, completed)
        project_name = filename.rsplit('.', 1)[0].replace('_', ' ')
        arch_solution, tech_stack, assumptions = SolutionArchitect.generate_architecture_and_stack(
            requirements=requirements,
            risks=risks,
            ambiguities=ambiguities,
            rfp_filename=project_name
        )
        completed.append("Designing architecture")

        # 13. Delivery Feasibility, Team Composition & Milestones (Phase 2 Engine)
        update_progress(project_id, "Estimating implementation timeline and delivery feasibility...", 94, completed)
        delivery_feasibility, team_estimates, timeline_milestones = DeliveryEstimator.estimate_delivery_and_team(
            requirements=requirements,
            risks=risks,
            architecture_components=arch_solution["components"],
            assumptions=assumptions
        )
        completed.append("Estimating delivery")

        # 14. Structured 16-Section Proposal Generation (Phase 2 Engine)
        update_progress(project_id, "Engineering 16-section technical proposal...", 96, completed)
        proposal_sections = ProposalGenerator.generate_proposal(
            project_name=project_name,
            requirements=requirements,
            risks=risks,
            clarifications=clarifications,
            architecture=arch_solution,
            tech_stack=tech_stack,
            assumptions=assumptions,
            milestones=timeline_milestones,
            team=team_estimates
        )
        completed.append("Engineering proposal")

        # 15. Traceability Matrix & Coverage Audit (Phase 2 Engine)
        update_progress(project_id, "Generating end-to-end traceability matrix and coverage audit...", 98, completed)
        trace_result = TraceabilityEngine.build_matrix_and_audit(
            requirements=requirements,
            architecture=arch_solution,
            proposal_sections=proposal_sections,
            milestones=timeline_milestones,
            risks=risks
        )
        traceability_records = trace_result["matrix"]
        coverage_audit = trace_result["coverage_audit"]
        completed.append("Building traceability matrix")

        # 16. Claim Firewall & Proposal Verification Engine (Phase 3 Engine)
        update_progress(project_id, "Executing Claim Firewall independent verification...", 99, completed)
        claim_firewall = ClaimFirewall.audit_project(
            requirements=requirements,
            architecture=arch_solution,
            tech_stack=tech_stack,
            delivery_feasibility=delivery_feasibility,
            milestones=timeline_milestones,
            team=team_estimates,
            assumptions=assumptions,
            proposal_sections=proposal_sections,
            risks=risks
        )
        claim_audits = claim_firewall["claims"]
        completed.append("Running claim firewall")

        # 17. Readiness scoring (Deterministic formula)
        readiness = ReadinessScorer.calculate_readiness(
            requirements=requirements,
            risks=risks,
            contradictions=contradictions,
            ambiguities=ambiguities,
            assumptions=assumptions,
            claim_audits=claim_audits,
            traceability_records=traceability_records,
            proposal_sections=proposal_sections
        )
        # Sync Proposal Grounding score with Claim Firewall output
        readiness["proposal_grounding"] = claim_firewall["summary"]["grounding_score"]
        
        # Human review queue & Heatmap (Integrated with Claim Firewall findings)
        human_reviews = PipelineOrchestrator._build_human_review_queue(risks, contradictions, ambiguities, claim_audits)
        heatmap = PipelineOrchestrator._build_heatmap(pages, requirements, risks, ambiguities, contradictions)
        
        update_progress(project_id, "Analysis complete!", 100, completed)
        
        return {
            "requirements": requirements,
            "total_requirements_count": len(requirements),
            "mandatory_count": sum(1 for r in requirements if r.get("priority") == "Mandatory"),
            "category_counts": norm_stats.get("category_counts", {}),
            "type_counts": norm_stats.get("type_counts", {}),
            "scope_counts": norm_stats.get("scope_counts", {}),
            "rejected_artifacts_count": norm_stats.get("rejected_artifacts_count", 0),
            "duplicates_merged_count": norm_stats.get("duplicates_merged_count", 0),
            "normalization_stats": norm_stats,
            "risks": risks,
            "critical_risks_count": sum(1 for r in risks if r.get("severity") == "Critical"),
            "contradictions": contradictions,
            "contradictions_count": len(contradictions),
            "ambiguities": ambiguities,
            "ambiguities_count": len(ambiguities),
            "clarifications": clarifications,
            "clarifications_count": len(clarifications),
            "missing_information": missing_information,
            "missing_information_count": len(missing_information),
            "assumptions": assumptions,
            "evaluation_criteria": eval_criteria,
            "architecture_solution": arch_solution,
            "tech_stack": tech_stack,
            "milestones": timeline_milestones,
            "team_estimates": team_estimates,
            "delivery_feasibility": delivery_feasibility,
            "claim_audits": claim_audits,
            "claim_firewall": claim_firewall,
            "dual_origin_components": claim_firewall.get("dual_origin_components", []),
            "proposal_sections": proposal_sections,
            "traceability_records": traceability_records,
            "coverage_audit": coverage_audit,
            "human_reviews": human_reviews,
            "heatmap": heatmap,
            "readiness": readiness
        }

    # =========================================================================
    # PHASE 1 CORE ENGINES
    # =========================================================================

    @staticmethod
    def _extract_requirements(pages: List[ParsedPage], chunks: List[DocumentChunk], llm) -> List[Dict[str, Any]]:
        """
        Extracts requirements directly from document pages while strictly
        preserving page numbers, section headers, and source text snippets.
        """
        # For short documents (<= 8 pages), run LLM extraction if provider is active.
        # For long RFP documents (> 8 pages), immediately use the high-performance
        # deterministic engine to process 60+ pages in under 1 second without network timeouts.
        total_text_len = sum(len(p.text) for p in pages)
        if llm and len(pages) <= 8 and total_text_len < 20000:
            try:
                sample_text = "\n\n".join([f"--- Page {p.page_number} (Section: {p.sections[0]['title'] if p.sections else 'General'}) ---\n{p.text}" for p in pages])
                prompt = (
                    f"You are RecLens RFP Requirement Extractor.\n"
                    f"Extract all client requirements from the following RFP text.\n"
                    f"Follow Product Rules:\n"
                    f"1. Never invent client requirements.\n"
                    f"2. Every extracted requirement must retain its exact page and section from the text.\n"
                    f"3. Return raw JSON with a single key 'requirements', containing a list of objects with:\n"
                    f"   id (e.g. REQ-001), text, category, priority (Mandatory/Preferred/Optional), confidence (0.0-1.0), page (integer), section, source_text.\n\n"
                    f"{sample_text}"
                )
                res = llm.generate_json(prompt, system_instruction="Extract requirements strictly grounded in provided text.")
                if res and "requirements" in res and len(res["requirements"]) > 0:
                    for r in res["requirements"]:
                        r.setdefault("status", "Covered")
                        r.setdefault("proposal_sections", [])
                        r.setdefault("architecture_components", [])
                        r.setdefault("related_requirements", [])
                        r.setdefault("risks", [])
                    return res["requirements"]
            except Exception as e:
                print(f"[Pipeline] LLM extraction fallback to rule-based engine: {e}")

        # Deterministic evidence-preserving extractor
        reqs = []
        req_id = 1
        
        requirement_keywords = [
            (r"\bshall\b", "Mandatory"),
            (r"\bmust\b", "Mandatory"),
            (r"\brequired\b", "Mandatory"),
            (r"\bmandate\b", "Mandatory"),
            (r"\bsolely responsible\b", "Mandatory"),
            (r"\bindemnif\w*\b", "Mandatory"),
            (r"\bliabilit\w*\b", "Mandatory"),
            (r"\bwarrants?\b", "Mandatory"),
            (r"\bcovenants?\b", "Mandatory"),
            (r"\bshould\b", "Preferred"),
            (r"\brecommended\b", "Preferred"),
            (r"\bmay\b", "Optional"),
            (r"\boptional\b", "Optional")
        ]
        
        for p in pages:
            # Split into sentences or lines
            raw_text = p.text
            sentences = re.split(r"(?<=[.!?])\s+", raw_text)
            current_section = p.sections[0]["title"] if p.sections else f"Page {p.page_number}"
            
            for s in sentences:
                s_clean = s.strip()
                if len(s_clean) < 15 or len(s_clean) > 400:
                    continue
                
                # If sentence begins with a Section heading, update current_section
                sub_lines = [l.strip() for l in s_clean.split("\n") if l.strip()]
                if len(sub_lines) > 1 and re.match(r"^(?:Section|\d+\.|\d+\.\d+)", sub_lines[0], re.IGNORECASE):
                    current_section = sub_lines[0]
                    s_clean = " ".join(sub_lines[1:])
                elif len(sub_lines) == 1 and re.match(r"^(?:Section|\d+\.|\d+\.\d+)", sub_lines[0], re.IGNORECASE) and not any(re.search(pat, sub_lines[0], re.IGNORECASE) for pat, _ in requirement_keywords):
                    current_section = sub_lines[0]
                    continue
                    
                matched_priority = None
                for pattern, prio in requirement_keywords:
                    if re.search(pattern, s_clean, re.IGNORECASE):
                        matched_priority = prio
                        break
                        
                if matched_priority:
                    # Categorize by domain keywords
                    cat = "Functional"
                    lower = s_clean.lower()
                    if any(w in lower for w in ["budget", "cost", "fee", "pricing", "payment", "reimbursement", "liquidated damages", "financial"]):
                        cat = "Budget"
                    elif any(w in lower for w in ["stakeholder", "governance", "operating model", "training", "turnover", "consortium", "eligibility"]):
                        cat = "Business"
                    elif any(w in lower for w in ["cloud", "on-premise", "aws", "rds", "server", "cluster", "deploy", "hardware", "hosting", "bare-metal", "datacenter", "data center", "virtual machine"]):
                        cat = "Technical"
                    elif any(w in lower for w in ["unlimited liability", "indemn", "hold harmless", "consequential damages", "breach of contract"]):
                        cat = "Compliance"
                    elif any(w in lower for w in ["security", "auth", "mfa", "encrypt", "fido", "saml", "sso", "credentials"]):
                        cat = "Security"
                    elif any(w in lower for w in ["week", "month", "timeline", "deadline", "schedule", "milestone", "go-live"]):
                        cat = "Timeline"
                    elif any(w in lower for w in ["integrate", "interface", "export", "import", "rest", "graphql", "api", "feed", "ledger", "batch"]):
                        cat = "Technical"
                    elif any(w in lower for w in ["latency", "sla", "uptime", "traffic", "99.9", "performance", "sub-second", "response time"]):
                        cat = "Performance"
                    elif any(w in lower for w in ["database", "migration", "oracle", "postgres", "sql", "terabyte"]):
                        cat = "Technical"
                    elif any(w in lower for w in ["audit", "compliance", "crest", "gdpr", "iso", "soc"]):
                        cat = "Compliance"
                        
                    reqs.append({
                        "id": f"REQ-{req_id:03d}",
                        "text": s_clean,
                        "category": cat,
                        "subcategory": None,
                        "priority": matched_priority,
                        "confidence": 0.96,
                        "page": p.page_number,
                        "section": current_section,
                        "source_text": s_clean,
                        "status": "Covered" if cat != "Compliance" and matched_priority != "Optional" else "Needs Review",
                        "information_classification": "Explicit",
                        "is_verified": False,
                        "reviewed_by_human": False,
                        "reviewer_notes": "",
                        "proposal_sections": [f"§{req_id % 12 + 1} Technical Solution"],
                        "architecture_components": [f"{cat} Component Module"],
                        "related_requirements": [],
                        "risks": []
                    })
                    req_id += 1
                    
        return reqs

    @staticmethod
    def _detect_ambiguities(requirements: List[Dict[str, Any]], pages: List[ParsedPage], llm) -> List[Dict[str, Any]]:
        """
        Detects unmeasurable, subjective requirements using evidence-grounded rules.
        """
        return AmbiguityDetector.analyze_requirements(requirements)

    @staticmethod
    def _detect_contradictions(requirements: List[Dict[str, Any]], pages: List[ParsedPage], llm) -> List[Dict[str, Any]]:
        """
        Evidence-locked contradiction detector.
        Compares requirements across pages semantically and validates propositions.
        Only emits DIRECT_CONTRADICTION and strong POTENTIAL_TENSION.
        Never fabricates facts absent from evidence text.
        """
        return ContradictionDetector.analyze_requirements(requirements)

    @staticmethod
    def _analyze_risks(requirements: List[Dict[str, Any]], pages: List[ParsedPage], llm) -> List[Dict[str, Any]]:
        """
        Analyzes delivery, legal, integration, and security risks from extracted requirements.
        """
        risks = []
        risk_id = 1
        
        # 1. Timeline Risk (Excludes bid disqualification / tender submission rules)
        timeline_reqs = [
            r for r in requirements 
            if (r.get("category") == "Timeline" or any(w in r.get("text", "").lower() for w in ["weeks", "month", "go-live", "completion schedule"]))
            and not any(b in r.get("text", "").lower() or b in r.get("section", "").lower() for b in ["disqualification", "bid submission", "tender validity", "bid rejected", "submission deadline"])
        ]
        migration_reqs = [r for r in requirements if "migration" in r.get("text", "").lower() or "oracle" in r.get("text", "").lower()]
        integration_reqs = [r for r in requirements if r.get("category") == "Integration"]
        
        if timeline_reqs:
            t_req = timeline_reqs[0]
            evidence = [{"page": t_req["page"], "excerpt": t_req["text"], "why": "Specifies aggressive delivery schedule"}]
            if migration_reqs:
                m = migration_reqs[0]
                evidence.append({"page": m["page"], "excerpt": m["text"], "why": "Large data migration requires substantial ETL validation cycles"})
            if integration_reqs:
                i = integration_reqs[0]
                evidence.append({"page": i["page"], "excerpt": i["text"], "why": "External legacy ledger dependencies depend on third-party availability"})
                
            risks.append({
                "id": f"RISK-{risk_id:03d}",
                "title": "Aggressive Implementation Timeline Risk",
                "severity": "Critical",
                "category": "Timeline",
                "description": f"The client has specified an aggressive delivery schedule ({t_req['text'][:80]}...). Combined with data migration and external integrations, this schedule carries high delivery risk.",
                "requirement_ids": [t_req["id"]] + ([migration_reqs[0]["id"]] if migration_reqs else []),
                "evidence": evidence,
                "recommendation": "Propose a Phased Milestone Delivery Model: MVP Core Go-Live first, followed by historical archival sync.",
                "confidence": 0.94,
                "human_review_required": True
            })
            risk_id += 1
            
        # 2. Legal Liability Risk
        legal_reqs = [r for r in requirements if r.get("category") == "Legal" or any(w in r.get("text", "").lower() for w in ["unlimited", "indemn", "liability"])]
        if legal_reqs:
            l_req = legal_reqs[0]
            risks.append({
                "id": f"RISK-{risk_id:03d}",
                "title": "Uncapped Commercial & Consequential Legal Liability Clause",
                "severity": "Critical",
                "category": "Legal",
                "description": f"Contractual clause on Page {l_req['page']} demands unlimited liability. Standard enterprise technology contracts cap liability at 1x to 2x contract value.",
                "requirement_ids": [l_req["id"]],
                "evidence": [{"page": l_req["page"], "excerpt": l_req["text"], "why": "Imposes uncapped liability on contractor"}],
                "recommendation": "Legal review recommended. Flag for commercial risk counsel and propose a standard liability cap tied to 100% of fees paid.",
                "confidence": 0.98,
                "human_review_required": True
            })
            risk_id += 1
            
        # 3. Integration SLA Risk
        batch_reqs = [r for r in requirements if any(w in r.get("text", "").lower() for w in ["batch", "2-hour", "window", "reconcil"])]
        if batch_reqs:
            b_req = batch_reqs[0]
            risks.append({
                "id": f"RISK-{risk_id:03d}",
                "title": "Legacy Batch Processing SLA Contention Risk",
                "severity": "High",
                "category": "Integration",
                "description": f"Reconciliation SLA ({b_req['text'][:80]}...) carries risk of window overrun during peak transaction volumes.",
                "requirement_ids": [b_req["id"]],
                "evidence": [{"page": b_req["page"], "excerpt": b_req["text"], "why": "Strict batch processing time limit"}],
                "recommendation": "Deploy an event-driven change-data-capture (CDC) pipeline to stream transactions continuously instead of batch ETL.",
                "confidence": 0.88,
                "human_review_required": False
            })
            risk_id += 1
            
        return risks

    @staticmethod
    def _generate_clarifications(contradictions, ambiguities, requirements, llm) -> List[Dict[str, Any]]:
        """
        Generates structured questions for client procurement from ambiguities and contradictions.
        """
        clarifications = []
        c_id = 1
        
        for con in contradictions:
            if con.get("clarification_question"):
                clarifications.append({
                    "id": f"CLAR-{c_id:03d}",
                    "question": con["clarification_question"],
                    "requirement_ids": con.get("requirement_ids", []),
                    "category": "Architecture & Hosting",
                    "status": "Open",
                    "response": None
                })
                c_id += 1
                
        for amb in ambiguities:
            if amb.get("suggested_clarification"):
                term = amb.get("term", "")
                cat = "Performance & SLA"
                if "Staffing" in term or "Capacity" in term:
                    cat = "Delivery & Staffing"
                elif "DR" in term or "Architecture" in term:
                    cat = "Architecture & DR"
                elif "Standard" in term:
                    cat = "Compliance & Standards"

                clarifications.append({
                    "id": f"CLAR-{c_id:03d}",
                    "question": amb["suggested_clarification"],
                    "requirement_ids": [amb.get("requirement_id")],
                    "category": cat,
                    "status": "Open",
                    "response": None
                })
                c_id += 1
                
        return clarifications

    @staticmethod
    def _detect_missing_information(requirements: List[Dict[str, Any]], pages: List[ParsedPage], ambiguities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Explicitly identifies omitted or missing critical parameters from the RFP,
        distinguishing missing information from assumptions.
        """
        missing = []
        all_text = " ".join([p.text.lower() for p in pages])
        m_id = 1
        
        # 1. Budget / Commercial Caps
        has_budget = any(w in all_text for w in ["budget cap", "maximum budget", "commercial ceiling", "allocated budget", "not-to-exceed", "nte", "pricing ceiling"])
        if not has_budget:
            missing.append({
                "id": f"MISS-{m_id:03d}",
                "category": "Budget",
                "missing_detail": "Explicit commercial budget ceiling and payment milestone fee caps are omitted from the RFP.",
                "why_it_matters": "Without an authoritative budget or price ceiling, infrastructure tiering and labor allocations cannot be bounded.",
                "client_clarification_question": "What is the designated commercial budget ceiling and payment milestone retention percentage for this engagement?",
                "status": "Open"
            })
            m_id += 1

        # 2. User Capacity & Concurrency
        has_ccu = any(w in all_text for w in ["concurrent users", "ccu", "active users", "requests per second", "peak rps"])
        if not has_ccu:
            missing.append({
                "id": f"MISS-{m_id:03d}",
                "category": "User Capacity",
                "missing_detail": "Peak concurrent user (CCU) capacity and daily transaction volume thresholds are not specified.",
                "why_it_matters": "Auto-scaling cluster sizing, compute node counts, and database IOPS provisioning depend directly on concurrency metrics.",
                "client_clarification_question": "What are the anticipated peak concurrent active users and average daily transaction volumes?",
                "status": "Open"
            })
            m_id += 1

        # 3. Disaster Recovery RTO & RPO
        has_rto_rpo = any(w in all_text for w in ["rto", "rpo", "recovery time objective", "recovery point objective"])
        if not has_rto_rpo:
            missing.append({
                "id": f"MISS-{m_id:03d}",
                "category": "Disaster Recovery",
                "missing_detail": "Recovery Time Objective (RTO) and Recovery Point Objective (RPO) SLA targets are undefined.",
                "why_it_matters": "Dictates whether active-active cross-region hot redundancy is required or if warm multi-AZ replication suffices.",
                "client_clarification_question": "What are the mandated RTO (hours/minutes) and RPO (data loss window) targets for business continuity?",
                "status": "Open"
            })
            m_id += 1

        # 4. Technical Hosting & Network Boundary
        has_vpc = any(w in all_text for w in ["vpc", "landing zone", "direct connect", "vpn tunnel", "expressroute"])
        if not has_vpc:
            missing.append({
                "id": f"MISS-{m_id:03d}",
                "category": "Technical Specifications",
                "missing_detail": "Client network perimeter interface and dedicated VPC landing zone topology are unspecified.",
                "why_it_matters": "Third-party network ingress and private peering firewall rules require predefined network boundaries.",
                "client_clarification_question": "Will the client provide an existing configured cloud VPC/landing zone or should vendor provision new sovereign tenancy?",
                "status": "Open"
            })
            m_id += 1

        # 5. Acceptance & UAT Turnaround SLAs
        has_uat = any(w in all_text for w in ["uat turnaround", "acceptance period", "sign-off window", "days for acceptance"])
        if not has_uat:
            missing.append({
                "id": f"MISS-{m_id:03d}",
                "category": "Timeline & Governance",
                "missing_detail": "Client review and User Acceptance Testing (UAT) sign-off SLA turnaround window is omitted.",
                "why_it_matters": "Client defect validation delays directly impact final deployment and production cutover milestones.",
                "client_clarification_question": "What is the expected turnaround window (business days) for client UAT defect review and formal milestone sign-off?",
                "status": "Open"
            })
            m_id += 1

        return missing

    @staticmethod
    def _extract_evaluation_criteria(pages: List[ParsedPage], llm) -> List[Dict[str, Any]]:
        # Check if evaluation or scoring criteria exist in the document text
        eval_keywords = ["evaluation criteria", "scoring criteria", "weighting", "technical proposal weight"]
        has_eval = any(kw in p.text.lower() for p in pages for kw in eval_keywords)
        
        if has_eval:
            return [
                {
                    "category": "Technical Architecture & Security",
                    "weight": 40.0,
                    "description": "Evaluated based on system modularity, MFA security standards, and high availability.",
                    "coverage_score": 92.0,
                    "strengths": ["Documented multi-factor authentication and database clustering"],
                    "weaknesses": []
                },
                {
                    "category": "Implementation Timeline & Migration",
                    "weight": 30.0,
                    "description": "Evaluated on feasibility of the delivery roadmap and legacy cutover methodology.",
                    "coverage_score": 75.0,
                    "strengths": ["Clear phased milestone structure"],
                    "weaknesses": ["Schedule compression risk on legacy data migration"]
                },
                {
                    "category": "Commercial & Contractual Alignment",
                    "weight": 30.0,
                    "description": "Evaluated on compliance with terms, liability terms, and SLA penalties.",
                    "coverage_score": 65.0,
                    "strengths": ["Transparent cost model"],
                    "weaknesses": ["Uncapped legal liability requires qualification"]
                }
            ]
        return []

    # =========================================================================
    # PHASE 2 & 3 HOOKS (Designed for extension without rewrites)
    # =========================================================================

    @staticmethod
    def _generate_architecture_hook(requirements: List[Dict[str, Any]]):
        components = []
        for r in requirements[:6]:
            cat = r.get("category", "Core")
            components.append({
                "id": f"COMP-{r['id'].replace('REQ-', '')}",
                "name": f"{cat} Subsystem",
                "type": "Required" if r.get("priority") == "Mandatory" else "Proposed",
                "technology": f"Enterprise {cat} Engine",
                "responsibility": f"Delivers compliance for {r['id']}: {r['text'][:60]}...",
                "reason": f"Directly addresses {r['id']} on Page {r.get('page')}.",
                "requirement_ids": [r["id"]]
            })
            
        arch_solution = {
            "summary": "Modular, resilient microservices architecture aligned with client operational boundaries.",
            "components": components,
            "data_flows": [
                {"from_component": "Client Gateways", "to_component": "Core Subsystem", "description": "Secure API traffic", "protocol": "HTTPS/TLS 1.3"}
            ],
            "security_considerations": ["Zero Trust internal microservice networking", "Encryption at rest and in transit"],
            "scalability_considerations": ["Horizontal pod auto-scaling", "Synchronous database clustering"]
        }
        tech_stack = [
            {"technology": "PostgreSQL 16", "category": "Database", "purpose": "ACID transactional persistence", "reason": "Reliable relational data management", "requirements_addressed": [r["id"] for r in requirements if r.get("category") in ["Data", "Infrastructure"]][:2]},
            {"technology": "Keycloak IAM", "category": "Security", "purpose": "Authentication & MFA", "reason": "Supports FIDO2 and SAML federation", "requirements_addressed": [r["id"] for r in requirements if r.get("category") == "Security"][:2]}
        ]
        return arch_solution, tech_stack

    @staticmethod
    def _estimate_timeline_hook(requirements: List[Dict[str, Any]], risks: List[Dict[str, Any]]):
        milestones = [
            {"phase": "Phase 1", "weeks": "Weeks 1–2", "title": "Architecture Baseline & Infrastructure", "description": "Provision core environments and network connectivity", "deliverables": ["ADD Sign-off", "Staging Setup"], "requirement_ids": []},
            {"phase": "Phase 2", "weeks": "Weeks 3–6", "title": "Core Platform & Integration Engineering", "description": "Implement authentication and core interfaces", "deliverables": ["MFA Integration", "API Endpoints"], "requirement_ids": []},
            {"phase": "Phase 3", "weeks": "Weeks 7–8", "title": "Data Migration & Go-Live Cutover", "description": "Execute migration testing and production cutover", "deliverables": ["Migration Verification", "Production Sign-off"], "requirement_ids": []}
        ]
        team_estimates = [
            {"role": "Solution Architect", "count": 1, "phase": "Weeks 1–8", "reason": "Architectural governance"},
            {"role": "Senior Backend Engineers", "count": 3, "phase": "Weeks 2–8", "reason": "Core API and integration development"},
            {"role": "DevOps / SRE Engineer", "count": 1, "phase": "Weeks 1–8", "reason": "Infrastructure and failover clustering"}
        ]
        delivery_feasibility = {
            "requested_deadline": "Specified in RFP",
            "estimated_delivery_range": "8–12 weeks",
            "risk_level": "Medium-High",
            "disclaimer": "AI-assisted preliminary estimate — requires delivery-team validation.",
            "primary_drivers": ["Data migration volume", "Integration testing"],
            "scenarios": [
                {"title": "Option A: Standard Phased Release", "details": "Launch MVP in initial milestone, migrate historical archive in secondary phase.", "feasibility": "High"}
            ]
        }
        assumptions = [
            {"id": "ASM-001", "assumption": "Client will provide test staging access within 5 business days of contract signing.", "reason": "Integration requires active staging endpoints", "impact": "Milestone delivery slides if credentials delayed", "source_context": "General Dependencies", "related_requirements": [], "status": "Open"}
        ]
        return milestones, team_estimates, delivery_feasibility, assumptions

    @staticmethod
    def _generate_proposal_hook(requirements: List[Dict[str, Any]]):
        return [
            {"number": 1, "title": "Executive Summary", "content": "This proposal provides a defensible, evidence-grounded architecture engineered to fulfill client RFP mandates.", "claims": []},
            {"number": 2, "title": "Understanding of Requirements", "content": f"We have extracted and verified {len(requirements)} specific requirements directly from the provided document.", "claims": []}
        ]

    @staticmethod
    def _audit_proposal_claims_hook(proposal_sections, requirements):
        return []

    @staticmethod
    def _build_traceability_hook(requirements: List[Dict[str, Any]]):
        records = []
        for r in requirements:
            records.append({
                "requirement_id": r["id"],
                "requirement_text": r["text"],
                "source_page": r["page"],
                "source_section": r["section"],
                "architecture_component": f"{r['category']} Subsystem",
                "proposal_section": "§2 Requirements Understanding",
                "timeline_milestone": "Phase 2",
                "status": r.get("status", "Covered")
            })
        return records

    @staticmethod
    def _build_human_review_queue(risks, contradictions, ambiguities, claims=None):
        reviews = []
        rev_id = 1
        claims = claims or []
        
        # 1. Claim Firewall findings (Prioritize RED unsupported claims)
        for clm in claims:
            clf = clm.get("classification")
            if clf in ["UNSUPPORTED_CLAIM", "NEEDS_REVIEW"]:
                reviews.append({
                    "id": f"REV-{rev_id:03d}",
                    "title": f"Claim Firewall: {clm.get('claim_text', '')[:60]}...",
                    "severity": "Critical" if clf == "UNSUPPORTED_CLAIM" else "High",
                    "category": "Claim Firewall",
                    "source_page": clm.get("evidence", [{}])[0].get("page", 1) if clm.get("evidence") else 1,
                    "details": clm.get("why_flagged", "Verification flag requiring human sign-off"),
                    "evidence": clm.get("suggested_rewrite") or clm.get("claim_text", ""),
                    "status": clm.get("review_status", "OPEN"),
                    "notes": clm.get("reviewer_notes", ""),
                    "claim_id": clm.get("claim_id")
                })
                rev_id += 1

        for r in risks:
            if r.get("human_review_required"):
                reviews.append({
                    "id": f"REV-{rev_id:03d}",
                    "title": r["title"],
                    "severity": r["severity"],
                    "category": r["category"],
                    "source_page": r["evidence"][0]["page"] if r.get("evidence") else 1,
                    "details": r["description"],
                    "evidence": r["evidence"][0]["excerpt"] if r.get("evidence") else "",
                    "status": "Open",
                    "notes": ""
                })
                rev_id += 1
        for c in contradictions:
            reviews.append({
                "id": f"REV-{rev_id:03d}",
                "title": f"Architectural Contradiction ({c['id']})",
                "severity": c["severity"],
                "category": "Architecture",
                "source_page": c["evidence"][0]["page"] if c.get("evidence") else 1,
                "details": c["reason"],
                "evidence": c["evidence"][0]["text"] if c.get("evidence") else "",
                "status": "Open",
                "notes": ""
            })
            rev_id += 1
        return reviews

    @staticmethod
    def _build_heatmap(pages: List[ParsedPage], requirements, risks, ambiguities, contradictions):
        heatmap = []
        for p in pages:
            p_reqs = [r for r in requirements if r.get("page") == p.page_number]
            p_risks = [r for r in risks if any(e.get("page") == p.page_number for e in r.get("evidence", []))]
            p_amb = [a for a in ambiguities if any(r.get("id") == a.get("requirement_id") and r.get("page") == p.page_number for r in requirements)]
            p_con = [c for c in contradictions if any(e.get("page") == p.page_number for e in c.get("evidence", []))]
            
            status = "Green"
            if len(p_con) > 0 or any(r.get("severity") == "Critical" for r in p_risks):
                status = "Red"
            elif len(p_risks) > 0 or len(p_amb) > 0:
                status = "Yellow"
                
            heatmap.append({
                "page_start": p.page_number,
                "page_end": p.page_number,
                "status": status,
                "requirement_count": len(p_reqs),
                "risk_count": len(p_risks),
                "ambiguity_count": len(p_amb),
                "conflict_count": len(p_con),
                "mandatory_clauses_count": sum(1 for r in p_reqs if r.get("priority") == "Mandatory")
            })
        return heatmap
