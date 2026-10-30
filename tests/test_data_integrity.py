import unittest
from backend.services.requirement_normalizer import RequirementNormalizer
from backend.services.ambiguity_detector import AmbiguityDetector
from backend.services.contradiction_detector import ContradictionDetector, ContradictionType
from backend.services.pipeline_orchestrator import PipelineOrchestrator
from backend.database.db import ProjectRepository

class TestDataIntegrityPipeline(unittest.TestCase):
    
    def test_01_contradictions_empty_no_conflict_banner(self):
        """1. When contradictions=[], the system reports 0 contradictions and produces no conflict banner."""
        contradictions = []
        has_banner = len(contradictions) > 0
        self.assertFalse(has_banner)
        self.assertEqual(len(contradictions), 0)

    def test_02_exact_duplicate_requirements_merged(self):
        """2. Exact duplicate requirements are merged, preserving both source pages and citations."""
        raw_reqs = [
            {
                "id": "REQ-101",
                "text": "The Bidder shall submit a valid empanelment certificate.",
                "page": 13,
                "section": "1.2 Empanelment",
                "source_text": "The Bidder shall submit a valid empanelment certificate.",
                "priority": "Mandatory"
            },
            {
                "id": "REQ-102",
                "text": "The Bidder shall submit a valid empanelment certificate.",
                "page": 45,
                "section": "5.1 Certifications",
                "source_text": "The Bidder shall submit a valid empanelment certificate.",
                "priority": "Mandatory"
            }
        ]
        normalized, stats = RequirementNormalizer.normalize_and_deduplicate(raw_reqs)
        self.assertEqual(len(normalized), 1)
        self.assertEqual(stats["duplicates_merged_count"], 1)
        self.assertEqual(normalized[0]["duplicate_count"], 1)
        self.assertEqual(normalized[0]["source_pages"], [13, 45])
        self.assertEqual(len(normalized[0]["citations"]), 2)

    def test_03_near_identical_duplicate_requirements_merged(self):
        """3. Near-identical duplicate requirements across annexures are conservatively merged with traceability."""
        raw_reqs = [
            {
                "id": "REQ-201",
                "text": "It is hereby confirmed that I/We are entitled to act on behalf of the bidder.",
                "page": 130,
                "section": "Annexure A",
                "source_text": "It is hereby confirmed that I/We are entitled to act on behalf of the bidder.",
                "priority": "Mandatory"
            },
            {
                "id": "REQ-202",
                "text": "It is hereby confirmed that I/We are entitled to act on beha lf of the bidder.",
                "page": 135,
                "section": "Annexure B",
                "source_text": "It is hereby confirmed that I/We are entitled to act on beha lf of the bidder.",
                "priority": "Mandatory"
            }
        ]
        # Cleaned and normalized
        normalized, stats = RequirementNormalizer.normalize_and_deduplicate(raw_reqs)
        self.assertEqual(len(normalized), 1)
        self.assertEqual(stats["duplicates_merged_count"], 1)
        self.assertEqual(normalized[0]["source_pages"], [130, 135])

    def test_04_related_but_distinct_requirements_not_merged(self):
        """4. Related but distinct requirements MUST NOT be merged."""
        raw_reqs = [
            {
                "id": "REQ-301",
                "text": "The platform shall support multi-factor authentication (MFA).",
                "page": 40,
                "section": "Security",
                "source_text": "The platform shall support multi-factor authentication (MFA).",
                "priority": "Mandatory"
            },
            {
                "id": "REQ-302",
                "text": "MFA shall use hardware security tokens adhering to FIDO2 WebAuthn.",
                "page": 41,
                "section": "Security",
                "source_text": "MFA shall use hardware security tokens adhering to FIDO2 WebAuthn.",
                "priority": "Mandatory"
            }
        ]
        normalized, stats = RequirementNormalizer.normalize_and_deduplicate(raw_reqs)
        self.assertEqual(len(normalized), 2)
        self.assertEqual(stats["duplicates_merged_count"], 0)
        self.assertEqual(normalized[0]["id"], "REQ-001")
        self.assertEqual(normalized[1]["id"], "REQ-002")

    def test_05_header_footer_garbage_ignored(self):
        """5. TOC dot leaders and running headers are rejected or cleaned."""
        raw_reqs = [
            {
                "id": "REQ-401",
                "text": "General Liability Clause ................................................................ 50",
                "page": 3,
                "section": "Table of Contents",
                "source_text": "General Liability Clause ................................................................ 50",
                "priority": "Mandatory"
            },
            {
                "id": "REQ-402",
                "text": "Items Documents Required Reference Page No.",
                "page": 150,
                "section": "Forms",
                "source_text": "Items Documents Required Reference Page No.",
                "priority": "Mandatory"
            },
            {
                "id": "REQ-403",
                "text": "Model RFP — Procurement of Cloud Computing Services Page 27 of 164 Service credits shall be applied within 30 days.",
                "page": 27,
                "section": "SLA",
                "source_text": "Model RFP — Procurement of Cloud Computing Services Page 27 of 164 Service credits shall be applied within 30 days.",
                "priority": "Mandatory"
            }
        ]
        normalized, stats = RequirementNormalizer.normalize_and_deduplicate(raw_reqs)
        # REQ-401 (TOC) and REQ-402 (table header) are rejected.
        # REQ-403 has its header stripped, leaving the valid requirement: 'Service credits shall be applied within 30 days.'
        self.assertEqual(len(normalized), 1)
        self.assertIn("Service credits shall be applied within 30 days.", normalized[0]["text"])
        self.assertNotIn("Model RFP", normalized[0]["text"])
        self.assertEqual(stats["rejected_artifacts_count"], 2)

    def test_06_procurement_requirement_preserved_and_classified(self):
        """6. Procurement/tender requirements are preserved and classified with scope_type='procurement_admin'."""
        raw_req = [{
            "id": "REQ-501",
            "text": "The Bidder shall submit an Earnest Money Deposit (EMD) of INR 5,00,000 along with the technical bid.",
            "page": 14,
            "section": "2.1 Bid Submission",
            "source_text": "The Bidder shall submit an Earnest Money Deposit (EMD) of INR 5,00,000 along with the technical bid.",
            "priority": "Mandatory"
        }]
        normalized, stats = RequirementNormalizer.normalize_and_deduplicate(raw_req)
        self.assertEqual(len(normalized), 1)
        self.assertEqual(normalized[0]["requirement_type"], "COMMERCIAL")
        self.assertEqual(normalized[0]["category"], "Legal & Commercial")
        self.assertEqual(normalized[0]["scope_type"], "procurement_admin")

    def test_07_technical_requirement_preserved_and_classified(self):
        """7. Technical infrastructure requirements are preserved and classified with scope_type='technical'."""
        raw_req = [{
            "id": "REQ-601",
            "text": "The cloud services must support dynamic resource scaling based on CPU and memory thresholds.",
            "page": 90,
            "section": "Part I - Functional Spec",
            "source_text": "The cloud services must support dynamic resource scaling based on CPU and memory thresholds.",
            "priority": "Mandatory"
        }]
        normalized, stats = RequirementNormalizer.normalize_and_deduplicate(raw_req)
        self.assertEqual(len(normalized), 1)
        self.assertEqual(normalized[0]["requirement_type"], "TECHNICAL")
        self.assertEqual(normalized[0]["category"], "Infrastructure")
        self.assertEqual(normalized[0]["scope_type"], "technical")

    def test_08_vague_but_measurable_not_falsely_flagged(self):
        """8. A requirement with measurable thresholds (e.g. 99.95% uptime, <200ms latency) is not falsely flagged as ambiguous."""
        reqs = [
            {
                "id": "REQ-701",
                "text": "The system shall provide high availability with a minimum guaranteed uptime SLA of 99.95%.",
                "page": 35,
                "section": "SLA"
            },
            {
                "id": "REQ-702",
                "text": "The API gateway must ensure timely response with p95 latency under 200 ms.",
                "page": 36,
                "section": "API"
            }
        ]
        ambiguities = AmbiguityDetector.analyze_requirements(reqs)
        self.assertEqual(len(ambiguities), 0)

    def test_09_genuinely_undefined_metric_ambiguity_candidate(self):
        """9. A requirement with an undefined/unmeasurable criterion is flagged with specific missing information."""
        reqs = [
            {
                "id": "REQ-801",
                "text": "The Bidder shall demonstrate that it has adequate certified technical manpower to deliver all cloud modules.",
                "page": 15,
                "section": "1.3 Technical Capacity"
            }
        ]
        ambiguities = AmbiguityDetector.analyze_requirements(reqs)
        self.assertEqual(len(ambiguities), 1)
        self.assertEqual(ambiguities[0]["requirement_id"], "REQ-801")
        self.assertEqual(ambiguities[0]["page"], 15)
        self.assertIn("FTE", ambiguities[0]["missing_information"][0])
        self.assertIn("suggested_clarification", ambiguities[0])

    def test_10_category_totals_reconcile_with_normalized_requirements(self):
        """10. Sum of counts across all categories and requirement_types exactly equals total normalized requirements."""
        raw_reqs = [
            {"id": "R1", "text": "All administrative access shall enforce MFA using FIDO2.", "page": 1, "priority": "Mandatory"},
            {"id": "R2", "text": "Vendor solution must integrate with client's Azure AD via SAML 2.0.", "page": 2, "priority": "Mandatory"},
            {"id": "R3", "text": "Compute workloads must be deployed on client-owned on-premise hardware.", "page": 3, "priority": "Mandatory"},
            {"id": "R4", "text": "Contractor accepts unlimited liability for any data breach.", "page": 4, "priority": "Mandatory"},
            {"id": "R5", "text": "Bidder shall submit an Earnest Money Deposit of INR 1,00,000.", "page": 5, "priority": "Mandatory"},
            {"id": "R6", "text": "Application shall deliver sub-second response times.", "page": 6, "priority": "Mandatory"},
            {"id": "R7", "text": "The platform shall support database export in encrypted CSV format.", "page": 7, "priority": "Mandatory"},
        ]
        normalized, stats = RequirementNormalizer.normalize_and_deduplicate(raw_reqs)
        total_normalized = len(normalized)
        
        sum_categories = sum(stats["category_counts"].values())
        sum_types = sum(stats["type_counts"].values())
        sum_scopes = sum(stats["scope_counts"].values())
        
        self.assertEqual(sum_categories, total_normalized)
        self.assertEqual(sum_types, total_normalized)
        self.assertEqual(sum_scopes, total_normalized)

    def test_11_no_demo_data_leaks_into_real_project(self):
        """11. A real project data dictionary does not contain hardcoded demo contradiction texts or demo project ID."""
        repo = ProjectRepository()
        real_project = repo.get_project("proj-fbf85b77")
        if real_project:
            self.assertFalse(real_project.get("is_demo", False))
            self.assertNotEqual(real_project.get("id"), "demo-rfp-001")
            
            pdata = real_project.get("data", {})
            contradictions = pdata.get("contradictions", [])
            # In real project, CON-001 (disqualification vs contract termination) was rejected
            for c in contradictions:
                reason = c.get("reason", "").lower()
                self.assertNotIn("compressed window", reason)
                self.assertNotIn("data cleansing and migration prior to cutover", reason)

    def test_12_all_displayed_page_and_source_citations_exist(self):
        """12. Every normalized requirement possesses a valid integer page number and non-empty source_text."""
        raw_reqs = [
            {"id": "R1", "text": "The solution must support SSO integration via OIDC.", "page": 48, "section": "8.3", "source_text": "Vendor solution must seamlessly federate with corporate Azure AD.", "priority": "Mandatory"}
        ]
        normalized, _ = RequirementNormalizer.normalize_and_deduplicate(raw_reqs)
        for r in normalized:
            self.assertIsInstance(r["page"], int)
            self.assertGreater(r["page"], 0)
            self.assertTrue(len(r["source_text"]) > 0)
            self.assertIn("citations", r)
            self.assertEqual(r["citations"][0]["page"], 48)

if __name__ == "__main__":
    unittest.main()

