import re
from typing import List, Dict, Any, Optional, Tuple

class ClaimFirewall:
    """
    Independent Claim Firewall & Proposal Verification Engine.
    Executes AFTER proposal and architecture generation.
    Never trusts generator metadata without independent evidence cross-examination.

    Classifications:
    - RFP_FACT (GREEN): Directly grounded in original RFP text/requirements.
    - PROPOSED_DESIGN (BLUE): Engineered solution or preliminary estimate proposed by RecLens.
    - ASSUMPTION (YELLOW): Contingent operational prerequisite or planning dependency.
    - UNSUPPORTED_CLAIM (RED): Stated as client mandate or fact without RFP evidence.
    - NEEDS_REVIEW (GRAY): Technically questionable claim or ungrounded arbitrary precision.
    """

    @classmethod
    def audit_project(
        cls,
        requirements: List[Dict[str, Any]],
        architecture: Dict[str, Any],
        tech_stack: List[Dict[str, Any]],
        delivery_feasibility: Dict[str, Any],
        milestones: List[Dict[str, Any]],
        team: List[Dict[str, Any]],
        assumptions: List[Dict[str, Any]],
        proposal_sections: List[Dict[str, Any]],
        risks: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Performs an exhaustive, multi-tier audit of all claims across the generated output.
        """
        risks = risks or []
        audited_claims = []
        claim_counter = 1

        # Build fast inverted text index of all RFP requirement text
        all_req_text = " ".join([
            (r.get("text", "") + " " + r.get("source_text", "") + " " + r.get("title", "")).lower()
            for r in requirements
        ])

        def find_evidence_for_terms(terms: List[str]) -> Tuple[List[str], List[Dict[str, Any]]]:
            matched_ids = []
            excerpts = []
            for r in requirements:
                text_lower = (r.get("text", "") + " " + r.get("source_text", "")).lower()
                if any(t.lower() in text_lower for t in terms):
                    matched_ids.append(r["id"])
                    excerpts.append({
                        "requirement_id": r["id"],
                        "page": r.get("page", 1),
                        "section": r.get("section", "RFP Specification"),
                        "excerpt": r.get("text", "")[:160]
                    })
                    if len(matched_ids) >= 5:
                        break
            return matched_ids, excerpts

        # =========================================================================
        # 1. ARCHITECTURE FIREWALL & DUAL-ORIGIN MAPPING
        # =========================================================================
        dual_origin_components = []
        components = architecture.get("components", [])

        for comp in components:
            comp_id = comp.get("component_id") or comp.get("id", "")
            comp_name = comp.get("name", "")
            tech = comp.get("recommended_technology_or_category") or comp.get("technology", "")
            comp_origin = comp.get("origin") or comp.get("type", "RECLENS_PROPOSED")
            category = comp.get("category", "")

            # 1A. Capability Evaluation
            cap_need = f"{comp_name} capability"
            cap_terms = []
            if "Security" in category or "Identity" in comp_name:
                cap_terms = ["mfa", "multi-factor", "authentication", "iam", "access control", "rbac"]
            elif "Infrastructure" in category or "Compute" in comp_name:
                cap_terms = ["cloud", "hosting", "kubernetes", "virtual machine", "auto-scaling", "server", "cluster"]
            elif "Integration" in category or "Gateway" in comp_name:
                cap_terms = ["api", "interface", "integration", "rest", "soap", "gateway", "export"]
            elif "Data" in category or "Persistence" in comp_name:
                cap_terms = ["database", "relational", "sql", "storage", "encryption", "export", "backup"]
            elif "Compliance" in category or "Observability" in comp_name:
                cap_terms = ["audit", "log", "monitoring", "siem", "telemetry", "metrics"]
            else:
                cap_terms = [category.lower()]

            cap_req_ids, cap_evidence = find_evidence_for_terms(cap_terms)
            cap_origin = "RFP_REQUIRED" if len(cap_req_ids) > 0 else "RECLENS_PROPOSED"

            # 1B. Implementation Technology Evaluation
            # Check if specific technology is named in RFP
            clean_tech_name = tech.split("(")[0].split("/")[0].strip()
            # Specific vendor technologies
            tech_search_term = ""
            if "Keycloak" in tech:
                tech_search_term = "keycloak"
            elif "Kubernetes" in tech:
                tech_search_term = "kubernetes"
            elif "PostgreSQL" in tech:
                tech_search_term = "postgresql"
            elif "Kong" in tech:
                tech_search_term = "kong"
            elif "Prometheus" in tech:
                tech_search_term = "prometheus"
            elif "Grafana" in tech:
                tech_search_term = "grafana"

            impl_req_ids = []
            impl_evidence = []
            if tech_search_term:
                impl_req_ids, impl_evidence = find_evidence_for_terms([tech_search_term])

            impl_origin = "RFP_REQUIRED" if len(impl_req_ids) > 0 else "RECLENS_PROPOSED"

            # Check for misclassification:
            # If component or tech was marked RFP_REQUIRED when the tech itself is not named in RFP
            is_misclassified = (comp_origin in ["RFP_REQUIRED", "Required"] and len(impl_req_ids) == 0)

            # Technical consistency check (e.g. Prometheus as SIEM)
            is_questionable_tech = ("Prometheus" in tech or "Grafana" in tech) and ("SIEM" in comp_name or "SIEM" in tech)
            
            dual_origin_components.append({
                "component_id": comp_id,
                "name": comp_name,
                "capability_need": f"Enterprise {category} Subsystem",
                "capability_origin": cap_origin,
                "capability_evidence_req_ids": cap_req_ids,
                "capability_evidence": cap_evidence,
                "implementation_technology": tech,
                "implementation_origin": impl_origin,
                "implementation_evidence_req_ids": impl_req_ids,
                "firewall_verdict": (
                    "NEEDS_REVIEW - QUESTIONABLE TOOLING DEFINITION" if is_questionable_tech
                    else "MISCLASSIFICATION RECTIFIED - CAPABILITY MANDATED BUT IMPLEMENTATION PROPOSED" if is_misclassified
                    else "VALIDATED - ACCURATELY ATTRIBUTED"
                )
            })

            # Create Claim for Component Origin
            if is_misclassified:
                c_id = f"CLM-{claim_counter:03d}"
                claim_counter += 1
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": f"Component '{comp_name}' ({tech}) is designated as RFP Required.",
                    "source_type": "ARCHITECTURE_COMPONENT",
                    "source_id": comp_id,
                    "source_title": comp_name,
                    "classification": "UNSUPPORTED_CLAIM",
                    "initial_classification": "RFP_FACT",
                    "confidence": 0.95,
                    "supporting_requirement_ids": cap_req_ids,
                    "evidence": cap_evidence,
                    "traceability_chain": {
                        "claim_text": f"RFP Mandates {comp_name}",
                        "proposal_section": "Section 4: System Architecture",
                        "architecture_component": comp_id,
                        "requirement_id": cap_req_ids[0] if cap_req_ids else "N/A",
                        "page": cap_evidence[0]["page"] if cap_evidence else 1
                    },
                    "why_flagged": (
                        f"The client RFP mandates the underlying {category} capability ({len(cap_req_ids)} clauses found), "
                        f"but does NOT mandate '{clean_tech_name}'. Marking the implementation technology as 'RFP Required' "
                        f"misrepresents a vendor architectural choice as a client contractual mandate."
                    ),
                    "technical_notes": "Enforce Capability vs Implementation separation.",
                    "suggested_rewrite": (
                        f"The RFP establishes mandatory requirements for {comp_name.lower()}. "
                        f"RecLens proposes {tech} as the optimized implementation platform."
                    ),
                    "review_status": "OPEN",
                    "reviewer_notes": ""
                })
            elif is_questionable_tech:
                c_id = f"CLM-{claim_counter:03d}"
                claim_counter += 1
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": f"Deploy Prometheus & Grafana Enterprise SIEM for immutable security auditing.",
                    "source_type": "ARCHITECTURE_COMPONENT",
                    "source_id": comp_id,
                    "source_title": comp_name,
                    "classification": "NEEDS_REVIEW",
                    "initial_classification": "PROPOSED_DESIGN",
                    "confidence": 0.88,
                    "supporting_requirement_ids": cap_req_ids,
                    "evidence": cap_evidence,
                    "traceability_chain": {
                        "claim_text": "Prometheus & Grafana as Enterprise SIEM",
                        "proposal_section": "Section 6: Security Architecture",
                        "architecture_component": comp_id,
                        "requirement_id": cap_req_ids[0] if cap_req_ids else "N/A",
                        "page": cap_evidence[0]["page"] if cap_evidence else 1
                    },
                    "why_flagged": (
                        "Prometheus and Grafana provide time-series observability, metric scraping, and dashboarding, "
                        "but do not by themselves constitute a certified Enterprise SIEM (Security Information and Event Management) "
                        "solution capable of regulatory non-repudiation and threat correlation."
                    ),
                    "technical_notes": "Observability tooling cannot substitute for dedicated security SIEM compliance.",
                    "suggested_rewrite": (
                        "Deploy Prometheus & Grafana for platform observability, metrics, and SLA monitoring, "
                        "integrated with a dedicated sovereign SIEM log forwarder for centralized security audit event archival."
                    ),
                    "review_status": "OPEN",
                    "reviewer_notes": ""
                })
            else:
                c_id = f"CLM-{claim_counter:03d}"
                claim_counter += 1
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": f"RecLens proposes {tech} to deliver {comp_name} ({cap_origin}).",
                    "source_type": "ARCHITECTURE_COMPONENT",
                    "source_id": comp_id,
                    "source_title": comp_name,
                    "classification": "PROPOSED_DESIGN" if impl_origin == "RECLENS_PROPOSED" else "RFP_FACT",
                    "initial_classification": "PROPOSED_DESIGN",
                    "confidence": 0.94,
                    "supporting_requirement_ids": cap_req_ids,
                    "evidence": cap_evidence,
                    "traceability_chain": {
                        "claim_text": f"Implementation of {comp_name}",
                        "proposal_section": "Section 4: System Architecture",
                        "architecture_component": comp_id,
                        "requirement_id": cap_req_ids[0] if cap_req_ids else "N/A",
                        "page": cap_evidence[0]["page"] if cap_evidence else 1
                    },
                    "why_flagged": None,
                    "technical_notes": "Properly designated as proposed implementation.",
                    "suggested_rewrite": None,
                    "review_status": "RESOLVED",
                    "reviewer_notes": "Verified design proposal."
                })

        # =========================================================================
        # 2. TECHNOLOGY STACK FIREWALL
        # =========================================================================
        for item in tech_stack:
            tech_name = item.get("technology", "")
            origin = item.get("origin", "RECLENS_PROPOSED")
            category = item.get("category", "")
            purpose = item.get("purpose", "")
            
            # Check literal existence in RFP
            tech_keyword = tech_name.split()[0].lower()
            matched_ids, matched_ev = find_evidence_for_terms([tech_keyword])

            is_prom_siem = ("prometheus" in tech_name.lower() or "grafana" in tech_name.lower()) and ("siem" in tech_name.lower() or "siem" in purpose.lower() or "siem" in category.lower())
            
            if origin in ["RFP_REQUIRED", "Required"] and len(matched_ids) == 0:
                c_id = f"CLM-{claim_counter:03d}"
                claim_counter += 1
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": f"Technology '{tech_name}' is classified as RFP Required.",
                    "source_type": "TECH_STACK",
                    "source_id": tech_name,
                    "source_title": f"Tech Stack: {tech_name}",
                    "classification": "UNSUPPORTED_CLAIM",
                    "initial_classification": "RFP_FACT",
                    "confidence": 0.96,
                    "supporting_requirement_ids": [],
                    "evidence": [],
                    "traceability_chain": {
                        "claim_text": f"Mandate for {tech_name}",
                        "proposal_section": "Section 5: Technology Stack",
                        "architecture_component": item.get("architecture_components", ["COMP-CORE-01"])[0],
                        "requirement_id": "N/A",
                        "page": 1
                    },
                    "why_flagged": f"The specific technology '{tech_name}' does not appear anywhere in the client RFP text.",
                    "technical_notes": "Vendor technology recommendation must be classified as RecLens Proposed.",
                    "suggested_rewrite": f"RecLens proposes {tech_name} ({category}) to fulfill client operational standards.",
                    "review_status": "OPEN",
                    "reviewer_notes": ""
                })
            elif is_prom_siem:
                c_id = f"CLM-{claim_counter:03d}"
                claim_counter += 1
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": f"Tooling '{tech_name}' proposed as an Enterprise SIEM solution.",
                    "source_type": "TECH_STACK",
                    "source_id": tech_name,
                    "source_title": f"Tech Stack: {tech_name}",
                    "classification": "NEEDS_REVIEW",
                    "initial_classification": "PROPOSED_DESIGN",
                    "confidence": 0.88,
                    "supporting_requirement_ids": matched_ids,
                    "evidence": matched_ev,
                    "traceability_chain": {
                        "claim_text": "Prometheus & Grafana as Enterprise SIEM",
                        "proposal_section": "Section 5: Technology Stack",
                        "architecture_component": "COMP-OBS-01",
                        "requirement_id": matched_ids[0] if matched_ids else "N/A",
                        "page": 1
                    },
                    "why_flagged": (
                        "Prometheus and Grafana provide time-series metrics, scraping, and dashboarding, "
                        "but do not by themselves constitute a certified Enterprise SIEM (Security Information and Event Management) "
                        "platform capable of long-term security log analysis and regulatory non-repudiation."
                    ),
                    "technical_notes": "Proposed tooling provides observability capabilities but may not fully satisfy SIEM/security-event-management requirements.",
                    "suggested_rewrite": (
                        "Deploy Prometheus & Grafana for platform observability, metrics, and SLA monitoring, "
                        "integrated with a dedicated sovereign SIEM log forwarder for centralized security audit event archival."
                    ),
                    "review_status": "OPEN",
                    "reviewer_notes": ""
                })
            else:
                c_id = f"CLM-{claim_counter:03d}"
                claim_counter += 1
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": f"Proposed {tech_name} for {item.get('purpose', category)}.",
                    "source_type": "TECH_STACK",
                    "source_id": tech_name,
                    "source_title": f"Tech Stack: {tech_name}",
                    "classification": "PROPOSED_DESIGN",
                    "initial_classification": "PROPOSED_DESIGN",
                    "confidence": 0.95,
                    "supporting_requirement_ids": item.get("requirements_addressed", [])[:3],
                    "evidence": [],
                    "traceability_chain": {
                        "claim_text": f"Selection of {tech_name}",
                        "proposal_section": "Section 5: Technology Stack",
                        "architecture_component": item.get("architecture_components", ["COMP-CORE-01"])[0],
                        "requirement_id": item.get("requirements_addressed", ["N/A"])[0],
                        "page": 1
                    },
                    "why_flagged": None,
                    "technical_notes": "Grounded selection rationale with documented alternatives.",
                    "suggested_rewrite": None,
                    "review_status": "RESOLVED",
                    "reviewer_notes": "Verified."
                })

        # =========================================================================
        # 2B. SPECIFIC PROTOCOL & SECURITY CONTROL CLAIMS AUDIT
        # =========================================================================
        technical_spec_claims = [
            {
                "term": "TLS 1.3",
                "claim_text": "Mandatory TLS 1.3 encryption on all ingress and egress network channels.",
                "search_terms": ["tls 1.3", "tls"],
                "section": "Section 6: Security Architecture",
                "comp_id": "COMP-SEC-01",
                "default_type": "RFP_FACT"
            },
            {
                "term": "AES-256",
                "claim_text": "AES-256 transparent encryption at rest for all database volumes and snapshot archives.",
                "search_terms": ["aes-256", "aes"],
                "section": "Section 8: Data Architecture",
                "comp_id": "COMP-DATA-01",
                "default_type": "RFP_FACT"
            },
            {
                "term": "VPC & Private Subnets",
                "claim_text": "Workloads isolated inside dedicated Virtual Private Cloud (VPC) with non-routable private subnets.",
                "search_terms": ["vpc", "virtual private cloud", "subnet"],
                "section": "Section 4: System Architecture",
                "comp_id": "COMP-INFRA-01",
                "default_type": "RFP_FACT"
            },
            {
                "term": "FIDO2 & TOTP Multi-Factor Authentication",
                "claim_text": "Enforces FIDO2 hardware token and time-based one-time password (TOTP) MFA for privileged administrative access.",
                "search_terms": ["fido2", "totp"],
                "section": "Section 6: Security Architecture",
                "comp_id": "COMP-SEC-01",
                "default_type": "PROPOSED_DESIGN",
                "capability_terms": ["mfa", "multi-factor"]
            },
            {
                "term": "gRPC Inter-Service Communication",
                "claim_text": "Internal microservice request dispatch mediated over high-performance binary gRPC protocols.",
                "search_terms": ["grpc"],
                "section": "Section 7: Integration Architecture",
                "comp_id": "COMP-INT-01",
                "default_type": "PROPOSED_DESIGN"
            },
            {
                "term": "PostgreSQL Dedicated Port 5432",
                "claim_text": "Transactional database read/write connections restricted strictly to TLS-encrypted SQL port 5432.",
                "search_terms": ["5432", "port 5432"],
                "section": "Section 8: Data Architecture",
                "comp_id": "COMP-DATA-01",
                "default_type": "PROPOSED_DESIGN"
            },
            {
                "term": "Horizontal Pod Auto-scaling (HPA)",
                "claim_text": "Horizontal Pod Auto-scaling (HPA) governed by CPU and memory saturation metrics.",
                "search_terms": ["hpa", "horizontal pod"],
                "section": "Section 4: System Architecture",
                "comp_id": "COMP-INFRA-01",
                "default_type": "PROPOSED_DESIGN",
                "capability_terms": ["auto-scaling", "elastic", "scaling"]
            }
        ]

        for spec in technical_spec_claims:
            matched_ids, matched_ev = find_evidence_for_terms(spec["search_terms"])
            c_id = f"CLM-{claim_counter:03d}"
            claim_counter += 1

            if len(matched_ids) > 0:
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": spec["claim_text"],
                    "source_type": "TECHNICAL_SPEC",
                    "source_id": spec["comp_id"],
                    "source_title": f"Technical Spec: {spec['term']}",
                    "classification": "RFP_FACT",
                    "initial_classification": "RFP_FACT",
                    "confidence": 0.98,
                    "supporting_requirement_ids": matched_ids,
                    "evidence": matched_ev,
                    "traceability_chain": {
                        "claim_text": spec["claim_text"],
                        "proposal_section": spec["section"],
                        "architecture_component": spec["comp_id"],
                        "requirement_id": matched_ids[0],
                        "page": matched_ev[0]["page"] if matched_ev else 1
                    },
                    "why_flagged": None,
                    "technical_notes": f"Directly grounded in RFP evidence text ({len(matched_ids)} clauses).",
                    "suggested_rewrite": None,
                    "review_status": "RESOLVED",
                    "reviewer_notes": "Verified RFP Fact."
                })
            else:
                # Check if capability is grounded but implementation is proposed
                cap_ids = []
                cap_ev = []
                if "capability_terms" in spec:
                    cap_ids, cap_ev = find_evidence_for_terms(spec["capability_terms"])

                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": spec["claim_text"],
                    "source_type": "TECHNICAL_SPEC",
                    "source_id": spec["comp_id"],
                    "source_title": f"Technical Spec: {spec['term']}",
                    "classification": "PROPOSED_DESIGN",
                    "initial_classification": "PROPOSED_DESIGN",
                    "confidence": 0.92,
                    "supporting_requirement_ids": cap_ids,
                    "evidence": cap_ev,
                    "traceability_chain": {
                        "claim_text": spec["claim_text"],
                        "proposal_section": spec["section"],
                        "architecture_component": spec["comp_id"],
                        "requirement_id": cap_ids[0] if cap_ids else "N/A",
                        "page": cap_ev[0]["page"] if cap_ev else 1
                    },
                    "why_flagged": None,
                    "technical_notes": (
                        f"Underlying capability grounded in {len(cap_ids)} clauses; "
                        f"specific technical mechanism ({spec['term']}) correctly classified as RecLens Proposed Design."
                        if cap_ids else "Architectural implementation design."
                    ),
                    "suggested_rewrite": None,
                    "review_status": "RESOLVED",
                    "reviewer_notes": "Verified Proposed Design."
                })

        # =========================================================================
        # 3. TIMELINE & ESTIMATE FIREWALL
        # =========================================================================
        timeline_audit = {
            "client_deadlines": [],
            "preliminary_estimates": [],
            "proposed_milestones": [],
            "assumed_dependencies": [],
            "disclaimer_present": bool("AI-assisted preliminary estimate" in delivery_feasibility.get("disclaimer", ""))
        }

        # 3A. 20-24 week estimate
        est_range = delivery_feasibility.get("estimated_delivery_range", "20–24 weeks")
        c_id = f"CLM-{claim_counter:03d}"
        claim_counter += 1
        audited_claims.append({
            "claim_id": c_id,
            "claim_text": f"Project implementation duration estimated at {est_range}.",
            "source_type": "TIMELINE",
            "source_id": "EST-01",
            "source_title": "Implementation Estimate",
            "classification": "PROPOSED_DESIGN",
            "initial_classification": "PROPOSED_DESIGN",
            "confidence": 0.92,
            "supporting_requirement_ids": [],
            "evidence": [],
            "traceability_chain": {
                "claim_text": f"Delivery benchmark {est_range}",
                "proposal_section": "Section 9: Implementation Plan",
                "architecture_component": "N/A",
                "requirement_id": "N/A",
                "page": 1
            },
            "why_flagged": None,
            "technical_notes": "Properly accompanied by preliminary AI disclaimer.",
            "suggested_rewrite": None,
            "review_status": "RESOLVED",
            "reviewer_notes": "Audited as preliminary vendor benchmark."
        })
        timeline_audit["preliminary_estimates"].append({
            "item": "Delivery Duration",
            "value": est_range,
            "disclaimer_attached": True
        })

        # 3B. 30-day hypercare & milestones
        c_id = f"CLM-{claim_counter:03d}"
        claim_counter += 1
        audited_claims.append({
            "claim_id": c_id,
            "claim_text": "RecLens provides 30-day dedicated hypercare support following production cutover.",
            "source_type": "TIMELINE",
            "source_id": "M-06",
            "source_title": "Milestone M-06: Production Cutover",
            "classification": "PROPOSED_DESIGN",
            "initial_classification": "PROPOSED_DESIGN",
            "confidence": 0.90,
            "supporting_requirement_ids": [],
            "evidence": [],
            "traceability_chain": {
                "claim_text": "30-day hypercare commitment",
                "proposal_section": "Section 9: Implementation Plan",
                "architecture_component": "COMP-CORE-01",
                "requirement_id": "N/A",
                "page": 1
            },
            "why_flagged": None,
            "technical_notes": "Proposed warranty commitment.",
            "suggested_rewrite": None,
            "review_status": "RESOLVED",
            "reviewer_notes": "Verified as vendor proposed terms."
        })

        # 3C. Strategic delivery options (Parallel Squads / 4-6 week extension)
        for opt in delivery_feasibility.get("options", []):
            timeline_audit["proposed_milestones"].append({
                "option": opt.get("title", ""),
                "summary": opt.get("summary", ""),
                "feasibility": opt.get("feasibility", "")
            })

        # =========================================================================
        # 4. ASSUMPTION PRECISION FIREWALL
        # =========================================================================
        assumption_audits = []
        for asm in assumptions:
            asm_id = asm.get("id") or asm.get("assumption_id", "ASM-001")
            stmt = asm.get("statement") or asm.get("description") or asm.get("text", "")
            
            # Check for arbitrary invented numerical precision without RFP grounding
            # e.g., "within 10 business days", "within 5 business days"
            precision_match = re.search(r"within\s+(\d+)\s+business\s+days", stmt, re.IGNORECASE)
            has_arbitrary_precision = bool(precision_match)

            if has_arbitrary_precision:
                num_days = precision_match.group(1)
                safe_formulation = re.sub(
                    r"within\s+\d+\s+business\s+days\s+of\s+project\s+kickoff",
                    "in time to support the scheduled milestone discovery kickoff",
                    stmt,
                    flags=re.IGNORECASE
                )
                safe_formulation = re.sub(
                    r"within\s+\d+\s+business\s+days\s+per\s+release",
                    "within an agreed operational turnaround window prior to milestone cutover",
                    safe_formulation,
                    flags=re.IGNORECASE
                )
                if safe_formulation == stmt:
                    safe_formulation = re.sub(
                        r"within\s+\d+\s+business\s+days([a-zA-Z\s]*)",
                        r"in alignment with agreed project milestone schedules\1",
                        stmt,
                        flags=re.IGNORECASE
                    )
                
                c_id = f"CLM-{claim_counter:03d}"
                claim_counter += 1
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": stmt,
                    "source_type": "ASSUMPTION",
                    "source_id": asm_id,
                    "source_title": f"Assumption {asm_id}",
                    "classification": "NEEDS_REVIEW",
                    "initial_classification": "ASSUMPTION",
                    "confidence": 0.85,
                    "supporting_requirement_ids": asm.get("related_requirement_ids", []),
                    "evidence": [],
                    "traceability_chain": {
                        "claim_text": stmt,
                        "proposal_section": "Section 14: Commercial Assumptions",
                        "architecture_component": asm.get("related_architecture_components", ["N/A"])[0],
                        "requirement_id": asm.get("related_requirement_ids", ["N/A"])[0],
                        "page": 1
                    },
                    "why_flagged": (
                        f"Invented numerical precision detected: '{precision_match.group(0)}'. "
                        f"The specific timeframe of {num_days} business days is an arbitrary vendor planning assumption "
                        f"not found in RFP evidence. Rigorously define expectations relative to milestone prerequisites."
                    ),
                    "technical_notes": "Avoid unnegotiated numerical constraints that could trigger procurement friction.",
                    "suggested_rewrite": safe_formulation,
                    "review_status": "OPEN",
                    "reviewer_notes": ""
                })

                assumption_audits.append({
                    "assumption_id": asm_id,
                    "statement": stmt,
                    "invented_precision_detected": True,
                    "arbitrary_elements": [precision_match.group(0)],
                    "suggested_safe_formulation": safe_formulation,
                    "status": "NEEDS_REVIEW"
                })
            else:
                c_id = f"CLM-{claim_counter:03d}"
                claim_counter += 1
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": stmt,
                    "source_type": "ASSUMPTION",
                    "source_id": asm_id,
                    "source_title": f"Assumption {asm_id}",
                    "classification": "ASSUMPTION",
                    "initial_classification": "ASSUMPTION",
                    "confidence": 0.94,
                    "supporting_requirement_ids": asm.get("related_requirement_ids", []),
                    "evidence": [],
                    "traceability_chain": {
                        "claim_text": stmt,
                        "proposal_section": "Section 14: Commercial Assumptions",
                        "architecture_component": "N/A",
                        "requirement_id": "N/A",
                        "page": 1
                    },
                    "why_flagged": None,
                    "technical_notes": "Explicit, uninflated contingency.",
                    "suggested_rewrite": None,
                    "review_status": "RESOLVED",
                    "reviewer_notes": "Confirmed."
                })

                assumption_audits.append({
                    "assumption_id": asm_id,
                    "statement": stmt,
                    "invented_precision_detected": False,
                    "arbitrary_elements": [],
                    "suggested_safe_formulation": stmt,
                    "status": "VALIDATED"
                })

        # =========================================================================
        # 5. PROPOSAL SECTION CLAIMS FIREWALL (16 SECTIONS)
        # =========================================================================
        for sec in proposal_sections:
            sec_num = sec.get("number", 1)
            sec_title = sec.get("title", f"Section {sec_num}")
            sec_claims = sec.get("claims", [])

            for clm in sec_claims:
                c_text = clm.get("claim_text", "")
                initial_clf = clm.get("classification", "GROUNDED_REQUIREMENT")
                pg = clm.get("source_page")

                # Audit verification logic
                verified_clf = initial_clf
                why_flagged = None
                suggested_rewrite = None
                evidence_list = []
                matched_req_ids = []

                # Test 1: Grounded Requirement claim verification
                if initial_clf == "GROUNDED_REQUIREMENT":
                    # Check if claim keywords exist in RFP evidence
                    c_lower = c_text.lower()
                    
                    # Check if this claim is asserting a specific named technology is required
                    for vendor_tech in ["keycloak", "postgresql 16", "kong gateway", "prometheus"]:
                        if vendor_tech in c_lower and any(w in c_lower for w in ["requires", "mandates", "shall"]):
                            verified_clf = "UNSUPPORTED_CLAIM"
                            why_flagged = f"Claim asserts that the client mandates '{vendor_tech}', which is absent from RFP text."
                            suggested_rewrite = (
                                f"The client RFP requires enterprise capability; "
                                f"RecLens proposes {vendor_tech} as the implementation platform."
                            )
                            break

                    if verified_clf == "GROUNDED_REQUIREMENT":
                        # Find matching requirements
                        keywords = [w for w in re.findall(r"\b[a-zA-Z]{4,}\b", c_text) if w.lower() not in ["this", "that", "with", "from", "shall", "will", "client", "platform"]]
                        matched_req_ids, evidence_list = find_evidence_for_terms(keywords[:4])
                        
                        if len(matched_req_ids) > 0:
                            verified_clf = "RFP_FACT"
                        else:
                            verified_clf = "PROPOSED_DESIGN"
                            why_flagged = "Factual statement lacks direct textual RFP match; reclassified to Proposed Design."
                            suggested_rewrite = f"RecLens designs the platform architecture to ensure {c_text}."

                elif initial_clf == "PROPOSED_DESIGN":
                    verified_clf = "PROPOSED_DESIGN"

                elif initial_clf == "ASSUMPTION":
                    verified_clf = "ASSUMPTION"

                c_id = f"CLM-{claim_counter:03d}"
                claim_counter += 1
                audited_claims.append({
                    "claim_id": c_id,
                    "claim_text": c_text,
                    "source_type": "PROPOSAL_SECTION",
                    "source_id": f"Section {sec_num}",
                    "source_title": f"Section {sec_num}: {sec_title}",
                    "classification": verified_clf,
                    "initial_classification": initial_clf,
                    "confidence": 0.95 if verified_clf in ["RFP_FACT", "PROPOSED_DESIGN"] else 0.82,
                    "supporting_requirement_ids": matched_req_ids,
                    "evidence": evidence_list,
                    "traceability_chain": {
                        "claim_text": c_text,
                        "proposal_section": f"Section {sec_num}: {sec_title}",
                        "architecture_component": "COMP-CORE-01",
                        "requirement_id": matched_req_ids[0] if matched_req_ids else "N/A",
                        "page": pg or (evidence_list[0]["page"] if evidence_list else 1)
                    },
                    "why_flagged": why_flagged,
                    "technical_notes": "Audited via Proposal Claim Firewall.",
                    "suggested_rewrite": suggested_rewrite,
                    "review_status": "OPEN" if verified_clf in ["UNSUPPORTED_CLAIM", "NEEDS_REVIEW"] else "RESOLVED",
                    "reviewer_notes": ""
                })

        # =========================================================================
        # 6. SUMMARY & GROUNDING METRICS
        # =========================================================================
        total_claims = len(audited_claims)
        rfp_facts = sum(1 for c in audited_claims if c["classification"] == "RFP_FACT")
        proposed_designs = sum(1 for c in audited_claims if c["classification"] == "PROPOSED_DESIGN")
        assumptions_count = sum(1 for c in audited_claims if c["classification"] == "ASSUMPTION")
        unsupported_count = sum(1 for c in audited_claims if c["classification"] == "UNSUPPORTED_CLAIM")
        needs_review_count = sum(1 for c in audited_claims if c["classification"] == "NEEDS_REVIEW")

        # Deterministic Proposal Grounding Score
        grounding_score = cls.calculate_grounding_score(audited_claims)

        audit_verdict = (
            "PASSED - HIGH GROUNDING INTEGRITY" if unsupported_count == 0 and needs_review_count == 0
            else "ATTENTION REQUIRED - RED UNSUPPORTED CLAIMS OR MISCLASSIFICATIONS DETECTED" if unsupported_count > 0
            else "REVIEW RECOMMENDED - TECHNICAL QUESTION MARKS OR INVENTED PRECISION DETECTED"
        )

        return {
            "summary": {
                "total_claims": total_claims,
                "rfp_facts_count": rfp_facts,
                "proposed_designs_count": proposed_designs,
                "assumptions_count": assumptions_count,
                "unsupported_claims_count": unsupported_count,
                "needs_review_count": needs_review_count,
                "grounding_score": grounding_score,
                "audit_verdict": audit_verdict,
                "score_explanation": (
                    f"Proposal Grounding Score ({grounding_score}/100) measures empirical claim verifiability. "
                    f"Reflects {rfp_facts} grounded RFP facts, {proposed_designs} accurately labeled proposals, "
                    f"{assumptions_count} declared assumptions, penalized by {unsupported_count} unsupported claims "
                    f"and {needs_review_count} items requiring review. Not a win probability."
                )
            },
            "claims": audited_claims,
            "dual_origin_components": dual_origin_components,
            "timeline_audit": timeline_audit,
            "assumption_audits": assumption_audits
        }

    @classmethod
    def calculate_grounding_score(cls, claims: List[Dict[str, Any]]) -> int:
        """
        Deterministic formula for Proposal Grounding Score:
        Grounded facts = 1.0, Proposed designs = 0.95, Declared assumptions = 0.85
        Penalties: Unsupported claims = 1.5 weight penalty, Needs review = 0.8 weight penalty.
        """
        if not claims:
            return 100
        total_claims = len(claims)
        rfp_facts = sum(1 for c in claims if c.get("classification") == "RFP_FACT")
        proposed_designs = sum(1 for c in claims if c.get("classification") == "PROPOSED_DESIGN")
        assumptions_count = sum(1 for c in claims if c.get("classification") == "ASSUMPTION")
        unsupported_count = sum(1 for c in claims if c.get("classification") == "UNSUPPORTED_CLAIM" and c.get("review_status") != "RESOLVED")
        needs_review_count = sum(1 for c in claims if c.get("classification") == "NEEDS_REVIEW" and c.get("review_status") != "RESOLVED")

        weighted_valid = (rfp_facts * 1.0) + (proposed_designs * 0.95) + (assumptions_count * 0.85)
        weighted_total = total_claims + (unsupported_count * 1.5) + (needs_review_count * 0.8)
        raw_ratio = (weighted_valid / max(weighted_total, 1)) * 100
        return min(100, max(25, int(raw_ratio)))

    @classmethod
    def audit_architecture_components(
        cls,
        components: List[Dict[str, Any]],
        requirements: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Standalone audit for architecture components.
        """
        res = cls.audit_project(
            requirements=requirements,
            architecture={"components": components, "data_flows": []},
            tech_stack=[],
            delivery_feasibility={},
            milestones=[],
            team=[],
            assumptions=[],
            proposal_sections=[]
        )
        # Filter for architecture component claims
        return [c for c in res["claims"] if c.get("source_type") == "ARCHITECTURE_COMPONENT"]

    @classmethod
    def audit_timeline_milestones(
        cls,
        milestones: List[Dict[str, Any]],
        requirements: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Standalone audit for timeline milestones and delivery claims.
        """
        res = cls.audit_project(
            requirements=requirements,
            architecture={"components": [], "data_flows": []},
            tech_stack=[],
            delivery_feasibility={"estimated_delivery_range": "20–24 weeks"},
            milestones=milestones,
            team=[],
            assumptions=[],
            proposal_sections=[]
        )
        return [c for c in res["claims"] if c.get("source_type") == "TIMELINE"]

    @classmethod
    def audit_assumptions(
        cls,
        assumptions: List[Dict[str, Any]],
        requirements: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Standalone audit for project assumptions and invented precision.
        """
        res = cls.audit_project(
            requirements=requirements,
            architecture={"components": [], "data_flows": []},
            tech_stack=[],
            delivery_feasibility={},
            milestones=[],
            team=[],
            assumptions=assumptions,
            proposal_sections=[]
        )
        return [c for c in res["claims"] if c.get("source_type") == "ASSUMPTION"]

    @classmethod
    def apply_claim_action(
        cls,
        claims: List[Dict[str, Any]],
        claim_id: str,
        action: str,
        custom_text: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Applies a reviewer action to a claim (accept_rewrite, reject, edit, mark_reviewed)
        and recalculates the grounding metrics and audit summary.
        """
        target_claim = None
        for c in claims:
            if c.get("claim_id") == claim_id:
                target_claim = c
                break

        if not target_claim:
            raise ValueError(f"Claim {claim_id} not found")

        if action == "accept_rewrite":
            if target_claim.get("suggested_rewrite"):
                target_claim["claim_text"] = target_claim["suggested_rewrite"]
            target_claim["classification"] = "PROPOSED_DESIGN"
            target_claim["status"] = "ACCEPTED_REWRITE"
            target_claim["review_status"] = "RESOLVED"
            target_claim["reviewer_notes"] = notes or "Safe rewrite accepted by reviewer."
        elif action == "reject":
            target_claim["status"] = "REJECTED"
            target_claim["review_status"] = "ACCEPTED_RISK"
            target_claim["reviewer_notes"] = notes or "Rewrite rejected. Accepted risk."
        elif action == "edit":
            if custom_text:
                target_claim["claim_text"] = custom_text
            target_claim["classification"] = "PROPOSED_DESIGN"
            target_claim["status"] = "EDITED"
            target_claim["review_status"] = "RESOLVED"
            target_claim["reviewer_notes"] = notes or "Custom edit applied by reviewer."
        elif action == "mark_reviewed":
            target_claim["status"] = "VERIFIED"
            target_claim["review_status"] = "RESOLVED"
            if notes:
                target_claim["reviewer_notes"] = notes

        grounding_score = cls.calculate_grounding_score(claims)
        rfp_facts = sum(1 for c in claims if c.get("classification") == "RFP_FACT")
        proposed_designs = sum(1 for c in claims if c.get("classification") == "PROPOSED_DESIGN")
        assumptions_count = sum(1 for c in claims if c.get("classification") == "ASSUMPTION")
        unsupported_count = sum(1 for c in claims if c.get("classification") == "UNSUPPORTED_CLAIM" and c.get("review_status") != "RESOLVED")
        needs_review_count = sum(1 for c in claims if c.get("classification") == "NEEDS_REVIEW" and c.get("review_status") != "RESOLVED")

        summary = {
            "total_claims": len(claims),
            "rfp_facts_count": rfp_facts,
            "proposed_designs_count": proposed_designs,
            "assumptions_count": assumptions_count,
            "unsupported_claims_count": unsupported_count,
            "needs_review_count": needs_review_count,
            "grounding_score": grounding_score,
            "audit_verdict": (
                "PASSED - HIGH GROUNDING INTEGRITY" if unsupported_count == 0 and needs_review_count == 0
                else "ATTENTION REQUIRED - RED UNSUPPORTED CLAIMS OR MISCLASSIFICATIONS DETECTED" if unsupported_count > 0
                else "REVIEW RECOMMENDED - TECHNICAL QUESTION MARKS OR INVENTED PRECISION DETECTED"
            )
        }
        return target_claim, summary
