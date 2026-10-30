import re
from typing import List, Dict, Any

class AmbiguityDetector:
    """
    Evidence-grounded detector for vague, unmeasurable, or missing-metric criteria.
    Never invents ambiguities. Only flags requirements where critical implementation,
    sizing, or SLA criteria are objectively omitted.
    """

    AMBIGUITY_RULES = [
        {
            "pattern": r"\bhigh\s+performance\b",
            "term": "High Performance",
            "missing": [
                "Target latency in milliseconds (p95 / p99)",
                "Peak throughput in requests per second (RPS)",
                "Concurrent active user capacity"
            ],
            "impact": "Compute capacity, load balancer sizing, and hardware cost cannot be engineered accurately.",
            "severity": "High"
        },
        {
            "pattern": r"\bscalable\b",
            "term": "Scalability",
            "missing": [
                "Target scaling dimension (requests/sec or data volume in TB)",
                "Auto-scaling threshold triggers and elasticity bounds",
                "Maximum bursting capacity limit"
            ],
            "impact": "Auto-scaling infrastructure and multi-zone capacity reservation cannot be sized.",
            "severity": "Medium"
        },
        {
            "pattern": r"\buser[- ]friendly\b",
            "term": "User Friendly",
            "missing": [
                "Target System Usability Scale (SUS) score",
                "Accessibility compliance standard (e.g. WCAG 2.1 AA)",
                "Maximum operator onboarding duration"
            ],
            "impact": "Subjective user interface criteria cannot be formally validated during user acceptance testing (UAT).",
            "severity": "Low"
        },
        {
            "pattern": r"\bhigh\s+availability\b",
            "term": "High Availability",
            "missing": [
                "Explicit availability SLA percentage (e.g. 99.9% vs 99.99%)",
                "Recovery Time Objective (RTO) in minutes",
                "Recovery Point Objective (RPO) in minutes"
            ],
            "impact": "Multi-region redundancy vs single-region clustering cannot be determined, heavily impacting cloud hosting costs.",
            "severity": "High"
        },
        {
            "pattern": r"\brobust\s+(?:disaster|dr|security|architecture|segmentation|backup)\b",
            "term": "Robust Architecture / DR",
            "missing": [
                "Target RTO/RPO failover windows",
                "Automated drill frequency and failover verification criteria",
                "Network isolation and microsegmentation parameters"
            ],
            "impact": "Disaster recovery tiering and secondary site provisioning cannot be quoted accurately.",
            "severity": "High"
        },
        {
            "pattern": r"\bindustry\s+standard\b",
            "term": "Industry Standard",
            "missing": [
                "Governing technical standard body (e.g. NIST 800-53, ISO 27001, OWASP ASVS)",
                "Specific cipher suite or encryption protocol version"
            ],
            "impact": "Audit compliance and architecture security baseline cannot be validated.",
            "severity": "Medium"
        },
        {
            "pattern": r"\badequate\s+(?:certified\s+technical\s+)?manpower\b",
            "term": "Adequate Staffing",
            "missing": [
                "Minimum dedicated FTE headcounts by engineering role",
                "Mandatory certification levels (e.g. AWS Solutions Architect Professional, CISA)",
                "On-site vs remote SLA presence"
            ],
            "impact": "Delivery labor sizing and monthly managed service operational costs cannot be determined.",
            "severity": "Medium"
        },
        {
            "pattern": r"\btimely\s+(?:performance|support|resolution)\b",
            "term": "Timely Performance / SLA",
            "missing": [
                "Severity 1 to Severity 4 ticket response SLAs (in minutes/hours)",
                "Defect resolution timeline thresholds",
                "Financial penalty calculation window"
            ],
            "impact": "Support staffing shift models (8x5 vs 24x7) and SLA financial penalty liabilities cannot be planned.",
            "severity": "High"
        }
    ]

    MEASURABLE_REGEXES = [
        r"\d+\s*%",
        r"\d+\s*ms\b",
        r"\d+\s*seconds?\b",
        r"\d+\s*minutes?\b",
        r"\d+\s*hours?\b",
        r"\d+\s*days?\b",
        r"\d+\s*(?:gb|tb|mb)\b",
        r"99\.\d+",
        r"\d+\s*rps\b",
        r"\d+\s*tps\b",
        r"\d+\s*concurrent",
        r"rto\s*(?:of\s*)?\d+",
        r"rpo\s*(?:of\s*)?\d+"
    ]

    @classmethod
    def analyze_requirements(cls, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Scans normalized requirements for evidence-based unmeasurable criteria.
        Rejects candidates that already contain quantifiable thresholds.
        """
        ambiguities = []
        amb_id = 1

        for req in requirements:
            text = req.get("text", "")
            text_lower = text.lower()

            for rule in cls.AMBIGUITY_RULES:
                if re.search(rule["pattern"], text_lower):
                    # Check if requirement is already measurable
                    has_metrics = any(re.search(m, text_lower) for m in cls.MEASURABLE_REGEXES)
                    
                    # If metrics are present for the concept, do not falsely flag
                    if has_metrics and "99." in text_lower and "availability" in rule["pattern"]:
                        continue
                    if has_metrics and any(w in text_lower for w in ["ms", "second", "hour", "day"]) and "timely" in rule["pattern"]:
                        continue
                    if has_metrics and any(w in text_lower for w in ["gb", "tb", "rps"]) and "scalable" in rule["pattern"]:
                        continue

                    req_id = req.get("id")
                    page = req.get("page", 1)
                    section = req.get("section", "General")

                    ambiguities.append({
                        "id": f"AMB-{amb_id:03d}",
                        "requirement_id": req_id,
                        "page": page,
                        "section": section,
                        "text": text,
                        "term": rule["term"],
                        "missing_information": rule["missing"],
                        "impact": rule["impact"],
                        "severity": rule["severity"],
                        "suggested_clarification": (
                            f"Requirement {req_id} (Page {page}, {section}) specifies '{rule['term']}' without measurable criteria. "
                            f"Could the client confirm quantitative targets for: {', '.join(rule['missing'][:2])}?"
                        )
                    })
                    amb_id += 1
                    break

        return ambiguities

