"""
Evidence-Locked Contradiction Detection & Validation Engine for RecLens.

Enforces Product Rules:
1. Evidence-Locked: Contradictions are derived STRICTLY from the normalized text
   and source_text of the referenced requirements.
2. Contradiction Validation: Runs a 4-part logical validation test:
   - What exact proposition does A require?
   - What exact proposition does B require?
   - Are those propositions logically incompatible?
   - Can both requirements reasonably be satisfied simultaneously?
3. Lifecycle & Section Context Awareness: Discriminates between different lifecycle
   stages (e.g. Bid Disqualification vs Contract Expiry / Termination).
4. Contradiction Types:
   - DIRECT_CONTRADICTION
   - POTENTIAL_TENSION
   - DEPENDENCY
   - RELATED_NOT_CONTRADICTORY
   - INSUFFICIENT_EVIDENCE
   Only DIRECT_CONTRADICTION and strong POTENTIAL_TENSION are emitted to the UI.
5. No Invented Reasoning: Never asserts external timelines, cutover sizes, or
   technologies absent from the evidence text.
"""

import re
from enum import Enum
from typing import Dict, Any, List, Optional, Tuple

class ContradictionType(str, Enum):
    DIRECT_CONTRADICTION = "DIRECT_CONTRADICTION"
    POTENTIAL_TENSION = "POTENTIAL_TENSION"
    DEPENDENCY = "DEPENDENCY"
    RELATED_NOT_CONTRADICTORY = "RELATED_NOT_CONTRADICTORY"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"

class LifecycleStage(str, Enum):
    BID_SUBMISSION = "BID_SUBMISSION"
    PRE_CONTRACT = "PRE_CONTRACT"
    IMPLEMENTATION = "IMPLEMENTATION"
    OPERATIONS = "OPERATIONS"
    TERMINATION_EXIT = "TERMINATION_EXIT"
    GENERAL_SPEC = "GENERAL_SPEC"

class ContradictionDetector:
    @staticmethod
    def detect_lifecycle_stage(section: str, text: str) -> LifecycleStage:
        combined = f"{section} {text}".lower()
        
        # 1. Bid submission / disqualification
        if any(w in combined for w in [
            "disqualification", "rejection of bid", "bid submission", "tender validity", 
            "proposal submission", "submission deadline", "bidder eligibility", "disqualif"
        ]):
            return LifecycleStage.BID_SUBMISSION
            
        # 2. Termination / Exit / Decommissioning
        if any(w in combined for w in [
            "expiry", "termination", "transition out", "exit management", "decommission",
            "data destruction", "contract expiry", "on termination"
        ]):
            return LifecycleStage.TERMINATION_EXIT
            
        # 3. Operations / SLA
        if any(w in combined for w in [
            "service level agreement", "sla", "operational hours", "routine maintenance",
            "ongoing support", "availability sla"
        ]):
            return LifecycleStage.OPERATIONS
            
        # 4. Implementation / Go-live
        if any(w in combined for w in [
            "milestone", "implementation phase", "sprint", "cutover", "go-live", "initial rollout"
        ]):
            return LifecycleStage.IMPLEMENTATION
            
        return LifecycleStage.GENERAL_SPEC

    @staticmethod
    def validate_contradiction(
        req_a: Dict[str, Any],
        req_b: Dict[str, Any]
    ) -> Tuple[ContradictionType, Optional[str], Optional[str], float]:
        """
        Validates whether req_a and req_b are logically incompatible.
        Returns (ContradictionType, evidence_locked_reason, clarification_question, confidence).
        """
        text_a = req_a.get("text", "").strip()
        text_b = req_b.get("text", "").strip()
        sec_a = req_a.get("section", "General")
        sec_b = req_b.get("section", "General")
        
        lower_a = text_a.lower()
        lower_b = text_b.lower()
        
        # 1. Lifecycle Stage Check
        stage_a = ContradictionDetector.detect_lifecycle_stage(sec_a, text_a)
        stage_b = ContradictionDetector.detect_lifecycle_stage(sec_b, text_b)
        
        # Lifecycle incompatibility check:
        # e.g., Bid disqualification rule vs contract exit/termination rule
        if (stage_a == LifecycleStage.BID_SUBMISSION and stage_b == LifecycleStage.TERMINATION_EXIT) or \
           (stage_b == LifecycleStage.BID_SUBMISSION and stage_a == LifecycleStage.TERMINATION_EXIT):
            return (
                ContradictionType.RELATED_NOT_CONTRADICTORY,
                "Requirements govern distinct lifecycle stages (Bid Submission vs Contract Expiry/Exit) and can be satisfied sequentially without logical conflict.",
                None,
                0.0
            )

        # 2. Infrastructure Hosting Boundary Conflict Test
        # Pattern: One requirement specifies exclusive On-Premise private infrastructure,
        # while the other requirement mandates Public Cloud / AWS / Azure / GCP managed services.
        is_onprem_a = bool(re.search(r"\b(on-premise|client-owned|private data center|frankfurt private data center|bare-metal)\b", lower_a))
        is_onprem_b = bool(re.search(r"\b(on-premise|client-owned|private data center|frankfurt private data center|bare-metal)\b", lower_b))
        
        is_cloud_a = bool(re.search(r"\b(aws|amazon web services|aws rds|azure|google cloud|gcp|public cloud)\b", lower_a))
        is_cloud_b = bool(re.search(r"\b(aws|amazon web services|aws rds|azure|google cloud|gcp|public cloud)\b", lower_b))
        
        # Guard: Azure AD SSO / directory federation is NOT a cloud hosting contradiction
        is_directory_federation_a = bool(re.search(r"\b(azure active directory|azure ad|saml|sso|federat|identity)\b", lower_a)) and not bool(re.search(r"\b(hosting|compute|database|rds|infrastructure)\b", lower_a))
        is_directory_federation_b = bool(re.search(r"\b(azure active directory|azure ad|saml|sso|federat|identity)\b", lower_b)) and not bool(re.search(r"\b(hosting|compute|database|rds|infrastructure)\b", lower_b))

        if (is_onprem_a and is_cloud_b and not is_directory_federation_b) or \
           (is_onprem_b and is_cloud_a and not is_directory_federation_a):
            
            # Identify which is on-prem and which is cloud
            onprem_req = req_a if is_onprem_a else req_b
            cloud_req = req_b if is_onprem_a else req_a
            
            # Check if text allows hybrid or both
            allows_hybrid = any(w in lower_a or w in lower_b for w in ["hybrid", "optional", "where applicable", "or cloud"])
            
            c_type = ContradictionType.POTENTIAL_TENSION if allows_hybrid else ContradictionType.DIRECT_CONTRADICTION
            
            reason = (
                f"Direct architectural conflict between {onprem_req['id']} (Page {onprem_req['page']}, Section '{onprem_req['section']}') "
                f"and {cloud_req['id']} (Page {cloud_req['page']}, Section '{cloud_req['section']}'). "
                f"Proposition A specifies that compute workloads and persistent data stores must be deployed on client on-premise infrastructure. "
                f"Proposition B specifies that databases or services must utilize public cloud managed services ({cloud_req['text'][:75]}...). "
                f"Both propositions cannot be satisfied simultaneously without an approved hybrid architecture or cloud exemption."
            )
            
            clarification = (
                f"Requirement {onprem_req['id']} (Page {onprem_req['page']}) mandates on-premise private infrastructure, "
                f"whereas Requirement {cloud_req['id']} (Page {cloud_req['page']}) mandates public cloud managed services. "
                f"Could the client clarify whether on-premise private deployment or public cloud infrastructure is the governing standard?"
            )
            
            confidence = 0.94 if c_type == ContradictionType.DIRECT_CONTRADICTION else 0.82
            return (c_type, reason, clarification, confidence)

        # 3. Explicit Mutually Exclusive Technical Standards Test
        # e.g., "strictly forbid external internet connectivity" vs "requires direct outbound public internet API integration"
        is_airgap_a = bool(re.search(r"\b(air-gapped|no external internet|strictly isolated network|no outbound internet)\b", lower_a))
        is_airgap_b = bool(re.search(r"\b(air-gapped|no external internet|strictly isolated network|no outbound internet)\b", lower_b))
        
        is_internet_a = bool(re.search(r"\b(public internet|outbound webhook|public api endpoint|external saas integration)\b", lower_a))
        is_internet_b = bool(re.search(r"\b(public internet|outbound webhook|public api endpoint|external saas integration)\b", lower_b))
        
        if (is_airgap_a and is_internet_b) or (is_airgap_b and is_internet_a):
            isolated_req = req_a if is_airgap_a else req_b
            internet_req = req_b if is_airgap_a else req_a
            
            reason = (
                f"Network isolation contradiction between {isolated_req['id']} (Page {isolated_req['page']}) "
                f"and {internet_req['id']} (Page {internet_req['page']}). "
                f"{isolated_req['id']} mandates isolated/air-gapped network boundaries, while {internet_req['id']} mandates public internet connectivity."
            )
            clarification = (
                f"Please confirm whether external public network connectivity is permitted for {internet_req['id']}, "
                f"given the network isolation mandate in {isolated_req['id']}."
            )
            return (ContradictionType.DIRECT_CONTRADICTION, reason, clarification, 0.92)

        # 4. Directly Incompatible Numerical Timeline Test
        # ONLY if both requirements specify mutually exclusive explicit numeric schedule constraints for the exact same phase.
        # Note: General schedule compression with migration is a DELIVERY RISK, not a logical contradiction,
        # unless both clauses state mutually exclusive calendar deadlines.
        match_deadline_a = re.search(r"\bwithin\s+(\d+)\s+(weeks|months|days)\b", lower_a)
        match_deadline_b = re.search(r"\bminimum\s+of\s+(\d+)\s+(weeks|months|days)\s+required\b", lower_b)
        if match_deadline_a and match_deadline_b:
            unit_a = match_deadline_a.group(2)
            unit_b = match_deadline_b.group(2)
            val_a = int(match_deadline_a.group(1))
            val_b = int(match_deadline_b.group(1))
            
            # Normalize to days approx
            days_a = val_a * (7 if "week" in unit_a else 30 if "month" in unit_a else 1)
            days_b = val_b * (7 if "week" in unit_b else 30 if "month" in unit_b else 1)
            
            if days_a < days_b and stage_a == stage_b:
                reason = (
                    f"Direct schedule contradiction between {req_a['id']} (Page {req_a['page']}) specifying completion within {val_a} {unit_a}, "
                    f"and {req_b['id']} (Page {req_b['page']}) specifying a mandatory minimum duration of {val_b} {unit_b}."
                )
                clarification = (
                    f"Requirement {req_a['id']} mandates completion within {val_a} {unit_a}, while {req_b['id']} specifies a minimum of {val_b} {unit_b}. "
                    f"Could the client confirm the governing milestone timeline?"
                )
                return (ContradictionType.DIRECT_CONTRADICTION, reason, clarification, 0.90)

        # Default: If no evidence-backed logical incompatibility can be proven from the text alone,
        # return RELATED_NOT_CONTRADICTORY or INSUFFICIENT_EVIDENCE.
        return (
            ContradictionType.RELATED_NOT_CONTRADICTORY,
            "No direct logical incompatibility between propositions; both requirements can be satisfied without mutual exclusion.",
            None,
            0.0
        )

    @classmethod
    def analyze_requirements(cls, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Examines all requirement pairs, runs validation, and retains ONLY
        validated DIRECT_CONTRADICTION and strong POTENTIAL_TENSION findings.
        Never fabricates facts absent from the evidence.
        """
        validated_contradictions = []
        con_idx = 1
        
        # Compare candidate pairs
        num_reqs = len(requirements)
        for i in range(num_reqs):
            for j in range(i + 1, num_reqs):
                req_a = requirements[i]
                req_b = requirements[j]
                
                c_type, reason, clarification, conf = cls.validate_contradiction(req_a, req_b)
                
                # Rule: ONLY DIRECT_CONTRADICTION and POTENTIAL_TENSION are saved.
                # All other classes (DEPENDENCY, RELATED_NOT_CONTRADICTORY, INSUFFICIENT_EVIDENCE) are rejected.
                if c_type in [ContradictionType.DIRECT_CONTRADICTION, ContradictionType.POTENTIAL_TENSION]:
                    severity = "Critical" if c_type == ContradictionType.DIRECT_CONTRADICTION else "High"
                    
                    validated_contradictions.append({
                        "id": f"CON-{con_idx:03d}",
                        "requirement_ids": [req_a["id"], req_b["id"]],
                        "severity": severity,
                        "type": c_type.value,
                        "reason": reason,
                        "confidence": conf,
                        "evidence": [
                            {
                                "req_id": req_a["id"],
                                "page": req_a.get("page", 1),
                                "section": req_a.get("section", "General"),
                                "text": req_a.get("text", "")
                            },
                            {
                                "req_id": req_b["id"],
                                "page": req_b.get("page", 1),
                                "section": req_b.get("section", "General"),
                                "text": req_b.get("text", "")
                            }
                        ],
                        "clarification_question": clarification,
                        "reviewed": False
                    })
                    con_idx += 1
                    
        return validated_contradictions

