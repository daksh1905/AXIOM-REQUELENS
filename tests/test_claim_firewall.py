"""
Phase 3 Regression & Verification Suite: Claim Firewall & Proposal Verification Engine
Tests the independent verification layer for:
- RFP Fact vs Proposed Design vs Unsupported Claim vs Assumption vs Needs Review
- Dual-origin component modeling (capability vs implementation)
- Invented precision detection in assumptions ("within 10 business days")
- Technical validity checks (e.g., Prometheus as SIEM)
- Deterministic Proposal Grounding Score
- Live interactive claim action resolution (accept_rewrite, edit, etc.)
"""

import unittest
from backend.services.claim_firewall import ClaimFirewall


class TestClaimFirewall(unittest.TestCase):
    def setUp(self):
        self.firewall = ClaimFirewall()

    def test_mfa_keycloak_misclassification(self):
        """
        Test 1: RFP mandates MFA, proposal states Keycloak is client-required.
        Must be flagged as UNSUPPORTED_CLAIM because Keycloak is a vendor choice, not RFP mandate.
        """
        requirements = [
            {"id": "REQ-001", "text": "The CSP must provide Multi-Factor Authentication (MFA) for administrative access.", "page": 45}
        ]
        components = [
            {
                "id": "arch-iam",
                "name": "Identity & Access Management (Keycloak)",
                "category": "Security",
                "origin": "RFP_REQUIRED",  # Misclassification!
                "technology": "Keycloak",
                "purpose": "Provides MFA and SSO.",
                "mapped_rfp_requirements": ["REQ-001"]
            }
        ]
        claims = self.firewall.audit_architecture_components(components, requirements)
        self.assertEqual(len(claims), 1)
        clm = claims[0]
        self.assertEqual(clm["classification"], "UNSUPPORTED_CLAIM")
        self.assertIn("Keycloak", clm["why_flagged"])
        self.assertIsNotNone(clm.get("suggested_rewrite"))

    def test_mfa_keycloak_proposed_design(self):
        """
        Test 2: RFP mandates MFA, proposal states Keycloak is proposed by RecLens.
        Must be classified as PROPOSED_DESIGN.
        """
        requirements = [
            {"id": "REQ-001", "text": "The CSP must provide Multi-Factor Authentication (MFA) for administrative access.", "page": 45}
        ]
        components = [
            {
                "id": "arch-iam",
                "name": "Identity & Access Management (Keycloak)",
                "category": "Security",
                "origin": "RECLENS_PROPOSED",
                "capability_origin": "RFP_REQUIRED",
                "implementation_origin": "RECLENS_PROPOSED",
                "technology": "Keycloak",
                "purpose": "Proposed to fulfill RFP-mandated MFA requirement.",
                "mapped_rfp_requirements": ["REQ-001"]
            }
        ]
        claims = self.firewall.audit_architecture_components(components, requirements)
        self.assertEqual(len(claims), 1)
        clm = claims[0]
        self.assertEqual(clm["classification"], "PROPOSED_DESIGN")

    def test_kubernetes_explicit_rfp_fact(self):
        """
        Test 3: RFP explicitly mandates Kubernetes, proposal states Kubernetes is required.
        Must be classified as RFP_FACT.
        """
        requirements = [
            {"id": "REQ-050", "text": "All workloads must deploy on managed Kubernetes (EKS / MeitY-empanelled).", "page": 12}
        ]
        components = [
            {
                "id": "arch-k8s",
                "name": "Managed Cloud Kubernetes",
                "category": "Infrastructure",
                "origin": "RFP_REQUIRED",
                "technology": "Kubernetes",
                "purpose": "Workload container orchestration",
                "mapped_rfp_requirements": ["REQ-050"]
            }
        ]
        claims = self.firewall.audit_architecture_components(components, requirements)
        self.assertEqual(len(claims), 1)
        clm = claims[0]
        self.assertEqual(clm["classification"], "RFP_FACT")

    def test_postgresql_proposed_design(self):
        """
        Test 4: RFP does not specify PostgreSQL, proposal offers PostgreSQL as a proposed design.
        Must be classified as PROPOSED_DESIGN.
        """
        requirements = [
            {"id": "REQ-080", "text": "Relational data store with ACID compliance required.", "page": 30}
        ]
        components = [
            {
                "id": "arch-db",
                "name": "PostgreSQL 16 High-Availability Cluster",
                "category": "Data",
                "origin": "RECLENS_PROPOSED",
                "technology": "PostgreSQL",
                "purpose": "Fulfills relational ACID compliance requirement.",
                "mapped_rfp_requirements": ["REQ-080"]
            }
        ]
        claims = self.firewall.audit_architecture_components(components, requirements)
        self.assertEqual(len(claims), 1)
        clm = claims[0]
        self.assertEqual(clm["classification"], "PROPOSED_DESIGN")

    def test_postgresql_unsupported_claim(self):
        """
        Test 5: RFP does not specify PostgreSQL, proposal erroneously states PostgreSQL is RFP-required.
        Must be flagged as UNSUPPORTED_CLAIM.
        """
        requirements = [
            {"id": "REQ-080", "text": "Relational data store with ACID compliance required.", "page": 30}
        ]
        components = [
            {
                "id": "arch-db",
                "name": "PostgreSQL 16 High-Availability Cluster",
                "category": "Data",
                "origin": "RFP_REQUIRED",  # Misclassification!
                "technology": "PostgreSQL",
                "purpose": "Relational ACID compliance.",
                "mapped_rfp_requirements": ["REQ-080"]
            }
        ]
        claims = self.firewall.audit_architecture_components(components, requirements)
        self.assertEqual(len(claims), 1)
        clm = claims[0]
        self.assertEqual(clm["classification"], "UNSUPPORTED_CLAIM")

    def test_timeline_preliminary_estimate(self):
        """
        Test 6: AI timeline estimate with preliminary disclaimer is PROPOSED_DESIGN, not RFP_FACT.
        """
        milestones = [
            {
                "id": "M1",
                "title": "Phase 1: Foundation & Infrastructure",
                "weeks": "Weeks 1-4",
                "target_date": "Estimated Month 1",
                "source": "AI_ESTIMATE"
            }
        ]
        claims = self.firewall.audit_timeline_milestones(milestones, [])
        est_clm = claims[0]
        self.assertEqual(est_clm["classification"], "PROPOSED_DESIGN")
        self.assertIn("preliminary", est_clm["technical_notes"].lower())

    def test_invented_precision_in_assumption(self):
        """
        Test 7: Assumption with arbitrary invented precision ("within 10 business days")
        must be flagged as NEEDS_REVIEW with a milestone-based rewrite.
        """
        assumptions = [
            {
                "id": "ASM-001",
                "title": "Client sign-off turnaround",
                "statement": "Client stakeholders shall review and approve design deliverables within 10 business days of submission.",
                "category": "Delivery",
                "confidence": 0.8
            }
        ]
        claims = self.firewall.audit_assumptions(assumptions, [])
        self.assertEqual(len(claims), 1)
        clm = claims[0]
        self.assertEqual(clm["classification"], "NEEDS_REVIEW")
        self.assertIn("invented numerical precision", clm["why_flagged"].lower())
        self.assertIn("milestone", clm["suggested_rewrite"].lower())

    def test_prometheus_grafana_siem_technical_validity(self):
        """
        Test 8: Technical validity check flags Prometheus / Grafana described as an Enterprise SIEM.
        """
        components = [
            {
                "id": "arch-siem",
                "name": "SIEM & Security Analytics (Prometheus & Grafana)",
                "category": "Compliance",
                "origin": "RECLENS_PROPOSED",
                "technology": "Prometheus & Grafana",
                "purpose": "Acts as full enterprise SIEM and security incident management system.",
                "mapped_rfp_requirements": []
            }
        ]
        claims = self.firewall.audit_architecture_components(components, [])
        self.assertEqual(len(claims), 1)
        clm = claims[0]
        self.assertEqual(clm["classification"], "NEEDS_REVIEW")
        self.assertIn("SIEM", clm["why_flagged"])

    def test_deterministic_grounding_score_calculation(self):
        """
        Test 9: Grounding score calculation respects the deterministic formula:
        Grounding Score = min(100, max(25, int((weighted_valid / weighted_total) * 100)))
        """
        claims = [
            {"classification": "RFP_FACT"},
            {"classification": "RFP_FACT"},
            {"classification": "PROPOSED_DESIGN"},
            {"classification": "PROPOSED_DESIGN"},
            {"classification": "ASSUMPTION"},
            {"classification": "UNSUPPORTED_CLAIM"},
            {"classification": "NEEDS_REVIEW"}
        ]
        score = self.firewall.calculate_grounding_score(claims)
        self.assertEqual(score, 51)

    def test_accept_rewrite_action_resolves_unsupported_claim(self):
        """
        Test 10: Accepting a safe rewrite transitions an UNSUPPORTED_CLAIM to PROPOSED_DESIGN
        and updates the grounding score upwards.
        """
        claim = {
            "claim_id": "CLM-ARCH-001",
            "claim_text": "Managed Cloud Kubernetes is mandated by the client RFP.",
            "classification": "UNSUPPORTED_CLAIM",
            "suggested_rewrite": "Managed Cloud Kubernetes is proposed by RecLens to host client containerized services.",
            "status": "FLAGGED",
            "why_flagged": "Client RFP mandates containers but does not name Kubernetes."
        }
        claims = [claim]
        score_before = self.firewall.calculate_grounding_score(claims)

        updated_claim, summary = self.firewall.apply_claim_action(
            claims=claims,
            claim_id="CLM-ARCH-001",
            action="accept_rewrite"
        )
        self.assertEqual(updated_claim["classification"], "PROPOSED_DESIGN")
        self.assertEqual(updated_claim["status"], "ACCEPTED_REWRITE")
        self.assertEqual(updated_claim["claim_text"], claim["suggested_rewrite"])
        self.assertGreater(summary["grounding_score"], score_before)


if __name__ == "__main__":
    unittest.main()
