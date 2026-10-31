"""
Test Suite for BIDFORGE AI Checklist Features:
Tests Document Reading, Human Review & CRUD (Requirements, Risks, Assumptions, Proposal Sections),
Proposal Section Single-Unit Regeneration, Version Diffing, and Missing Information Detection.
"""

import unittest
import os
import io
from backend.database.db import ProjectRepository
from backend.api.main import (
    startup_event,
    get_project_document,
    update_requirement,
    update_risk,
    update_assumption,
    update_proposal_section,
    regenerate_proposal_section,
    compare_projects
)
from backend.schemas.models import (
    RequirementUpdateRequest,
    RiskUpdateRequest,
    AssumptionUpdateRequest,
    ProposalSectionUpdateRequest,
    RegenerateSectionRequest,
    CompareProjectsRequest
)
from backend.services.pipeline_orchestrator import PipelineOrchestrator
from backend.parsers.document_parser import DocumentParser, ParsedPage
from backend.exports.export_service import ExportService


class TestChecklistFeatures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        startup_event()
        cls.repo = ProjectRepository()
        cls.pid = "demo-rfp-001"
        cls.proj = cls.repo.get_project(cls.pid)
        assert cls.proj is not None, "Demo project must be initialized by startup_event"

    def test_01_document_retrieval(self):
        """Checklist #1 & #5: Document streaming endpoint returns file response."""
        resp = get_project_document(self.pid)
        self.assertIsNotNone(resp)
        self.assertTrue(hasattr(resp, "status_code") or hasattr(resp, "path"))

    def test_02_requirement_update_and_verification(self):
        """Checklist #3 & #8: Requirement text editing, category change, and human verification."""
        body = RequirementUpdateRequest(
            text="Updated functional requirement statement with verified audit trail",
            category="Technical",
            priority="Mandatory",
            is_verified=True,
            reviewer_notes="Verified against section 4.2"
        )
        res = update_requirement(self.pid, "REQ-001", body)
        self.assertEqual(res["status"], "success")
        updated = res["requirement"]
        self.assertEqual(updated["id"], "REQ-001")
        self.assertEqual(updated["category"], "Technical")
        self.assertTrue(updated["is_verified"])
        self.assertEqual(updated["reviewer_notes"], "Verified against section 4.2")

    def test_03_risk_update(self):
        """Checklist #6 & #8: Risk severity update and solution recommendation refinement."""
        body = RiskUpdateRequest(
            severity="Critical",
            recommendation="Immediate architect sign-off and active-passive redundancy deploy"
        )
        res = update_risk(self.pid, "RISK-001", body)
        self.assertEqual(res["status"], "success")
        updated = res["risk"]
        self.assertEqual(updated["id"], "RISK-001")
        self.assertEqual(updated["severity"], "Critical")
        self.assertIn("Immediate architect sign-off", updated["recommendation"])

    def test_04_assumption_update(self):
        """Checklist #3 & #8: Assumption approval, modification, and status transition."""
        body = AssumptionUpdateRequest(
            statement="Client will provide dedicated staging environment 3 weeks before UAT",
            status="CONFIRMED"
        )
        res = update_assumption(self.pid, "ASM-001", body)
        self.assertEqual(res["status"], "success")
        updated = res["assumption"]
        self.assertEqual(updated["status"], "CONFIRMED")

    def test_05_proposal_section_update(self):
        """Checklist #12 & #13: Proposal section narrative manual editing."""
        body = ProposalSectionUpdateRequest(
            title="Executive Mission & Operational Vision",
            content="RecLens provides sovereign, evidence-grounded bid generation for tier-1 institutions."
        )
        res = update_proposal_section(self.pid, 1, body)
        self.assertEqual(res["status"], "success")
        updated = res["section"]
        self.assertEqual(updated["number"], 1)
        self.assertEqual(updated["title"], "Executive Mission & Operational Vision")
        self.assertTrue(updated["human_edited"])

    def test_06_proposal_section_regeneration(self):
        """Checklist #13: Proposal section single-unit regeneration without invalidating rest of document."""
        body = RegenerateSectionRequest(
            custom_instructions="Emphasize strict GDPR, ISO 27001 compliance, and 99.999% SLA availability."
        )
        res = regenerate_proposal_section(self.pid, 1, body)
        self.assertEqual(res["status"], "success")
        sec = res["section"]
        self.assertEqual(sec["number"], 1)
        self.assertIsNotNone(sec["content"])
        self.assertIn("regenerated_at", sec)

    def test_07_compare_projects_version_diff(self):
        """Checklist #17: Version comparison between two projects / revisions."""
        body = CompareProjectsRequest(
            project_id_1=self.pid,
            project_id_2=self.pid
        )
        res = compare_projects(body)
        self.assertIn("added_requirements_count", res)
        self.assertEqual(res["added_requirements_count"], 0)
        self.assertEqual(res["removed_requirements_count"], 0)
        self.assertEqual(res["modified_requirements_count"], 0)

    def test_08_missing_information_detection(self):
        """Checklist #7: Missing Information Detection engine flags unstated SLAs, capacity, DR."""
        orchestrator = PipelineOrchestrator()
        dummy_pages = [
            ParsedPage(
                page_number=1,
                text="The client seeks a trading portal. No budget mentioned. No user concurrency details provided.",
                tables=[],
                sections=[]
            )
        ]
        missing = orchestrator._detect_missing_information(dummy_pages, [], [])
        self.assertTrue(len(missing) >= 3)
        categories = [m["category"] for m in missing]
        self.assertIn("Budget", categories)
        self.assertIn("User Capacity", categories)
        self.assertIn("Disaster Recovery", categories)
        for m in missing:
            self.assertIn("missing_detail", m)
            self.assertIn("why_it_matters", m)
            self.assertTrue("client_clarification_question" in m or "recommended_question" in m)

    def test_09_visual_architecture_diagram_generation(self):
        """Checklist #9 & #16: Visual architecture diagram generation via matplotlib."""
        data = self.proj.get("data", {})
        arch_img = ExportService.generate_architecture_diagram_image(data)
        self.assertIsNotNone(arch_img)
        self.assertIsInstance(arch_img, io.BytesIO)
        raw_bytes = arch_img.getvalue()
        self.assertTrue(len(raw_bytes) > 1000)
        # PNG signature
        self.assertEqual(raw_bytes[:8], b"\x89PNG\r\n\x1a\n")


if __name__ == "__main__":
    unittest.main()
