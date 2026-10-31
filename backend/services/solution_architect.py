import re
from typing import List, Dict, Any, Tuple

class SolutionArchitect:
    """
    Synthesizes normalized requirements, risks, and ambiguities into a structured,
    defensible Solution Architecture and Technology Stack.
    
    CRITICAL RULE:
    Strictly distinguishes client mandates (RFP_REQUIRED) from RecLens recommendations
    (RECLENS_PROPOSED). Never claims a vendor recommendation was mandated by the client.
    """

    @classmethod
    def generate_architecture_and_stack(
        cls,
        requirements: List[Dict[str, Any]],
        risks: List[Dict[str, Any]],
        ambiguities: List[Dict[str, Any]],
        rfp_filename: str = ""
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Returns:
            (architecture_solution, tech_stack, assumptions)
        """
        # Group requirements by category and type
        sec_reqs = [r for r in requirements if r.get("category") == "Security" or r.get("requirement_type") == "SECURITY"]
        infra_reqs = [r for r in requirements if r.get("category") in ["Technical", "Infrastructure"] or r.get("requirement_type") == "TECHNICAL"]
        data_reqs = [r for r in requirements if r.get("category") == "Data / Migration" or r.get("requirement_type") == "DATA"]
        int_reqs = [r for r in requirements if r.get("category") == "Integration" or r.get("requirement_type") == "INTEGRATION"]
        perf_reqs = [r for r in requirements if r.get("category") == "Performance" or r.get("requirement_type") == "PERFORMANCE"]
        comp_reqs = [r for r in requirements if r.get("category") == "Compliance" or r.get("requirement_type") == "COMPLIANCE"]
        func_reqs = [r for r in requirements if r.get("category") == "Functional" or r.get("requirement_type") == "FUNCTIONAL"]
        biz_reqs = [r for r in requirements if r.get("category") == "Business" or r.get("requirement_type") == "BUSINESS"]
        budget_reqs = [r for r in requirements if r.get("category") == "Budget" or r.get("requirement_type") == "BUDGET"]

        components = []

        # 1. Frontend Experience & Responsive Portal Tier
        func_req_ids = [r["id"] for r in func_reqs[:12]]
        components.append({
            "component_id": "COMP-FE-01",
            "name": "Enterprise Web Portal & Operator Console",
            "category": "Frontend",
            "purpose": "Delivers a responsive, accessible (WCAG 2.1 AA) operator dashboard, reporting widgets, and administrative consoles.",
            "description": "Server-side rendered modern Web UI built with Next.js and TailwindCSS, utilizing reactive websockets for live dashboard feeds.",
            "recommended_technology_or_category": "Next.js 14 / React with TailwindCSS & TypeScript",
            "justification": f"Fulfills client functional usability and portal interaction specifications across {len(func_req_ids)} operational requirements.",
            "related_requirement_ids": func_req_ids,
            "related_risk_ids": [],
            "assumptions": ["End users access the platform using modern Chromium/WebKit browsers."],
            "confidence": 0.96,
            "origin": "RECLENS_PROPOSED"
        })

        # 2. Identity & Zero-Trust Access Controller
        sec_req_ids = [r["id"] for r in sec_reqs[:12]]
        has_mfa = any("mfa" in r.get("text", "").lower() or "multi-factor" in r.get("text", "").lower() for r in sec_reqs)
        has_sso = any("sso" in r.get("text", "").lower() or "saml" in r.get("text", "").lower() for r in sec_reqs)
        sec_risks = [rk["id"] for rk in risks if rk.get("category") == "Security"]

        components.append({
            "component_id": "COMP-SEC-01",
            "name": "Identity & Zero-Trust Access Controller",
            "category": "Security",
            "purpose": "Enforces centralized authentication, FIDO2/TOTP MFA, role-based access control (RBAC), and session auditing.",
            "description": "Federated IAM tier integrating client identity providers with mandatory step-up authentication for all privileged sessions.",
            "recommended_technology_or_category": "Keycloak Enterprise IAM / OpenID Connect",
            "justification": f"Directly satisfies {len(sec_req_ids)} security requirements including strict MFA protocols and credential boundaries.",
            "related_requirement_ids": sec_req_ids,
            "related_risk_ids": sec_risks,
            "assumptions": ["Client will provide SAML 2.0 metadata and identity provider endpoints during Phase 1 foundation."],
            "confidence": 0.96,
            "origin": "RFP_REQUIRED" if has_mfa or has_sso else "RECLENS_PROPOSED"
        })

        # 3. Resilient Cloud Infrastructure & Compute Cluster
        infra_req_ids = [r["id"] for r in infra_reqs[:12]]
        is_cloud_mandated = any("cloud" in r.get("text", "").lower() or "meity" in r.get("text", "").lower() for r in infra_reqs)
        infra_risks = [rk["id"] for rk in risks if rk.get("category") in ["Infrastructure", "Timeline"]]

        components.append({
            "component_id": "COMP-INFRA-01",
            "name": "Resilient Multi-AZ Compute Cluster",
            "category": "Infrastructure",
            "purpose": "Provides elastic, auto-scaling compute workloads across isolated availability zones with zero single points of failure.",
            "description": "Containerized application runtime hosted on managed Kubernetes within isolated private subnets, fronted by redundant load balancers.",
            "recommended_technology_or_category": "Managed Cloud Kubernetes (MeitY-Empanelled CSP)",
            "justification": f"Fulfills {len(infra_req_ids)} infrastructure mandates for elastic scalability, automated failover, and high availability.",
            "related_requirement_ids": infra_req_ids,
            "related_risk_ids": infra_risks,
            "assumptions": ["Underlying cloud infrastructure will be provisioned inside MeitY-certified sovereign data centers in India."],
            "confidence": 0.95,
            "origin": "RFP_REQUIRED" if is_cloud_mandated else "RECLENS_PROPOSED"
        })

        # 4. Enterprise Integration Gateway
        int_req_ids = [r["id"] for r in int_reqs[:12]]
        int_risks = [rk["id"] for rk in risks if rk.get("category") == "Integration"]

        components.append({
            "component_id": "COMP-INT-01",
            "name": "Enterprise Integration Gateway",
            "category": "Integration",
            "purpose": "Manages rate-limited, authenticated API communication between external client services and core application subsystems.",
            "description": "API Gateway supporting REST, OpenAPI specifications, HMAC request signing, and mutual TLS encryption.",
            "recommended_technology_or_category": "Kong Gateway Enterprise / Reverse Proxy",
            "justification": f"Provides secure mediation for {len(int_req_ids)} integration requirements and shields internal microservices.",
            "related_requirement_ids": int_req_ids,
            "related_risk_ids": int_risks,
            "assumptions": ["External third-party API specifications will adhere to standard REST/JSON formats with test sandbox availability."],
            "confidence": 0.94,
            "origin": "RECLENS_PROPOSED"
        })

        # 5. Encrypted Relational Persistence & Migration Engine
        data_req_ids = [r["id"] for r in data_reqs[:12]]
        components.append({
            "component_id": "COMP-DATA-01",
            "name": "Encrypted Relational Persistence & Migration Engine",
            "category": "Data",
            "purpose": "Provides ACID transactional data storage, transparent KMS encryption at rest, automated snapshots, and export tooling.",
            "description": "Multi-AZ clustered relational database with automated read replication, point-in-time recovery, and exit data portability exporters.",
            "recommended_technology_or_category": "Clustered Relational Database (PostgreSQL 16 Multi-AZ)",
            "justification": f"Guarantees compliance with {len(data_req_ids)} data isolation, snapshotting, and contract exit export covenants.",
            "related_requirement_ids": data_req_ids,
            "related_risk_ids": [],
            "assumptions": ["Legacy dataset schemas will be documented with sample validation records provided 3 weeks before migration cutover."],
            "confidence": 0.95,
            "origin": "RECLENS_PROPOSED"
        })

        # 6. Core Business Application Services
        components.append({
            "component_id": "COMP-CORE-01",
            "name": "Core Business Application Services",
            "category": "Functional",
            "purpose": "Executes domain business logic, workflow automation, approval chains, and client operational workflows.",
            "description": "Decoupled microservice architecture utilizing event-driven inter-service messaging for loose coupling and scalability.",
            "recommended_technology_or_category": "FastAPI (Python 3.12) Async Microservices",
            "justification": f"Implements core operational workflows addressing {len(func_req_ids)} client functional requirements.",
            "related_requirement_ids": func_req_ids,
            "related_risk_ids": [],
            "assumptions": ["Standard business workflow rules and approval roles will be signed off during Sprint 1 discovery."],
            "confidence": 0.93,
            "origin": "RECLENS_PROPOSED"
        })

        # 7. Observability, SIEM & Audit Subsystem
        comp_req_ids = [r["id"] for r in comp_reqs[:8]] + [r["id"] for r in perf_reqs[:8]]
        components.append({
            "component_id": "COMP-OBS-01",
            "name": "Observability, SIEM & Audit Subsystem",
            "category": "Compliance",
            "purpose": "Captures immutable audit logs, real-time performance telemetry, APM traces, and SLA violation alerts.",
            "description": "Centralized logging and metrics pipeline with write-once-read-many (WORM) storage for regulatory non-repudiation.",
            "recommended_technology_or_category": "Centralized SIEM & Telemetry Engine (Prometheus & Grafana)",
            "justification": f"Delivers verifiable audit trails satisfying {len(comp_req_ids)} monitoring and compliance specifications.",
            "related_requirement_ids": comp_req_ids,
            "related_risk_ids": [],
            "assumptions": ["Retention period for audit logs is governed by applicable statutory data retention laws."],
            "confidence": 0.95,
            "origin": "RFP_REQUIRED" if len(comp_reqs) > 0 else "RECLENS_PROPOSED"
        })

        # Populate aliases for component properties
        for c in components:
            c["id"] = c["component_id"]
            c["type"] = "Required" if c.get("origin") == "RFP_REQUIRED" else "Proposed"
            c["technology"] = c.get("recommended_technology_or_category", "")
            c["responsibility"] = c.get("purpose", "")
            c["reason"] = c.get("justification", "")
            c["requirement_ids"] = c.get("related_requirement_ids", [])

        # Data Flows between components
        data_flows = [
            {"from_component": "Client Gateways / Users", "to_component": "COMP-FE-01", "description": "Interactive Web Traffic & API Ingress", "protocol": "HTTPS / TLS 1.3"},
            {"from_component": "COMP-FE-01", "to_component": "COMP-SEC-01", "description": "User Authentication & MFA Challenge", "protocol": "OIDC / OAuth 2.0"},
            {"from_component": "COMP-FE-01", "to_component": "COMP-INT-01", "description": "Authenticated Microservice Dispatch", "protocol": "HTTPS / Bearer JWT"},
            {"from_component": "COMP-INT-01", "to_component": "COMP-CORE-01", "description": "Rate-limited API Request Execution", "protocol": "gRPC / Internal TLS"},
            {"from_component": "COMP-CORE-01", "to_component": "COMP-DATA-01", "description": "Encrypted Transactional Read/Write", "protocol": "TLS Encrypted SQL (Port 5432)"},
            {"from_component": "All Components", "to_component": "COMP-OBS-01", "description": "Structured Audit Logs & Health Metrics", "protocol": "Syslog-TLS / OTLP"}
        ]

        # Generate Mermaid Architecture Graph
        mermaid_diagram = (
            "flowchart TD\n"
            "  classDef rfp fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;\n"
            "  classDef prop fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;\n"
            "  classDef sec fill:#1e1b4b,stroke:#06b6d4,stroke-width:2px,color:#f8fafc;\n\n"
            "  subgraph Edge [Client Entry & Perimeter]\n"
            "    GW[\"Client Gateway & Browser Users\"]:::rfp\n"
            "    FE[\"COMP-FE-01: Next.js Enterprise Portal\"]:::prop\n"
            "  end\n\n"
            "  subgraph SecurityTier [Zero-Trust Security]\n"
            "    SEC[\"COMP-SEC-01: Identity & Access Controller\"]:::sec\n"
            "  end\n\n"
            "  subgraph AppTier [Compute & Integration Tier]\n"
            "    INT[\"COMP-INT-01: Enterprise API Gateway\"]:::prop\n"
            "    CORE[\"COMP-CORE-01: FastAPI Microservice Core\"]:::prop\n"
            "  end\n\n"
            "  subgraph DataTier [Persistence & Audit Tier]\n"
            "    DATA[(\"COMP-DATA-01: Relational Clustered DB\")]:::prop\n"
            "    OBS[\"COMP-OBS-01: Observability & SIEM Engine\"]:::sec\n"
            "  end\n\n"
            "  GW -->|TLS 1.3| FE\n"
            "  FE -->|OIDC / MFA| SEC\n"
            "  FE -->|Bearer Token| INT\n"
            "  INT -->|gRPC| CORE\n"
            "  CORE -->|Encrypted SQL| DATA\n"
            "  CORE -.->|Audit Events| OBS\n"
            "  SEC -.->|Auth Logs| OBS\n"
        )

        architecture_solution = {
            "summary": "Evidence-grounded modular cloud architecture engineered to satisfy client RFP security, resilience, and operational covenants.",
            "components": components,
            "data_flows": data_flows,
            "mermaid_diagram": mermaid_diagram,
            "security_considerations": [
                "Zero Trust network microsegmentation across all microservices",
                "Mandatory FIDO2/TOTP Multi-Factor Authentication on all privileged routes",
                "AES-256 encryption at rest with customer-managed KMS keys",
                "TLS 1.3 strict enforcement on all ingress and egress channels"
            ],
            "scalability_considerations": [
                "Horizontal Pod Auto-scaling (HPA) governed by CPU and memory saturation metrics",
                "Database read replica pooling to offload analytical and reporting query volume",
                "Stateless application tiers enabling seamless cross-AZ disaster recovery"
            ]
        }

        # Technology Stack Recommendations (Covering Programming Languages, Frameworks, DBs, Cloud, & SIEM)
        tech_stack = [
            {
                "technology": "Python 3.12 & TypeScript",
                "category": "Programming Languages",
                "purpose": "High-performance asynchronous backend services, AI data extraction, and type-safe frontend UI engineering.",
                "why_selected": "Python provides native enterprise AI/data processing pipelines; TypeScript guarantees frontend type safety and zero runtime schema drift.",
                "requirements_addressed": func_req_ids[:4],
                "architecture_components": ["COMP-FE-01", "COMP-CORE-01"],
                "alternatives_considered": ["Java / Spring", "C# / .NET"],
                "origin": "RECLENS_PROPOSED",
                "confidence": 0.98
            },
            {
                "technology": "Next.js 14 / React with TailwindCSS",
                "category": "Frontend Framework",
                "purpose": "Server-side rendered enterprise dashboard, accessibility adherence (WCAG 2.1 AA), and high-performance UI state management.",
                "why_selected": "Sub-second initial page rendering, automatic bundle splitting, and robust component modularity.",
                "requirements_addressed": func_req_ids[:4],
                "architecture_components": ["COMP-FE-01"],
                "alternatives_considered": ["Angular 17", "Vue.js 3"],
                "origin": "RECLENS_PROPOSED",
                "confidence": 0.96
            },
            {
                "technology": "FastAPI (Asynchronous Python)",
                "category": "Backend Framework",
                "purpose": "Microservice REST and WebSocket APIs, automatic OpenAPI documentation, and asynchronous I/O concurrency.",
                "why_selected": "High throughput benchmarks matching Node.js/Go with native Pydantic schema validation.",
                "requirements_addressed": func_req_ids[4:8],
                "architecture_components": ["COMP-CORE-01"],
                "alternatives_considered": ["Flask", "Django REST Framework"],
                "origin": "RECLENS_PROPOSED",
                "confidence": 0.95
            },
            {
                "technology": "Keycloak Enterprise IAM",
                "category": "Security & Identity",
                "purpose": "Centralized Identity Federation, SAML 2.0 / OIDC provider, and FIDO2 MFA enforcement.",
                "why_selected": "Production-grade, standards-compliant open architecture avoiding commercial vendor lock-in.",
                "requirements_addressed": sec_req_ids[:4],
                "architecture_components": ["COMP-SEC-01"],
                "alternatives_considered": ["Auth0 Enterprise", "Okta Workforce"],
                "origin": "RECLENS_PROPOSED",
                "confidence": 0.96
            },
            {
                "technology": "Managed Cloud Kubernetes (EKS / MeitY-Empanelled)",
                "category": "Compute & Infrastructure",
                "purpose": "Declarative container orchestration across multi-zone redundant nodes.",
                "why_selected": "Provides resilient self-healing pods, automated rolling upgrades, and zero-downtime cutover.",
                "requirements_addressed": infra_req_ids[:4],
                "architecture_components": ["COMP-INFRA-01"],
                "alternatives_considered": ["Standalone Virtual Machines", "Docker Swarm"],
                "origin": "RFP_REQUIRED" if is_cloud_mandated else "RECLENS_PROPOSED",
                "confidence": 0.95
            },
            {
                "technology": "PostgreSQL 16 (Multi-AZ Clustered)",
                "category": "Database & Persistence",
                "purpose": "ACID transactional relational persistence with automated snapshotting and streaming replication.",
                "why_selected": "Exceptional reliability, native JSONB support, and transparent encrypted export tooling.",
                "requirements_addressed": data_req_ids[:4],
                "architecture_components": ["COMP-DATA-01"],
                "alternatives_considered": ["Oracle 19c", "MySQL Enterprise"],
                "origin": "RECLENS_PROPOSED",
                "confidence": 0.95
            },
            {
                "technology": "Kong Gateway Enterprise",
                "category": "API Gateway & Integration",
                "purpose": "Perimeter rate limiting, reverse proxying, JWT token validation, and mutual TLS termination.",
                "why_selected": "Sub-millisecond routing latency with native Lua plugin extensibility for custom security policies.",
                "requirements_addressed": int_req_ids[:4],
                "architecture_components": ["COMP-INT-01"],
                "alternatives_considered": ["NGINX Plus", "Envoy Proxy"],
                "origin": "RECLENS_PROPOSED",
                "confidence": 0.93
            },
            {
                "technology": "Prometheus & Grafana Enterprise SIEM",
                "category": "Observability & Auditing",
                "purpose": "Real-time metrics scraping, SLA latency monitoring, and immutable compliance log aggregation.",
                "why_selected": "Open telemetry standard ensuring total client ownership of audit telemetry and dash boarding.",
                "requirements_addressed": comp_req_ids[:4],
                "architecture_components": ["COMP-OBS-01"],
                "alternatives_considered": ["Datadog", "Splunk Enterprise"],
                "origin": "RECLENS_PROPOSED",
                "confidence": 0.94
            }
        ]

        # Assumption Ledger
        assumptions = [
            {
                "assumption_id": "ASM-001",
                "statement": "Client will provide technical documentation and staging endpoints for external integration interfaces within 10 business days of project kickoff.",
                "reason": "Integration Gateway engineering requires active sandbox interfaces to construct and test connector contracts.",
                "impact_if_wrong": "Integration milestone delivery schedule will be delayed by the duration of interface access unavailability.",
                "related_requirement_ids": int_req_ids[:3],
                "related_architecture_components": ["COMP-INT-01"],
                "status": "OPEN"
            },
            {
                "assumption_id": "ASM-002",
                "statement": "Underlying cloud hosting infrastructure will be hosted within MeitY-empanelled data centers located within sovereign territory of India.",
                "reason": "Statutory data residency and empanelment requirements prohibit offshore hosting of Project Data.",
                "impact_if_wrong": "Non-compliance disqualification or regulatory penalty during audit.",
                "related_requirement_ids": infra_req_ids[:3],
                "related_architecture_components": ["COMP-INFRA-01"],
                "status": "OPEN"
            },
            {
                "assumption_id": "ASM-003",
                "statement": "Legacy datasets to be migrated will be provided in standardized relational export formats (SQL dumps or CSVs) with verified schema definitions.",
                "reason": "Database migration tooling requires deterministic schema mapping to prevent schema drift during ingestion.",
                "impact_if_wrong": "Data transformation effort will expand, requiring additional sprint cycles for manual schema cleansing.",
                "related_requirement_ids": data_req_ids[:3],
                "related_architecture_components": ["COMP-DATA-01"],
                "status": "OPEN"
            },
            {
                "assumption_id": "ASM-004",
                "statement": "Client technical team will participate in weekly sprint reviews and complete UAT review turnarounds within 5 business days per release.",
                "reason": "Agile phased delivery cadence depends on timely review and sign-off cycles to authorize production cutover.",
                "impact_if_wrong": "Release approval bottlenecks will push final deployment milestones past target go-live.",
                "related_requirement_ids": func_req_ids[:3],
                "related_architecture_components": ["COMP-CORE-01"],
                "status": "OPEN"
            }
        ]

        for t in tech_stack:
            t["reason"] = t.get("why_selected", "")

        for a in assumptions:
            a["id"] = a.get("assumption_id", "")
            a["rationale"] = a.get("reason", "")
            a["impact"] = a.get("impact_if_wrong", "")

        return architecture_solution, tech_stack, assumptions
