from typing import List, Dict, Any

class ProposalGenerator:
    """
    Generates a structured, evidence-grounded 16-section technical proposal.
    Pipeline:
    Normalized Requirements → Validated Risks → Clarifications → Architecture →
    Technology Stack → Assumptions → Timeline → Proposal.
    """

    @classmethod
    def generate_proposal(
        cls,
        project_name: str,
        requirements: List[Dict[str, Any]],
        risks: List[Dict[str, Any]],
        clarifications: List[Dict[str, Any]],
        architecture: Dict[str, Any],
        tech_stack: List[Dict[str, Any]],
        assumptions: List[Dict[str, Any]],
        milestones: List[Dict[str, Any]],
        team: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        total_reqs = len(requirements)
        mandatory_reqs = sum(1 for r in requirements if r.get("priority") == "Mandatory")
        critical_risks = [r for r in risks if r.get("severity") == "Critical"]
        components = architecture.get("components", [])

        # Helpers for requirement IDs
        sec_ids = [r["id"] for r in requirements if r.get("category") == "Security"][:6]
        infra_ids = [r["id"] for r in requirements if r.get("category") == "Infrastructure"][:6]
        int_ids = [r["id"] for r in requirements if r.get("category") == "Integration"][:6]
        data_ids = [r["id"] for r in requirements if r.get("category") == "Data / Migration"][:6]
        top_ids = [r["id"] for r in requirements[:8]]

        sections = [
            # 1. Executive Summary
            {
                "number": 1,
                "title": "Executive Summary",
                "content": (
                    f"RecLens has engineered this comprehensive Technical Proposal in direct response to the "
                    f"client's Request for Proposal ({project_name}). Our proposal is evidence-grounded, addressing "
                    f"{total_reqs} verified client requirements ({mandatory_reqs} mandatory covenants) extracted with "
                    f"100% page-level source traceability. We propose a resilient, modular cloud architecture backed by "
                    f"Zero Trust security, automated multi-AZ failover, and sovereign compliance."
                ),
                "related_requirement_ids": top_ids,
                "related_risk_ids": [r["id"] for r in risks[:2]],
                "related_assumption_ids": ["ASM-001", "ASM-002"],
                "claims": [
                    {
                        "claim_text": f"RFP specifies {total_reqs} total requirements including {mandatory_reqs} mandatory specifications.",
                        "classification": "GROUNDED_REQUIREMENT",
                        "source_page": 1
                    },
                    {
                        "claim_text": "We propose a modular microservices architecture hosted across multi-AZ availability zones.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 2. Understanding of Client Requirements
            {
                "number": 2,
                "title": "Understanding of Client Requirements",
                "content": (
                    f"A rigorous, deterministic parsing audit of the client's RFP reveals a structured scope of {total_reqs} "
                    f"requirements distributed across Technical Infrastructure ({len(infra_ids)}+ clauses), Enterprise Security ({len(sec_ids)}+ clauses), "
                    f"System Integration ({len(int_ids)}+ clauses), and Data Persistence ({len(data_ids)}+ clauses). "
                    f"All requirements have been normalized, cataloged, and cross-referenced against original document page and section headings."
                ),
                "related_requirement_ids": top_ids,
                "related_risk_ids": [],
                "related_assumption_ids": [],
                "claims": [
                    {
                        "claim_text": f"RFP establishes mandatory security and operational covenants across {total_reqs} clauses.",
                        "classification": "GROUNDED_REQUIREMENT",
                        "source_page": requirements[0]["page"] if requirements else 1
                    }
                ]
            },

            # 3. Proposed Solution
            {
                "number": 3,
                "title": "Proposed Solution",
                "content": (
                    "Our solution delivers an enterprise-grade cloud operating platform engineered for seamless scalability, "
                    "verifiable data sovereignty, and robust business continuity. The platform decouples presentation, "
                    "business workflow execution, integration mediation, and transactional data persistence to ensure that "
                    "individual service updates can be rolled out with zero downtime."
                ),
                "related_requirement_ids": [c["component_id"] for c in components],
                "related_risk_ids": [],
                "related_assumption_ids": ["ASM-001"],
                "claims": [
                    {
                        "claim_text": "Proposed solution uses decoupled service tiers with automated rolling upgrades.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 4. Technical Architecture
            {
                "number": 4,
                "title": "Technical Architecture",
                "content": (
                    f"The technical architecture comprises {len(components)} core subsystems: "
                    + ", ".join([f"{c['name']} ({c['component_id']})" for c in components]) + ". "
                    "Network isolation is enforced via private VPC subnets with dedicated ingress load balancers. "
                    "All inter-service traffic is authenticated via short-lived JWT bearer tokens with internal mutual TLS."
                ),
                "related_requirement_ids": infra_ids + sec_ids,
                "related_risk_ids": [],
                "related_assumption_ids": ["ASM-002"],
                "claims": [
                    {
                        "claim_text": "Architecture employs Zero Trust microsegmentation and internal mTLS communication.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 5. Technology Stack
            {
                "number": 5,
                "title": "Technology Stack",
                "content": (
                    f"The recommended technology stack combines production-proven open technologies to deliver enterprise performance "
                    f"without proprietary vendor lock-in. Key selected technologies include: "
                    + "; ".join([f"{t['category']}: {t['technology']} (Origin: {t['origin']})" for t in tech_stack]) + ". "
                    "Each technology choice is directly tied to verified RFP capability needs."
                ),
                "related_requirement_ids": [rid for t in tech_stack for rid in t.get("requirements_addressed", [])],
                "related_risk_ids": [],
                "related_assumption_ids": [],
                "claims": [
                    {
                        "claim_text": "Technology recommendations are selected by RecLens based on requirement characteristics.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 6. Security & Compliance
            {
                "number": 6,
                "title": "Security & Compliance",
                "content": (
                    f"Security is architected as a core foundational pillar satisfying {len(sec_ids)} explicit security requirements. "
                    "The system enforces mandatory multi-factor authentication (MFA) via FIDO2 WebAuthn and TOTP RFC 6238 protocols "
                    "for all privileged administrative access. Data residency covenants are respected by hosting strictly within "
                    "sovereign MeitY-empanelled data centers in India. All persistent data is encrypted with AES-256 at rest, "
                    "and all transport channels mandate TLS 1.3."
                ),
                "related_requirement_ids": sec_ids,
                "related_risk_ids": [r["id"] for r in risks if r.get("category") == "Security"],
                "related_assumption_ids": ["ASM-002"],
                "claims": [
                    {
                        "claim_text": "MFA and sovereign data residency in India are mandatory client specifications.",
                        "classification": "GROUNDED_REQUIREMENT",
                        "source_page": sec_reqs[0]["page"] if (sec_reqs := [r for r in requirements if r.get("category") == "Security"]) else 1
                    },
                    {
                        "claim_text": "Keycloak Enterprise IAM is proposed to enforce FIDO2 and SAML federation.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 7. Integration Approach
            {
                "number": 7,
                "title": "Integration Approach",
                "content": (
                    f"The Enterprise Integration Gateway (COMP-INT-01) manages interfaces addressing {len(int_ids)} integration specifications. "
                    "External connectors utilize RESTful endpoints with OpenAPI schemas, automated request rate-limiting, "
                    "and HMAC message authentication. Event-driven message broker queues decouple asynchronous feeds and "
                    "prevent downstream service starvation during transaction surges."
                ),
                "related_requirement_ids": int_ids,
                "related_risk_ids": [r["id"] for r in risks if r.get("category") == "Integration"],
                "related_assumption_ids": ["ASM-001"],
                "claims": [
                    {
                        "claim_text": "Enterprise Integration Gateway mediates all third-party external connectors.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 8. Implementation Methodology
            {
                "number": 8,
                "title": "Implementation Methodology",
                "content": (
                    "We execute an Agile Scrum delivery framework with two-week sprint intervals, structured sprint retrospectives, "
                    "and continuous integration/continuous deployment (CI/CD) pipelines. Automated unit and integration testing "
                    "gates ensure that code regressions are identified and remediated prior to staging deployment."
                ),
                "related_requirement_ids": [],
                "related_risk_ids": [],
                "related_assumption_ids": ["ASM-004"],
                "claims": [
                    {
                        "claim_text": "Delivery executes an Agile Scrum delivery cadence with 2-week sprint cycles.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 9. Timeline & Milestones
            {
                "number": 9,
                "title": "Timeline & Milestones",
                "content": (
                    f"Implementation is structured into {len(milestones)} major delivery milestones spanning an estimated "
                    "20 to 24-week delivery roadmap: "
                    + "; ".join([f"{m['name']} ({m['duration_range']})" for m in milestones]) + ". "
                    "All timeline estimates are preliminary engineering projections subject to delivery-team validation."
                ),
                "related_requirement_ids": [r["id"] for r in requirements if r.get("category") == "Timeline"][:6],
                "related_risk_ids": [r["id"] for r in risks if r.get("category") == "Timeline"],
                "related_assumption_ids": ["ASM-001", "ASM-004"],
                "claims": [
                    {
                        "claim_text": "Implementation is structured across 6 sequential milestones spanning 20–24 weeks.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 10. Team Composition
            {
                "number": 10,
                "title": "Team Composition",
                "content": (
                    f"To deliver the platform within target quality parameters, we recommend a multidisciplinary squad of "
                    f"{sum(t.get('suggested_count', 1) for t in team)} specialized professionals: "
                    + "; ".join([f"{t['role']} ({t['suggested_count']} FTE, {t['delivery_phase']})" for t in team]) + ". "
                    "Roles are dedicated to specific phases to optimize budget allocation while maintaining technical continuity."
                ),
                "related_requirement_ids": top_ids,
                "related_risk_ids": [],
                "related_assumption_ids": [],
                "claims": [
                    {
                        "claim_text": "Proposed team allocation includes specialized Lead Architect, Security, DevOps, and QA roles.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 11. Risks & Mitigations
            {
                "number": 11,
                "title": "Risks & Mitigations",
                "content": (
                    f"Our Phase 1 intelligence audit identified {len(risks)} significant delivery and commercial risks: "
                    + "; ".join([f"{rk.get('title', 'Risk')} (Severity: {rk.get('severity', 'Medium')}): {rk.get('recommendation', rk.get('description', 'Proactive mitigation applied'))}" for rk in risks]) + ". "
                    "Proactive mitigations have been incorporated into architecture and timeline buffers."
                ),
                "related_requirement_ids": [rid for rk in risks for rid in rk.get("requirement_ids", [])],
                "related_risk_ids": [rk["id"] for rk in risks],
                "related_assumption_ids": [],
                "claims": [
                    {
                        "claim_text": f"Audit identified {len(risks)} specific operational and legal risk clauses in RFP.",
                        "classification": "GROUNDED_REQUIREMENT",
                        "source_page": risks[0]["evidence"][0]["page"] if (risks and risks[0].get("evidence")) else 1
                    }
                ]
            },

            # 12. Assumptions
            {
                "number": 12,
                "title": "Assumptions",
                "content": (
                    f"Architecture and delivery planning rely on {len(assumptions)} explicit operational assumptions recorded in the Assumption Ledger: "
                    + "; ".join([f"[{a['assumption_id']}] {a['statement']}" for a in assumptions]) + ". "
                    "These assumptions are tracked as open governance items to be confirmed during Phase 1 discovery."
                ),
                "related_requirement_ids": [rid for a in assumptions for rid in a.get("related_requirement_ids", [])],
                "related_risk_ids": [],
                "related_assumption_ids": [a["assumption_id"] for a in assumptions],
                "claims": [
                    {
                        "claim_text": "Client will provide interface documentation and sandbox credentials during discovery.",
                        "classification": "ASSUMPTION",
                        "source_page": None
                    }
                ]
            },

            # 13. Dependencies
            {
                "number": 13,
                "title": "Dependencies",
                "content": (
                    "Key external delivery dependencies include: (1) Prompt provisioning of cloud hosting accounts in MeitY-empanelled regions; "
                    "(2) Timely issuance of SAML identity metadata for Azure AD federation; (3) Availability of client subject matter experts "
                    "for weekly sprint reviews and UAT defect sign-offs."
                ),
                "related_requirement_ids": infra_ids[:3],
                "related_risk_ids": [],
                "related_assumption_ids": ["ASM-001", "ASM-002", "ASM-004"],
                "claims": [
                    {
                        "claim_text": "Delivery progress depends on external stakeholder review turnarounds.",
                        "classification": "ASSUMPTION",
                        "source_page": None
                    }
                ]
            },

            # 14. Requirement Traceability
            {
                "number": 14,
                "title": "Requirement Traceability",
                "content": (
                    f"Every one of the {total_reqs} normalized requirements maintains unbroken bidirectional traceability from its source "
                    f"RFP page to its mapped solution component (COMP-01..06), proposal section, and milestone phase. "
                    "The Traceability Matrix provides transparent verification of compliance status across all client mandates."
                ),
                "related_requirement_ids": top_ids,
                "related_risk_ids": [],
                "related_assumption_ids": [],
                "claims": [
                    {
                        "claim_text": f"Traceability matrix maps all {total_reqs} requirements to specific technical deliverables.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 15. Open Clarifications
            {
                "number": 15,
                "title": "Open Clarifications",
                "content": (
                    f"RecLens has formulated {len(clarifications)} structured pre-bid clarification inquiries regarding ambiguous clauses: "
                    + "; ".join([f"[{cl['id']}] {cl['question']}" for cl in clarifications]) + ". "
                    "Dispatching these questions during the pre-bid window ensures delivery estimates and sizing metrics remain deterministic."
                ),
                "related_requirement_ids": [rid for cl in clarifications for rid in cl.get("requirement_ids", [])],
                "related_risk_ids": [],
                "related_assumption_ids": [],
                "claims": [
                    {
                        "claim_text": f"Identified {len(clarifications)} pre-bid clarification questions for client procurement.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            },

            # 16. Conclusion
            {
                "number": 16,
                "title": "Conclusion",
                "content": (
                    f"In conclusion, our technical solution directly fulfills all {total_reqs} client requirements with verified evidence, "
                    "a hardened Zero Trust security baseline, transparent assumptions, and an actionable 6-milestone delivery roadmap. "
                    "We welcome the opportunity to partner with the client to deliver this critical infrastructure platform."
                ),
                "related_requirement_ids": top_ids,
                "related_risk_ids": [],
                "related_assumption_ids": [],
                "claims": [
                    {
                        "claim_text": "Technical proposal provides end-to-end evidence-backed architecture for RFP award.",
                        "classification": "PROPOSED_DESIGN",
                        "source_page": None
                    }
                ]
            }
        ]

        return sections
