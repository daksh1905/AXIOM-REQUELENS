import re
from typing import List, Dict, Any, Tuple

class DeliveryEstimator:
    """
    Estimates delivery feasibility, team composition, quantitative effort,
    and implementation timeline from normalized requirements, risks, and architecture components.
    
    CRITICAL RULE:
    All estimates are transparently labeled as AI-assisted preliminary estimates.
    Never invents client deadlines.
    """

    @classmethod
    def estimate_delivery_and_team(
        cls,
        requirements: List[Dict[str, Any]],
        risks: List[Dict[str, Any]],
        architecture_components: List[Dict[str, Any]],
        assumptions: List[Dict[str, Any]]
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Returns:
            (delivery_feasibility, team_estimates, milestones)
        """
        total_reqs = len(requirements)
        mandatory_reqs = sum(1 for r in requirements if r.get("priority") == "Mandatory")
        
        # Categorical lists and counts
        sec_reqs = [r for r in requirements if r.get("category") == "Security" or r.get("requirement_type") == "SECURITY"]
        infra_reqs = [r for r in requirements if r.get("category") in ["Technical", "Infrastructure"] or r.get("requirement_type") == "TECHNICAL"]
        int_reqs = [r for r in requirements if r.get("category") == "Integration" or r.get("requirement_type") == "INTEGRATION"]
        data_reqs = [r for r in requirements if r.get("category") == "Data / Migration" or r.get("requirement_type") == "DATA"]
        timeline_reqs = [r for r in requirements if r.get("category") == "Timeline" or r.get("requirement_type") == "TIMELINE"]
        
        sec_count = len(sec_reqs)
        infra_count = len(infra_reqs)
        int_count = len(int_reqs)
        data_count = len(data_reqs)
        timeline_count = len(timeline_reqs)
        
        # Risk factors
        has_critical_timeline = any(r.get("category") == "Timeline" and r.get("severity") == "Critical" for r in risks)
        has_critical_legal = any(r.get("category") == "Legal" and r.get("severity") == "Critical" for r in risks)
        
        # Feasibility assessment
        delivery_pressure = "High" if (total_reqs > 400 or has_critical_timeline) else "Medium"
        migration_complexity = "High" if data_count > 30 else ("Medium" if data_count > 10 else "Low")
        integration_complexity = "High" if int_count > 30 else ("Medium" if int_count > 10 else "Low")
        security_effort = "High" if sec_count > 50 else ("Medium" if sec_count > 20 else "Low")
        
        # Quantitative effort calculation
        base_hours_per_req = 12 if total_reqs < 100 else 8
        calculated_dev_hours = max(3200, total_reqs * base_hours_per_req + (sec_count * 16) + (data_count * 24))
        person_months = round(calculated_dev_hours / 160, 1)

        delivery_feasibility = {
            "requested_deadline": "Derived from RFP specifications",
            "estimated_delivery_range": "20–24 weeks (5–6 months)",
            "overall_pressure": delivery_pressure,
            "total_estimated_hours": calculated_dev_hours,
            "total_person_months": person_months,
            "effort_breakdown_by_phase": {
                "M-01 Architecture Baseline & Discovery": f"{round(calculated_dev_hours * 0.10)} hours",
                "M-02 Cloud Foundation & Security Hardening": f"{round(calculated_dev_hours * 0.14)} hours",
                "M-03 Core Platform & API Gateway Engineering": f"{round(calculated_dev_hours * 0.38)} hours",
                "M-04 Legacy Data Migration & Integration": f"{round(calculated_dev_hours * 0.18)} hours",
                "M-05 Security Audit, VAPT & UAT": f"{round(calculated_dev_hours * 0.12)} hours",
                "M-06 Production Cutover & Hypercare": f"{round(calculated_dev_hours * 0.08)} hours"
            },
            "dependency_risk": "Moderate (dependent on timely client interface access and credential provisioning)",
            "migration_complexity": migration_complexity,
            "integration_complexity": integration_complexity,
            "security_compliance_effort": security_effort,
            "unresolved_items_count": len([r for r in risks if r.get("severity") == "Critical"]),
            "disclaimer": "AI-assisted preliminary estimate — requires delivery-team validation.",
            "options": [
                {
                    "title": "Option A — Phased Scope Release (Recommended)",
                    "summary": "Deploy core compute infrastructure, IAM authentication, and high-priority APIs in MVP milestone (Weeks 1–12), migrating historical legacy datasets and secondary reporting integrations in Phase 2 (Weeks 13–20).",
                    "feasibility": "High",
                    "tradeoff": "Immediate business value and reduced cutover risk; deferred historical archive access."
                },
                {
                    "title": "Option B — Parallel Delivery Capacity",
                    "summary": "Deploy two parallel engineering workstreams: Squad Alpha dedicated to platform core and integrations, and Squad Beta dedicated strictly to legacy data migration and ETL testing.",
                    "feasibility": "Medium-High",
                    "tradeoff": "Achieves single go-live date; increases staffing capacity and coordination overhead."
                },
                {
                    "title": "Option C — Extended Implementation Timeline",
                    "summary": "Extend go-live milestone by 4 to 6 weeks to absorb full sequential data cleansing, third-party compliance audits, and prolonged UAT soak periods.",
                    "feasibility": "High",
                    "tradeoff": "Lowest operational risk; later delivery completion date."
                }
            ]
        }

        # Role-based team composition
        team_estimates = [
            {
                "role": "Lead Solution Architect",
                "suggested_count": 1,
                "delivery_phase": "Weeks 1–24 (Full Lifecycle)",
                "responsibilities": "Architectural governance, Zero Trust baseline, high availability design, and client technical steering.",
                "reason": "Oversees architecture alignment across extracted requirements.",
                "requirements_driving_need": [r["id"] for r in infra_reqs[:4]]
            },
            {
                "role": "Lead Security & Compliance Engineer",
                "suggested_count": 1,
                "delivery_phase": "Weeks 2–22",
                "responsibilities": "MFA implementation, encryption key rotation, vulnerability assessments, and sovereign audit compliance.",
                "reason": f"Required to fulfill {sec_count} security and compliance clauses.",
                "requirements_driving_need": [r["id"] for r in sec_reqs[:4]]
            },
            {
                "role": "Senior Integration Engineers",
                "suggested_count": 2,
                "delivery_phase": "Weeks 4–18",
                "responsibilities": "API gateway configuration, third-party protocol mediation, rate-limiting, and SSO directory federation.",
                "reason": f"Engineers connectors for {int_count} interface specifications.",
                "requirements_driving_need": [r["id"] for r in int_reqs[:4]]
            },
            {
                "role": "Database & Migration Specialist",
                "suggested_count": 1,
                "delivery_phase": "Weeks 6–18",
                "responsibilities": "Relational schema mapping, encrypted export verification, data cleansing scripts, and cutover rehearsals.",
                "reason": f"Drives compliance with {data_count} data retention and export mandates.",
                "requirements_driving_need": [r["id"] for r in data_reqs[:4]]
            },
            {
                "role": "Senior Full-Stack / Backend Developers",
                "suggested_count": 3,
                "delivery_phase": "Weeks 3–20",
                "responsibilities": "Core business microservices, transactional processing, administrative portals, and workflow engines.",
                "reason": "Constructs core platform capabilities across functional specifications.",
                "requirements_driving_need": [r["id"] for r in requirements[:4]]
            },
            {
                "role": "DevOps & Cloud Reliability Engineer",
                "suggested_count": 1,
                "delivery_phase": "Weeks 1–24",
                "responsibilities": "Kubernetes cluster provisioning, CI/CD pipelines, multi-AZ clustering, and automated backup drills.",
                "reason": f"Automates resilience across {infra_count} infrastructure requirements.",
                "requirements_driving_need": [r["id"] for r in infra_reqs[4:8]]
            },
            {
                "role": "QA & Performance Test Engineer",
                "suggested_count": 2,
                "delivery_phase": "Weeks 8–22",
                "responsibilities": "Automated regression suites, load benchmarking, latency validation, and UAT defect tracking.",
                "reason": "Validates SLA latency and performance thresholds prior to cutover.",
                "requirements_driving_need": [r["id"] for r in requirements[10:14]]
            },
            {
                "role": "Project Manager / Scrum Master",
                "suggested_count": 1,
                "delivery_phase": "Weeks 1–24",
                "responsibilities": "Sprint coordination, dependency tracking, milestone governance, and client weekly status reporting.",
                "reason": "Manages delivery cadence and mitigates delivery risks.",
                "requirements_driving_need": [r["id"] for r in requirements[14:18]]
            }
        ]

        # Milestone roadmap with explicit dependency graph
        milestones = [
            {
                "milestone_id": "M-01",
                "name": "Architecture Baseline & Discovery",
                "duration_range": "Weeks 1–3 (3 weeks)",
                "description": "Finalize Architectural Design Document (ADD), agree on interface schemas, and sign off security boundary.",
                "requirements_addressed": [r["id"] for r in requirements[:10]],
                "dependencies": ["Client kickoff and designated stakeholder alignment"],
                "depends_on": [],
                "architecture_components": ["COMP-SEC-01", "COMP-INFRA-01"],
                "risks": ["Scope ambiguity during discovery"],
                "assumptions": ["ASM-001", "ASM-002"]
            },
            {
                "milestone_id": "M-02",
                "name": "Cloud Foundation & Security Hardening",
                "duration_range": "Weeks 4–6 (3 weeks)",
                "description": "Deploy multi-AZ VPC infrastructure, configure Keycloak IAM with mandatory MFA, and establish private subnets.",
                "requirements_addressed": [r["id"] for r in sec_reqs[:8]],
                "dependencies": ["Cloud hosting accounts provisioned in India data center"],
                "depends_on": ["M-01"],
                "architecture_components": ["COMP-SEC-01", "COMP-INFRA-01"],
                "risks": ["Network connectivity delays"],
                "assumptions": ["ASM-002"]
            },
            {
                "milestone_id": "M-03",
                "name": "Core Platform & API Gateway Engineering",
                "duration_range": "Weeks 7–12 (6 weeks)",
                "description": "Construct core business application microservices, deploy API gateway with rate-limiting, and configure audit logging.",
                "requirements_addressed": [r["id"] for r in requirements[20:35]],
                "dependencies": ["Security foundation sign-off"],
                "depends_on": ["M-02"],
                "architecture_components": ["COMP-CORE-01", "COMP-INT-01", "COMP-OBS-01"],
                "risks": ["Integration contract changes"],
                "assumptions": ["ASM-001", "ASM-004"]
            },
            {
                "milestone_id": "M-04",
                "name": "Legacy Data Migration & Integration Pipeline",
                "duration_range": "Weeks 13–16 (4 weeks)",
                "description": "Execute dry-run migration of historical datasets, validate relational schemas, and test external system connectors.",
                "requirements_addressed": [r["id"] for r in data_reqs[:8]],
                "dependencies": ["Sample legacy export files provided by client"],
                "depends_on": ["M-03"],
                "architecture_components": ["COMP-DATA-01", "COMP-INT-01"],
                "risks": ["Legacy data schema anomalies"],
                "assumptions": ["ASM-003"]
            },
            {
                "milestone_id": "M-05",
                "name": "Security Audit, Penetration Testing & UAT",
                "duration_range": "Weeks 17–20 (4 weeks)",
                "description": "Perform independent VAPT security audit, execute load benchmarking under simulated peak volume, and conduct business UAT.",
                "requirements_addressed": [r["id"] for r in sec_reqs[8:16]],
                "dependencies": ["Feature freeze on Sprint 8 release"],
                "depends_on": ["M-03", "M-04"],
                "architecture_components": ["COMP-SEC-01", "COMP-OBS-01"],
                "risks": ["VAPT remediation turnarounds"],
                "assumptions": ["ASM-004"]
            },
            {
                "milestone_id": "M-06",
                "name": "Production Cutover & Hypercare Handover",
                "duration_range": "Weeks 21–24 (4 weeks)",
                "description": "Execute final production delta migration, complete DNS traffic cutover, and provide 30-day dedicated hypercare support.",
                "requirements_addressed": [r["id"] for r in requirements[40:50]],
                "dependencies": ["Formal UAT sign-off and production authorization"],
                "depends_on": ["M-05"],
                "architecture_components": ["COMP-INFRA-01", "COMP-CORE-01", "COMP-DATA-01"],
                "risks": ["Cutover rollback triggers"],
                "assumptions": ["ASM-004"]
            }
        ]

        for te in team_estimates:
            te["count"] = te.get("suggested_count", 1)
            te["phase"] = te.get("delivery_phase", "")

        for m in milestones:
            m["phase"] = m.get("milestone_id", "")
            m["title"] = m.get("name", "")
            m["weeks"] = m.get("duration_range", "")
            m["deliverables"] = [
                f"{m.get('name')} Architecture Specification",
                f"Environment deployment & test verification",
                f"Compliance validation across {len(m.get('requirements_addressed', []))} requirements"
            ]

        delivery_feasibility["risk_level"] = delivery_feasibility.get("overall_pressure", "High")
        delivery_feasibility["scenarios"] = [
            {"title": opt.get("title", ""), "details": opt.get("summary", ""), "feasibility": opt.get("feasibility", "High")}
            for opt in delivery_feasibility.get("options", [])
        ]

        return delivery_feasibility, team_estimates, milestones
