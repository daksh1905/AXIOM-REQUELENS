"""
Integration Test Suite for Claim Action API:
Tests POST /api/projects/{project_id}/claims/{claim_id}/action
using the live running server and the exact frontend JSON schema.
"""

import unittest
import urllib.request
import urllib.error
import json
from backend.database.db import ProjectRepository


class TestClaimActionAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.repo = ProjectRepository()
        cls.project_id = "test-claim-api-proj"
        cls.base_url = "http://127.0.0.1:8000"

        # Create a test project fixture with a sample unsupported claim
        initial_claims = [
            {
                "claim_id": "CLM-TEST-001",
                "claim_text": "Component Identity Access Management (Keycloak) is designated as RFP Required.",
                "source_type": "ARCHITECTURE_COMPONENT",
                "source_id": "COMP-SEC-01",
                "source_title": "Identity & Access Management",
                "classification": "UNSUPPORTED_CLAIM",
                "status": "OPEN",
                "review_status": "OPEN",
                "suggested_rewrite": "The RFP establishes requirements for MFA. RecLens proposes Keycloak as the IAM platform.",
                "why_flagged": "Vendor tech Keycloak is not named in RFP text."
            },
            {
                "claim_id": "CLM-TEST-002",
                "claim_text": "TLS 1.3 protocol encryption mandated by RFP.",
                "source_type": "ARCHITECTURE_COMPONENT",
                "source_id": "COMP-SEC-02",
                "source_title": "Transport Security",
                "classification": "RFP_FACT",
                "status": "VERIFIED",
                "review_status": "RESOLVED",
                "suggested_rewrite": None,
                "why_flagged": None
            }
        ]
        test_project_data = {
            "claim_firewall": {
                "summary": {
                    "total_claims": 2,
                    "rfp_facts_count": 1,
                    "proposed_designs_count": 0,
                    "assumptions_count": 0,
                    "unsupported_claims_count": 1,
                    "needs_review_count": 0,
                    "grounding_score": 50,
                    "audit_verdict": "ATTENTION REQUIRED"
                },
                "claims": initial_claims
            },
            "claim_audits": initial_claims
        }
        cls.repo.create_project({
            "id": cls.project_id,
            "name": "Test Claim Action Project",
            "filename": "test.pdf",
            "file_type": "pdf",
            "status": "analyzed",
            "readiness": {"proposal_grounding": 50}
        }, initial_data=test_project_data)

    @classmethod
    def tearDownClass(cls):
        try:
            from backend.database.db import get_db_connection
            conn = get_db_connection()
            conn.execute("DELETE FROM projects WHERE id = ?", (cls.project_id,))
            conn.commit()
            conn.close()
        except Exception:
            pass

    def _post_action(self, project_id: str, claim_id: str, payload: dict):
        url = f"{self.base_url}/api/projects/{project_id}/claims/{claim_id}/action"
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                return resp.status, json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode("utf-8"))

    def test_accept_rewrite_success(self):
        """
        Tests accepting rewrite on an unsupported claim via exact frontend schema.
        Asserts HTTP 200, status updated, rewrite applied, unsupported count decreases.
        """
        payload = {"action": "accept_rewrite", "custom_text": None, "notes": None}
        status, data = self._post_action(self.project_id, "CLM-TEST-001", payload)
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "success")

        claim = data["claim"]
        self.assertEqual(claim["claim_id"], "CLM-TEST-001")
        self.assertEqual(claim["classification"], "PROPOSED_DESIGN")
        self.assertEqual(claim["status"], "ACCEPTED_REWRITE")
        self.assertEqual(claim["review_status"], "RESOLVED")
        self.assertIn("RecLens proposes Keycloak", claim["claim_text"])

        summary = data["summary"]
        self.assertEqual(summary["unsupported_claims_count"], 0)
        self.assertGreater(summary["grounding_score"], 50)

    def test_invalid_action_returns_400(self):
        """
        Tests sending an unsupported action string returns HTTP 400.
        """
        payload = {"action": "invalid_random_action"}
        status, data = self._post_action(self.project_id, "CLM-TEST-001", payload)
        self.assertEqual(status, 400)
        self.assertIn("Invalid action", data.get("detail", ""))

    def test_nonexistent_claim_returns_404(self):
        """
        Tests action on a non-existent claim ID returns HTTP 404.
        """
        payload = {"action": "accept_rewrite"}
        status, data = self._post_action(self.project_id, "CLM-NONEXISTENT", payload)
        self.assertEqual(status, 404)

    def test_nonexistent_project_returns_404(self):
        """
        Tests action on a non-existent project ID returns HTTP 404.
        """
        payload = {"action": "accept_rewrite"}
        status, data = self._post_action("proj-does-not-exist", "CLM-TEST-001", payload)
        self.assertEqual(status, 404)


if __name__ == "__main__":
    unittest.main()
