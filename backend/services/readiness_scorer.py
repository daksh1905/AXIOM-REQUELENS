from typing import Dict, Any, List

class ReadinessScorer:
    """
    Transparent deterministic heuristic scoring algorithm.
    Calculates proposal readiness from measurable indicators.
    Never uses fake win probability or arbitrary LLM guesses.
    """
    @staticmethod
    def calculate_readiness(
        requirements: List[Dict[str, Any]],
        risks: List[Dict[str, Any]],
        contradictions: List[Dict[str, Any]],
        ambiguities: List[Dict[str, Any]],
        assumptions: List[Dict[str, Any]],
        claim_audits: List[Dict[str, Any]],
        traceability_records: List[Dict[str, Any]],
        proposal_sections: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        # 1. Requirement Coverage
        total_reqs = len(requirements) or 1
        covered_reqs = sum(1 for r in requirements if r.get("status") in ["Covered", "covered"])
        partially_covered = sum(1 for r in requirements if r.get("status") in ["Partially Covered", "partially covered"])
        req_coverage_score = min(100, int(((covered_reqs + 0.5 * partially_covered) / total_reqs) * 100))

        # 2. Requirement Clarity (penalized by ambiguities and contradictions)
        ambiguity_count = len(ambiguities)
        contradiction_count = len(contradictions)
        unclarified_penalties = (ambiguity_count * 3) + (contradiction_count * 6)
        req_clarity_score = max(20, min(100, 100 - unclarified_penalties))

        # 3. Proposal Grounding (penalized by unsupported claims)
        total_claims = len(claim_audits) or 1
        grounded_claims = sum(1 for c in claim_audits if c.get("classification") in ["GROUNDED_REQUIREMENT", "RFP_FACT"])
        proposed_claims = sum(1 for c in claim_audits if c.get("classification") == "PROPOSED_DESIGN")
        assumed_claims = sum(1 for c in claim_audits if c.get("classification") == "ASSUMPTION")
        unsupported_claims = sum(1 for c in claim_audits if c.get("classification") == "UNSUPPORTED_CLAIM")
        needs_review_claims = sum(1 for c in claim_audits if c.get("classification") == "NEEDS_REVIEW")
        
        # Grounded and Proposed are high quality, Assumptions slight penalty, Unsupported heavy penalty
        weighted_val = (grounded_claims * 1.0 + proposed_claims * 0.95 + assumed_claims * 0.85)
        weighted_tot = total_claims + (unsupported_claims * 1.5) + (needs_review_claims * 0.8)
        grounding_score = max(10, min(100, int((weighted_val / max(weighted_tot, 1)) * 100)))

        # 4. Timeline Feasibility (penalized by timeline risks)
        timeline_risks = [r for r in risks if r.get("category", "").lower() == "timeline"]
        has_critical_timeline = any(r.get("severity", "").lower() == "critical" for r in timeline_risks)
        has_high_timeline = any(r.get("severity", "").lower() == "high" for r in timeline_risks)
        
        timeline_score = 90
        if has_critical_timeline:
            timeline_score -= 32
        elif has_high_timeline:
            timeline_score -= 18

        # 5. Risk Resolution (penalized by open critical & high risks)
        critical_risks = sum(1 for r in risks if r.get("severity", "").lower() == "critical")
        high_risks = sum(1 for r in risks if r.get("severity", "").lower() == "high")
        risk_resolution_score = max(25, 100 - (critical_risks * 12 + high_risks * 6))

        # 6. Traceability Coverage
        total_traceable = len(traceability_records) or 1
        covered_trace = sum(1 for t in traceability_records if t.get("status") in ["Covered", "covered"])
        traceability_score = min(100, int((covered_trace / total_traceable) * 100))

        # Overall weighted score
        weights = {
            "requirement_coverage": 0.25,
            "requirement_clarity": 0.15,
            "proposal_grounding": 0.25,
            "timeline_feasibility": 0.15,
            "risk_resolution": 0.10,
            "traceability_coverage": 0.10
        }

        overall = int(
            req_coverage_score * weights["requirement_coverage"] +
            req_clarity_score * weights["requirement_clarity"] +
            grounding_score * weights["proposal_grounding"] +
            timeline_score * weights["timeline_feasibility"] +
            risk_resolution_score * weights["risk_resolution"] +
            traceability_score * weights["traceability_coverage"]
        )

        explanation = (
            f"Deterministic heuristic index composed of: Requirement Coverage ({req_coverage_score}%), "
            f"Proposal Grounding ({grounding_score}%), Traceability Coverage ({traceability_score}%), "
            f"Requirement Clarity ({req_clarity_score}%), Timeline Feasibility ({timeline_score}%), "
            f"and Risk Resolution ({risk_resolution_score}%). Not a win probability."
        )

        return {
            "overall_score": overall,
            "requirement_coverage": req_coverage_score,
            "requirement_clarity": req_clarity_score,
            "proposal_grounding": grounding_score,
            "timeline_feasibility": timeline_score,
            "risk_resolution": risk_resolution_score,
            "traceability_coverage": traceability_score,
            "scoring_explanation": explanation
        }

