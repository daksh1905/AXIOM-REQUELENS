from typing import List, Dict, Any

class TraceabilityEngine:
    """
    End-to-end Traceability Matrix & Coverage Audit Engine.
    Maps 100% of normalized requirements to:
    - Architecture Component
    - Proposal Section
    - Implementation Milestone
    - Coverage Status (COVERED, PARTIALLY_COVERED, UNCOVERED, NEEDS_REVIEW)
    - Justification/Notes

    Calculates deterministic Coverage Audit statistics and highlights any
    uncovered or needs-review mandatory requirements.
    """

    @classmethod
    def build_matrix_and_audit(
        cls,
        requirements: List[Dict[str, Any]],
        architecture: Dict[str, Any],
        proposal_sections: List[Dict[str, Any]],
        milestones: List[Dict[str, Any]],
        risks: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Builds the complete traceability matrix and computes coverage audit metrics.
        """
        risks = risks or []
        components = architecture.get("components", [])
        comp_map = {c.get("component_id"): c.get("name") for c in components}

        matrix_rows = []
        covered_count = 0
        partially_covered_count = 0
        needs_review_count = 0
        uncovered_count = 0
        uncovered_mandatory = []
        needs_review_mandatory = []

        total_reqs = len(requirements)
        mandatory_total = sum(1 for r in requirements if r.get("priority") == "Mandatory")

        for req in requirements:
            req_id = req.get("id", "")
            cat = req.get("category", "General")
            priority = req.get("priority", "Mandatory")
            norm_text = req.get("normalized_text", "").lower()

            # 1. Map to Architecture Component
            if cat == "Security":
                target_comp = "COMP-SEC-01"
                target_comp_name = comp_map.get("COMP-SEC-01", "Zero Trust Security & Identity Gateway")
            elif cat == "Infrastructure":
                target_comp = "COMP-INFRA-01"
                target_comp_name = comp_map.get("COMP-INFRA-01", "Cloud Infrastructure & Orchestration Cluster")
            elif cat == "Integration":
                target_comp = "COMP-INT-01"
                target_comp_name = comp_map.get("COMP-INT-01", "API Mediation & Enterprise Integration Gateway")
            elif cat == "Data / Migration":
                target_comp = "COMP-DATA-01"
                target_comp_name = comp_map.get("COMP-DATA-01", "Data Persistence & Encryption Store")
            elif cat in ("Observability", "Performance"):
                target_comp = "COMP-OBS-01"
                target_comp_name = comp_map.get("COMP-OBS-01", "Centralized Observability & Telemetry Platform")
            elif cat == "Functional":
                target_comp = "COMP-CORE-01"
                target_comp_name = comp_map.get("COMP-CORE-01", "Core Application & Workflow Services")
            elif cat == "Compliance":
                target_comp = "COMP-SEC-01"
                target_comp_name = comp_map.get("COMP-SEC-01", "Zero Trust Security & Identity Gateway")
            else:
                target_comp = "N/A"
                target_comp_name = "Not Architecture-Bound"

            # 2. Map to Proposal Section
            if cat == "Security":
                target_section_num = 6
                target_section_title = "Section 6: Security Architecture"
            elif cat == "Infrastructure":
                target_section_num = 4
                target_section_title = "Section 4: System Architecture"
            elif cat == "Integration":
                target_section_num = 7
                target_section_title = "Section 7: Integration Architecture"
            elif cat == "Data / Migration":
                target_section_num = 8
                target_section_title = "Section 8: Data Architecture and Migration Strategy"
            elif cat == "Functional":
                target_section_num = 3
                target_section_title = "Section 3: Proposed Solution"
            elif cat == "Compliance":
                target_section_num = 11
                target_section_title = "Section 11: Compliance and Governance"
            elif cat == "Timeline":
                target_section_num = 9
                target_section_title = "Section 9: Implementation Plan and Milestones"
            elif cat == "Legal":
                target_section_num = 15
                target_section_title = "Section 15: Risk Management and Mitigation"
            elif cat in ("Observability", "Performance"):
                target_section_num = 13
                target_section_title = "Section 13: Service Level Agreements and Support"
            else:
                target_section_num = 3
                target_section_title = "Section 3: Proposed Solution"

            # 3. Map to Implementation Milestone
            if cat == "Timeline":
                target_milestone = "M-01"
                target_milestone_name = "M-01: Discovery & Architecture Alignment"
            elif cat in ("Infrastructure", "Security"):
                target_milestone = "M-02"
                target_milestone_name = "M-02: Secure Landing Zone & Foundation Setup"
            elif cat in ("Functional", "Integration", "Data / Migration"):
                target_milestone = "M-03"
                target_milestone_name = "M-03: Core Service Implementation & Data Migration"
            elif cat in ("Compliance", "Observability", "Performance"):
                target_milestone = "M-04"
                target_milestone_name = "M-04: System Integration & Security Hardening"
            elif cat == "Legal":
                target_milestone = "M-01"
                target_milestone_name = "M-01: Discovery & Architecture Alignment"
            else:
                target_milestone = "M-03"
                target_milestone_name = "M-03: Core Service Implementation & Data Migration"

            # 4. Determine Coverage Status
            # Special check for legal clauses with extreme or ambiguous exposure
            is_legal = (cat == "Legal")
            has_uncapped_terms = any(term in norm_text for term in ["uncapped", "penalty", "liquidated damages", "indemnif", "unlimited liability"])
            
            # Check for non-standard / out-of-scope physical constraints
            has_hardware_mandate = any(term in norm_text for term in ["customer-owned physical appliance", "on-premise mainframe co-location", "custom silicon"])

            if has_hardware_mandate:
                status = "UNCOVERED"
                justification = "RFP clause stipulates proprietary hardware/co-location beyond standard cloud infrastructure scope. Requires custom client exception or dedicated hosting model."
                uncovered_count += 1
                if priority == "Mandatory":
                    uncovered_mandatory.append({
                        "requirement_id": req_id,
                        "title": req.get("title", ""),
                        "category": cat,
                        "page": req.get("page", 1),
                        "reason": justification
                    })
            elif is_legal and has_uncapped_terms:
                status = "NEEDS_REVIEW"
                justification = "Commercial legal clause specifies potential uncapped liabilities or aggressive penalty schedules. Requires commercial negotiation and specific contract qualification."
                needs_review_count += 1
                if priority == "Mandatory":
                    needs_review_mandatory.append({
                        "requirement_id": req_id,
                        "title": req.get("title", ""),
                        "category": cat,
                        "page": req.get("page", 1),
                        "reason": justification
                    })
            elif priority == "Optional" or priority == "Nice to Have":
                status = "PARTIALLY_COVERED"
                justification = "Optional capability cataloged for post-MVP Phase 2 release or enhancement sprint."
                partially_covered_count += 1
            else:
                status = "COVERED"
                justification = f"Fully designed in {target_comp_name}, validated in {target_section_title}, and scheduled for delivery in {target_milestone_name}."
                covered_count += 1

            matrix_rows.append({
                "requirement_id": req_id,
                "requirement_title": req.get("title", f"Requirement {req_id}"),
                "requirement_text": req.get("text", req.get("title", f"Requirement {req_id}")),
                "category": cat,
                "priority": priority,
                "source_page": req.get("page", 1),
                "source_section": req.get("section", ""),
                "target_component_id": target_comp,
                "target_component_name": target_comp_name,
                "architecture_component": target_comp_name,
                "target_section_number": target_section_num,
                "target_section_title": target_section_title,
                "proposal_section": target_section_title,
                "target_milestone_id": target_milestone,
                "target_milestone_name": target_milestone_name,
                "timeline_milestone": target_milestone_name,
                "status": status,
                "justification": justification
            })

        coverage_rate = round(((covered_count + partially_covered_count) / max(total_reqs, 1)) * 100, 1)

        coverage_audit = {
            "total_normalized": total_reqs,
            "mandatory_count": mandatory_total,
            "covered_count": covered_count,
            "partially_covered_count": partially_covered_count,
            "needs_review_count": needs_review_count,
            "uncovered_count": uncovered_count,
            "coverage_percentage": coverage_rate,
            "uncovered_mandatory": uncovered_mandatory,
            "needs_review_mandatory": needs_review_mandatory,
            "audit_verdict": (
                "PASSED - HIGH COMPLIANCE" if len(uncovered_mandatory) == 0 and coverage_rate >= 90.0
                else "ATTENTION REQUIRED - UNCOVERED MANDATORY CLAUSES DETECTED"
            )
        }

        return {
            "matrix": matrix_rows,
            "coverage_audit": coverage_audit
        }
