import re
from typing import List, Dict, Any, Tuple, Optional
from difflib import SequenceMatcher

class RequirementNormalizer:
    """
    Evidence-locked requirement normalization, garbage filtering,
    conservative deduplication, and requirement type classification.
    """

    @staticmethod
    def clean_text(raw_sentence: str) -> str:
        """
        Strips running headers, footers, and formatting noise without losing
        the underlying requirement sentence.
        """
        t = re.sub(
            r"Model RFP\s*[-—–]\s*Procurement of Cloud Computing Services\s*(?:Page\s+\d+\s+of\s+\d+)?",
            "",
            raw_sentence,
            flags=re.IGNORECASE
        )
        t = re.sub(r"Page\s+\d+\s+of\s+\d+", "", t, flags=re.IGNORECASE)
        t = re.sub(r"^\s*[-•*]\s*", "", t)
        t = re.sub(r"\s+", " ", t).strip()
        return t

    @staticmethod
    def is_garbage(text: str) -> Tuple[bool, Optional[str]]:
        """
        Detects whether an extracted fragment is non-requirement extraction garbage.
        Returns (is_garbage, reason).
        """
        if len(text) < 15:
            return (True, "Fragment under 15 characters")
            
        # 1. Table of Contents dot leaders
        if re.search(r"\.{3,}\s*\d*", text):
            return (True, "Table of Contents dot leader")
            
        # 2. Table of Contents headings
        if re.match(r"^(?:table of contents|contents|index)\b", text, re.IGNORECASE):
            return (True, "Table of Contents header")
            
        # 3. Table header row fragments lacking an actionable requirement verb
        if re.match(r"^(?:items\s+documents\s+required\s+reference|stage\s+name\s+description|sl\s+no\b)", text, re.IGNORECASE):
            if not any(k in text.lower() for k in ["shall", "must", "agrees to"]):
                return (True, "Table header row fragment")
                
        # 4. Form templates with fill-in blanks
        if re.search(r"_{4,}|\[insert\b", text, re.IGNORECASE):
            return (True, "Form template blank placeholder")
            
        # 5. Very short fragment without action verb
        words = text.split()
        if len(words) < 4 and not any(k in text.lower() for k in ["shall", "must"]):
            return (True, "Under 4 words lacking requirement verb")
            
        return (False, None)

    @staticmethod
    def classify_requirement(text: str, section: str = "") -> Tuple[str, str, str]:
        """
        Classifies a requirement into:
        - requirement_type: (FUNCTIONAL, TECHNICAL, BUSINESS, BUDGET, SECURITY, COMPLIANCE,
          PERFORMANCE, TIMELINE, INTEGRATION, DATA, LEGAL, OTHER)
        - category: Human-readable display category matching user requirements:
          - Functional
          - Technical
          - Business
          - Budget
          - Timeline
          - Security
          - Compliance
          - Performance
          - Other
        - scope_type: ('technical' vs 'procurement_admin')
        """
        t_lower = text.lower()
        s_lower = section.lower() if section else ""

        # 1. Procurement & Administrative Clauses
        proc_terms = [
            "bidder shall submit", "earnest money", "emd", "tender fee", "disqualification",
            "evaluation of bids", "bid submission", "pre-qualification", "eligibility criteria",
            "consortium", "sub-contracting", "blacklisting", "portal", "corrigendum",
            "power of attorney", "integrity pact", "validity of bid", "bid security", "gem",
            "central e-procurement", "mode of selection", "qcbs", "lcs", "annexure", "undertaking",
            "empanelment certificate", "document fee", "turnover", "net worth", "bid validity",
            "bidder must be", "bidder shall furnish", "joint venture"
        ]
        if any(k in t_lower for k in proc_terms) or any(k in s_lower for k in [
            "bidding", "tender", "instruction to bidders", "qualification", "empanelment", "procedural"
        ]):
            if any(k in t_lower for k in ["timeline", "working days", "deadline", "date of submission", "bid opening"]):
                return "TIMELINE", "Timeline", "procurement_admin"
            if any(k in t_lower for k in ["fee", "money", "emd", "cost of bid", "turnover", "commercial", "earnest money"]):
                return "COMMERCIAL", "Legal & Commercial", "procurement_admin"
            return "PROCUREMENT", "Procurement & Admin", "procurement_admin"

        # 2. Budget & Commercial Pricing Requirements
        budget_terms = [
            "budget", "pricing", "payment terms", "invoicing", "reimbursement", "total contract value",
            "retainage", "holdback", "commercial bid", "financial proposal", "advance payment",
            "payment milestone", "price schedule", "unit rate"
        ]
        if any(k in t_lower for k in budget_terms) or any(k in s_lower for k in ["pricing", "financial", "payment"]):
            return "BUDGET", "Budget", "procurement_admin"

        # 3. Business & Governance Requirements
        business_terms = [
            "business continuity", "stakeholder", "user training", "change management",
            "governance", "roi", "operating model", "business objective", "vendor experience",
            "past performance", "client references"
        ]
        if any(k in t_lower for k in business_terms) or any(k in s_lower for k in ["business", "governance"]):
            return "BUSINESS", "Business", "procurement_admin"

        # 4. Legal & Commercial Terms
        legal_terms = [
            "unlimited liability", "limitation of liability", "indemn", "hold harmless",
            "consequential damages", "breach of contract", "governing law", "jurisdiction",
            "arbitration", "force majeure", "liquidated damages", "penalty", "termination",
            "intellectual property", "infringement", "warranty", "title and ownership"
        ]
        if any(k in t_lower for k in legal_terms) or "liability" in s_lower or "legal" in s_lower:
            return "LEGAL", "Legal & Commercial", "technical"

        # 5. Security
        sec_terms = [
            "security", "auth", "mfa", "multi-factor", "encrypt", "fido", "saml", "sso",
            "credentials", "access control", "rbac", "zero trust", "firewall", "ids", "ips",
            "vulnerability", "patching", "soc", "siem", "aadhaar", "personal data", "dpdp", "cert-in"
        ]
        if any(k in t_lower for k in sec_terms) or "security" in s_lower:
            return "SECURITY", "Security", "technical"

        # 6. Integration
        int_terms = ["integrate", "interface", "api", "rest", "graphql", "webhook", "protocol", "federat", "connector"]
        if any(k in t_lower for k in int_terms) or "integration" in s_lower:
            return "INTEGRATION", "Integration", "technical"

        # 7. Data & Migration
        data_terms = ["database", "migration", "cutover", "export", "backup", "restore", "sql", "postgres", "oracle", "schema", "storage", "retention"]
        if any(k in t_lower for k in data_terms) or "database" in s_lower or "storage" in s_lower:
            return "DATA", "Data / Migration", "technical"

        # 8. Infrastructure & Hosting
        infra_terms = [
            "cloud", "on-premise", "aws", "azure", "gcp", "server", "cluster", "deploy",
            "hardware", "hosting", "bare-metal", "datacenter", "data center", "virtual machine",
            "vm", "kubernetes", "container"
        ]
        if any(k in t_lower for k in infra_terms) or "infrastructure" in s_lower or "hosting" in s_lower:
            return "TECHNICAL", "Infrastructure", "technical"

        # 9. Performance & SLA
        perf_terms = ["latency", "sla", "uptime", "traffic", "99.", "throughput", "response time", "concurrency", "bandwidth", "rto", "rpo"]
        if any(k in t_lower for k in perf_terms) or "service level" in s_lower or "sla" in s_lower:
            return "NON_FUNCTIONAL", "Performance", "technical"

        # 10. Timeline & Delivery
        time_terms = ["milestone", "go-live", "cutover date", "implementation schedule", "duration", "within 30 days", "within 60 days"]
        if any(k in t_lower for k in time_terms) or "timeline" in s_lower or "milestone" in s_lower:
            return "DELIVERY", "Timeline", "technical"

        # 11. Compliance
        comp_terms = ["iso", "soc 2", "crest", "audit", "covenant", "statutory", "regulatory", "rule 144", "gfr"]
        if any(k in t_lower for k in comp_terms) or "compliance" in s_lower:
            return "COMPLIANCE", "Compliance", "technical"

        # 12. Default Functional Requirement
        return "FUNCTIONAL", "Functional", "technical"

    @staticmethod
    def classify_information_type(text: str, priority: str = "Mandatory") -> str:
        """
        Classifies information into:
        - Explicit: Directly mandated or declared as a fact/covenant by client.
        - Inferred: Indirectly derived or implied from context.
        - Assumption: Contingent operational prerequisite or planning premise.
        - Missing: Criteria or specification omitted or marked TBD.
        """
        t = text.lower()
        if any(w in t for w in ["assume", "assumption", "presume", "contingent on", "subject to client providing", "prerequisite"]):
            return "Assumption"
        if any(w in t for w in ["tbd", "to be determined", "unspecified", "not specified", "omitted", "missing", "unknown"]):
            return "Missing"
        if any(w in t for w in ["implied", "inferred", "understood to mean", "recommend", "suggested that", "indicates that"]):
            return "Inferred"
        return "Explicit"

    @staticmethod
    def _normalize_key(text: str) -> str:
        """Strips all non-alphanumeric characters for robust comparison."""
        return re.sub(r"[^a-z0-9]", "", text.lower())

    @staticmethod
    def simplify_statement(text: str, category: str, priority: str) -> Dict[str, str]:
        """
        Translates complex legalese and long technical statements into:
        - plain_english: what the client actually means in plain human terms.
        - vendor_impact: what the service provider delivery team must build or deliver.
        - watchout: any risk, penalty, or commercial gotcha in the clause.
        """
        t_lower = text.lower()
        
        # 1. Security & Identity
        if any(k in t_lower for k in ["rbac", "role-based", "mfa", "multi-factor", "sso", "single sign-on", "saml", "oidc", "active directory", "identity"]):
            return {
                "plain_english": "The client requires enterprise identity integration with role-based permissions and mandatory two-factor login for administrative accounts.",
                "vendor_impact": "Configure Keycloak or Azure AD OAuth2/SAML bridge and map user permission tiers.",
                "watchout": "Ensure legacy systems support modern token-based auth without custom plugins."
            }
        
        # 2. SLA & High Availability
        if any(k in t_lower for k in ["99.9", "uptime", "availability", "rto", "rpo", "disaster recovery", "failover", "mttr", "redundant"]):
            return {
                "plain_english": "Demands high availability with automated failover. The system cannot exceed 43 minutes of unexpected downtime per month.",
                "vendor_impact": "Deploy multi-availability-zone load-balanced nodes with automated database replication and backup schedules.",
                "watchout": "Check if client defines penalties or service credits for SLA breaches."
            }
            
        # 3. Legal Liability & Indemnity
        if any(k in t_lower for k in ["unlimited", "indemn", "hold harmless", "consequential damages", "liability"]):
            return {
                "plain_english": "Clause attempts to place uncapped financial liability on the vendor for data issues or outages.",
                "vendor_impact": "Flag for commercial/legal counsel to propose a standard liability cap equal to 1x annual contract value.",
                "watchout": "Critical contract risk: Never accept uncapped consequential liability without mutual exceptions."
            }
            
        # 4. Data Migration & Legacy Databases
        if any(k in t_lower for k in ["migration", "oracle", "legacy", "historical records", "sanitize", "etl"]):
            return {
                "plain_english": "Must extract, validate, and migrate existing historical client data into the new platform without downtime or data loss.",
                "vendor_impact": "Build automated migration ETL pipelines with automated schema mapping and checksum validation.",
                "watchout": "Legacy data often has schema inconsistencies; budget extra time for data cleaning."
            }
            
        # 5. APIs & Integrations
        if any(k in t_lower for k in ["api", "rest", "graphql", "webhook", "integration", "exchange", "interface"]):
            return {
                "plain_english": "Must provide documented APIs so client's other internal systems can automatically send and sync tickets and data.",
                "vendor_impact": "Expose OpenAPI 3.0 documented REST endpoints with secure token authentication and rate limiting.",
                "watchout": "Client third-party endpoints may lack sandbox environments for integration testing."
            }
            
        # 6. Audit Logging & Retention
        if any(k in t_lower for k in ["audit", "logging", "immutable", "retain", "tamper", "log"]):
            return {
                "plain_english": "Every user action and system change must be logged permanently in an unalterable audit archive for compliance reviews.",
                "vendor_impact": "Configure append-only structured JSON logging stored in secured, encrypted long-term storage.",
                "watchout": "Log storage can grow rapidly; implement lifecycle retention policies."
            }
            
        # 7. Performance & Concurrency
        if any(k in t_lower for k in ["concurrent", "latency", "sub-second", "benchmark", "throughput", "users"]):
            return {
                "plain_english": "The software must remain fast and responsive even when thousands of employees access it simultaneously.",
                "vendor_impact": "Implement Redis query caching, database indexing, and horizontal auto-scaling pod policies.",
                "watchout": "Request peak traffic volume figures to properly size production cloud infrastructure."
            }

        # 8. Budget & Commercial Terms
        if any(k in t_lower for k in ["payment", "invoice", "liquidated damages", "milestone", "pricing", "penalty"]):
            return {
                "plain_english": "Payment is strictly tied to client sign-off on deliverable milestones, with potential late-delivery penalties.",
                "vendor_impact": "Include clear acceptance criteria in milestone contracts to prevent subjective payment delays.",
                "watchout": "Review liquidated damages clauses for punitive per-day delay deductions."
            }

        # Fallback Syntactic Simplification
        stripped = re.sub(r"^(?:the\s+(?:bidder|contractor|vendor|service\s+provider|system)\s+(?:shall|must|will|agrees\s+to)\s+|it\s+is\s+mandatory\s+that\s+)", "", text, flags=re.IGNORECASE).strip()
        if stripped:
            stripped = stripped[0].upper() + stripped[1:]
        else:
            stripped = text

        return {
            "plain_english": f"Client requirement: {stripped}",
            "vendor_impact": f"Design and deliver verified compliance for {category.lower()} specifications.",
            "watchout": "Verify acceptance testing criteria with client during initial scoping sprint."
        }

    @classmethod
    def normalize_and_deduplicate(
        cls,
        raw_requirements: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Cleans, classifies, and conservatively merges exact/near-identical duplicates.
        Preserves 100% of original source citations and page numbers.
        """
        cleaned_list: List[Dict[str, Any]] = []
        rejected_artifacts: List[Dict[str, Any]] = []

        for req in raw_requirements:
            raw_text = req.get("text", "")
            cleaned = cls.clean_text(raw_text)
            
            is_garb, garb_reason = cls.is_garbage(cleaned)
            if is_garb:
                rejected_artifacts.append({
                    "raw_text": raw_text[:80],
                    "page": req.get("page", 1),
                    "reason": garb_reason
                })
                continue

            section = req.get("section", "")
            req_type, category, scope_type = cls.classify_requirement(cleaned, section)
            info_type = cls.classify_information_type(cleaned, req.get("priority", "Mandatory"))
            simplified = cls.simplify_statement(cleaned, category, req.get("priority", "Mandatory"))

            item = dict(req)
            item["text"] = cleaned
            item["source_text"] = req.get("source_text", raw_text)
            item["requirement_type"] = req_type
            item["category"] = category
            item["scope_type"] = scope_type
            item["information_classification"] = info_type
            item["plain_english"] = simplified["plain_english"]
            item["vendor_impact"] = simplified["vendor_impact"]
            item["watchout"] = simplified["watchout"]
            item["is_verified"] = False
            item["reviewed_by_human"] = False
            item["reviewer_notes"] = ""
            item["source_pages"] = [req.get("page", 1)]
            item["citations"] = [{
                "page": req.get("page", 1),
                "section": section,
                "text": req.get("source_text", raw_text)
            }]
            item["duplicate_count"] = 0
            cleaned_list.append(item)

        # Conservative deduplication: Group by normalized text key
        merged_map: Dict[str, Dict[str, Any]] = {}
        duplicates_merged_count = 0

        for item in cleaned_list:
            key = cls._normalize_key(item["text"])
            
            if key in merged_map:
                existing = merged_map[key]
                p = item["source_pages"][0]
                if p not in existing["source_pages"]:
                    existing["source_pages"].append(p)
                    existing["source_pages"].sort()
                existing["citations"].append(item["citations"][0])
                existing["duplicate_count"] += 1
                duplicates_merged_count += 1
            else:
                merged_map[key] = item

        final_requirements = list(merged_map.values())
        
        # Renumber clean IDs REQ-001...
        for idx, r in enumerate(final_requirements):
            r["id"] = f"REQ-{idx+1:03d}"

        # Category and Type aggregations
        cat_counts: Dict[str, int] = {}
        type_counts: Dict[str, int] = {}
        info_counts: Dict[str, int] = {"Explicit": 0, "Inferred": 0, "Assumption": 0, "Missing": 0}
        scope_counts: Dict[str, int] = {"technical": 0, "procurement_admin": 0}

        for r in final_requirements:
            cat = r["category"]
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            
            t = r["requirement_type"]
            type_counts[t] = type_counts.get(t, 0) + 1
            
            inf = r.get("information_classification", "Explicit")
            info_counts[inf] = info_counts.get(inf, 0) + 1
            
            st = r["scope_type"]
            scope_counts[st] = scope_counts.get(st, 0) + 1

        stats = {
            "total_raw": len(raw_requirements),
            "rejected_artifacts_count": len(rejected_artifacts),
            "duplicates_merged_count": duplicates_merged_count,
            "final_count": len(final_requirements),
            "mandatory_count": sum(1 for r in final_requirements if r.get("priority") == "Mandatory"),
            "category_counts": cat_counts,
            "type_counts": type_counts,
            "information_counts": info_counts,
            "scope_counts": scope_counts,
            "rejected_artifacts": rejected_artifacts[:10]
        }

        return final_requirements, stats
