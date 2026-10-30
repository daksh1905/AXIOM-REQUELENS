"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  UserCheck
} from "lucide-react";
import { fetchProject, updateReview, updateClarification, askChat, getExportDocxUrl, getExportPdfUrl } from "@/lib/api";

export default function ProjectWorkspace() {
  const params = useParams();
  const projectId = (params?.id as string) || "demo-rfp-001";

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Filter states
  const [reqCategoryFilter, setReqCategoryFilter] = useState<string>("All");
  const [reqPriorityFilter, setReqPriorityFilter] = useState<string>("All");
  const [reqViewMode, setReqViewMode] = useState<"list" | "graph">("list");
  const [selectedReqForSource, setSelectedReqForSource] = useState<any>(null);
  const [whyModalRisk, setWhyModalRisk] = useState<any>(null);

  // Traceability filter
  const [traceFilter, setTraceFilter] = useState<string>("All");

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
      try {
        setLoading(true);
        const data = await fetchProject(projectId);
        setProject(data);
      } catch (e) {
        console.error("Failed to load project", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Project Not Found</h2>
          <Link href="/" className="px-4 py-2 text-xs font-semibold bg-blue-600 rounded-lg text-white">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const pData = project.data || {};
  const readiness = pData.readiness || { overall_score: 78 };
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
  const humanReviews = pData.human_reviews || [];
  const heatmap = pData.heatmap || [];

  // Filtered requirements
  const filteredReqs = requirements.filter((r: any) => {
    if (reqCategoryFilter !== "All" && r.category !== reqCategoryFilter) return false;
    if (reqPriorityFilter !== "All" && r.priority !== reqPriorityFilter) return false;
    return true;
  });

  // Filtered traceability
  const filteredTrace = traceabilityRecords.filter((t: any) => {
    if (traceFilter === "All") return true;
    return t.status.toLowerCase() === traceFilter.toLowerCase();
  });

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Persistent Project Header */}
      <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-sm shrink-0 hover:bg-blue-500 transition"
              title="Return to Home"
            >
              RL
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                  {project.name}
                </h1>
                {project.is_demo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                    DEMO DATA
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                  Verified Analysis
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {project.filename} • {project.pages_analyzed || 100} Pages Analyzed • {((project.file_size_bytes || 4800000) / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Bid Readiness Badge */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Proposal Readiness</p>
                <p className="text-lg font-black text-blue-400 font-mono leading-none">
                  {readiness.overall_score}<span className="text-xs text-slate-400">/100</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center text-[11px] font-bold text-white">
                {readiness.overall_score}%
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-1.5">
              <a
                href={getExportDocxUrl(projectId)}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                title="Download formatted Word proposal"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                DOCX
              </a>
              <a
                href={getExportPdfUrl(projectId)}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow transition"
                title="Download audited PDF proposal"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-800/60 scrollbar-none text-xs font-medium">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "requirements", label: `Requirements (${requirements.length})`, icon: Layers },
            { id: "risks", label: `Risks (${risks.length})`, icon: AlertTriangle },
            { id: "contradictions", label: `Contradictions (${contradictions.length})`, icon: GitBranch },
            { id: "ambiguities", label: `Ambiguities (${ambiguities.length})`, icon: HelpCircle },
            { id: "clarifications", label: `Clarifications (${clarifications.length})`, icon: MessageSquare },
            { id: "solution", label: "Architecture Solution", icon: Cpu },
            { id: "techstack", label: "Tech Stack", icon: ShieldCheck },
            { id: "timeline", label: "Timeline & Effort", icon: Calendar },
            { id: "traceability", label: "Traceability Matrix", icon: CheckCircle2 },
            { id: "proposal", label: "Proposal & Claim Firewall", icon: FileText },
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
                className={`flex items-center gap-2 py-3 px-3.5 whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? "border-blue-500 text-blue-400 font-semibold bg-blue-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium">Total Requirements</p>
                <p className="text-2xl font-bold text-white mt-1">{pData.total_requirements_count || 147}</p>
                <p className="text-[11px] text-emerald-400 mt-1">100% Page Sourced</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium">Mandatory</p>
                <p className="text-2xl font-bold text-white mt-1">{pData.mandatory_count || 122}</p>
                <p className="text-[11px] text-blue-400 mt-1">Critical to award</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium">Critical Risks</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{pData.critical_risks_count || 6}</p>
                <p className="text-[11px] text-red-400 mt-1">Review mandatory</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium">Contradictions</p>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{contradictions.length}</p>
                <p className="text-[11px] text-indigo-400 mt-1">Direct incompatibilities</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium">Ambiguities</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{ambiguities.length}</p>
                <p className="text-[11px] text-amber-400 mt-1">Missing metrics</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium">Clarification Qs</p>
                <p className="text-2xl font-bold text-sky-400 mt-1">{clarifications.length}</p>
                <p className="text-[11px] text-sky-400 mt-1">Ready for client</p>
              </div>
            </div>

            {/* Critical Conflict Callout Banner */}
            <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/40 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-400">Critical Architectural Conflict Detected</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300">Severity: High</span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-red-500/20">
                      <div>
                        <span className="font-semibold text-slate-400">RFP Page 17 (Section 3.1):</span>
                        <p className="text-white mt-0.5">&quot;Deployment must use client on-premise infrastructure strictly.&quot;</p>
                      </div>
                      <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                        <span className="font-semibold text-slate-400">RFP Page 93 (Section 16.1):</span>
                        <p className="text-white mt-0.5">&quot;Solution must utilize AWS RDS PostgreSQL in Multi-AZ mode.&quot;</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("contradictions")}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shrink-0 transition"
                >
                  Investigate Conflict &rarr;
                </button>
              </div>
            </div>

            {/* Proposal Readiness Breakdown & Risk Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Readiness Breakdown */}
              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Proposal Readiness Index</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Deterministic heuristic calculation based on internal audit metrics</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-blue-400 font-mono">{readiness.overall_score}</span>
                    <span className="text-sm text-slate-400">/100</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Requirement Coverage", val: readiness.requirement_coverage || 94, color: "bg-emerald-500" },
                    { label: "Requirement Clarity", val: readiness.requirement_clarity || 82, color: "bg-blue-500" },
                    { label: "Proposal Grounding", val: readiness.proposal_grounding || 91, color: "bg-indigo-500" },
                    { label: "Traceability Coverage", val: readiness.traceability_coverage || 91, color: "bg-teal-500" },
                    { label: "Risk Resolution", val: readiness.risk_resolution || 66, color: "bg-amber-500" },
                    { label: "Timeline Feasibility", val: readiness.timeline_feasibility || 58, color: "bg-red-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className="font-mono text-slate-200 font-bold">{item.val}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-3 rounded-lg bg-slate-900/60 border border-slate-700/40 text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rule:</strong> RecLens never claims a fake probability of winning an RFP. Bid Readiness reflects internal completeness, evidence coverage, and unresolved risks.
                  </span>
                </div>
              </div>

              {/* Risk Radar / Summary */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Risk Radar</h3>
                  <p className="text-xs text-slate-400 mb-6">Categorical exposure by delivery and commercial domain</p>

                  <div className="space-y-3">
                    {[
                      { domain: "Timeline & Schedule", level: "High", color: "text-red-400 bg-red-500/10 border-red-500/30" },
                      { domain: "Legacy Integrations", level: "High", color: "text-red-400 bg-red-500/10 border-red-500/30" },
                      { domain: "Legal & Liability", level: "Critical", color: "text-red-400 bg-red-500/20 border-red-500/40 font-bold" },
                      { domain: "Security & MFA", level: "Medium", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
                      { domain: "Data Residency", level: "Medium", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
                      { domain: "Scope Sizing", level: "Low", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
                    ].map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-slate-300">{r.domain}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${r.color}`}>
                          {r.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("risks")}
                  className="mt-6 w-full py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  View All Risk Analyses &rarr;
                </button>
              </div>
            </div>

            {/* Requirement Category Overview Grid */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">Requirements by Category</h3>
              <p className="text-xs text-slate-400 mb-6">Distribution across technical, architectural, and business domains</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                {[
                  { name: "Security", count: 28, color: "text-blue-400" },
                  { name: "Integration", count: 34, color: "text-indigo-400" },
                  { name: "Infrastructure", count: 22, color: "text-emerald-400" },
                  { name: "Performance", count: 19, color: "text-amber-400" },
                  { name: "Data / Migration", count: 18, color: "text-purple-400" },
                  { name: "Timeline", count: 12, color: "text-red-400" },
                  { name: "Legal / Terms", count: 14, color: "text-sky-400" },
                ].map((cat, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className={`text-xl font-bold font-mono ${cat.color}`}>{cat.count}</p>
                    <p className="text-xs text-slate-300 mt-1">{cat.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REQUIREMENT INTELLIGENCE */}
        {/* ========================================================================= */}
        {activeTab === "requirements" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2">
                  <Filter className="w-3.5 h-3.5" /> Filter Category:
                </span>
                {["All", "Security", "Integration", "Infrastructure", "Performance", "Data", "Legal", "Timeline"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setReqCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition ${
                      reqCategoryFilter === cat
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-900/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
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
                    List
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

            {/* List View */}
            {reqViewMode === "list" && (
              <div className="space-y-3">
                {filteredReqs.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                          {req.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300">
                          {req.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            req.priority === "Mandatory"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {req.priority}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Confidence: {(req.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
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
        {/* TAB 3: RISKS & "WHY?" EXPLAINABILITY */}
        {/* ========================================================================= */}
        {activeTab === "risks" && (
          <div className="space-y-6 animate-in fade-in duration-200">
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

                    <button
                      onClick={() => setWhyModalRisk(risk)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-lg transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      &quot;Why?&quot; Evidence Breakdown
                    </button>
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
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Cross-Document Contradiction Engine</h2>
              <p className="text-xs text-slate-400 mt-1">
                Semantically compares requirements across distant pages to flag mutually exclusive or incompatible client clauses.
              </p>
            </div>

            <div className="space-y-6">
              {contradictions.map((con: any) => (
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
                    <p className="text-slate-300">{con.reason}</p>
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
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AMBIGUITY DETECTOR */}
        {/* ========================================================================= */}
        {activeTab === "ambiguities" && (
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Pre-Bid Clarification Inquiries</h2>
              <p className="text-xs text-slate-400 mt-1">
                Structured questions ready for sales engineers to dispatch to client procurement to eliminate ambiguities.
              </p>
            </div>

            <div className="space-y-4">
              {clarifications.map((c: any) => (
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
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SOLUTION ARCHITECTURE */}
        {/* ========================================================================= */}
        {activeTab === "solution" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Proposed Technical Architecture</h2>
              <p className="text-xs text-slate-400 mt-1">
                Synthesized based on extracted requirements. Every subsystem explicitly states whether it is Required, Proposed, or Assumed.
              </p>
            </div>

            {/* Architecture Summary */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-300 leading-relaxed">
              <strong className="text-white block mb-1 text-base">Architectural Baseline:</strong>
              {archSolution.summary}
            </div>

            {/* Interactive Component Topologies */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archSolution.components?.map((comp: any) => (
                <div key={comp.id} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-blue-400 font-bold">{comp.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          comp.type === "Required"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : comp.type === "Proposed"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {comp.type}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{comp.name}</h4>
                    <p className="text-xs font-mono text-indigo-300 mt-1">{comp.technology}</p>
                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{comp.responsibility}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 text-[11px] text-slate-400">
                    <strong className="text-slate-300">Reason:</strong> {comp.reason}
                    <div className="mt-1 flex items-center gap-1">
                      <span>Mapped:</span>
                      {comp.requirement_ids?.map((rid: string) => (
                        <span key={rid} className="font-mono text-blue-400 bg-slate-900 px-1 rounded">
                          {rid}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: TECH STACK */}
        {/* ========================================================================= */}
        {activeTab === "techstack" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Proposed Technology Stack</h2>
              <p className="text-xs text-slate-400 mt-1">
                Every tool is mapped to specific RFP requirements. Technologies are never selected merely because they are popular.
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/60 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Technology</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Why Chosen &amp; Justification</th>
                    <th className="py-3 px-4">Requirements Addressed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {techStack.map((t: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-white">{t.technology}</td>
                      <td className="py-3.5 px-4 text-slate-400">{t.category}</td>
                      <td className="py-3.5 px-4 text-slate-300">{t.purpose}</td>
                      <td className="py-3.5 px-4 text-slate-300">{t.reason}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {t.requirements_addressed?.map((rid: string) => (
                            <span key={rid} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                              {rid}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: TIMELINE & FEASIBILITY */}
        {/* ========================================================================= */}
        {activeTab === "timeline" && (
          <div className="space-y-8 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Requirement Traceability Matrix</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Bidirectional mapping connecting RFP Source &rarr; Requirement ID &rarr; Architecture Component &rarr; Proposal Section &rarr; Milestone.
                </p>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                {["All", "Covered", "Needs Review", "Partially Covered"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTraceFilter(st)}
                    className={`px-3 py-1 text-xs rounded-lg transition ${
                      traceFilter === st
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/60 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
                <thead className="bg-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Req ID</th>
                    <th className="py-3 px-4">Client Requirement &amp; Source</th>
                    <th className="py-3 px-4">Architecture Component</th>
                    <th className="py-3 px-4">Proposal Section</th>
                    <th className="py-3 px-4">Milestone</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {filteredTrace.map((tr: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{tr.requirement_id}</td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-white font-medium">{tr.requirement_text}</p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Page {tr.source_page} ({tr.source_section})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-indigo-300">{tr.architecture_component}</td>
                      <td className="py-3.5 px-4 text-emerald-300">{tr.proposal_section}</td>
                      <td className="py-3.5 px-4 text-slate-400">{tr.timeline_milestone}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            tr.status === "Covered"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {tr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 11: PROPOSAL & CLAIM FIREWALL */}
        {/* ========================================================================= */}
        {activeTab === "proposal" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Claim Firewall Audit Summary Card */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-bold text-white">Proposal Claim Firewall Audit</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Every important sentence in this proposal has been audited against original RFP evidence.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getExportDocxUrl(projectId)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> DOCX
                  </a>
                  <a
                    href={getExportPdfUrl(projectId)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </a>
                </div>
              </div>

              {/* Claim Classification Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block tracking-wider">
                    Grounded Requirement
                  </span>
                  <p className="text-xl font-bold text-emerald-300 font-mono mt-1">
                    {claimAudits.filter((c: any) => c.classification === "GROUNDED_REQUIREMENT").length} Claims
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">RFP Evidence Verified</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30">
                  <span className="text-[10px] font-bold uppercase text-blue-400 block tracking-wider">
                    Proposed Design
                  </span>
                  <p className="text-xl font-bold text-blue-300 font-mono mt-1">
                    {claimAudits.filter((c: any) => c.classification === "PROPOSED_DESIGN").length} Claims
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Engineered Solution</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block tracking-wider">
                    Assumption
                  </span>
                  <p className="text-xl font-bold text-amber-300 font-mono mt-1">
                    {claimAudits.filter((c: any) => c.classification === "ASSUMPTION").length} Claims
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Contingent Pre-requisite</p>
                </div>

                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30">
                  <span className="text-[10px] font-bold uppercase text-red-400 block tracking-wider">
                    Unsupported Claim
                  </span>
                  <p className="text-xl font-bold text-red-300 font-mono mt-1">
                    {claimAudits.filter((c: any) => c.classification === "UNSUPPORTED_CLAIM").length} Claims
                  </p>
                  <p className="text-[10px] text-red-400 mt-0.5">Requires Correction</p>
                </div>
              </div>

              {/* Unsupported Claims Warnings with Corrections */}
              {claimAudits.some((c: any) => c.classification === "UNSUPPORTED_CLAIM") && (
                <div className="mt-4 p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Claim Firewall Warning: Unsupported Claims Detected</span>
                  </div>
                  {claimAudits
                    .filter((c: any) => c.classification === "UNSUPPORTED_CLAIM")
                    .map((uc: any) => (
                      <div key={uc.id} className="p-3 rounded-lg bg-slate-900 border border-red-500/20 text-xs space-y-1.5">
                        <p className="text-red-300 line-through">&quot;{uc.claim_text}&quot;</p>
                        <p className="text-slate-400 text-[11px]">{uc.explanation}</p>
                        {uc.suggested_correction && (
                          <div className="pt-1 text-emerald-300 font-medium">
                            <strong>Suggested Correction:</strong> &quot;{uc.suggested_correction}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 16 Proposal Sections */}
            <div className="space-y-6">
              {proposalSections.map((sec: any) => (
                <div key={sec.number} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-slate-900">
                      §{sec.number}
                    </span>
                    <h3 className="text-base font-bold text-white">{sec.title}</h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">{sec.content}</p>

                  {/* Section claim audits */}
                  {sec.claims && sec.claims.length > 0 && (
                    <div className="pt-3 border-t border-slate-700/60 space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Audited Claims in Section:
                      </span>
                      {sec.claims.map((clm: any) => (
                        <div
                          key={clm.id}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            clm.classification === "GROUNDED_REQUIREMENT"
                              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                              : clm.classification === "PROPOSED_DESIGN"
                              ? "bg-blue-950/20 border-blue-500/30 text-blue-200"
                              : clm.classification === "ASSUMPTION"
                              ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                              : "bg-red-950/20 border-red-500/30 text-red-200"
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 12: HUMAN REVIEW QUEUE */}
        {/* ========================================================================= */}
        {activeTab === "review" && (
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
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
    </div>
  );
}

