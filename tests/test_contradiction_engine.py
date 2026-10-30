"""
Regression tests for RecLens Contradiction Engine.
Verifies that:
1. Bid rejection/disqualification clause vs Contract termination data export clause
   is NOT classified as a contradiction.
2. Exclusive on-premise infrastructure vs AWS RDS PostgreSQL
   IS classified as DIRECT_CONTRADICTION or POTENTIAL_TENSION.
3. No facts outside the requirement text are introduced.
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.contradiction_detector import ContradictionDetector, ContradictionType

class TestContradictionEngine(unittest.TestCase):
    def test_bid_disqualification_vs_termination_export_not_contradiction(self):
        """
        REGRESSION TEST: The exact failure pattern observed on real RFP.
        Clause A: Bid disqualification rule.
        Clause B: Contract termination data export rule.
        Must NOT be classified as a contradiction.
        """
        req_a = {
            "id": "REQ-098",
            "page": 26,
            "section": "9.3 Disqualification of Bids",
            "text": "Without limiting the foregoing, a bid shall be rejected where: (a) it is submitted after the deadline; (b) it is conditional; (c) the Bidder attempts to influence the evaluation process; or (d) it contains information that is materially incorrect or misleading."
        }
        
        req_b = {
            "id": "REQ-285",
            "page": 45,
            "section": "Page 45",
            "text": "• On contract expiry or termination, the CSP shall: Provide a full encrypted export of all datasets, logs, configurations, and analytics outputs. Perform secure deletion of all residual data within 30 days. Furnish a certificate of data destruction signed by an authorized signatory. The CSP must support open formats (CSV, JSON, SQL dump, etc.) to facilitate migration."
        }
        
        c_type, reason, clarification, conf = ContradictionDetector.validate_contradiction(req_a, req_b)
        
        # Must be rejected as contradiction
        self.assertIn(c_type, [ContradictionType.RELATED_NOT_CONTRADICTORY, ContradictionType.INSUFFICIENT_EVIDENCE])
        self.assertIsNone(clarification, "No clarification question should be generated for rejected contradiction.")
        
        # Verify batch analysis rejects this pair
        results = ContradictionDetector.analyze_requirements([req_a, req_b])
        self.assertEqual(len(results), 0, "Disqualification vs Termination export must yield ZERO contradictions.")

    def test_onpremise_vs_aws_rds_is_contradiction(self):
        """
        VERIFICATION TEST: Exclusive On-Premise vs AWS RDS Cloud Database.
        Must be classified as DIRECT_CONTRADICTION or POTENTIAL_TENSION.
        """
        req_a = {
            "id": "REQ-004",
            "page": 2,
            "section": "Hosting & Infrastructure Boundary",
            "text": "All application compute workloads and primary persistent data stores must be deployed strictly on client-owned on-premise hardware inside our Frankfurt private data center."
        }
        
        req_b = {
            "id": "REQ-008",
            "page": 4,
            "section": "Managed Cloud Database Services",
            "text": "All relational databases must utilize AWS RDS PostgreSQL in Multi-AZ configuration with automated snapshotting and continuous replication."
        }
        
        c_type, reason, clarification, conf = ContradictionDetector.validate_contradiction(req_a, req_b)
        
        self.assertIn(c_type, [ContradictionType.DIRECT_CONTRADICTION, ContradictionType.POTENTIAL_TENSION])
        self.assertIsNotNone(reason)
        self.assertIsNotNone(clarification)
        self.assertGreater(conf, 0.75)
        
        # Verify reason does not invent facts outside the text
        self.assertNotIn("cutover", reason.lower())
        self.assertNotIn("8 weeks", reason.lower())
        self.assertNotIn("45tb", reason.lower())
        
        # Verify batch analysis includes this pair
        results = ContradictionDetector.analyze_requirements([req_a, req_b])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["requirement_ids"], ["REQ-004", "REQ-008"])
        self.assertEqual(results[0]["evidence"][0]["page"], 2)
        self.assertEqual(results[0]["evidence"][1]["page"], 4)

    def test_no_contradiction_for_unrelated_clauses(self):
        """
        Negative test: Two standard operational clauses that do not conflict.
        """
        req_a = {
            "id": "REQ-001",
            "page": 1,
            "section": "Security",
            "text": "The platform shall enforce multi-factor authentication (MFA) for administrative sessions."
        }
        req_b = {
            "id": "REQ-002",
            "page": 2,
            "section": "Reporting",
            "text": "System shall generate daily trade execution audit logs in CSV and PDF formats."
        }
        
        results = ContradictionDetector.analyze_requirements([req_a, req_b])
        self.assertEqual(len(results), 0)

if __name__ == "__main__":
    unittest.main()

