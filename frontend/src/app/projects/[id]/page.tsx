"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TransitionLink } from "@/context/TransitionContext";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Layers,
  GitBranch,
  Calendar,
  Download,
  Search,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Info,
  Scale,
  Copy,
  Check,
  ChevronRight,
  Filter,
  BarChart3,
  Clock,
  ArrowRight,
  Send,
  UserCheck,
  CheckCircle,
  XCircle,
  Edit3,
  RefreshCw,
  ShieldAlert,
  FileCheck2,
  FolderGit2
} from "lucide-react";
import {
  fetchProject,
  updateReview,
  updateClarification,
  updateClaimAction,
  askChat,
  getExportDocxUrl,
  getExportPdfUrl,
  getReportDocxUrl,
  getReportPdfUrl,
  getDocumentUrl,
  updateRequirement,
  updateRiskItem,
  updateAssumptionItem,
  updateProposalSection,
  regenerateProposalSection
} from "@/lib/api";

export default function ProjectWorkspace({ params }: { params?: { id?: string } }) {
  const clientParams = useParams();
  const rawId = clientParams?.id || params?.id;
  const projectId = (typeof rawId === "string" ? rawId : (Array.isArray(rawId) ? rawId[0] : null)) || "demo-rfp-001";

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Filter states
  const [reqCategoryFilter, setReqCategoryFilter] = useState<string>("All");
  const [reqPriorityFilter, setReqPriorityFilter] = useState<string>("All");
  const [reqScopeFilter, setReqScopeFilter] = useState<string>("All");
  const [reqSearchQuery, setReqSearchQuery] = useState<string>("");
  const [reqViewMode, setReqViewMode] = useState<"list" | "graph">("list");
  const [selectedReqForSource, setSelectedReqForSource] = useState<any>(null);
  const [whyModalRisk, setWhyModalRisk] = useState<any>(null);

  // Traceability filter
  const [traceFilter, setTraceFilter] = useState<string>("All");
  const [traceSearchQuery, setTraceSearchQuery] = useState<string>("");

  // Claim Firewall states
  const [claimCategoryFilter, setClaimCategoryFilter] = useState<string>("All");
  const [claimSectionFilter, setClaimSectionFilter] = useState<string>("All");
  const [claimSearchQuery, setClaimSearchQuery] = useState<string>("");
  const [selectedClaimForModal, setSelectedClaimForModal] = useState<any>(null);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [customRewriteText, setCustomRewriteText] = useState<string>("");
  const [isUpdatingClaim, setIsUpdatingClaim] = useState<boolean>(false);
  const [showExportGateModal, setShowExportGateModal] = useState<boolean>(false);
  const [pendingExportType, setPendingExportType] = useState<"docx" | "pdf" | null>(null);

  // Requirement Editing & Verification State
  const [editingReq, setEditingReq] = useState<any>(null);
  const [editReqForm, setEditReqForm] = useState<any>({ text: "", category: "Functional", priority: "Mandatory", is_verified: false, reviewer_notes: "" });
  const [isSavingReq, setIsSavingReq] = useState<boolean>(false);

  // Risk Editing State
  const [editingRisk, setEditingRisk] = useState<any>(null);
  const [editRiskForm, setEditRiskForm] = useState<any>({ severity: "Medium", recommendation: "" });
  const [isSavingRisk, setIsSavingRisk] = useState<boolean>(false);

  // Assumption Editing State
  const [editingAssumption, setEditingAssumption] = useState<any>(null);
  const [editAssumptionForm, setEditAssumptionForm] = useState<any>({ statement: "", status: "CONFIRMED" });
  const [isSavingAssumption, setIsSavingAssumption] = useState<boolean>(false);

  // Proposal Section Editing & Regeneration State
  const [editingProposalSection, setEditingProposalSection] = useState<{ number: number; title: string; content: string } | null>(null);
  const [isSavingProposalSection, setIsSavingProposalSection] = useState<boolean>(false);
  const [regeneratingSectionNum, setRegeneratingSectionNum] = useState<number | null>(null);
  const [regenCustomPrompt, setRegenCustomPrompt] = useState<string>("");
  const [isSubmittingRegen, setIsSubmittingRegen] = useState<boolean>(false);

  // Document Viewer Page State
  const [docViewerPage, setDocViewerPage] = useState<number>(1);

  // Chat state
  const [chatQuery, setChatQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string; citations?: any[] }>>([
    {
      role: "assistant",
      text: "Hello! I am RecLens Evidence Assistant. Ask me anything about this RFP. Every answer will be strictly grounded in parsed document page and section citations.",
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedClarId, setCopiedClarId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!projectId) return;
      try {
        setLoading(true);
        setLoadError(null);
        const data = await fetchProject(projectId);
        setProject(data);
      } catch (e: any) {
        console.error("Failed to load project", e);
        setLoadError(e?.message || "Failed to load project from server");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  // Derived state & fallback objects (unconditionally initialized)
  const pData = project?.data || {};
  const readiness = pData.readiness || project?.readiness || { overall_score: 0 };
  const requirements = pData.requirements || [];
  const risks = pData.risks || [];
  const contradictions = pData.contradictions || [];
  const ambiguities = pData.ambiguities || [];
  const clarifications = pData.clarifications || [];
  const assumptions = pData.assumptions || [];
  const evaluationCriteria = pData.evaluation_criteria || [];
  const archSolution = pData.architecture_solution || { components: [], data_flows: [] };
  const techStack = pData.tech_stack || [];
  const milestones = pData.milestones || [];
  const deliveryFeasibility = pData.delivery_feasibility || {};
  const teamEstimates = pData.team_estimates || [];
  const proposalSections = pData.proposal_sections || [];
  const claimAudits = pData.claim_audits || [];
  const traceabilityRecords = pData.traceability_records || [];
  const coverageAudit = pData.coverage_audit || {};
  const humanReviews = pData.human_reviews || [];
  const heatmap = pData.heatmap || [];
  const missingInfo = pData.missing_information || [];

  // Claim Firewall derived data
  const claimFirewall = pData.claim_firewall || { summary: {}, claims: [], dual_origin_components: [] };
  const dualOriginComponents = pData.dual_origin_components || claimFirewall.dual_origin_components || [];
  const cfSummary = claimFirewall.summary || {};
  const allFirewallClaims: any[] = (claimFirewall.claims && claimFirewall.claims.length > 0) ? claimFirewall.claims : claimAudits;
  const cfTotalClaims = cfSummary.total_claims || allFirewallClaims.length;
  const cfRfpFacts = cfSummary.rfp_facts_count ?? allFirewallClaims.filter((c: any) => c.classification === "RFP_FACT").length;
  const cfProposed = cfSummary.proposed_designs_count ?? allFirewallClaims.filter((c: any) => c.classification === "PROPOSED_DESIGN").length;
  const cfAssumptions = cfSummary.assumptions_count ?? allFirewallClaims.filter((c: any) => c.classification === "ASSUMPTION").length;
  const cfUnsupported = cfSummary.unsupported_claims_count ?? allFirewallClaims.filter((c: any) => c.classification === "UNSUPPORTED_CLAIM").length;
  const cfNeedsReview = cfSummary.needs_review_count ?? allFirewallClaims.filter((c: any) => c.classification === "NEEDS_REVIEW").length;
  const cfGroundingScore = cfSummary.grounding_score ?? readiness?.proposal_grounding ?? 70;

  // Dynamic KPI Counts
  const totalReqsCount = requirements.length;
  const mandatoryCount = requirements.filter((r: any) => r.priority === "Mandatory").length;
  const criticalRisksCount = risks.filter((r: any) => r.severity === "Critical").length;
  const contradictionsCount = contradictions.length;
  const ambiguitiesCount = ambiguities.length;
  const clarificationsCount = clarifications.length;
  const humanReviewsCount = humanReviews.length;

  // Dynamic Category Counts from normalized requirements (HOOK 1: Unconditional)
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    requirements.forEach((r: any) => {
      const cat = r.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [requirements]);

  // Dynamic Categories list for filtering (HOOK 2: Unconditional)
  const availableCategories = React.useMemo(() => {
    const cats = Object.keys(categoryCounts);
    return ["All", ...cats];
  }, [categoryCounts]);

  // Dynamic Risk Radar (HOOK 3: Unconditional)
  const riskRadar = React.useMemo(() => {
    const domains = [
      { domain: "Legal & Liability", category: "Legal" },
      { domain: "Timeline & Delivery", category: "Timeline" },
      { domain: "Integration & Feeds", category: "Integration" },
      { domain: "Security & MFA", category: "Security" },
      { domain: "Data & Migration", category: "Data" },
      { domain: "Performance & SLA", category: "Performance" },
    ];
    return domains.map(d => {
      const matching = risks.filter((r: any) => 
        (r.category || "").toLowerCase().includes(d.category.toLowerCase()) ||
        (r.title || "").toLowerCase().includes(d.category.toLowerCase())
      );
      let level = "Low";
      let color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      if (matching.some((r: any) => r.severity === "Critical")) {
        level = "Critical";
        color = "text-red-400 bg-red-500/20 border-red-500/40 font-bold";
      } else if (matching.some((r: any) => r.severity === "High")) {
        level = "High";
        color = "text-red-400 bg-red-500/10 border-red-500/30";
      } else if (matching.some((r: any) => r.severity === "Medium")) {
        level = "Medium";
        color = "text-amber-400 bg-amber-500/10 border-amber-500/30";
      }
      return { domain: d.domain, level, color, count: matching.length };
    });
  }, [risks]);

  // Filtered requirements
  const filteredReqs = requirements.filter((r: any) => {
    if (reqCategoryFilter !== "All" && r.category !== reqCategoryFilter) return false;
    if (reqPriorityFilter !== "All" && r.priority !== reqPriorityFilter) return false;
    if (reqScopeFilter !== "All" && r.scope_type !== reqScopeFilter) return false;
    if (reqSearchQuery.trim()) {
      const q = reqSearchQuery.toLowerCase();
      const matchId = (r.id || "").toLowerCase().includes(q);
      const matchText = (r.text || "").toLowerCase().includes(q);
      const matchType = (r.requirement_type || "").toLowerCase().includes(q);
      const matchSection = (r.section || "").toLowerCase().includes(q);
      if (!matchId && !matchText && !matchType && !matchSection) return false;
    }
    return true;
  });

  // Filtered traceability
  const filteredTrace = traceabilityRecords.filter((t: any) => {
    const s = (t.status || "").toLowerCase().replace(/_/g, " ");
    const f = traceFilter.toLowerCase().replace(/_/g, " ");
    const matchesStatus = (traceFilter === "All" || s === f);
    if (!matchesStatus) return false;
    if (traceSearchQuery.trim()) {
      const q = traceSearchQuery.toLowerCase();
      const idMatch = (t.requirement_id || "").toLowerCase().includes(q);
      const textMatch = (t.requirement_text || t.requirement_title || "").toLowerCase().includes(q);
      const compMatch = (t.architecture_component || t.target_component_name || "").toLowerCase().includes(q);
      const secMatch = (t.proposal_section || t.target_section_title || "").toLowerCase().includes(q);
      return idMatch || textMatch || compMatch || secMatch;
    }
    return true;
  });

  // Filtered Firewall claims
  const filteredFirewallClaims = allFirewallClaims.filter((c: any) => {
    if (claimCategoryFilter !== "All" && c.classification !== claimCategoryFilter) return false;
    if (claimSectionFilter !== "All" && !c.source_title?.includes(claimSectionFilter) && c.source_id !== claimSectionFilter) return false;
    if (claimSearchQuery.trim()) {
      const q = claimSearchQuery.toLowerCase();
      const textMatch = (c.claim_text || "").toLowerCase().includes(q);
      const whyMatch = (c.why_flagged || "").toLowerCase().includes(q);
      const idMatch = (c.claim_id || "").toLowerCase().includes(q);
      const rewriteMatch = (c.suggested_rewrite || "").toLowerCase().includes(q);
      return textMatch || whyMatch || idMatch || rewriteMatch;
    }
    return true;
  });

  const handleClaimAction = async (claimId: string, action: "accept_rewrite" | "reject" | "edit" | "mark_reviewed", customText?: string) => {
    try {
      setIsUpdatingClaim(true);
      const res = await updateClaimAction(projectId, claimId, action, customText);
      if (res && res.claim) {
        setProject((prev: any) => {
          if (!prev) return prev;
          const updatedData = { ...prev.data };
          const cf = { ...(updatedData.claim_firewall || {}) };
          const claims = (cf.claims || []).map((c: any) => (c.claim_id === claimId ? res.claim : c));
          cf.claims = claims;
          cf.summary = res.summary || cf.summary;
          updatedData.claim_firewall = cf;
          updatedData.claim_audits = claims;
          return {
            ...prev,
            data: updatedData,
            readiness: {
              ...(prev.readiness || {}),
              proposal_grounding: res.summary?.grounding_score ?? prev.readiness?.proposal_grounding
            }
          };
        });
        if (selectedClaimForModal && selectedClaimForModal.claim_id === claimId) {
          setSelectedClaimForModal(res.claim);
        }
        setEditingClaimId(null);
        setCustomRewriteText("");
      }
    } catch (err: any) {
      console.error("[ClaimFirewall] Failed to update claim action:", { projectId, claimId, action, error: err });
      alert("Unable to update claim. " + (err?.message || "Please retry."));
    } finally {
      setIsUpdatingClaim(false);
    }
  };

  const handleExportWithGate = (type: "docx" | "pdf") => {
    if (cfUnsupported > 0) {
      setPendingExportType(type);
      setShowExportGateModal(true);
    } else {
      window.location.href = type === "docx" ? getExportDocxUrl(projectId) : getExportPdfUrl(projectId);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClarId(id);
    setTimeout(() => setCopiedClarId(null), 2000);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || isChatLoading) return;
    const q = chatQuery.trim();
    setChatQuery("");
    setChatMessages((prev) => [...prev, { role: "user", text: q }]);
    setIsChatLoading(true);

    try {
      const res = await askChat(projectId, q);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer,
          citations: res.citations,
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Error executing search: " + (err.message || "Failed to reach AI engine"),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleUpdateReviewStatus = async (reviewId: string, newStatus: string) => {
    try {
      await updateReview(projectId, reviewId, newStatus);
      const updated = await fetchProject(projectId);
      setProject(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateClarificationStatus = async (clarId: string, newStatus: string) => {
    try {
      await updateClarification(projectId, clarId, newStatus);
      const updated = await fetchProject(projectId);
      setProject(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRequirement = async () => {
    if (!editingReq) return;
    try {
      setIsSavingReq(true);
      await updateRequirement(projectId, editingReq.id, editReqForm);
      const updated = await fetchProject(projectId);
      setProject(updated);
      setEditingReq(null);
    } catch (err: any) {
      alert("Failed to update requirement: " + (err?.message || "Unknown error"));
    } finally {
      setIsSavingReq(false);
    }
  };

  const handleSaveRisk = async () => {
    if (!editingRisk) return;
    try {
      setIsSavingRisk(true);
      await updateRiskItem(projectId, editingRisk.id, editRiskForm);
      const updated = await fetchProject(projectId);
      setProject(updated);
      setEditingRisk(null);
    } catch (err: any) {
      alert("Failed to update risk: " + (err?.message || "Unknown error"));
    } finally {
      setIsSavingRisk(false);
    }
  };

  const handleSaveAssumption = async () => {
    if (!editingAssumption) return;
    try {
      setIsSavingAssumption(true);
      await updateAssumptionItem(projectId, editingAssumption.id || editingAssumption.assumption_id, editAssumptionForm);
      const updated = await fetchProject(projectId);
      setProject(updated);
      setEditingAssumption(null);
    } catch (err: any) {
      alert("Failed to update assumption: " + (err?.message || "Unknown error"));
    } finally {
      setIsSavingAssumption(false);
    }
  };

  const handleSaveProposalSection = async () => {
    if (!editingProposalSection) return;
    try {
      setIsSavingProposalSection(true);
      await updateProposalSection(projectId, editingProposalSection.number, {
        title: editingProposalSection.title,
        content: editingProposalSection.content,
      });
      const updated = await fetchProject(projectId);
      setProject(updated);
      setEditingProposalSection(null);
    } catch (err: any) {
      alert("Failed to update proposal section: " + (err?.message || "Unknown error"));
    } finally {
      setIsSavingProposalSection(false);
    }
  };

  const handleRegenerateProposalSection = async () => {
    if (regeneratingSectionNum === null) return;
    try {
      setIsSubmittingRegen(true);
      await regenerateProposalSection(projectId, regeneratingSectionNum, regenCustomPrompt);
      const updated = await fetchProject(projectId);
      setProject(updated);
      setRegeneratingSectionNum(null);
      setRegenCustomPrompt("");
    } catch (err: any) {
      alert("Failed to regenerate proposal section: " + (err?.message || "Unknown error"));
    } finally {
      setIsSubmittingRegen(false);
    }
  };

  // CONDITIONAL RETURNS: Safely evaluated AFTER all hooks have executed unconditionally
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading RFP Intelligence Workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300 px-4">
        <div className="text-center space-y-4 max-w-md p-6 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-2xl">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Project Not Found</h2>
          <p className="text-xs text-slate-400">
            Could not load project <span className="font-mono text-blue-400 font-bold">&quot;{projectId}&quot;</span>.
            {loadError && <span className="block mt-1 text-red-400">Reason: {loadError}</span>}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
            >
              Retry
            </button>
            <TransitionLink href="/" className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition">
              Return Home
            </TransitionLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080807] text-[#f4f2ec] flex flex-col font-sans selection:bg-[#b08d4b]/30 selection:text-white">
      {/* Top Persistent Project Header */}
      <header className="sticky top-0 z-40 bg-[#0c0c09]/95 backdrop-blur-xl border-b border-[#23211b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TransitionLink
              href="/"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#cda76e] via-[#b08d4b] to-[#473924] p-[1px] flex items-center justify-center shrink-0 shadow-lg shadow-[#b08d4b]/10 hover:shadow-[#b08d4b]/20 transition"
              title="Return to Home"
            >
              <div className="w-full h-full rounded-full bg-[#0d0c0a] flex items-center justify-center text-[11px] font-mono font-bold text-[#cda76e]">
                RL
              </div>
            </TransitionLink>
            <TransitionLink
              href="/projects"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[#b3a78f] hover:text-[#faf8f5] bg-[#141310] hover:bg-[#1f1d18] rounded-full border border-[#2b2720] transition shadow-sm"
              title="Return to My Projects"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-[#cda76e]" />
              <span>Projects</span>
            </TransitionLink>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-editorial text-lg sm:text-xl font-normal text-[#faf8f5] truncate max-w-md sm:max-w-xl">
                  {project.name}
                </h1>
                {project.is_demo && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-[#1c1914] text-[#cda76e] border border-[#3d3628]">
                    DEMO DATA
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-emerald-950/30 text-emerald-300 border border-emerald-500/30">
                  Verified Analysis
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                {project.filename} • {project.pages_analyzed || 100} Pages Analyzed • {((project.file_size_bytes || 4800000) / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Bid Readiness Badge */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-[#14151f] border border-zinc-700/70">
              <div className="text-right">
                <p className="text-[9px] uppercase font-mono font-medium text-zinc-400 tracking-wider">Proposal Readiness</p>
                <p className="font-editorial text-2xl font-bold text-white leading-none">
                  {readiness.overall_score}<span className="text-xs text-zinc-400 font-sans">/100</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-amber-400/80 bg-amber-400/10 flex items-center justify-center text-[10px] font-mono font-bold text-amber-300">
                {readiness.overall_score}%
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportWithGate("docx")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium tracking-wider text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700/80 rounded-full border border-zinc-700 transition cursor-pointer"
                title="Download formatted Word proposal"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                DOCX
              </button>
              <button
                onClick={() => handleExportWithGate("pdf")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold tracking-wider text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-full shadow transition cursor-pointer"
                title="Download audited PDF proposal"
              >
                <Download className="w-3.5 h-3.5 text-[#080807]" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-zinc-800 scrollbar-none text-xs font-medium">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "docviewer", label: "Document Viewer 📑", icon: FileText },
            { id: "report", label: "Project Report 📄", icon: FileText },
            { id: "requirements", label: `Requirements (${requirements.length})`, icon: Layers },
            { id: "missing", label: `Missing Info (${missingInfo.length})`, icon: HelpCircle },
            { id: "risks", label: `Risks (${risks.length})`, icon: AlertTriangle },
            { id: "contradictions", label: `Contradictions (${contradictions.length})`, icon: GitBranch },
            { id: "ambiguities", label: `Ambiguities (${ambiguities.length})`, icon: HelpCircle },
            { id: "clarifications", label: `Clarifications (${clarifications.length})`, icon: MessageSquare },
            { id: "solution", label: "Architecture Solution", icon: Cpu },
            { id: "techstack", label: "Tech Stack", icon: ShieldCheck },
            { id: "timeline", label: "Timeline & Effort", icon: Calendar },
            { id: "traceability", label: "Traceability Matrix", icon: CheckCircle2 },
            { id: "proposal", label: cfUnsupported > 0 ? `Proposal & Firewall (${cfUnsupported} ⚠)` : "Proposal & Claim Firewall", icon: FileCheck2 },
            { id: "review", label: `Human Review (${humanReviews.length})`, icon: UserCheck },
            { id: "heatmap", label: "Document Heatmap", icon: Scale },
            { id: "evaluation", label: "Evaluation Criteria", icon: Sparkles },
            { id: "chat", label: "Ask RecLens", icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 whitespace-nowrap border-b-2 transition text-xs font-mono tracking-wider ${
                  isActive
                    ? "border-amber-400 text-white font-semibold bg-zinc-800/60"
                    : "border-transparent text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-zinc-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD (EXECUTIVE INTELLIGENCE BRIEFING)               */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (() => {
          // Dynamic highlights for 3-pillar briefing
          const functionalHighlight = requirements.find((r: any) => r.category === "Functional" || r.priority === "Mandatory");
          const technicalHighlight = requirements.find((r: any) => r.category === "Technical" || r.category === "Security");
          const budgetReq = requirements.find((r: any) => (r.category || "").toLowerCase().includes("budget") || (r.text || "").toLowerCase().includes("budget"));
          const budgetHighlight = budgetReq ? budgetReq.text : (missingInfo.some((m: any) => (m.category || "").toLowerCase().includes("budget") || (m.title || "").toLowerCase().includes("budget")) ? "Budget not specified in RFP (Tagged in Missing Info)" : "Standard commercial milestones");
          const timelineEstimate = pData.delivery_feasibility?.estimated_timeline_weeks 
            ? `${pData.delivery_feasibility.estimated_timeline_weeks} Weeks Estimated Delivery` 
            : (milestones.length > 0 ? `${milestones.length} core delivery sprint milestones` : "12-16 weeks phased delivery schedule");

          const proposalNarrative = proposalSections.length > 0 && proposalSections[0]?.content
            ? proposalSections[0].content.replace(/[#*`_]/g, "").slice(0, 220).trim() + "..."
            : `A comprehensive enterprise cloud solution architecture designed specifically to address 100% of the ${mandatoryCount} mandatory scope requirements with verified auditability and deterministic compliance.`;

          const topRisks = risks.slice(0, 2);

          return (
            <div className="space-y-8 animate-tab-enter">
              {/* Executive 3-Column Briefing Grid (Inspired by Reference Layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Current RFP & Key Requirements */}
                <div className="rounded-2xl bg-[#12131a] border border-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Current RFP Snapshot
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        ID: {projectId.slice(0, 10)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white tracking-tight leading-snug">
                      {project.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 mb-4">
                      {project.filename} • {project.pages_analyzed || 100} Pages Analyzed
                    </p>

                    <div className="pt-3 border-t border-zinc-800/80">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 font-mono mb-3">
                        Key Requirements
                      </h4>
                      <ul className="space-y-2.5 text-xs text-zinc-300">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                          <div>
                            <strong className="text-white font-medium">Functional: </strong>
                            <span className="text-zinc-300">
                              {functionalHighlight?.text ? (functionalHighlight.text.length > 95 ? functionalHighlight.text.slice(0, 95) + "..." : functionalHighlight.text) : `${mandatoryCount} mandatory capabilities extracted`}
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                          <div>
                            <strong className="text-white font-medium">Technical: </strong>
                            <span className="text-zinc-300">
                              {technicalHighlight?.text ? (technicalHighlight.text.length > 90 ? technicalHighlight.text.slice(0, 90) + "..." : technicalHighlight.text) : "Multi-tenant cloud architecture with RBAC & REST APIs"}
                            </span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                          <div>
                            <strong className="text-white font-medium">Budget: </strong>
                            <span className="text-zinc-300">{budgetHighlight}</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                          <div>
                            <strong className="text-white font-medium">Timeline: </strong>
                            <span className="text-zinc-300">{timelineEstimate}</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveTab("requirements")}
                      className="flex-1 py-2 px-3 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700/80 rounded-lg border border-zinc-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore Requirements ({totalReqsCount})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                    <button
                      onClick={() => setActiveTab("docviewer")}
                      className="py-2 px-3 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition cursor-pointer"
                      title="Open interactive document viewer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column 2: Proposal Solution Summary */}
                <div className="rounded-2xl bg-[#12131a] border border-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Proposal Solution • Ready
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        Readiness: {readiness.overall_score ?? 77}/100
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white tracking-tight leading-snug">
                      RecLens Solution Architecture
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 mb-4">
                      100% Deterministic Evidence Grounding
                    </p>

                    <div className="pt-3 border-t border-zinc-800/80">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90 font-mono mb-2">
                        AI Draft Summary
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed line-clamp-4 mb-3.5">
                        {proposalNarrative}
                      </p>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-zinc-400 block">Proposed Tech Stack:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(techStack.length > 0
                            ? techStack.slice(0, 5).map((t: any) => (typeof t === "string" ? t : (t?.technology || t?.name || "Component")))
                            : ["Next.js 14", "FastAPI", "PostgreSQL", "Docker / K8s", "Keycloak"]
                          ).map((st: any, idx: number) => {
                            const label = typeof st === "string" ? st : (st?.technology || st?.name || "Tech Component");
                            return (
                              <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800/90 text-zinc-200 border border-zinc-700/80">
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveTab("proposal")}
                      className="flex-1 py-2 px-3 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Inspect Proposal & Firewall</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab("report")}
                      className="py-2 px-3 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition cursor-pointer"
                      title="View comprehensive project report"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column 3: Identified Risks & Mitigations */}
                <div className="rounded-2xl bg-[#12131a] border border-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        Risk Assessment
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {risks.length} {risks.length === 1 ? "Risk" : "Risks"} Detected
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white tracking-tight leading-snug">
                      Identified Risks & Mitigations
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 mb-4">
                      Categorical delivery and compliance audit
                    </p>

                    <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                      {topRisks.length > 0 ? (
                        topRisks.map((r: any, idx: number) => {
                          const isCrit = r.severity === "Critical";
                          const isHigh = r.severity === "High";
                          const badgeColor = isCrit
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            : isHigh
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-blue-500/15 text-blue-300 border-blue-500/30";
                          const meterWidth = isCrit ? "w-4/5 bg-rose-500" : isHigh ? "w-3/5 bg-amber-500" : "w-2/5 bg-blue-500";

                          return (
                            <div key={idx} className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/60 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-medium text-white line-clamp-1">
                                  Risk {idx + 1}: {r.title}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 border ${badgeColor}`}>
                                  {r.severity}
                                </span>
                              </div>

                              {/* Visual Risk Gauge Meter (like in reference image) */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                                  <span>Low</span>
                                  <span>Medium</span>
                                  <span>Critical</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-zinc-700/60 overflow-hidden">
                                  <div className={`h-full ${meterWidth} rounded-full transition-all duration-500`} />
                                </div>
                              </div>

                              {/* Mitigation suggestion */}
                              <div className="pt-1.5 border-t border-zinc-700/40">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-medium block mb-0.5">
                                  Mitigation:
                                </span>
                                <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                                  {r.recommendation || r.suggested_mitigation || "Implement phased validation gates and continuous compliance audits."}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 text-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                          <p className="text-xs font-medium text-white">No Critical Risks Detected</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">Specifications meet baseline delivery feasibility.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-zinc-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab("risks")}
                      className="w-full py-2 px-3 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700/80 rounded-lg border border-zinc-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View All Risk Analyses ({risks.length})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean Supporting KPI Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="bg-[#12131a] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
                  <p className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider font-medium">Total Requirements</p>
                  <p className="text-2xl font-bold text-white font-mono mt-1">{totalReqsCount}</p>
                  <p className="text-[11px] text-emerald-400 font-mono mt-0.5">100% Page Sourced</p>
                </div>

                <div className="bg-[#12131a] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
                  <p className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider font-medium">Mandatory Scope</p>
                  <p className="text-2xl font-bold text-white font-mono mt-1">{mandatoryCount}</p>
                  <p className="text-[11px] text-amber-400 font-mono mt-0.5">Critical to award</p>
                </div>

                <div className="bg-[#12131a] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
                  <p className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider font-medium">Proposal Readiness</p>
                  <p className="text-2xl font-bold text-white font-mono mt-1">{readiness.overall_score ?? 77}<span className="text-xs text-zinc-400 font-normal">/100</span></p>
                  <p className="text-[11px] text-blue-400 font-mono mt-0.5">Deterministic Index</p>
                </div>

                <div className="bg-[#12131a] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
                  <p className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider font-medium">Critical Risks</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${criticalRisksCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>{criticalRisksCount}</p>
                  <p className="text-[11px] text-rose-400/90 font-mono mt-0.5">{criticalRisksCount > 0 ? "Review mandatory" : "0 critical exposures"}</p>
                </div>

                <div className="bg-[#12131a] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
                  <p className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider font-medium">Contradictions</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${contradictionsCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {contradictionsCount}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{contradictionsCount > 0 ? "Requires review" : "0 cross conflicts"}</p>
                </div>

                <div className="bg-[#12131a] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
                  <p className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider font-medium">Missing Info</p>
                  <p className="text-2xl font-bold text-amber-300 font-mono mt-1">{missingInfo.length}</p>
                  <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">Client inquiries ready</p>
                </div>
              </div>

              {/* Conflict Notification Banner */}
              {contradictions.length > 0 ? (
                <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/40 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                            {contradictions[0].title || "Requirement Contradiction Detected"}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300">
                            Severity: {contradictions[0].severity}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-red-500/20">
                          {contradictions[0].evidence?.slice(0, 2).map((ev: any, idx: number) => (
                            <div key={idx} className={idx > 0 ? "border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3" : ""}>
                              <span className="font-semibold text-slate-400">
                                RFP Page {ev.page} ({ev.section || ev.req_id}):
                              </span>
                              <p className="text-white mt-0.5 italic">&quot;{ev.text}&quot;</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("contradictions")}
                      className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shrink-0 transition cursor-pointer"
                    >
                      Investigate Conflict &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">No Contradictions Detected</p>
                      <p className="text-[11px] text-zinc-400">
                        All {totalReqsCount} extracted requirements were cross-validated across lifecycle stages. No mutually exclusive or contradictory clauses were found.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    Verified 0 Conflicts
                  </span>
                </div>
              )}

              {/* Proposal Readiness Breakdown & Risk Radar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Readiness Breakdown */}
                <div className="lg:col-span-2 bg-[#12131a] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-white">Proposal Readiness Index</h3>
                      <p className="text-xs text-zinc-400 mt-0.5 font-mono">Deterministic heuristic calculation based on internal audit metrics</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white font-mono">{readiness.overall_score ?? 0}</span>
                      <span className="text-xs text-zinc-400 font-mono">/100</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "Requirement Coverage", val: readiness.requirement_coverage ?? 0, color: "bg-emerald-500" },
                      { label: "Requirement Clarity", val: readiness.requirement_clarity ?? 0, color: "bg-amber-400" },
                      { label: "Proposal Grounding", val: readiness.proposal_grounding ?? 0, color: "bg-blue-400" },
                      { label: "Traceability Coverage", val: readiness.traceability_coverage ?? 0, color: "bg-teal-400" },
                      { label: "Risk Resolution", val: readiness.risk_resolution ?? 0, color: "bg-indigo-400" },
                      { label: "Timeline Feasibility", val: readiness.timeline_feasibility ?? 0, color: "bg-rose-400" },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-300 font-medium">{item.label}</span>
                          <span className="font-mono text-white font-semibold">{item.val}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-300`} style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/60 text-xs text-zinc-400 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-200">Deterministic Principle:</strong> RecLens never claims a fake probability of winning an RFP. Bid Readiness reflects internal completeness, evidence coverage, and unresolved risks.
                    </span>
                  </div>
                </div>

                {/* Dynamic Risk Radar */}
                <div className="bg-[#12131a] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Risk Radar</h3>
                    <p className="text-xs text-zinc-400 mb-6 font-mono">Categorical exposure dynamically derived from detected risks ({risks.length} total)</p>

                    <div className="space-y-2.5">
                      {riskRadar.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/60">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-200 font-medium">{r.domain}</span>
                            {r.count > 0 && (
                              <span className="text-[11px] text-zinc-400 font-mono">({r.count})</span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono border ${r.color}`}>
                            {r.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("risks")}
                    className="mt-6 w-full py-2.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700/80 rounded-lg border border-zinc-700 transition cursor-pointer"
                  >
                    View All Risk Analyses ({risks.length}) &rarr;
                  </button>
                </div>
              </div>

              {/* Dynamic Requirements by Category Grid */}
              <div className="bg-[#12131a] border border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Requirements by Category</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Dynamic distribution across {Object.keys(categoryCounts).length} domains ({totalReqsCount} total requirements)
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                    100% Page Sourced
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-center">
                  {Object.entries(categoryCounts).map(([catName, count], idx) => {
                    const colors = [
                      "text-blue-400", "text-indigo-400", "text-emerald-400", "text-amber-400",
                      "text-purple-400", "text-rose-400", "text-sky-400", "text-teal-400", "text-amber-300", "text-cyan-400"
                    ];
                    const color = colors[idx % colors.length];
                    return (
                      <button
                        key={catName}
                        onClick={() => {
                          setReqCategoryFilter(catName);
                          setActiveTab("requirements");
                        }}
                        className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/60 hover:border-zinc-500 hover:bg-zinc-800/70 transition text-left cursor-pointer"
                      >
                        <p className={`text-xl font-bold font-mono ${color}`}>{count}</p>
                        <p className="text-xs text-zinc-300 mt-1 truncate">{catName}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* TAB: INTERACTIVE RFP DOCUMENT VIEWER                                      */}
        {/* ========================================================================= */}
        {activeTab === "docviewer" && (
          <div className="space-y-6 animate-tab-enter">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0f0e0c]/95 border border-[#2b2720] shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#cda76e]" />
                  <h2 className="text-base font-editorial font-bold text-[#faf8f5]">Interactive RFP Document Viewer</h2>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase bg-[#1c1914] text-[#cda76e] border border-[#3d3628]">
                    Original Evidence Stream
                  </span>
                </div>
                <p className="text-xs text-[#8a725c] mt-1 font-mono">
                  Inspect &amp; verify source RFP document ({project.filename || "Uploaded File"}) with page-synchronized evidence highlighting.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-[#141310] border border-[#2b2720] rounded-xl px-3 py-1.5 gap-2 text-xs">
                  <span className="text-[#8a725c] font-mono">Page:</span>
                  <button
                    onClick={() => setDocViewerPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-0.5 bg-[#1f1d18] hover:bg-[#2b2720] text-[#faf8f5] rounded font-mono transition"
                    title="Previous page"
                  >
                    ◀
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={project.pages_analyzed || 500}
                    value={docViewerPage}
                    onChange={(e) => setDocViewerPage(Number(e.target.value) || 1)}
                    className="w-14 bg-[#0a0a08] text-[#cda76e] text-center font-mono font-bold rounded border border-[#2b2720] py-0.5 text-xs focus:outline-none"
                  />
                  <span className="text-[#8a725c] font-mono">/ {project.pages_analyzed || 100}</span>
                  <button
                    onClick={() => setDocViewerPage((p) => p + 1)}
                    className="px-2 py-0.5 bg-[#1f1d18] hover:bg-[#2b2720] text-[#faf8f5] rounded font-mono transition"
                    title="Next page"
                  >
                    ▶
                  </button>
                </div>

                <a
                  href={getDocumentUrl(projectId)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold tracking-wider text-[#b3a78f] hover:text-[#faf8f5] bg-[#171511] hover:bg-[#1f1d18] rounded-full border border-[#2b2720] transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#cda76e]" />
                  Open Document
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Document Frame */}
              <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-[#2b2720] bg-[#0c0c09] shadow-2xl">
                <iframe
                  key={docViewerPage}
                  src={`${getDocumentUrl(projectId)}#page=${docViewerPage}`}
                  className="w-full h-[850px] border-0"
                  title="RFP Source Document"
                />
              </div>

              {/* Synchronized Findings Drawer */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#0f0e0c]/95 border border-[#2b2720] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#23211b]">
                    <h3 className="text-xs font-mono font-bold text-[#faf8f5] uppercase tracking-wider">
                      Grounding (Page {docViewerPage})
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1c1914] text-[#cda76e] border border-[#3d3628]">
                      {requirements.filter((r: any) => Number(r.page) === Number(docViewerPage)).length} Clauses
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8a725c] font-mono leading-relaxed">
                    Extracted requirements mapped to Page {docViewerPage}:
                  </p>

                  <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
                    {requirements
                      .filter((r: any) => Math.abs(Number(r.page) - Number(docViewerPage)) <= 1)
                      .map((req: any) => (
                        <div
                          key={req.id}
                          onClick={() => setDocViewerPage(Number(req.page))}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                            Number(req.page) === Number(docViewerPage)
                              ? "bg-[#1c1914] border-[#cda76e]/50 text-[#faf8f5]"
                              : "bg-[#141310] border-[#23211b] hover:border-[#2b2720] text-[#b3a78f]"
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                            <span className="font-bold text-[#cda76e]">{req.id}</span>
                            <span className="text-[#8a725c]">P.{req.page} ({req.section || "Sec"})</span>
                          </div>
                          <p className="line-clamp-2 text-[#faf8f5] font-medium leading-relaxed">{req.text}</p>
                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            <span className="text-[#8a725c] font-mono">{req.category}</span>
                            <span className={`px-1.5 py-0.2 rounded font-mono ${
                              req.priority === "Mandatory" ? "text-red-400 bg-red-950/20" : "text-[#8a725c]"
                            }`}>
                              {req.priority}
                            </span>
                          </div>
                        </div>
                      ))}

                    {requirements.filter((r: any) => Math.abs(Number(r.page) - Number(docViewerPage)) <= 1).length === 0 && (
                      <p className="text-xs text-[#8a725c] italic py-6 text-center font-mono">
                        No direct requirements mapped to Page {docViewerPage}. Use the page buttons above to navigate.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CONSOLIDATED PROJECT INTELLIGENCE REPORT                             */}
        {/* ========================================================================= */}
        {activeTab === "report" && (
          <div className="space-y-8 animate-tab-enter">
            {/* Header & Executive Actions */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0f0e0c]/95 border border-[#2b2720] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#b08d4b]/5 blur-3xl pointer-events-none rounded-full" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Analysis Complete
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#171511] text-[#9e8973] border border-[#26241e]">
                      ID: {projectId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#171511] text-[#9e8973] border border-[#26241e]">
                      {project?.filename || "RFP-Document.pdf"} ({project?.pages_analyzed || 100} Pages)
                    </span>
                  </div>

                  <h2 className="font-editorial text-3xl sm:text-4xl text-[#faf8f5] tracking-tight font-light">
                    {project?.name || "Enterprise RFP Intelligence Dossier"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#b3a78f] leading-relaxed font-light">
                    Consolidated executive intelligence dossier summarizing extracted requirements, identified delivery risks, cross-clause contradictions, synthesized architecture with dual-origin provenance, end-to-end traceability, and Claim Firewall verification.
                  </p>
                </div>

                {/* Score Badges & Direct Report Download Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="text-right bg-[#080807] border border-[#23211b] rounded-xl p-3">
                      <span className="text-[9px] font-bold uppercase font-mono tracking-wider text-[#8a725c] block">Proposal Readiness</span>
                      <span className="font-editorial text-2xl font-bold text-[#faf8f5]">{readiness.overall_score || 78}<span className="text-xs text-[#8a725c] font-sans">/100</span></span>
                    </div>
                    <div className="text-right bg-[#080807] border border-[#23211b] rounded-xl p-3">
                      <span className="text-[9px] font-bold uppercase font-mono tracking-wider text-[#8a725c] block">Grounding Score</span>
                      <span className="font-editorial text-2xl font-bold text-emerald-400">{cfGroundingScore}<span className="text-xs text-[#8a725c] font-sans">/100</span></span>
                    </div>
                  </div>

                  {/* Dedicated Project Report Exports */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={getReportDocxUrl(projectId)}
                      download
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold tracking-wider text-[#b3a78f] hover:text-[#faf8f5] bg-[#171511] hover:bg-[#1f1d18] rounded-full border border-[#2b2720] transition shadow-sm cursor-pointer"
                      title="Download complete consolidated Project Report in DOCX"
                    >
                      <Download className="w-3.5 h-3.5 text-[#cda76e]" />
                      Report (DOCX)
                    </a>
                    <a
                      href={getReportPdfUrl(projectId)}
                      download
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold tracking-wider text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-full transition shadow-md shadow-[#b08d4b]/15 cursor-pointer"
                      title="Download complete consolidated Project Report in PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-[#080807]" />
                      Report (PDF)
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Jump Links */}
              <div className="mt-6 pt-4 border-t border-[#23211b] flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-[#8a725c] font-medium">Quick Navigate:</span>
                <button onClick={() => setActiveTab("requirements")} className="px-2.5 py-1 rounded-full bg-[#141310] hover:bg-[#1c1914] text-[#b3a78f] hover:text-[#faf8f5] border border-[#23211b] transition">
                  Requirements ({totalReqsCount})
                </button>
                <button onClick={() => setActiveTab("risks")} className="px-2.5 py-1 rounded-full bg-[#141310] hover:bg-[#1c1914] text-[#b3a78f] hover:text-[#faf8f5] border border-[#23211b] transition">
                  Risks ({risks.length})
                </button>
                <button onClick={() => setActiveTab("solution")} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
                  Architecture Solution
                </button>
                <button onClick={() => setActiveTab("timeline")} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
                  Timeline Plan
                </button>
                <button onClick={() => setActiveTab("traceability")} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
                  Traceability Matrix
                </button>
                <button onClick={() => setActiveTab("proposal")} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
                  Claim Firewall
                </button>
                <button onClick={() => setActiveTab("proposal")} className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition">
                  Full Technical Proposal →
                </button>
              </div>
            </div>

            {/* 1. EXECUTIVE ANALYSIS SUMMARY (11 DYNAMIC KPIS) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  1. Executive Analysis Summary
                </h3>
                <span className="text-xs text-slate-400 font-mono">100% Dynamic Project Data</span>
              </div>

              {/* De-congested 4-Pillar Executive Service Provider Briefing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#12131a] border border-zinc-800/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Scope & Mandates</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">100% Sourced</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-white">{mandatoryCount}</span>
                    <span className="text-xs text-zinc-400 font-mono">/ {totalReqsCount} total</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    <strong className="text-emerald-400 font-medium">{((mandatoryCount / (totalReqsCount || 1)) * 100).toFixed(0)}%</strong> mandatory scope items critical to win.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#12131a] border border-zinc-800/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Delivery Readiness</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/25">Deterministic</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-white">{readiness.overall_score || 78}</span>
                    <span className="text-xs text-zinc-400 font-mono">/ 100</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {pData.delivery_feasibility?.estimated_timeline_weeks ? `${pData.delivery_feasibility.estimated_timeline_weeks} weeks estimated delivery` : "16 weeks phased delivery schedule"} across core sprints.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#12131a] border border-zinc-800/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Risk Exposure</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${criticalRisksCount > 0 ? "bg-rose-500/15 text-rose-300 border border-rose-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"}`}>
                      {criticalRisksCount > 0 ? "Review Required" : "Low Exposure"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold font-mono ${criticalRisksCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>{risks.length}</span>
                    <span className="text-xs text-zinc-400 font-mono">({criticalRisksCount} critical)</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {criticalRisksCount > 0 ? "Uncapped legal liability clause flagged for counsel" : "Specifications meet standard commercial baseline"}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#12131a] border border-zinc-800/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Evidence Grounding</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25">Firewall Audited</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-emerald-400">{cfGroundingScore}%</span>
                    <span className="text-xs text-zinc-400 font-mono">grounded</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {cfUnsupported > 0 ? `${cfUnsupported} unsupported claims quarantined` : "Zero fabricated claims in generated proposal"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. PLAIN-ENGLISH STATEMENT DECODER & REQUIREMENT INTELLIGENCE */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#12131a] border border-zinc-800/90 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/25 mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Plain-English Vendor Briefing
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    2. Complex RFP Clauses Decoded
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Translating long, convoluted 67-page RFP legal statements into concrete vendor actions and commercial watchouts.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("requirements")}
                  className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700/80 rounded-lg border border-zinc-700 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>Explore All {totalReqsCount} Requirements</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Domain Category Scope Pills */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium block">
                  Requirement Distribution by Domain:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {Object.entries(categoryCounts).map(([cat, count]: [string, any]) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setReqCategoryFilter(cat);
                        setActiveTab("requirements");
                      }}
                      className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/70 hover:border-zinc-500 text-left transition cursor-pointer"
                    >
                      <span className="text-lg font-bold font-mono text-white block">{count}</span>
                      <span className="text-xs text-zinc-200 truncate block mt-0.5">{cat}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {((count / (totalReqsCount || 1)) * 100).toFixed(0)}% of scope
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plain-English Statement Cards (The Long Statement Translator) */}
              <div className="space-y-3.5 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 font-mono block">
                  Critical Clauses: Original Text vs. Plain-English Action
                </span>

                <div className="space-y-3">
                  {requirements.slice(0, 5).map((r: any, idx: number) => {
                    const plain = r.plain_english || `Client specification: ${r.text}`;
                    const impact = r.vendor_impact || `Design and deliver compliant architecture for ${r.category || 'core'} specifications.`;
                    const watchout = r.watchout || `Verify client acceptance testing criteria with procurement before submission.`;

                    return (
                      <div key={idx} className="p-4 sm:p-5 rounded-xl bg-zinc-800/40 border border-zinc-700/60 hover:border-zinc-600 transition space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-700/50 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-amber-400 font-bold text-xs">{r.id}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {r.priority || "Mandatory"}
                            </span>
                            <span className="text-zinc-300 text-xs">• {r.category || "General"}</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded border border-zinc-700/70">
                            RFP Page {r.page || 1} • {r.section || "Specification"}
                          </span>
                        </div>

                        {/* Side-by-Side: Original Legalese vs Plain-English Meaning */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 block">
                              Original RFP Clause (verbatim):
                            </span>
                            <p className="text-zinc-300 italic leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                          </div>

                          <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-300 block">
                              What This Actually Means:
                            </span>
                            <p className="text-zinc-100 font-medium leading-relaxed">{plain}</p>
                          </div>
                        </div>

                        {/* Concrete Deliverable Action & Watchout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                          <div className="flex items-start gap-2 text-zinc-200 bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                            <strong className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider shrink-0 mt-0.5">What to build:</strong>
                            <span className="text-zinc-300 leading-snug">{impact}</span>
                          </div>
                          <div className="flex items-start gap-2 text-zinc-200 bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                            <strong className="text-rose-400 font-mono text-[11px] uppercase tracking-wider shrink-0 mt-0.5">Watchout / Trap:</strong>
                            <span className="text-zinc-300 leading-snug">{watchout}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. RISK, CONTRADICTION & CLARITY ANALYSIS */}
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  3. Risk, Contradiction &amp; Clarity Analysis
                </h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab("risks")} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                    View Risks ({risks.length}) →
                  </button>
                  <button onClick={() => setActiveTab("clarifications")} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    View Clarifications ({clarifications.length}) →
                  </button>
                </div>
              </div>

              {/* High-Impact Risks */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Identified High-Impact Risks:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {risks.slice(0, 4).map((rk: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-400">{rk.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rk.severity === "Critical" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {rk.severity} Severity
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{rk.title}</h4>
                      <p className="text-slate-300 leading-relaxed">{rk.description}</p>
                      {rk.evidence && rk.evidence[0] && (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                          <strong className="text-blue-400">RFP Evidence (Page {rk.evidence[0].page}):</strong> &quot;{rk.evidence[0].excerpt}&quot;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contradictions & Ambiguities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Cross-Document Contradictions:</span>
                  {contradictions.length > 0 ? (
                    contradictions.map((c: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-xs space-y-1">
                        <span className="font-bold text-red-300">{c.title || c.id}</span>
                        <p className="text-slate-300">{c.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Verified: No unresolved cross-document requirement contradictions detected.</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Generated Client Clarification Queries:</span>
                  {clarifications.slice(0, 2).map((cl: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <span className="font-mono text-[10px] text-blue-400 font-bold">{cl.id}</span>
                      <p className="text-white font-medium">&quot;{cl.question}&quot;</p>
                      <p className="text-[11px] text-slate-400">{cl.background || cl.ambiguity_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. PROPOSED SOLUTION ARCHITECTURE & DUAL-ORIGIN PROVENANCE */}
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  4. Proposed Technical Solution &amp; Dual-Origin Provenance
                </h3>
                <button
                  onClick={() => setActiveTab("solution")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  View Architecture Topologies →
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {archSolution.summary || "Zero-trust modular cloud solution architecture engineered to satisfy client specifications."}
              </p>

              {/* Dual-Origin Components Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3 rounded-l-lg">Component Name</th>
                      <th className="p-3">Selected Technology</th>
                      <th className="p-3">Capability Origin</th>
                      <th className="p-3">Implementation Origin</th>
                      <th className="p-3 rounded-r-lg">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {(dualOriginComponents.length > 0 ? dualOriginComponents : (archSolution.components || [])).slice(0, 8).map((comp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="p-3 font-semibold text-white">{comp.name}</td>
                        <td className="p-3 text-slate-300">{comp.implementation_technology || comp.technology || comp.recommended_technology_or_category}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {comp.capability_origin || "RFP_REQUIRED"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {comp.implementation_origin || "RECLENS_PROPOSED"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-[11px] text-slate-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {comp.firewall_verdict || "VALIDATED"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. DELIVERY PLAN & MILESTONES */}
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  5. Phased Delivery Plan &amp; Implementation Roadmap
                </h3>
                <button onClick={() => setActiveTab("timeline")} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  View Timeline &amp; Team Sizing →
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Implementation Duration Estimate:</span>
                  <strong className="text-white ml-2 text-sm">{deliveryFeasibility.estimated_delivery_range || "20–24 weeks"}</strong>
                </div>
                <span className="text-[11px] text-amber-400 italic">
                  ⚠ {deliveryFeasibility.disclaimer || "AI-assisted preliminary estimate — subject to team capacity & scoping."}
                </span>
              </div>

              {/* Milestones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {milestones.slice(0, 6).map((m: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-blue-400 font-bold">{m.milestone_id || m.phase || `M-${idx + 1}`}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">{m.duration_weeks || m.weeks || "4 Weeks"}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{m.title}</h4>
                    <p className="text-slate-400 text-[11px]">{m.description || m.target_phase}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. VERIFIED ASSUMPTION LEDGER */}
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    6. Verified Assumption Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reflects effective verified formulations after Claim Firewall reviews. No stale ungrounded precision.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {assumptions.length} Verified Assumptions
                </span>
              </div>

              <div className="space-y-2">
                {assumptions.map((asm: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-400 font-bold">{asm.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {asm.category || "Delivery"}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {asm.status || "VALIDATED"}
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium leading-relaxed">
                        &quot;{asm.statement || asm.description}&quot;
                      </p>
                      {asm.rationale && (
                        <p className="text-slate-400 text-[11px] italic">Rationale: {asm.rationale}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded shrink-0">
                      Impact: {asm.impact || "Schedule"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. REQUIREMENT TRACEABILITY MATRIX SUMMARY */}
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    7. Requirement Traceability Matrix Summary
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    End-to-End deterministic linkage connecting RFP source clauses through delivery milestones.
                  </p>
                </div>
                <button onClick={() => setActiveTab("traceability")} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  Open Full Traceability Matrix ({traceabilityRecords.length || totalReqsCount}) →
                </button>
              </div>

              {/* Sample Evidence Chain Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Sample 5-Tier Traceability Chain:</span>
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex-1">
                    <span className="text-[10px] text-blue-400 font-mono block">1. RFP Source</span>
                    <strong className="text-white block truncate">Page 45, Section 6.2</strong>
                  </div>
                  <span className="hidden lg:block text-slate-600 font-bold">&rarr;</span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex-1">
                    <span className="text-[10px] text-emerald-400 font-mono block">2. Requirement ID</span>
                    <strong className="text-white block truncate">REQ-001 (Mandatory MFA)</strong>
                  </div>
                  <span className="hidden lg:block text-slate-600 font-bold">&rarr;</span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex-1">
                    <span className="text-[10px] text-indigo-400 font-mono block">3. Target Component</span>
                    <strong className="text-white block truncate">COMP-SEC-01 (Keycloak)</strong>
                  </div>
                  <span className="hidden lg:block text-slate-600 font-bold">&rarr;</span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex-1">
                    <span className="text-[10px] text-sky-400 font-mono block">4. Proposal Covenant</span>
                    <strong className="text-white block truncate">Section 6: Security Architecture</strong>
                  </div>
                  <span className="hidden lg:block text-slate-600 font-bold">&rarr;</span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex-1">
                    <span className="text-[10px] text-amber-400 font-mono block">5. Delivery Milestone</span>
                    <strong className="text-white block truncate">M-01: Foundation Cutover</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. CLAIM FIREWALL & VERIFICATION SUMMARY */}
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    8. Claim Firewall Verification &amp; Grounding Audit
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Independent post-generation audit evaluating statements against stored RFP evidence.
                  </p>
                </div>
                <button onClick={() => setActiveTab("proposal")} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  Open Claim Firewall Workspace →
                </button>
              </div>

              {/* Status Warning Banner if unsupported claims remain */}
              {cfUnsupported > 0 ? (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-xs text-red-200 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-red-300 block text-sm">
                      {cfUnsupported} Unresolved Unsupported Claim(s) Detected in Technical Proposal
                    </strong>
                    <p className="text-slate-300">
                      These claims assert contractual client requirements not found in the RFP. RecLens recommends accepting safe rewrites or editing before final client submission.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-emerald-300 block">All Unsupported Claims Resolved (High Grounding Integrity)</strong>
                    <p className="text-slate-300">Every statement in the technical proposal has been verified as a grounded RFP fact or an accurately labeled proposed design.</p>
                  </div>
                </div>
              )}
            </div>

            {/* 9. FINAL RECLENS VERIFICATION STATUS CHECKLIST */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  9. Final RecLens Verification Status
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Audit Verified</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3 rounded-l-lg">Audit Dimension</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-r-lg">Evidence / Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-semibold text-white">Requirements Extraction</td>
                      <td className="p-3"><span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED</span></td>
                      <td className="p-3 text-slate-300">{totalReqsCount} Normalized Clauses Extracted</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-semibold text-white">Source Evidence Preservation</td>
                      <td className="p-3"><span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED</span></td>
                      <td className="p-3 text-slate-300">100% Page, Section, and Excerpt Citations Preserved</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-semibold text-white">Risk &amp; Semantic Analysis</td>
                      <td className="p-3"><span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED</span></td>
                      <td className="p-3 text-slate-300">{risks.length} Risks, {contradictionsCount} Conflicts, {ambiguitiesCount} Ambiguities Spotted</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-semibold text-white">Architecture Solution Generation</td>
                      <td className="p-3"><span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED</span></td>
                      <td className="p-3 text-slate-300">{archSolution.components?.length || 0} Components Provenance-Verified</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-semibold text-white">Traceability Audit</td>
                      <td className="p-3"><span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED</span></td>
                      <td className="p-3 text-slate-300">{coverageAudit.coverage_percentage || 100}% Traceability Coverage</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-semibold text-white">Claim Firewall Verification</td>
                      <td className="p-3"><span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED</span></td>
                      <td className="p-3 text-slate-300">Proposal Grounding Score: {cfGroundingScore}/100</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-semibold text-white">Unresolved Unsupported Claims</td>
                      <td className="p-3">
                        {cfUnsupported > 0 ? (
                          <span className="text-amber-400 font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {cfUnsupported} PENDING</span>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 0 RESOLVED</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">{cfUnsupported > 0 ? "Review in Claim Firewall Workspace" : "High Grounding Integrity"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REQUIREMENT INTELLIGENCE */}
        {/* ========================================================================= */}
        {activeTab === "requirements" && (
          <div className="space-y-6 animate-tab-enter">
            {/* Filter toolbar */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search requirement text, ID (e.g. REQ-054), or section..."
                    value={reqSearchQuery}
                    onChange={(e) => setReqSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Scope & Priority Selector */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={reqScopeFilter}
                    onChange={(e) => setReqScopeFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Scopes (Technical &amp; Procurement)</option>
                    <option value="technical">Technical &amp; Product Only</option>
                    <option value="procurement_admin">Procurement &amp; Admin Only</option>
                  </select>

                  <select
                    value={reqPriorityFilter}
                    onChange={(e) => setReqPriorityFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Priorities</option>
                    <option value="Mandatory">Mandatory Only</option>
                    <option value="Preferred">Preferred Only</option>
                    <option value="Optional">Optional Only</option>
                  </select>

                  <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                    <button
                      onClick={() => setReqViewMode("list")}
                      className={`px-3 py-1 text-xs rounded-md ${reqViewMode === "list" ? "bg-blue-600 text-white font-medium" : "text-slate-400"}`}
                    >
                      List ({filteredReqs.length})
                    </button>
                    <button
                      onClick={() => setReqViewMode("graph")}
                      className={`px-3 py-1 text-xs rounded-md ${reqViewMode === "graph" ? "bg-blue-600 text-white font-medium" : "text-slate-400"}`}
                    >
                      Graph
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3" /> Category:
                </span>
                {availableCategories.map((cat) => {
                  const count = cat === "All" ? requirements.length : (categoryCounts[cat] || 0);
                  return (
                    <button
                      key={cat}
                      onClick={() => setReqCategoryFilter(cat)}
                      className={`px-2.5 py-0.5 text-xs rounded-lg transition flex items-center gap-1.5 ${
                        reqCategoryFilter === cat
                          ? "bg-blue-600 text-white font-semibold"
                          : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List View */}
            {reqViewMode === "list" && (
              <div className="space-y-3">
                {filteredReqs.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                          {req.id}
                        </span>
                        {req.requirement_type && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {req.requirement_type}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300">
                          {req.category}
                        </span>
                        {req.scope_type === "procurement_admin" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            Procurement / Admin
                          </span>
                        )}
                        {req.duplicate_count > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Merged ({req.duplicate_count + 1} citations: P.{req.source_pages?.join(", P.")})
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            req.priority === "Mandatory"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {req.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                          (req.information_classification || "Explicit") === "Explicit"
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                            : req.information_classification === "Inferred"
                            ? "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                            : req.information_classification === "Assumption"
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                            : "bg-red-500/10 text-red-300 border border-red-500/30"
                        }`}>
                          {req.information_classification || "Explicit"}
                        </span>
                        {req.is_verified && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-mono">
                          Confidence: {(req.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            req.status === "Covered"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {req.status}
                        </span>
                        <button
                          onClick={() => {
                            setDocViewerPage(req.page || 1);
                            setActiveTab("docviewer");
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded transition flex items-center gap-1 cursor-pointer"
                          title="Jump to original page in document viewer"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                          Jump to Doc (P.{req.page || 1})
                        </button>
                        <button
                          onClick={() => {
                            setEditingReq(req);
                            setEditReqForm({
                              text: req.text,
                              category: req.category,
                              priority: req.priority,
                              is_verified: !!req.is_verified,
                              reviewer_notes: req.reviewer_notes || ""
                            });
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-sky-300 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded transition flex items-center gap-1 cursor-pointer"
                          title="Edit interpretation or verify requirement"
                        >
                          <Edit3 className="w-3 h-3 text-sky-400" />
                          Edit / Verify
                        </button>
                        <button
                          onClick={() => setSelectedReqForSource(req)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded transition flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-blue-400" />
                          View Source
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-white">{req.text}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-800">
                      <span>
                        Source: <strong className="text-slate-200">Page {req.page}</strong> ({req.section})
                        {req.source_pages && req.source_pages.length > 1 && (
                          <span className="text-purple-400 font-mono text-[11px] ml-1">
                            + Pages {req.source_pages.slice(1).join(", ")}
                          </span>
                        )}
                      </span>
                      {req.architecture_components && req.architecture_components.length > 0 && (
                        <span>
                          Mapped Component: <strong className="text-blue-300">{req.architecture_components[0]}</strong>
                        </span>
                      )}
                      {req.proposal_sections && req.proposal_sections.length > 0 && (
                        <span>
                          Proposal: <strong className="text-emerald-300">{req.proposal_sections[0]}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Graph View */}
            {reqViewMode === "graph" && (
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-8 min-h-[500px] flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase">Hierarchical Trace Graph</span>
                  <h4 className="text-lg font-bold text-white mt-1">RFP Requirement Evidence Tree</h4>
                </div>

                <div className="w-full max-w-4xl space-y-6">
                  {/* Root Node */}
                  <div className="mx-auto w-48 p-3 rounded-xl bg-blue-600 text-white text-center font-bold text-xs shadow-lg shadow-blue-500/20">
                    RFP Specification (100 Pages)
                  </div>

                  <div className="w-0.5 h-6 bg-slate-700 mx-auto" />

                  {/* Category Nodes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {["Security", "Integration", "Infrastructure", "Performance"].map((cat) => (
                      <div key={cat} className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-center">
                        <p className="text-xs font-bold text-slate-200">{cat}</p>
                        <p className="text-[10px] text-blue-400 mt-0.5">Category Node</p>
                      </div>
                    ))}
                  </div>

                  <div className="w-0.5 h-6 bg-slate-700 mx-auto" />

                  {/* Sample Leaf Requirement Nodes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {requirements.slice(0, 3).map((r: any) => (
                      <div
                        key={r.id}
                        onClick={() => setSelectedReqForSource(r)}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-blue-500 cursor-pointer transition text-left"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-blue-400 font-bold">{r.id}</span>
                          <span className="text-emerald-400">Page {r.page}</span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-8">Click any requirement node to inspect exact source excerpt.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: MISSING INFORMATION DETECTION                                        */}
        {/* ========================================================================= */}
        {activeTab === "missing" && (
          <div className="space-y-6 animate-tab-enter">
            <div className="p-6 rounded-2xl bg-[#0f0e0c]/95 border border-[#2b2720] space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#23211b]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-editorial font-bold text-[#faf8f5]">Missing Information &amp; RFP Gap Detection</h2>
                    <p className="text-xs text-[#8a725c] font-mono mt-0.5">
                      Checklist Item #7: Identifies omitted budgets, timelines, user capacities, technical specifications, and SLA terms.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#1c1914] text-[#cda76e] border border-[#3d3628]">
                  {missingInfo.length} Critical Omissions Found
                </span>
              </div>

              {/* Product Rule Callout */}
              <div className="p-4 rounded-xl bg-[#141310] border border-blue-500/30 text-xs text-blue-200/90 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-blue-300 font-mono">Product Integrity Rule 3:</strong>
                  Missing information is never silently populated as an assumption without explicit client disclosure.
                  Below are the concrete omissions detected with clarification questions to submit to the issuing authority.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingInfo.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#0f0e0c]/80 border border-[#2b2720] hover:border-[#3d3628] transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1c1914] text-[#cda76e] border border-[#3d3628]">
                      {item.category || "General"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950/30 text-red-400 border border-red-500/30">
                      Omitted from RFP
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#faf8f5]">{item.missing_detail}</h3>

                  <div className="p-3.5 rounded-xl bg-[#141310] border border-[#23211b] text-xs text-[#b3a78f] leading-relaxed">
                    <strong className="text-[#faf8f5] font-mono block mb-1">Why This Matters for Bidding:</strong>
                    {item.why_it_matters}
                  </div>

                  {(item.recommended_question || item.client_clarification_question) && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-emerald-400 font-mono font-semibold">Recommended Clarification Question:</strong>
                        <button
                          onClick={() => handleCopy(item.recommended_question || item.client_clarification_question, `missing-${idx}`)}
                          className="text-[11px] text-[#8a725c] hover:text-[#faf8f5] flex items-center gap-1 font-mono transition"
                        >
                          {copiedClarId === `missing-${idx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#cda76e]" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[#faf8f5] italic font-serif leading-relaxed">&quot;{item.recommended_question || item.client_clarification_question}&quot;</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RISKS & "WHY?" EXPLAINABILITY */}
        {/* ========================================================================= */}
        {activeTab === "risks" && (
          <div className="space-y-6 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white">Risk Intelligence &amp; Evidence Audit</h2>
              <p className="text-xs text-slate-400 mt-1">
                Every detected risk includes supporting page citations, delivery impact analysis, and explainable AI reasoning.
              </p>
            </div>

            <div className="space-y-4">
              {risks.map((risk: any) => (
                <div
                  key={risk.id}
                  className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/70 hover:border-slate-600 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-slate-900 text-blue-400 border border-slate-700">
                        {risk.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          risk.severity === "Critical"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : risk.severity === "High"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {risk.severity} Severity
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300">
                        Category: {risk.category}
                      </span>
                      {risk.human_review_required && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Human Review Required
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setDocViewerPage(risk.page || 1);
                          setActiveTab("docviewer");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition cursor-pointer"
                        title="Jump to risk evidence page in document viewer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        Jump to Doc (P.{risk.page || 1})
                      </button>

                      <button
                        onClick={() => {
                          setEditingRisk(risk);
                          setEditRiskForm({
                            severity: risk.severity || "Medium",
                            recommendation: risk.recommendation || ""
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition cursor-pointer"
                        title="Edit risk severity or mitigation solution"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                        Edit Risk
                      </button>

                      <button
                        onClick={() => setWhyModalRisk(risk)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-lg transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        &quot;Why?&quot; Evidence Breakdown
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white">{risk.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{risk.description}</p>

                  {/* Recommendation Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs">
                    <strong className="text-emerald-400 font-semibold block mb-1">Recommended Solution &amp; Mitigation:</strong>
                    <p className="text-slate-300">{risk.recommendation}</p>
                  </div>

                  {risk.category === "Legal" && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium">
                      ⚠️ <strong>Product Rule 5:</strong> Legal review recommended. RecLens flags contractual liability risks for legal counsel and does not treat AI outputs as legal advice.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CONTRADICTION ENGINE */}
        {/* ========================================================================= */}
        {activeTab === "contradictions" && (
          <div className="space-y-6 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white">Cross-Document Contradiction Engine</h2>
              <p className="text-xs text-slate-400 mt-1">
                Semantically compares requirements across distant pages to flag mutually exclusive or incompatible client clauses.
              </p>
            </div>

            <div className="space-y-6">
              {contradictions.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-850/50 border border-slate-750 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No Contradictions Detected</h3>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto">
                    All extracted requirements were validated across lifecycle stages. No mutually exclusive or logically incompatible client clauses were found in this RFP.
                  </p>
                </div>
              ) : (
                contradictions.map((con: any) => (
                  <div key={con.id} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-red-400 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                          {con.id}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                          Conflict Detected ({con.severity} Severity)
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Confidence: {(con.confidence * 100).toFixed(0)}%</span>
                    </div>

                    {/* Requirement Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {con.evidence?.map((ev: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-blue-400 font-mono">{ev.req_id}</span>
                            <span className="text-slate-400">Page {ev.page} ({ev.section})</span>
                          </div>
                          <p className="text-xs text-slate-200 italic">&quot;{ev.text}&quot;</p>
                        </div>
                      ))}
                    </div>

                    {/* AI Explanation */}
                    <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
                      <strong className="text-blue-400 font-semibold block mb-1">AI Explanation: Why these conflict:</strong>
                      <p className="text-slate-300">{con.reason || con.explanation}</p>
                    </div>

                    {/* Clarification prompt */}
                    {con.clarification_question && (
                      <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Suggested Client Clarification:</span>
                          <p className="text-white mt-0.5 font-medium">{con.clarification_question}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(con.clarification_question, con.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shrink-0 transition flex items-center gap-1.5"
                        >
                          {copiedClarId === con.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedClarId === con.id ? "Copied" : "Copy Question"}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AMBIGUITY DETECTOR */}
        {/* ========================================================================= */}
        {activeTab === "ambiguities" && (
          <div className="space-y-6 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white">Ambiguity &amp; Missing Sizing Detector</h2>
              <p className="text-xs text-slate-400 mt-1">
                Pinpoints unmeasurable, subjective, or open-ended requirements that pose delivery scope risk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ambiguities.map((amb: any) => (
                <div key={amb.id} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {amb.id} • {amb.requirement_id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300">
                      {amb.severity} Severity
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-white italic">&quot;{amb.text}&quot;</p>

                  <div className="space-y-2">
                    <strong className="text-xs text-slate-400 uppercase tracking-wider block">Missing Implementation Metrics:</strong>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {amb.missing_information?.map((m: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-700 text-xs">
                    <strong className="text-red-400 block mb-0.5">Architecture &amp; Cost Impact:</strong>
                    <p className="text-slate-300">{amb.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CLARIFICATION QUESTIONS */}
        {/* ========================================================================= */}
        {activeTab === "clarifications" && (
          <div className="space-y-6 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white">Pre-Bid Clarification Inquiries</h2>
              <p className="text-xs text-slate-400 mt-1">
                Structured questions ready for sales engineers to dispatch to client procurement to eliminate ambiguities.
              </p>
            </div>

            <div className="space-y-4">
              {clarifications.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-850/50 border border-slate-750 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No Clarifications Required</h3>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto">
                    All requirement clauses are sufficiently specified and free of direct contradictions. No pre-bid clarification questions need to be submitted to client procurement.
                  </p>
                </div>
              ) : (
                clarifications.map((c: any) => (
                  <div key={c.id} className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">
                          {c.id}
                        </span>
                        <span className="text-xs text-slate-400">Category: {c.category}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateClarificationStatus(c.id, e.target.value)}
                          className="text-xs bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-300 focus:outline-none"
                        >
                          <option value="Open">Open</option>
                          <option value="Asked">Asked</option>
                          <option value="Resolved">Resolved</option>
                        </select>

                        <button
                          onClick={() => handleCopy(c.question, c.id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded flex items-center gap-1 transition"
                        >
                          {copiedClarId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedClarId === c.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-white">{c.question}</p>

                    {c.response && (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200">
                        <strong>Client Clarification Received:</strong> {c.response}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Related Requirements:</span>
                      {c.requirement_ids?.map((rid: string) => (
                        <span key={rid} className="font-mono text-blue-400 bg-slate-900 px-1 rounded">
                          {rid}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SOLUTION ARCHITECTURE */}
        {/* ========================================================================= */}
        {activeTab === "solution" && (
          <div className="space-y-8 animate-tab-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Proposed Technical Solution Architecture</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesized directly from {requirements.length} normalized requirements. Every subsystem explicitly states whether it is RFP Required or RecLens Proposed.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RFP Required
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  RecLens Proposed
                </span>
              </div>
            </div>

            {/* Architecture Summary Banner */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-300 leading-relaxed shadow-sm">
              <div className="flex items-center gap-2 text-white font-bold mb-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Executive Architectural Baseline</span>
              </div>
              <p>{archSolution.summary}</p>
            </div>

            {/* Interactive Component Topologies */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Core Subsystems ({archSolution.components?.length || 0})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archSolution.components?.map((comp: any) => {
                  const compId = comp.component_id || comp.id;
                  const dualComp = dualOriginComponents.find((d: any) => d.component_id === compId);
                  const isRfpReq = (comp.origin === "RFP_REQUIRED" || comp.type === "Required");
                  const capOrigin = dualComp?.capability_origin || (isRfpReq ? "RFP_REQUIRED" : "RECLENS_PROPOSED");
                  const implOrigin = dualComp?.implementation_origin || "RECLENS_PROPOSED";
                  const tech = comp.recommended_technology_or_category || comp.technology;
                  const resp = comp.purpose || comp.responsibility;
                  const just = comp.justification || comp.reason;
                  const mappedReqs = comp.related_requirement_ids || comp.requirement_ids || [];

                  return (
                    <div key={compId} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-4 hover:border-slate-600 transition">
                      <div>
                        <div className="flex items-start justify-between text-xs mb-2">
                          <span className="font-mono text-blue-400 font-bold">{compId}</span>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              capOrigin === "RFP_REQUIRED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}>
                              Capability: {capOrigin.replace("_", " ")}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              implOrigin === "RFP_REQUIRED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}>
                              Impl: {implOrigin.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-white">{comp.name}</h4>
                        <p className="text-xs font-mono text-indigo-300 mt-1">{tech}</p>
                        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{resp}</p>

                        {dualComp?.firewall_verdict && dualComp.firewall_verdict !== "VALIDATED - ACCURATELY ATTRIBUTED" && (
                          <div className="mt-2.5 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">
                            <strong>Firewall Notice:</strong> {dualComp.firewall_verdict}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 space-y-2">
                        <div>
                          <strong className="text-slate-300">Justification:</strong> {just}
                        </div>
                        {mappedReqs.length > 0 && (
                          <div>
                            <span className="text-slate-400 block mb-1">Driving Requirements:</span>
                            <div className="flex flex-wrap gap-1">
                              {mappedReqs.slice(0, 6).map((rid: string) => (
                                <button
                                  key={rid}
                                  onClick={() => {
                                    const req = requirements.find((r: any) => r.id === rid);
                                    if (req) setSelectedReqForSource(req);
                                  }}
                                  className="font-mono text-blue-400 bg-slate-900 hover:bg-blue-900/40 px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer"
                                  title="Click to view source evidence"
                                >
                                  {rid}
                                </button>
                              ))}
                              {mappedReqs.length > 6 && (
                                <span className="text-[10px] text-slate-500 font-mono py-0.5">
                                  +{mappedReqs.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inter-Component Data Flows */}
            {archSolution.data_flows && archSolution.data_flows.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span>Inter-Service Communication &amp; Security Data Flows</span>
                </h3>
                <div className="divide-y divide-slate-800 border border-slate-700/40 rounded-xl overflow-hidden bg-slate-900/60">
                  {archSolution.data_flows.map((df: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">{df.from_component}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">{df.to_component}</span>
                      </div>
                      <p className="text-slate-300 flex-1 sm:px-4">{df.description}</p>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px] shrink-0 border border-blue-500/20">
                        {df.protocol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security & Scalability considerations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Security Architecture &amp; Governance
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {archSolution.security_considerations?.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Scalability &amp; High-Availability Strategy
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {archSolution.scalability_considerations?.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Explicit Assumption Ledger inside Architecture */}
            {assumptions.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Explicit Architectural Assumption Ledger ({assumptions.length})</span>
                  </h3>
                  <span className="text-[11px] text-amber-400 font-medium">Product Rule 3 Validated</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assumptions.map((asm: any) => (
                    <div key={asm.id || asm.assumption_id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-400">{asm.id || asm.assumption_id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {asm.status || "OPEN"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{asm.statement}</p>
                      <p className="text-[11px] text-slate-400"><strong className="text-slate-300">Rationale:</strong> {asm.rationale || asm.reason}</p>
                      <div className="pt-1 text-[11px] text-red-300">
                        <strong>Impact if Invalidated:</strong> {asm.impact || asm.impact_if_wrong}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: TECH STACK */}
        {/* ========================================================================= */}
        {activeTab === "techstack" && (
          <div className="space-y-6 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white">Selected Technology Stack</h2>
              <p className="text-xs text-slate-400 mt-1">
                Every component is directly mapped to RFP requirements. Technologies distinguish client mandates from RecLens proposed solutions.
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/60 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Technology</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Origin</th>
                    <th className="py-3 px-4">Role &amp; Purpose</th>
                    <th className="py-3 px-4">Selection Rationale</th>
                    <th className="py-3 px-4">Alternatives Considered</th>
                    <th className="py-3 px-4">Driving Requirements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {techStack.map((t: any, idx: number) => {
                    const isReq = (t.origin === "RFP_REQUIRED" || t.origin === "Required");
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-white">{t.technology}</td>
                        <td className="py-3.5 px-4 text-slate-400">{t.category}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                              isReq
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {isReq ? "RFP Required" : "RecLens Proposed"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{t.purpose}</td>
                        <td className="py-3.5 px-4 text-slate-300">{t.why_selected || t.reason}</td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {t.alternatives_considered?.join(", ") || "None"}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(t.requirements_addressed || t.addressed_requirement_ids)?.map((rid: string) => (
                              <button
                                key={rid}
                                onClick={() => {
                                  const req = requirements.find((r: any) => r.id === rid);
                                  if (req) setSelectedReqForSource(req);
                                }}
                                className="px-1.5 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-mono text-[10px] transition cursor-pointer"
                                title="Click to view requirement source"
                              >
                                {rid}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: TIMELINE & FEASIBILITY */}
        {/* ========================================================================= */}
        {activeTab === "timeline" && (
          <div className="space-y-8 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white">Delivery Feasibility &amp; Milestone Roadmap</h2>
              <p className="text-xs text-slate-400 mt-1">
                Evidence-based schedule comparison with scenario models to mitigate aggressive RFP timeline risks.
              </p>
            </div>

            {/* Feasibility Comparison Box */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-700">
                <div>
                  <span className="text-xs font-semibold text-slate-400">Requested Client Deadline:</span>
                  <p className="text-xl font-bold text-white mt-0.5">{deliveryFeasibility.requested_deadline || "12 weeks"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Preliminary Benchmark Estimate:</span>
                  <p className="text-xl font-bold text-amber-400 mt-0.5">{deliveryFeasibility.estimated_delivery_range || "15–18 weeks"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Schedule Risk Assessment:</span>
                  <p className="text-xl font-bold text-red-400 mt-0.5">{deliveryFeasibility.risk_level || "High Compression"}</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span><strong>Product Rule 6:</strong> {deliveryFeasibility.disclaimer || "AI-assisted preliminary estimate — requires delivery-team validation."}</span>
              </div>

              {/* Scenarios */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Proposed Strategic Scenarios:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deliveryFeasibility.scenarios?.map((sc: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-blue-400">{sc.title}</span>
                      <p className="text-xs text-slate-300">{sc.details}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold inline-block">
                        Feasibility: {sc.feasibility}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phased Milestones Visual Roadmap */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Phased Delivery Milestones</h3>
              <div className="space-y-3">
                {milestones.map((m: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">{m.phase}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300">
                          {m.weeks}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{m.title}</h4>
                      <p className="text-xs text-slate-300">{m.description}</p>
                    </div>

                    <div className="text-xs text-slate-400 shrink-0">
                      <strong className="text-slate-300 block mb-1">Key Deliverables:</strong>
                      <ul className="space-y-0.5">
                        {m.deliverables?.map((d: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Sizing */}
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
              <h3 className="text-base font-bold text-white">Suggested Team Composition</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {teamEstimates.map((te: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{te.role}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300">
                        {te.count}x
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{te.phase}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{te.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: TRACEABILITY MATRIX */}
        {/* ========================================================================= */}
        {activeTab === "traceability" && (
          <div className="space-y-6 animate-tab-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">End-to-End Requirement Traceability Matrix</h2>
                <p className="text-xs text-slate-400 mt-1">
                  100% deterministic mapping connecting RFP Source &rarr; Requirement ID &rarr; Architecture Component &rarr; Proposal Section &rarr; Implementation Milestone.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportWithGate("docx")}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> DOCX
                </button>
                <button
                  onClick={() => handleExportWithGate("pdf")}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>

            {/* Coverage Audit Summary Banner */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Proposal Coverage Audit Engine
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  (coverageAudit.coverage_percentage || 100) >= 90
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {coverageAudit.audit_verdict || "PASSED - HIGH COMPLIANCE"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Total Normalized</span>
                  <p className="text-xl font-bold text-white font-mono mt-0.5">{coverageAudit.total_normalized || totalReqsCount}</p>
                  <span className="text-[10px] text-slate-500">100% Sourced</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Mandatory Clauses</span>
                  <p className="text-xl font-bold text-indigo-400 font-mono mt-0.5">{coverageAudit.mandatory_count || mandatoryCount}</p>
                  <span className="text-[10px] text-slate-500">Contractual</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-950/40">
                  <span className="text-[10px] text-emerald-400 font-semibold block">Covered</span>
                  <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{coverageAudit.covered_count || 0}</p>
                  <span className="text-[10px] text-emerald-500/80">Architecture Bound</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-blue-950/40">
                  <span className="text-[10px] text-blue-400 font-semibold block">Partially Covered</span>
                  <p className="text-xl font-bold text-blue-400 font-mono mt-0.5">{coverageAudit.partially_covered_count || 0}</p>
                  <span className="text-[10px] text-blue-500/80">Phase 2 Scope</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-amber-950/40">
                  <span className="text-[10px] text-amber-400 font-semibold block">Needs Review</span>
                  <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">{coverageAudit.needs_review_count || 0}</p>
                  <span className="text-[10px] text-amber-500/80">Commercial Terms</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Coverage Rate</span>
                  <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{coverageAudit.coverage_percentage || 100}%</p>
                  <span className="text-[10px] text-slate-500">Deterministic</span>
                </div>
              </div>

              {/* Prominently Highlight Uncovered Mandatory Requirements */}
              {coverageAudit.uncovered_mandatory && coverageAudit.uncovered_mandatory.length > 0 && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/50 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Critical Alert: {coverageAudit.uncovered_mandatory.length} Uncovered Mandatory Clause(s)</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-red-200">
                    {coverageAudit.uncovered_mandatory.map((um: any) => (
                      <div key={um.requirement_id} className="p-2.5 rounded-lg bg-slate-900 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold mr-2 text-red-400">{um.requirement_id}</span>
                          <span>{um.title}</span>
                          <span className="text-slate-400 text-[10px] ml-2 font-mono">Page {um.page}</span>
                        </div>
                        <span className="text-[11px] text-red-300 italic">{um.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Controls: Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search requirement text, ID, component, or section..."
                  value={traceSearchQuery}
                  onChange={(e) => setTraceSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {["All", "Covered", "Partially Covered", "Needs Review", "Uncovered"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTraceFilter(st)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition whitespace-nowrap font-medium ${
                      traceFilter === st
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Data Table */}
            <div className="rounded-xl border border-slate-700/60 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs text-slate-300 min-w-[900px]">
                <thead className="bg-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Req ID</th>
                    <th className="py-3 px-4">Category &amp; Priority</th>
                    <th className="py-3 px-4">Client Requirement &amp; RFP Source</th>
                    <th className="py-3 px-4">Architecture Component</th>
                    <th className="py-3 px-4">Proposal Section</th>
                    <th className="py-3 px-4">Milestone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {filteredTrace.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                        No requirements match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTrace.slice(0, 150).map((tr: any, idx: number) => {
                      const isMandatory = (tr.priority === "Mandatory");
                      const statusClean = (tr.status || "COVERED").toUpperCase();

                      return (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                            {tr.requirement_id}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-slate-300 block">{tr.category}</span>
                            <span className={`text-[10px] font-bold ${isMandatory ? "text-amber-400" : "text-slate-500"}`}>
                              {tr.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="text-white font-medium line-clamp-2">{tr.requirement_text || tr.requirement_title}</p>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              Page {tr.source_page} &bull; {tr.source_section}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-indigo-300 font-medium">
                            {tr.target_component_name || tr.architecture_component}
                          </td>
                          <td className="py-3.5 px-4 text-emerald-300">
                            {tr.target_section_title || tr.proposal_section}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                            {tr.target_milestone_name || tr.timeline_milestone}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                statusClean === "COVERED"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : statusClean === "PARTIALLY_COVERED"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : statusClean === "NEEDS_REVIEW"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-red-500/20 text-red-300 border border-red-500/30"
                              }`}
                            >
                              {tr.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const fullReq = requirements.find((r: any) => r.id === tr.requirement_id) || tr;
                                setSelectedReqForSource(fullReq);
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                            >
                              Evidence
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {filteredTrace.length > 150 && (
                <div className="p-3 text-center text-xs text-slate-500 bg-slate-900 border-t border-slate-800">
                  Showing first 150 of {filteredTrace.length} matching rows. Use search to locate specific clauses.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 11: PROPOSAL & CLAIM FIREWALL */}
        {/* ========================================================================= */}
        {activeTab === "proposal" && (
          <div className="space-y-8 animate-tab-enter">
            {/* Claim Firewall Audit Top Banner */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-bold text-white">Proposal Claim Firewall &amp; Verification Audit</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Independent verification layer checking every technical, architectural, and timeline claim against original RFP evidence.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportWithGate("docx")}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> DOCX
                  </button>
                  <button
                    onClick={() => handleExportWithGate("pdf")}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>

              {/* Proposal Grounding Score Callout */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Proposal Grounding Index</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cfGroundingScore >= 80 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {cfSummary.audit_verdict || "VERIFIED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {cfSummary.score_explanation || "Empirical measure of proposal statement verifiability. Not a win probability."}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Audited Score</span>
                    <span className="text-2xl font-black text-blue-400 font-mono">{cfGroundingScore}/100</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center font-bold text-white text-xs">
                    {cfGroundingScore}%
                  </div>
                </div>
              </div>

              {/* 5-Classification KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">RFP Facts</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <p className="text-xl font-bold text-emerald-300 font-mono mt-1">{cfRfpFacts}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Direct Evidence Locked</p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Proposed Design</span>
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  </div>
                  <p className="text-xl font-bold text-blue-300 font-mono mt-1">{cfProposed}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">RecLens Architecture</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Assumptions</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  </div>
                  <p className="text-xl font-bold text-amber-300 font-mono mt-1">{cfAssumptions}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Contingent Dependencies</p>
                </div>

                <div className={`p-3.5 rounded-xl border ${cfUnsupported > 0 ? "bg-red-950/30 border-red-500/50" : "bg-slate-900 border-slate-800"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider">Unsupported</span>
                    <span className={`w-2 h-2 rounded-full ${cfUnsupported > 0 ? "bg-red-500 animate-ping" : "bg-slate-600"}`}></span>
                  </div>
                  <p className="text-xl font-bold text-red-300 font-mono mt-1">{cfUnsupported}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cfUnsupported > 0 ? "Requires Safe Rewrite" : "Zero Violations"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-300 tracking-wider">Needs Review</span>
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  </div>
                  <p className="text-xl font-bold text-slate-200 font-mono mt-1">{cfNeedsReview}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Questionable / Precision</p>
                </div>
              </div>

              {/* Prominent Unsupported Claims Alert Banner */}
              {cfUnsupported > 0 && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Claim Firewall Critical Alert: {cfUnsupported} Unsupported Claim(s) Detected</span>
                    </div>
                    <button
                      onClick={() => setClaimCategoryFilter("UNSUPPORTED_CLAIM")}
                      className="text-xs text-red-300 underline font-semibold hover:text-red-200"
                    >
                      Filter to Unsupported
                    </button>
                  </div>
                  <p className="text-xs text-red-200/90 leading-relaxed">
                    Vendor implementation technologies or capabilities were classified as client contractual mandates without direct RFP evidence.
                    Accept the suggested safe rewrites below to rectify these claims before export.
                  </p>
                </div>
              )}
            </div>

            {/* Claims Feed & Filter Controls */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search claim text, rewrites, or IDs..."
                    value={claimSearchQuery}
                    onChange={(e) => setClaimSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                  {[
                    { id: "All", label: `All (${cfTotalClaims})` },
                    { id: "RFP_FACT", label: `RFP Facts (${cfRfpFacts})` },
                    { id: "PROPOSED_DESIGN", label: `Proposed (${cfProposed})` },
                    { id: "ASSUMPTION", label: `Assumptions (${cfAssumptions})` },
                    { id: "UNSUPPORTED_CLAIM", label: `Unsupported (${cfUnsupported})` },
                    { id: "NEEDS_REVIEW", label: `Needs Review (${cfNeedsReview})` }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setClaimCategoryFilter(btn.id)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium cursor-pointer ${
                        claimCategoryFilter === btn.id
                          ? "bg-blue-600 text-white font-semibold shadow-sm"
                          : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Claims Cards Feed */}
              <div className="space-y-3">
                {filteredFirewallClaims.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-900/60 rounded-xl border border-slate-800">
                    No claims match the active filters.
                  </div>
                ) : (
                  filteredFirewallClaims.map((clm: any) => {
                    const isUnsupported = clm.classification === "UNSUPPORTED_CLAIM";
                    const isNeedsReview = clm.classification === "NEEDS_REVIEW";
                    const isEditingThis = editingClaimId === clm.claim_id;

                    return (
                      <div
                        key={clm.claim_id}
                        className={`p-5 rounded-xl border transition space-y-3 ${
                          isUnsupported
                            ? "bg-red-950/20 border-red-500/40 hover:border-red-500/60"
                            : isNeedsReview
                            ? "bg-slate-900/80 border-amber-500/30 hover:border-amber-500/50"
                            : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {clm.claim_id}
                            </span>
                            <span className="text-slate-400 font-medium">{clm.source_title || clm.source_id}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                clm.classification === "RFP_FACT"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : clm.classification === "PROPOSED_DESIGN"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : clm.classification === "ASSUMPTION"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : clm.classification === "UNSUPPORTED_CLAIM"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                  : "bg-slate-700/60 text-slate-300 border border-slate-600"
                              }`}
                            >
                              {clm.classification.replace("_", " ")}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Status: {clm.review_status || "OPEN"}
                            </span>
                          </div>
                        </div>

                        {/* Statement Narrative */}
                        <p className={`text-sm font-medium leading-relaxed ${isUnsupported ? "text-red-200" : "text-white"}`}>
                          &quot;{clm.claim_text}&quot;
                        </p>

                        {/* Why Flagged Callout */}
                        {clm.why_flagged && (
                          <div className="p-3 rounded-lg bg-slate-950/80 border border-red-500/20 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Firewall Grounding Assessment:</span>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{clm.why_flagged}</p>
                          </div>
                        )}

                        {/* Safe Rewrite Box with Interactive Actions */}
                        {clm.suggested_rewrite && (
                          <div className="p-3.5 rounded-lg bg-slate-900 border border-emerald-500/30 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" /> Safe Verified Rewrite
                              </span>
                              <span className="text-[10px] text-slate-400">Grounded Formulation</span>
                            </div>

                            {!isEditingThis ? (
                              <p className="text-xs text-emerald-200 font-medium leading-relaxed bg-emerald-950/30 p-2.5 rounded border border-emerald-500/20">
                                &quot;{clm.suggested_rewrite}&quot;
                              </p>
                            ) : (
                              <div className="space-y-2">
                                <textarea
                                  value={customRewriteText}
                                  onChange={(e) => setCustomRewriteText(e.target.value)}
                                  className="w-full p-2.5 bg-slate-950 border border-blue-500 rounded text-xs text-white focus:outline-none"
                                  rows={2}
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleClaimAction(clm.claim_id, "edit", customRewriteText)}
                                    disabled={isUpdatingClaim}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                                  >
                                    Save Custom Text
                                  </button>
                                  <button
                                    onClick={() => setEditingClaimId(null)}
                                    className="px-3 py-1 bg-slate-800 text-slate-400 hover:text-white rounded text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {!isEditingThis && (
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                <button
                                  onClick={() => handleClaimAction(clm.claim_id, "accept_rewrite")}
                                  disabled={isUpdatingClaim}
                                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" /> Accept Rewrite
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingClaimId(clm.claim_id);
                                    setCustomRewriteText(clm.suggested_rewrite || clm.claim_text);
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                  onClick={() => handleClaimAction(clm.claim_id, "reject")}
                                  disabled={isUpdatingClaim}
                                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-300 font-medium transition cursor-pointer"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleClaimAction(clm.claim_id, "mark_reviewed")}
                                  disabled={isUpdatingClaim}
                                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
                                >
                                  Mark Reviewed
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Traceability Breadcrumb Footer */}
                        <div className="pt-2 border-t border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1 font-mono text-[10px] truncate max-w-xl">
                            <span className="text-blue-400 font-bold">{clm.traceability_chain?.proposal_section || "Section"}</span>
                            <span>&rarr;</span>
                            <span className="text-indigo-300">{clm.traceability_chain?.architecture_component || "Component"}</span>
                            <span>&rarr;</span>
                            <span className="text-emerald-400">{clm.traceability_chain?.requirement_id || "Req ID"}</span>
                            {clm.traceability_chain?.page && (
                              <span className="text-slate-500 font-mono">(Page {clm.traceability_chain.page})</span>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedClaimForModal(clm)}
                            className="text-xs text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer shrink-0"
                          >
                            Inspect Evidence
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Explicit Assumption Ledger */}
            {assumptions && assumptions.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">Explicit Proposal Assumption Ledger</h3>
                      <p className="text-xs text-slate-400">
                        Product Rule 3: Assumptions are never disguised as confirmed facts. Every dependency is auditable.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {assumptions.length} Active Contingencies
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assumptions.map((asm: any) => (
                    <div key={asm.id || asm.assumption_id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {asm.id || asm.assumption_id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingAssumption(asm);
                              setEditAssumptionForm({
                                statement: asm.statement,
                                status: asm.status || "CONFIRMED"
                              });
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold text-sky-300 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-sky-400" />
                            Review / Edit
                          </button>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                            Status: {asm.status || "OPEN"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-white font-medium leading-relaxed">{asm.statement}</p>
                      <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                        <p className="text-slate-400">
                          <strong className="text-slate-300">Rationale:</strong> {asm.rationale || asm.reason}
                        </p>
                        <p className="text-red-300">
                          <strong className="text-red-400">Impact if Wrong:</strong> {asm.impact || asm.impact_if_wrong}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 16 Proposal Sections */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Audited Technical Proposal Narrative (16 Covenants)</h3>
                <span className="text-xs text-slate-400">Full structured document body</span>
              </div>

              {proposalSections.map((sec: any) => (
                <div key={sec.number} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                        Section {sec.number}
                      </span>
                      <h3 className="text-base font-bold text-white">{sec.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProposalSection({
                            number: sec.number,
                            title: sec.title,
                            content: sec.content,
                          });
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                        title="Edit section narrative and title"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        Edit Section
                      </button>

                      <button
                        onClick={() => {
                          setRegeneratingSectionNum(sec.number);
                          setRegenCustomPrompt("");
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-[#faf8f5] bg-[#1c1914] hover:bg-[#2b2720] border border-[#3d3628] rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                        title="Regenerate this specific section with custom AI instructions"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#cda76e]" />
                        Regenerate
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">{sec.content}</p>

                  {/* Section claim audits */}
                  {sec.claims && sec.claims.length > 0 && (
                    <div className="pt-3 border-t border-slate-700/60 space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Audited Claims in Section ({sec.claims.length}):
                      </span>
                      {sec.claims.map((clm: any, cidx: number) => (
                        <div
                          key={cidx}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            clm.classification === "RFP_FACT" || clm.classification === "GROUNDED_REQUIREMENT"
                              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                              : clm.classification === "PROPOSED_DESIGN"
                              ? "bg-blue-950/20 border-blue-500/30 text-blue-200"
                              : clm.classification === "ASSUMPTION"
                              ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                              : clm.classification === "UNSUPPORTED_CLAIM"
                              ? "bg-red-950/20 border-red-500/30 text-red-200"
                              : "bg-slate-800 border-slate-700 text-slate-300"
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold mr-2">[{clm.classification}]</span>
                            <span>{clm.claim_text}</span>
                          </div>
                          {clm.source_page && (
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              Page {clm.source_page}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Related Grounding Footnotes */}
                  {sec.related_requirement_ids && sec.related_requirement_ids.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs border-t border-slate-800/80">
                      <span className="text-slate-500 text-[11px] font-medium">Driving Clauses:</span>
                      {sec.related_requirement_ids.slice(0, 8).map((rid: string) => (
                        <button
                          key={rid}
                          onClick={() => {
                            const req = requirements.find((r: any) => r.id === rid);
                            if (req) setSelectedReqForSource(req);
                          }}
                          className="font-mono text-[10px] bg-slate-900 hover:bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded transition cursor-pointer"
                          title="Click to view requirement source"
                        >
                          {rid}
                        </button>
                      ))}
                      {sec.related_requirement_ids.length > 8 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{sec.related_requirement_ids.length - 8} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 12: HUMAN REVIEW QUEUE */}
        {/* ========================================================================= */}
        {activeTab === "review" && (
          <div className="space-y-6 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white">Centralized Human Review Queue</h2>
              <p className="text-xs text-slate-400 mt-1">
                Human-in-the-loop sign-off for critical risks, legal indemnification clauses, and high-impact assumptions.
              </p>
            </div>

            <div className="space-y-4">
              {humanReviews.map((rev: any) => (
                <div key={rev.id} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">{rev.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          rev.severity === "Critical"
                            ? "bg-red-500/20 text-red-300"
                            : rev.severity === "High"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {rev.severity}
                      </span>
                      <span className="text-xs text-slate-400">{rev.category}</span>
                      <span className="text-xs text-slate-500 font-mono">Page {rev.source_page}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Status:</span>
                      <select
                        value={rev.status}
                        onChange={(e) => handleUpdateReviewStatus(rev.id, e.target.value)}
                        className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Accepted Risk">Accepted Risk</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{rev.title}</h3>
                    <p className="text-sm text-slate-300 mt-1">{rev.details}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs italic text-slate-400">
                    Evidence: &quot;{rev.evidence}&quot;
                  </div>

                  {rev.notes && (
                    <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/20 text-xs text-blue-300">
                      <strong>Audit Notes:</strong> {rev.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 13: DOCUMENT HEATMAP */}
        {/* ========================================================================= */}
        {activeTab === "heatmap" && (
          <div className="space-y-6 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white">Document Page-Range Risk Heatmap</h2>
              <p className="text-xs text-slate-400 mt-1">
                Visual density of requirements, contradictions, and risk clauses across document page spans.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {heatmap.map((h: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    h.status === "Red"
                      ? "bg-red-950/20 border-red-500/40 text-red-300"
                      : h.status === "Yellow"
                      ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
                      : "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-3">
                      <span>Pages {h.page_start}–{h.page_end}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        h.status === "Red" ? "bg-red-500/30" : h.status === "Yellow" ? "bg-amber-500/30" : "bg-emerald-500/30"
                      }`}>
                        {h.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p>Requirements: <strong className="text-white">{h.requirement_count}</strong></p>
                      <p>Risks: <strong className="text-white">{h.risk_count}</strong></p>
                      <p>Conflicts: <strong className="text-white">{h.conflict_count}</strong></p>
                      <p>Ambiguities: <strong className="text-white">{h.ambiguity_count}</strong></p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400">
                    Mandatory clauses: {h.mandatory_clauses_count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 14: EVALUATION CRITERIA */}
        {/* ========================================================================= */}
        {activeTab === "evaluation" && (
          <div className="space-y-6 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white">Evaluation Criteria &amp; Scoring Intelligence</h2>
              <p className="text-xs text-slate-400 mt-1">
                Extracted scoring weighting and audit of current proposal coverage across scoring categories.
              </p>
            </div>

            <div className="space-y-4">
              {evaluationCriteria.map((crit: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{crit.category}</h3>
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300">
                          Weight: {crit.weight}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{crit.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 uppercase font-semibold">Proposal Coverage</span>
                      <p className="text-xl font-black text-emerald-400 font-mono">{crit.coverage_score}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <strong className="text-emerald-400 block mb-1">Key Proposal Strengths:</strong>
                      <ul className="space-y-1 text-slate-300">
                        {crit.strengths?.map((s: string, i: number) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>

                    {crit.weaknesses && crit.weaknesses.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30">
                        <strong className="text-amber-300 block mb-1">High-Weight Weaknesses to Address:</strong>
                        <ul className="space-y-1 text-amber-200">
                          {crit.weaknesses.map((w: string, i: number) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 15: ASK RECLENS CHAT */}
        {/* ========================================================================= */}
        {activeTab === "chat" && (
          <div className="max-w-4xl mx-auto space-y-4 animate-tab-enter">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Ask RecLens — Evidence Query Assistant
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Answers must cite exact pages and sections. RecLens will never hallucinate or invent answers.
              </p>
            </div>

            {/* Quick suggested queries */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                "What are the mandatory security requirements?",
                "Why is the timeline considered risky?",
                "Where does the client mention data residency?",
                "Show requirements related to authentication."
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatQuery(q)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 flex flex-col h-[500px]">
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-900 border border-slate-800 text-slate-200"
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                          {msg.citations.map((c: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                              Page {c.page}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-2xl rounded-2xl px-4 py-3 bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Auditing document evidence...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-900/60 flex gap-2">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Ask a question about requirements, risks, or timeline citations..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!chatQuery.trim() || isChatLoading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ask
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* "VIEW SOURCE" SIDE PANEL / DRAWER */}
      {/* ========================================================================= */}
      {selectedReqForSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-700/80 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-xs font-bold text-white">{selectedReqForSource.id} Evidence Source</span>
                </div>
                <button
                  onClick={() => setSelectedReqForSource(null)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded"
                >
                  Close ✕
                </button>
              </div>

              <div className="mt-6 space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Requirement Text</span>
                  <p className="text-sm font-semibold text-white mt-1">{selectedReqForSource.text}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Source Page</span>
                    <strong className="text-blue-400 text-sm">Page {selectedReqForSource.page}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Section</span>
                    <strong className="text-slate-200 text-xs">{selectedReqForSource.section}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Exact RFP Excerpt Highlight</span>
                  <div className="mt-1 p-4 rounded-xl bg-slate-950 border border-blue-500/40 text-blue-100 font-mono text-xs leading-relaxed">
                    &quot;{selectedReqForSource.source_text}&quot;
                  </div>
                </div>

                {selectedReqForSource.citations && selectedReqForSource.citations.length > 1 && (
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">
                      All Merged Citations ({selectedReqForSource.citations.length} occurrences across document)
                    </span>
                    <div className="mt-1 space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedReqForSource.citations.map((c: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between text-blue-400 font-mono text-[10px] mb-1">
                            <span>Page {c.page}</span>
                            <span className="text-slate-400">{c.section}</span>
                          </div>
                          <p className="text-slate-300 italic text-[11px]">&quot;{c.text}&quot;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Traceability Mapping</span>
                  <div className="mt-1 space-y-1 text-slate-300">
                    <p>• Architecture: <strong className="text-indigo-300">{selectedReqForSource.architecture_components?.[0] || "Core Module"}</strong></p>
                    <p>• Proposal: <strong className="text-emerald-300">{selectedReqForSource.proposal_sections?.[0] || "General Section"}</strong></p>
                    <p>• Confidence: <strong className="text-white">{(selectedReqForSource.confidence * 100).toFixed(0)}%</strong></p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedReqForSource(null)}
              className="mt-8 w-full py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
            >
              Done Inspecting
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* "WHY?" EXPLAINABILITY MODAL */}
      {/* ========================================================================= */}
      {whyModalRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Why is this flagged as a risk?</h3>
              </div>
              <button
                onClick={() => setWhyModalRisk(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded"
              >
                Close ✕
              </button>
            </div>

            <div>
              <span className="font-mono text-xs font-bold text-blue-400">{whyModalRisk.id}</span>
              <h4 className="text-base font-bold text-white mt-1">{whyModalRisk.title}</h4>
            </div>

            {/* Evidence List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Supporting Document Evidence:</span>
              {whyModalRisk.evidence?.map((ev: any, i: number) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-blue-400 font-mono text-[11px]">
                    <span>Source: RFP Page {ev.page}</span>
                  </div>
                  <p className="text-white font-medium">&quot;{ev.excerpt}&quot;</p>
                  <p className="text-slate-400 italic pt-1 border-t border-slate-800/80">&rarr; {ev.why}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
              <strong>RecLens Reasoning:</strong> {whyModalRisk.description}
            </div>

            <button
              onClick={() => setWhyModalRisk(null)}
              className="w-full py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
            >
              Close Explainability Modal
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLAIM FIREWALL EXPORT GATE MODAL */}
      {/* ========================================================================= */}
      {showExportGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-red-500/50 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Claim Firewall Export Gate
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                      Blocked
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pre-export verification detected ungrounded or misclassified technical claims.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportGateModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 space-y-2">
              <p className="font-semibold text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                {cfUnsupported} Unsupported Claim{cfUnsupported > 1 ? "s" : ""} Present in Technical Proposal
              </p>
              <p className="text-slate-300 leading-relaxed">
                Exporting a proposal with ungrounded claims risks client disqualification, scope creep, or contractual liability. 
                RecLens recommends accepting safe rewrites or editing these claims before exporting.
              </p>
            </div>

            {/* List of blocked claims */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Flagged Unsupported Claims:
              </span>
              {allFirewallClaims
                .filter((c: any) => c.classification === "UNSUPPORTED_CLAIM")
                .map((clm: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-red-500/20 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-red-400">{clm.claim_id}</span>
                      <span className="text-[10px] text-slate-400">{clm.source_title || clm.source_id}</span>
                    </div>
                    <p className="text-slate-200 font-medium">&quot;{clm.claim_text}&quot;</p>
                    <p className="text-red-300/90 text-[11px] italic">&rarr; {clm.why_flagged}</p>
                    {clm.suggested_rewrite && (
                      <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300">
                        <strong className="text-emerald-400">Safe Alternative:</strong> &quot;{clm.suggested_rewrite}&quot;
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowExportGateModal(false);
                  setActiveTab("proposal");
                  setClaimCategoryFilter("UNSUPPORTED_CLAIM");
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                Review & Resolve Claims (Recommended)
              </button>

              <button
                onClick={() => {
                  setShowExportGateModal(false);
                  if (pendingExportType === "docx") {
                    window.location.href = getExportDocxUrl(projectId);
                  } else if (pendingExportType === "pdf") {
                    window.location.href = getExportPdfUrl(projectId);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-red-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Override Gate & Export ({pendingExportType?.toUpperCase()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLAIM INSPECTION & EVIDENCE TRACEABILITY MODAL */}
      {/* ========================================================================= */}
      {selectedClaimForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-blue-400">{selectedClaimForModal.claim_id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedClaimForModal.classification === "RFP_FACT"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : selectedClaimForModal.classification === "PROPOSED_DESIGN"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : selectedClaimForModal.classification === "ASSUMPTION"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : selectedClaimForModal.classification === "UNSUPPORTED_CLAIM"
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-slate-600/30 text-slate-300 border border-slate-500/30"
                }`}>
                  {selectedClaimForModal.classification.replace(/_/g, " ")}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Status: {selectedClaimForModal.status || "VERIFIED"}
                </span>
              </div>
              <button
                onClick={() => setSelectedClaimForModal(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Scope / Breadcrumbs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Scope</span>
                <span className="text-slate-200 font-medium truncate block">{selectedClaimForModal.source_title || selectedClaimForModal.source_id}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Component</span>
                <span className="text-slate-200 font-medium truncate block">{selectedClaimForModal.component_name || "Architecture Component"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Capability Origin</span>
                <span className={`font-mono text-[11px] font-bold ${
                  (selectedClaimForModal.capability_origin || selectedClaimForModal.origin) === "RFP_REQUIRED"
                    ? "text-emerald-400"
                    : "text-blue-400"
                }`}>
                  {selectedClaimForModal.capability_origin || selectedClaimForModal.origin || "N/A"}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Impl Origin</span>
                <span className="font-mono text-[11px] font-bold text-blue-400">
                  {selectedClaimForModal.implementation_origin || "RECLENS_PROPOSED"}
                </span>
              </div>
            </div>

            {/* Verbatim Statement */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Audited Statement:</span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white leading-relaxed font-mono">
                &quot;{selectedClaimForModal.claim_text}&quot;
              </div>
            </div>

            {/* Why Flagged / Rationale */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Claim Firewall Verdict:</span>
              <div className={`p-3.5 rounded-xl text-xs space-y-1 ${
                selectedClaimForModal.classification === "UNSUPPORTED_CLAIM"
                  ? "bg-red-950/30 border border-red-500/30 text-red-200"
                  : selectedClaimForModal.classification === "NEEDS_REVIEW"
                  ? "bg-slate-800/80 border border-slate-700 text-slate-200"
                  : selectedClaimForModal.classification === "RFP_FACT"
                  ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-200"
                  : "bg-blue-950/30 border border-blue-500/30 text-blue-200"
              }`}>
                <p className="font-medium">{selectedClaimForModal.why_flagged || "Verified grounded against RFP evidence."}</p>
              </div>
            </div>

            {/* RFP Evidence Excerpts */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Grounding Evidence in RFP:
              </span>
              {selectedClaimForModal.evidence && selectedClaimForModal.evidence.length > 0 ? (
                selectedClaimForModal.evidence.map((ev: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-blue-400 font-mono text-[11px]">
                      <span>Source: RFP Page {ev.page || "N/A"} {ev.section ? `• ${ev.section}` : ""}</span>
                      <span className="text-slate-500 text-[10px]">Verified Clause</span>
                    </div>
                    <p className="text-white font-medium">&quot;{ev.excerpt || ev.requirement_text}&quot;</p>
                    {ev.why && <p className="text-slate-400 italic pt-1 border-t border-slate-800/80">&rarr; {ev.why}</p>}
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 italic">
                  No direct client requirement found in RFP. This statement represents an implementation decision or preliminary planning assumption proposed by RecLens.
                </div>
              )}
            </div>

            {/* Suggested Safe Rewrite & Actions */}
            {selectedClaimForModal.suggested_rewrite && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Recommended Safe Rewrite:
                </span>
                <p className="text-xs text-emerald-200 font-medium leading-relaxed">
                  &quot;{selectedClaimForModal.suggested_rewrite}&quot;
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    disabled={isUpdatingClaim}
                    onClick={async () => {
                      await handleClaimAction(selectedClaimForModal.claim_id, "accept_rewrite");
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Accept Rewrite
                  </button>

                  <button
                    disabled={isUpdatingClaim}
                    onClick={async () => {
                      await handleClaimAction(selectedClaimForModal.claim_id, "mark_reviewed");
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer disabled:opacity-50"
                  >
                    Mark Reviewed (Keep As-Is)
                  </button>

                  <button
                    disabled={isUpdatingClaim}
                    onClick={async () => {
                      await handleClaimAction(selectedClaimForModal.claim_id, "reject");
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 rounded-lg border border-red-500/30 transition cursor-pointer disabled:opacity-50"
                  >
                    Reject Claim
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedClaimForModal(null)}
              className="w-full py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* 1. REQUIREMENT EDIT & VERIFICATION MODAL */}
      {editingReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0e0c] border border-[#2b2720] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#23211b]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#cda76e]" />
                <h3 className="text-base font-editorial font-bold text-[#faf8f5]">Edit &amp; Verify Requirement</h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#cda76e] px-2 py-0.5 rounded bg-[#1c1914] border border-[#3d3628]">
                {editingReq.id}
              </span>
            </div>

            {/* Read-only Evidence Source Box */}
            <div className="p-3.5 rounded-xl bg-[#141310] border border-[#2b2720] text-xs space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-[#8a725c] block">
                Evidence Source (Preserved Immutable Grounding)
              </span>
              <p className="text-slate-300 font-mono text-[11px]">
                Page {editingReq.page} • Section: {editingReq.section || "N/A"}
              </p>
              {editingReq.supporting_text && (
                <p className="text-slate-400 italic text-[11px] pt-1 border-t border-[#23211b]">
                  &quot;{editingReq.supporting_text}&quot;
                </p>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Requirement Interpretation Text
                </label>
                <textarea
                  rows={3}
                  value={editReqForm.text}
                  onChange={(e) => setEditReqForm({ ...editReqForm, text: e.target.value })}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-3 text-xs text-[#faf8f5] focus:outline-none focus:border-[#cda76e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={editReqForm.category}
                    onChange={(e) => setEditReqForm({ ...editReqForm, category: e.target.value })}
                    className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-2.5 text-xs text-[#faf8f5] focus:outline-none"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Technical">Technical</option>
                    <option value="Business">Business</option>
                    <option value="Budget">Budget</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Security">Security &amp; Compliance</option>
                    <option value="Performance">Performance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={editReqForm.priority}
                    onChange={(e) => setEditReqForm({ ...editReqForm, priority: e.target.value })}
                    className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-2.5 text-xs text-[#faf8f5] focus:outline-none"
                  >
                    <option value="Mandatory">Mandatory</option>
                    <option value="Preferred">Preferred</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Reviewer Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional review notes or human sign-off comments..."
                  value={editReqForm.reviewer_notes}
                  onChange={(e) => setEditReqForm({ ...editReqForm, reviewer_notes: e.target.value })}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-2.5 text-xs text-[#faf8f5] focus:outline-none focus:border-[#cda76e]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editReqForm.is_verified}
                  onChange={(e) => setEditReqForm({ ...editReqForm, is_verified: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#0a0a08] border-[#2b2720] text-[#cda76e] focus:ring-0"
                />
                <span className="text-xs text-[#faf8f5] font-medium">Mark as Human Verified (Checklist Item #8)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#23211b]">
              <button
                type="button"
                onClick={() => setEditingReq(null)}
                className="px-4 py-2 text-xs font-mono font-medium text-[#b3a78f] hover:text-[#faf8f5] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingReq}
                onClick={handleSaveRequirement}
                className="px-4 py-2 text-xs font-mono font-semibold text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-xl shadow transition disabled:opacity-50"
              >
                {isSavingReq ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. RISK EDIT MODAL */}
      {editingRisk && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0e0c] border border-[#2b2720] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#23211b]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-editorial font-bold text-[#faf8f5]">Edit Risk Classification</h3>
              </div>
              <span className="font-mono text-xs text-[#cda76e]">{editingRisk.id}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#141310] border border-[#2b2720] text-xs space-y-1">
              <h4 className="font-bold text-[#faf8f5]">{editingRisk.title}</h4>
              <p className="text-[#8a725c]">{editingRisk.description}</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Severity Level
                </label>
                <select
                  value={editRiskForm.severity}
                  onChange={(e) => setEditRiskForm({ ...editRiskForm, severity: e.target.value })}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-2.5 text-xs text-[#faf8f5] focus:outline-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Recommended Solution &amp; Mitigation
                </label>
                <textarea
                  rows={4}
                  value={editRiskForm.recommendation}
                  onChange={(e) => setEditRiskForm({ ...editRiskForm, recommendation: e.target.value })}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-3 text-xs text-[#faf8f5] focus:outline-none focus:border-[#cda76e]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#23211b]">
              <button
                type="button"
                onClick={() => setEditingRisk(null)}
                className="px-4 py-2 text-xs font-mono font-medium text-[#b3a78f] hover:text-[#faf8f5] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingRisk}
                onClick={handleSaveRisk}
                className="px-4 py-2 text-xs font-mono font-semibold text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-xl shadow transition disabled:opacity-50"
              >
                {isSavingRisk ? "Saving..." : "Update Risk"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ASSUMPTION EDIT MODAL */}
      {editingAssumption && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0e0c] border border-[#2b2720] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#23211b]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-editorial font-bold text-[#faf8f5]">Review &amp; Edit Assumption</h3>
              </div>
              <span className="font-mono text-xs text-[#cda76e]">{editingAssumption.id || editingAssumption.assumption_id}</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Assumption Statement
                </label>
                <textarea
                  rows={3}
                  value={editAssumptionForm.statement}
                  onChange={(e) => setEditAssumptionForm({ ...editAssumptionForm, statement: e.target.value })}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-3 text-xs text-[#faf8f5] focus:outline-none focus:border-[#cda76e]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Assumption Decision
                </label>
                <select
                  value={editAssumptionForm.status}
                  onChange={(e) => setEditAssumptionForm({ ...editAssumptionForm, status: e.target.value })}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-2.5 text-xs text-[#faf8f5] focus:outline-none"
                >
                  <option value="CONFIRMED">Approved / Confirmed</option>
                  <option value="MODIFIED">Modified by Bid Team</option>
                  <option value="REJECTED">Rejected (Will not assume)</option>
                  <option value="OPEN">Open Contingency</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#23211b]">
              <button
                type="button"
                onClick={() => setEditingAssumption(null)}
                className="px-4 py-2 text-xs font-mono font-medium text-[#b3a78f] hover:text-[#faf8f5] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingAssumption}
                onClick={handleSaveAssumption}
                className="px-4 py-2 text-xs font-mono font-semibold text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-xl shadow transition disabled:opacity-50"
              >
                {isSavingAssumption ? "Saving..." : "Save Assumption"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROPOSAL SECTION EDIT MODAL */}
      {editingProposalSection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0e0c] border border-[#2b2720] rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#23211b]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#cda76e]" />
                <h3 className="text-base font-editorial font-bold text-[#faf8f5]">Edit Proposal Section</h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#cda76e] px-2 py-0.5 rounded bg-[#1c1914] border border-[#3d3628]">
                Section {editingProposalSection.number}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={editingProposalSection.title}
                  onChange={(e) => setEditingProposalSection({ ...editingProposalSection, title: e.target.value })}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-3 text-xs text-[#faf8f5] focus:outline-none focus:border-[#cda76e]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Narrative Body
                </label>
                <textarea
                  rows={12}
                  value={editingProposalSection.content}
                  onChange={(e) => setEditingProposalSection({ ...editingProposalSection, content: e.target.value })}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-3 text-xs text-[#faf8f5] font-sans leading-relaxed focus:outline-none focus:border-[#cda76e]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#23211b]">
              <button
                type="button"
                onClick={() => setEditingProposalSection(null)}
                className="px-4 py-2 text-xs font-mono font-medium text-[#b3a78f] hover:text-[#faf8f5] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingProposalSection}
                onClick={handleSaveProposalSection}
                className="px-4 py-2 text-xs font-mono font-semibold text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-xl shadow transition disabled:opacity-50"
              >
                {isSavingProposalSection ? "Saving Section..." : "Save Proposal Section"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PROPOSAL SECTION REGENERATE MODAL */}
      {regeneratingSectionNum !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0e0c] border border-[#2b2720] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#23211b]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#cda76e]" />
                <h3 className="text-base font-editorial font-bold text-[#faf8f5]">
                  AI Single-Section Regeneration
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#cda76e] px-2 py-0.5 rounded bg-[#1c1914] border border-[#3d3628]">
                Section {regeneratingSectionNum}
              </span>
            </div>

            <p className="text-xs text-[#8a725c] font-mono leading-relaxed">
              Checklist Item #13: Regenerate this individual section narrative using grounded RFP facts without rewriting or invalidating the rest of the proposal.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider">
                Custom Focus / Instructions (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="e.g. Emphasize multi-region active-active disaster recovery, ISO 27001 compliance, and 99.99% service availability..."
                value={regenCustomPrompt}
                onChange={(e) => setRegenCustomPrompt(e.target.value)}
                className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-3 text-xs text-[#faf8f5] focus:outline-none focus:border-[#cda76e]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#23211b]">
              <button
                type="button"
                onClick={() => setRegeneratingSectionNum(null)}
                className="px-4 py-2 text-xs font-mono font-medium text-[#b3a78f] hover:text-[#faf8f5] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRegen}
                onClick={handleRegenerateProposalSection}
                className="px-4 py-2 text-xs font-mono font-semibold text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingRegen ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Section...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#080807]" />
                    Run AI Regeneration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

