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
        # Strip common running headers/footers in RFP documents
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
            
        # 1. Table of Contents dot leaders (e.g. "General Liability Clause .................... 50")
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
        - requirement_type: (FUNCTIONAL, TECHNICAL, NON_FUNCTIONAL, SECURITY, INTEGRATION,
          DATA, COMPLIANCE, LEGAL, COMMERCIAL, PROCUREMENT, DELIVERY, TIMELINE, ADMINISTRATIVE, OTHER)
        - category: Human-readable display category
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
            if any(k in t_lower for k in ["fee", "money", "emd", "cost of bid", "turnover", "commercial"]):
                return "COMMERCIAL", "Legal & Commercial", "procurement_admin"
            return "PROCUREMENT", "Procurement & Admin", "procurement_admin"

        # 2. Legal & Commercial Terms
        legal_terms = [
            "unlimited liability", "limitation of liability", "indemn", "hold harmless",
            "consequential damages", "breach of contract", "governing law", "jurisdiction",
            "arbitration", "force majeure", "liquidated damages", "penalty", "termination",
            "intellectual property", "infringement", "warranty", "title and ownership"
        ]
        if any(k in t_lower for k in legal_terms) or "liability" in s_lower or "legal" in s_lower:
            return "LEGAL", "Legal & Commercial", "technical"

        # 3. Security
        sec_terms = [
            "security", "auth", "mfa", "multi-factor", "encrypt", "fido", "saml", "sso",
            "credentials", "access control", "rbac", "zero trust", "firewall", "ids", "ips",
            "vulnerability", "patching", "soc", "siem", "aadhaar", "personal data", "dpdp", "cert-in"
        ]
        if any(k in t_lower for k in sec_terms) or "security" in s_lower:
            return "SECURITY", "Security", "technical"

        # 4. Integration
        int_terms = ["integrate", "interface", "api", "rest", "graphql", "webhook", "protocol", "federat", "connector"]
        if any(k in t_lower for k in int_terms) or "integration" in s_lower:
            return "INTEGRATION", "Integration", "technical"

        # 5. Data & Migration
        data_terms = ["database", "migration", "cutover", "export", "backup", "restore", "sql", "postgres", "oracle", "schema", "storage", "retention"]
        if any(k in t_lower for k in data_terms) or "database" in s_lower or "storage" in s_lower:
            return "DATA", "Data / Migration", "technical"

        # 6. Infrastructure & Hosting
        infra_terms = [
            "cloud", "on-premise", "aws", "azure", "gcp", "server", "cluster", "deploy",
            "hardware", "hosting", "bare-metal", "datacenter", "data center", "virtual machine",
            "vm", "kubernetes", "container"
        ]
        if any(k in t_lower for k in infra_terms) or "infrastructure" in s_lower or "hosting" in s_lower:
            return "TECHNICAL", "Infrastructure", "technical"

        # 7. Performance & SLA
        perf_terms = ["latency", "sla", "uptime", "traffic", "99.", "throughput", "response time", "concurrency", "bandwidth", "rto", "rpo"]
        if any(k in t_lower for k in perf_terms) or "service level" in s_lower or "sla" in s_lower:
            return "NON_FUNCTIONAL", "Performance", "technical"

        # 8. Timeline & Delivery
        time_terms = ["milestone", "go-live", "cutover date", "implementation schedule", "duration", "within 30 days", "within 60 days"]
        if any(k in t_lower for k in time_terms) or "timeline" in s_lower or "milestone" in s_lower:
            return "DELIVERY", "Timeline", "technical"

        # 9. Compliance
        comp_terms = ["iso", "soc 2", "crest", "audit", "covenant", "statutory", "regulatory", "rule 144", "gfr"]
        if any(k in t_lower for k in comp_terms) or "compliance" in s_lower:
            return "COMPLIANCE", "Compliance", "technical"

        # 10. Default Functional Requirement
        return "FUNCTIONAL", "Functional", "technical"

    @staticmethod
    def _normalize_key(text: str) -> str:
        """Strips all non-alphanumeric characters for robust comparison."""
        return re.sub(r"[^a-z0-9]", "", text.lower())

    @classmethod
    def normalize_and_deduplicate(
        cls,
        raw_requirements: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Cleans, classifies, and conservatively merges exact/near-identical duplicates.
        Preserves 100% of original source citations and page numbers.
        Never merges related-but-distinct requirements.
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

            item = dict(req)
            item["text"] = cleaned
            item["source_text"] = req.get("source_text", raw_text)
            item["requirement_type"] = req_type
            item["category"] = category
            item["scope_type"] = scope_type
            item["source_pages"] = [req.get("page", 1)]
            item["citations"] = [{
                "page": req.get("page", 1),
                "section": section,
                "text": req.get("source_text", raw_text)
            }]
            item["duplicate_count"] = 0
            cleaned_list.append(item)

        # Conservative deduplication:
        # Group by normalized text key
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
        scope_counts: Dict[str, int] = {"technical": 0, "procurement_admin": 0}

        for r in final_requirements:
            cat = r["category"]
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            
            t = r["requirement_type"]
            type_counts[t] = type_counts.get(t, 0) + 1
            
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
            "scope_counts": scope_counts,
            "rejected_artifacts": rejected_artifacts[:10]
        }

        return final_requirements, stats

