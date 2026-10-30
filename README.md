# RECLENS
### *"Read. Reason. Verify. Propose."*

> **"AI writes it. AI audits it. Humans approve it."**  
> *Every requirement traced. Every risk surfaced. Every claim verified.*

RecLens is an **evidence-first AI RFP Intelligence and Proposal Engineering platform**. It accepts large enterprise client RFP documents (PDF / DOCX), parses them with page geometry preservation, extracts requirements with exact source citations, detects hidden risks, ambiguities, and cross-document contradictions, synthesizes a defensible technical architecture, generates a structured 16-section technical proposal, and audits every proposal claim through an independent **Proposal Claim Firewall**.

---

## The Core Differentiator

Traditional generative proposal tools operate on a dangerous, unverified assumption:  
$$\text{RFP} \longrightarrow \text{LLM Prompt} \longrightarrow \text{Unchecked Proposal}$$

This leads to invented requirements, unflagged legal liabilities, overlooked infrastructure contradictions, and undefensible claims.

**RecLens changes the paradigm:**
$$\text{RFP} \longrightarrow \text{Understand} \longrightarrow \text{Extract} \longrightarrow \text{Reason} \longrightarrow \text{Detect Risks} \longrightarrow \text{Design} \longrightarrow \text{Generate} \longrightarrow \text{Verify} \longrightarrow \text{Human Review} \longrightarrow \text{Export}$$

---

## 10 Core Product Capabilities

1. **Requirement Intelligence**: Every extracted requirement retains its exact page number, section heading, source excerpt, confidence score, and status.
2. **Cross-Document Contradiction Engine**: Identifies incompatible requirements across distant pages (e.g., Page 17 on-premise mandate vs. Page 93 AWS RDS requirement).
3. **Ambiguity Detector**: Flags unmeasurable criteria (e.g., *"platform should support high traffic"*), breaks down missing numeric metrics (concurrent users, RPS, latency), and highlights architecture impact.
4. **Clarification Question Generator**: Prepares structured inquiries with copy-to-clipboard functionality for sales engineers to clarify scope with client procurement.
5. **Explainable "Why?" Audit**: Every major risk conclusion provides a deep evidence drawer with supporting quotes from the document.
6. **Solution Architecture Synthesis**: Generates microservices topology, component responsibilities, data flows, and security governance categorized by *Required*, *Proposed*, and *Assumed*.
7. **Delivery Feasibility & Scenario Modeling**: Compares requested client timelines (e.g., 12 weeks) against empirical benchmarks (15–18 weeks) with explicit Option A/B/C trade-off scenarios and delivery disclaimers.
8. **Bidirection Traceability Matrix**: Maps RFP Source Page $\rightarrow$ Requirement ID $\rightarrow$ Architecture Component $\rightarrow$ Proposal Section $\rightarrow$ Milestone.
9. **Proposal Claim Firewall**: Audits proposal claims into 4 distinct classifications:
   - 🟢 **GROUNDED_REQUIREMENT** (RFP-backed with page citation)
   - 🔵 **PROPOSED_DESIGN** (Engineered solution design)
   - 🟡 **ASSUMPTION** (Contingent operational pre-requisite)
   - 🔴 **UNSUPPORTED_CLAIM** (Unsupported assertion with suggested automated correction)
10. **Deterministic Proposal Readiness Score**: Computes an objective index (0–100) based on measurable indicators (coverage, clarity, grounding, traceability, risk resolution). Never claims a fake "win probability".

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.11, FastAPI, Pydantic v2 validation schemas, Uvicorn.
- **Document Processing**: `pypdf` & PyMuPDF (`fitz`), `python-docx` for structured Word extraction.
- **Exports**: `python-docx` for professional Word documents, `ReportLab` for audited PDF exports.
- **Database**: SQLite with repository abstraction layer ready for PostgreSQL migration.
- **AI Abstraction**: Provider abstraction supporting Google Gemini API (`gemini-2.5-flash`), OpenAI (`gpt-4o`), and deterministic evidence fallback.

---

## Project Structure

```
hackathon-axiom/
├── backend/
│   ├── api/
│   │   └── main.py                 # FastAPI endpoints (upload, projects, reviews, chat, exports)
│   ├── database/
│   │   └── db.py                   # SQLite repository pattern & schema migrations
│   ├── exports/
│   │   └── export_service.py       # DOCX & PDF proposal generators
│   ├── parsers/
│   │   ├── document_parser.py      # Page-aware PDF & DOCX text/heading extraction
│   │   └── document_chunker.py     # Semantic chunking preserving page metadata
│   ├── schemas/
│   │   └── models.py               # Pydantic schemas for requirements, risks, proposals
│   └── services/
│       ├── llm_provider.py         # Provider abstraction (Gemini / OpenAI / Fallback)
│       ├── pipeline_orchestrator.py# 25-step execution engine with live progress tracking
│       └── readiness_scorer.py     # Deterministic readiness index calculator
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Enterprise B2B SaaS Landing Page
│   │   │   ├── layout.tsx          # Global fonts and theme layout
│   │   │   └── projects/[id]/
│   │   │       └── page.tsx        # Comprehensive RFP Intelligence Workspace
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Sticky navigation bar
│   │   │   └── UploadModal.tsx     # Drag-and-drop uploader with live pipeline visualizer
│   │   └── lib/
│   │       └── api.ts              # API client functions
│   └── package.json
├── sample-data/
│   └── demo_project.py             # Realistic pre-seeded demo dataset (147 reqs, 78 readiness)
├── .env.example
└── README.md
```

---

## Quickstart & Setup

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.11+

### 2. Backend Setup
```bash
# Navigate to workspace
cd hackathon-axiom

# Create virtual environment & install dependencies
python -m venv backend/.venv
backend\.venv\Scripts\activate
pip install -r requirements.txt # Or uv pip install

# Launch backend API server (runs on port 8000)
uvicorn backend.api.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
# In a new terminal window:
cd frontend

# Install packages
npm install

# Start Next.js development server (runs on port 3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Live Demo Workflow for Judges

1. **Landing Page**: Observe the enterprise B2B SaaS design, interactive mock KPI bar, and "Not another AI proposal writer" comparison.
2. **Instant Demo Mode**: Click **"Live Demo"** in the navbar to open the pre-seeded Enterprise Global Bank RFP project (`demo-rfp-001`).
3. **Intelligence Dashboard**: Inspect the **Proposal Readiness (78/100)** score breakdown, Risk Radar, and **Critical Conflict Banner** (Page 17 on-premise vs Page 93 AWS RDS).
4. **Requirements**: Filter by Category (Security, Integration, Infrastructure) and click **"View Source"** to inspect exact highlighted document excerpts.
5. **Contradiction Engine**: Review the side-by-side contradiction and copy the suggested clarification question.
6. **"Why?" Explainability**: Click *"Why?"* on the 12-Week Aggressive Timeline risk to view the 4 underlying evidence quotes from the RFP.
7. **Proposal & Claim Firewall**: Review the 16 structured proposal sections. Inspect the color-coded claims (Green Grounded, Blue Proposed, Yellow Assumption, Red Unsupported) and observe the automated correction suggestions.
8. **Export Proposal**: Click **PDF** or **DOCX** to download the audited document.
9. **Ask RecLens Chat**: Ask *"What are the mandatory security requirements?"* to test the citation-first Q&A engine.

---

## Important Product Rules Adherence

1. **Never invent client requirements**: Requirements must map to an extractable page number and section excerpt.
2. **AI uncertainty is visible**: Confidence percentages and ambiguity flags are transparently exposed.
3. **Legal clauses**: Flagged with *"Legal review recommended"* and never treated as legal advice.
4. **Delivery estimates**: Presented as preliminary benchmarks with delivery team disclaimers.
5. **No fake win probabilities**: Proposal Readiness indicates internal audit completeness only.
