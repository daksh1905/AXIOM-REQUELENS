from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Requirement(BaseModel):
    id: str
    text: str
    category: str = "Functional"  # Functional, Technical, Business, Budget, Timeline, Security, Compliance, Performance, Other
    subcategory: Optional[str] = None
    priority: str = "Mandatory"  # Mandatory, Preferred, Optional, Unknown
    confidence: float = 0.95
    page: int
    section: str = "General"
    source_text: str
    status: str = "Covered"  # Covered, Partially Covered, Uncovered, Needs Review
    information_classification: str = "Explicit"  # Explicit, Inferred, Assumption, Missing
    is_verified: bool = False
    reviewed_by_human: bool = False
    reviewer_notes: Optional[str] = None
    proposal_sections: List[str] = Field(default_factory=list)
    architecture_components: List[str] = Field(default_factory=list)
    related_requirements: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)

class RiskEvidence(BaseModel):
    page: int
    excerpt: str
    why: str

class Risk(BaseModel):
    id: str
    title: str
    severity: str  # Critical, High, Medium, Low
    category: str  # Timeline, Scope, Technical, Integration, Security, Compliance, Legal, Data, Operational, Dependency, Budget
    description: str
    requirement_ids: List[str] = Field(default_factory=list)
    evidence: List[RiskEvidence] = Field(default_factory=list)
    recommendation: str
    confidence: float = 0.90
    human_review_required: bool = True
    status: str = "Open"  # Open, Mitigated, Accepted Risk

class ContradictionEvidence(BaseModel):
    req_id: str
    page: int
    section: str
    text: str

class Contradiction(BaseModel):
    id: str
    requirement_ids: List[str]
    severity: str = "High"  # Critical, High, Medium, Low
    reason: str
    confidence: float = 0.88
    evidence: List[ContradictionEvidence] = Field(default_factory=list)
    clarification_question: Optional[str] = None
    reviewed: bool = False

class Ambiguity(BaseModel):
    id: str
    requirement_id: str
    text: str
    missing_information: List[str] = Field(default_factory=list)
    impact: str
    severity: str = "Medium"
    suggested_clarification: str

class MissingInformationItem(BaseModel):
    id: str
    category: str  # Budget, Timeline, User Capacity, Technical Specifications, Disaster Recovery, Other
    missing_detail: str
    why_it_matters: str
    client_clarification_question: str
    status: str = "Open"

class ClarificationQuestion(BaseModel):
    id: str
    question: str
    requirement_ids: List[str] = Field(default_factory=list)
    category: str = "General"
    status: str = "Open"  # Open, Asked, Resolved
    response: Optional[str] = None

class Assumption(BaseModel):
    id: str
    assumption: str
    reason: str
    impact: str
    source_context: str
    related_requirements: List[str] = Field(default_factory=list)
    status: str = "Open"  # Open, Confirmed, Rejected, Modified

class EvaluationCriteriaItem(BaseModel):
    category: str
    weight: float
    description: str
    coverage_score: float
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)

class ArchitectureComponent(BaseModel):
    id: str
    name: str
    type: str = "Proposed"  # Required, Proposed, Assumed
    technology: str
    responsibility: str
    reason: str
    requirement_ids: List[str] = Field(default_factory=list)

class DataFlow(BaseModel):
    from_component: str
    to_component: str
    description: str
    protocol: str = "HTTPS/gRPC"

class ArchitectureSolution(BaseModel):
    summary: str
    components: List[ArchitectureComponent] = Field(default_factory=list)
    data_flows: List[DataFlow] = Field(default_factory=list)
    security_considerations: List[str] = Field(default_factory=list)
    integration_points: List[str] = Field(default_factory=list)
    scalability_considerations: List[str] = Field(default_factory=list)
    mermaid_diagram: str = ""

class TechStackItem(BaseModel):
    technology: str
    category: str
    purpose: str
    reason: str
    requirements_addressed: List[str] = Field(default_factory=list)

class Milestone(BaseModel):
    phase: str
    weeks: str
    title: str
    description: str
    deliverables: List[str] = Field(default_factory=list)
    requirement_ids: List[str] = Field(default_factory=list)
    depends_on: List[str] = Field(default_factory=list)

class TeamRoleEstimate(BaseModel):
    role: str
    count: int
    phase: str
    reason: str

class DeliveryFeasibility(BaseModel):
    requested_deadline: str
    estimated_delivery_range: str
    risk_level: str
    total_estimated_hours: int = 4800
    total_person_months: int = 30
    disclaimer: str = "AI-assisted preliminary estimate — requires delivery-team validation."
    primary_drivers: List[str] = Field(default_factory=list)
    scenarios: List[Dict[str, str]] = Field(default_factory=list)

class ClaimAudit(BaseModel):
    id: str
    claim_text: str
    classification: str  # GROUNDED_REQUIREMENT, PROPOSED_DESIGN, ASSUMPTION, UNSUPPORTED_CLAIM, RFP_FACT, NEEDS_REVIEW
    source_page: Optional[int] = None
    source_section: Optional[str] = None
    confidence: float = 0.90
    explanation: str
    suggested_correction: Optional[str] = None

class ProposalSection(BaseModel):
    number: int
    title: str
    content: str
    claims: List[ClaimAudit] = Field(default_factory=list)

class Proposal(BaseModel):
    project_name: str
    version: str = "1.0"
    generated_at: str
    sections: List[ProposalSection] = Field(default_factory=list)

class ProposalReadiness(BaseModel):
    overall_score: int
    requirement_coverage: int
    requirement_clarity: int
    proposal_grounding: int
    timeline_feasibility: int
    risk_resolution: int
    traceability_coverage: int
    scoring_explanation: str

class TraceabilityRecord(BaseModel):
    requirement_id: str
    requirement_text: str
    source_page: int
    source_section: str
    architecture_component: str
    proposal_section: str
    timeline_milestone: str
    status: str = "Covered"

class HumanReviewItem(BaseModel):
    id: str
    title: str
    severity: str  # Critical, High, Medium, Low
    category: str
    source_page: int
    details: str
    evidence: str
    status: str = "Open"  # Open, Reviewing, Resolved, Accepted Risk
    notes: str = ""

class DocumentHeatmapRange(BaseModel):
    page_start: int
    page_end: int
    status: str  # Green, Yellow, Red
    requirement_count: int
    risk_count: int
    ambiguity_count: int
    conflict_count: int
    mandatory_clauses_count: int

class VersionDiff(BaseModel):
    version_old: str
    version_new: str
    project_name_old: str = ""
    project_name_new: str = ""
    added_requirements: List[Dict[str, Any]] = Field(default_factory=list)
    removed_requirements: List[Dict[str, Any]] = Field(default_factory=list)
    modified_requirements: List[Dict[str, Any]] = Field(default_factory=list)
    readiness_delta: Dict[str, Any] = Field(default_factory=dict)
    summary: str = ""

class Project(BaseModel):
    id: str
    name: str
    filename: str
    file_type: str
    file_size_bytes: int
    pages_analyzed: int
    status: str = "uploaded"  # uploaded, processing, analyzed, failed
    created_at: str
    is_demo: bool = False
    readiness: Optional[ProposalReadiness] = None

# API Request/Response Schemas
class RequirementUpdateRequest(BaseModel):
    text: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    information_classification: Optional[str] = None
    status: Optional[str] = None
    is_verified: Optional[bool] = None
    reviewer_notes: Optional[str] = None

class RiskUpdateRequest(BaseModel):
    title: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    recommendation: Optional[str] = None
    human_review_required: Optional[bool] = None
    status: Optional[str] = None

class AssumptionUpdateRequest(BaseModel):
    status: Optional[str] = None  # Open, Confirmed, Rejected, Modified
    assumption: Optional[str] = None
    reason: Optional[str] = None
    impact: Optional[str] = None

class ProposalSectionUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class RegenerateSectionRequest(BaseModel):
    custom_instructions: Optional[str] = None

class CompareProjectsRequest(BaseModel):
    project_id_1: str
    project_id_2: str
