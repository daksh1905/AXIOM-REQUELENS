import unittest
import io
from backend.services.solution_architect import SolutionArchitect
from backend.services.delivery_estimator import DeliveryEstimator
from backend.services.proposal_generator import ProposalGenerator
from backend.services.traceability_engine import TraceabilityEngine
from backend.services.readiness_scorer import ReadinessScorer
from backend.exports.export_service import ExportService

class TestPhase2Services(unittest.TestCase):
    def setUp(self):
        self.sample_requirements = [
            {
                "id": f"REQ-{i:03d}",
                "text": f"The CSP shall provide {'MFA and IAM authentication' if i % 4 == 0 else 'cloud infrastructure multi-AZ' if i % 4 == 1 else 'REST API data export' if i % 4 == 2 else 'audit logging'}.",
                "title": f"Mandatory Requirement {i}",
                "category": ["Security", "Infrastructure", "Integration", "Compliance"][i % 4],
                "priority": "Mandatory" if i % 5 != 0 else "Optional",
                "page": (i % 20) + 1,
                "section": f"Section {i % 10 + 1}.0"
            }
            for i in range(1, 41)
        ]
        self.sample_risks = [
            {
                "id": "RISK-001",
                "title": "Timeline Risk",
                "severity": "Critical",
                "category": "Timeline",
                "description": "Aggressive delivery timeline"
            }
        ]
        self.sample_clarifications = [
            {
                "id": "CLAR-001",
                "question": "Clarify cutover window",
                "category": "Architecture"
            }
        ]

    def test_solution_architect(self):
        arch, stack, assumptions = SolutionArchitect.generate_architecture_and_stack(
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            ambiguities=[],
            rfp_filename="Test_Project"
        )
        self.assertGreaterEqual(len(arch["components"]), 6)
        self.assertTrue(all("origin" in c for c in arch["components"]))
        self.assertTrue(any(c["origin"] in ["RFP_REQUIRED", "RECLENS_PROPOSED"] for c in arch["components"]))
        self.assertIn("mermaid_diagram", arch)
        self.assertGreater(len(arch["data_flows"]), 0)
        self.assertGreater(len(stack), 0)
        self.assertTrue(all("alternatives_considered" in s for s in stack))
        self.assertGreaterEqual(len(assumptions), 4)
        self.assertTrue(all(a["id"].startswith("ASM-") for a in assumptions))

    def test_delivery_estimator(self):
        arch, stack, assumptions = SolutionArchitect.generate_architecture_and_stack(
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            ambiguities=[],
            rfp_filename="Test_Project"
        )
        feas, team, milestones = DeliveryEstimator.estimate_delivery_and_team(
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            architecture_components=arch["components"],
            assumptions=assumptions
        )
        self.assertIn("AI-assisted preliminary estimate", feas["disclaimer"])
        self.assertGreaterEqual(len(feas["options"]), 3)
        self.assertGreaterEqual(len(team), 6)
        self.assertTrue(all("role" in t and "suggested_count" in t for t in team))
        self.assertEqual(len(milestones), 6)
        self.assertTrue(all(m["milestone_id"].startswith("M-") for m in milestones))

    def test_proposal_generator(self):
        arch, stack, assumptions = SolutionArchitect.generate_architecture_and_stack(
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            ambiguities=[],
            rfp_filename="Test_Project"
        )
        feas, team, milestones = DeliveryEstimator.estimate_delivery_and_team(
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            architecture_components=arch["components"],
            assumptions=assumptions
        )
        sections = ProposalGenerator.generate_proposal(
            project_name="Test Project",
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            clarifications=self.sample_clarifications,
            architecture=arch,
            tech_stack=stack,
            assumptions=assumptions,
            milestones=milestones,
            team=team
        )
        self.assertEqual(len(sections), 16)
        for sec in sections:
            self.assertIn("number", sec)
            self.assertIn("title", sec)
            self.assertIn("content", sec)
            self.assertIn("claims", sec)
            self.assertGreater(len(sec["content"]), 40)

    def test_traceability_engine(self):
        arch, stack, assumptions = SolutionArchitect.generate_architecture_and_stack(
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            ambiguities=[],
            rfp_filename="Test_Project"
        )
        feas, team, milestones = DeliveryEstimator.estimate_delivery_and_team(
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            architecture_components=arch["components"],
            assumptions=assumptions
        )
        sections = ProposalGenerator.generate_proposal(
            project_name="Test Project",
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            clarifications=self.sample_clarifications,
            architecture=arch,
            tech_stack=stack,
            assumptions=assumptions,
            milestones=milestones,
            team=team
        )
        res = TraceabilityEngine.build_matrix_and_audit(
            requirements=self.sample_requirements,
            architecture=arch,
            proposal_sections=sections,
            milestones=milestones,
            risks=self.sample_risks
        )
        matrix = res["matrix"]
        audit = res["coverage_audit"]
        self.assertEqual(len(matrix), len(self.sample_requirements))
        self.assertEqual(audit["total_normalized"], len(self.sample_requirements))
        self.assertGreaterEqual(audit["coverage_percentage"], 90.0)

    def test_exports_docx_and_pdf(self):
        arch, stack, assumptions = SolutionArchitect.generate_architecture_and_stack(
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            ambiguities=[],
            rfp_filename="Test_Project"
        )
        feas, team, milestones = DeliveryEstimator.estimate_delivery_and_team(
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            architecture_components=arch["components"],
            assumptions=assumptions
        )
        sections = ProposalGenerator.generate_proposal(
            project_name="Test Project",
            requirements=self.sample_requirements,
            risks=self.sample_risks,
            clarifications=self.sample_clarifications,
            architecture=arch,
            tech_stack=stack,
            assumptions=assumptions,
            milestones=milestones,
            team=team
        )
        res = TraceabilityEngine.build_matrix_and_audit(
            requirements=self.sample_requirements,
            architecture=arch,
            proposal_sections=sections,
            milestones=milestones,
            risks=self.sample_risks
        )
        project = {"name": "Test Project", "filename": "Test.pdf"}
        data = {
            "requirements": self.sample_requirements,
            "architecture_solution": arch,
            "tech_stack": stack,
            "assumptions": assumptions,
            "milestones": milestones,
            "team_estimates": team,
            "delivery_feasibility": feas,
            "proposal_sections": sections,
            "traceability_records": res["matrix"],
            "coverage_audit": res["coverage_audit"],
            "readiness": {"overall_score": 82}
        }
        docx_stream = ExportService.generate_docx(project, data)
        self.assertGreater(len(docx_stream.getvalue()), 1000)
        pdf_stream = ExportService.generate_pdf(project, data)
        self.assertGreater(len(pdf_stream.getvalue()), 1000)

if __name__ == "__main__":
    unittest.main()

