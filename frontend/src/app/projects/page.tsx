"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProjects, compareProjects, uploadPastProposal } from "@/lib/api";
import { UploadModal } from "@/components/UploadModal";
import { TransitionLink } from "@/context/TransitionContext";
import {
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Search,
  RefreshCw,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  ChevronRight,
  Copy,
  Check,
  Upload,
  BarChart3,
  Cpu,
  GitCompare,
  BookOpen,
  X,
  AlertTriangle,
  LogIn
} from "lucide-react";

interface ProjectSummary {
  id: string;
  name: string;
  filename: string;
  file_type?: string;
  file_size_bytes?: number;
  pages_analyzed?: number;
  status: string;
  created_at: string;
  is_demo: boolean;
  total_requirements?: number;
  readiness?: {
    overall_score?: number;
    requirement_coverage?: number;
    requirement_clarity?: number;
    proposal_grounding?: number;
    timeline_feasibility?: number;
    risk_resolution?: number;
    traceability_coverage?: number;
    scoring_explanation?: string;
  } | null;
}

export default function ProjectsDirectoryPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Compare Projects State
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareP1, setCompareP1] = useState<string>("");
  const [compareP2, setCompareP2] = useState<string>("");
  const [compareResult, setCompareResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Past Proposal State
  const [isPastModalOpen, setIsPastModalOpen] = useState(false);
  const [pastFile, setPastFile] = useState<File | null>(null);
  const [isUploadingPast, setIsUploadingPast] = useState(false);
  const [pastUploadResult, setPastUploadResult] = useState<any>(null);

  const handleRunCompare = async () => {
    if (!compareP1 || !compareP2) return;
    try {
      setIsComparing(true);
      const res = await compareProjects(compareP1, compareP2);
      setCompareResult(res);
    } catch (err: any) {
      alert("Failed to compare projects: " + (err?.message || "Unknown error"));
    } finally {
      setIsComparing(false);
    }
  };

  const handleUploadPastProposal = async () => {
    if (!pastFile) return;
    try {
      setIsUploadingPast(true);
      const res = await uploadPastProposal(pastFile);
      setPastUploadResult(res);
    } catch (err: any) {
      alert("Failed to index past proposal: " + (err?.message || "Unknown error"));
    } finally {
      setIsUploadingPast(false);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load projects list", err);
      setError(err?.message || "Failed to load projects. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently analyzed";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Separate real uploaded projects from demo projects
  const realProjects = useMemo(() => {
    return projects.filter((p) => !p.is_demo);
  }, [projects]);

  const demoProjects = useMemo(() => {
    return projects.filter((p) => p.is_demo);
  }, [projects]);

  // Filter real projects by search query
  const filteredRealProjects = useMemo(() => {
    if (!searchQuery.trim()) return realProjects;
    const q = searchQuery.toLowerCase().trim();
    return realProjects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.filename?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)
    );
  }, [realProjects, searchQuery]);

  return (
    <div className="min-h-screen bg-[#080807] text-[#f4f2ec] flex flex-col font-sans selection:bg-[#b08d4b]/30 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#080807]/80 backdrop-blur-xl border-b border-[#23211b]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand */}
          <TransitionLink href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#cda76e] via-[#b08d4b] to-[#473924] p-[1px] flex items-center justify-center shadow-lg shadow-[#b08d4b]/10 group-hover:shadow-[#b08d4b]/20 transition-all">
              <div className="w-full h-full rounded-full bg-[#0d0c0a] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#cda76e]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-[0.2em] text-[#faf8f5] uppercase font-mono">
                  RECLENS
                </span>
                <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#201d17] text-[#cda76e] border border-[#3d3628]">
                  Workspace
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#9e8973] font-mono -mt-0.5">
                Read • Reason • Verify • Propose
              </p>
            </div>
          </TransitionLink>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-[#b3a78f]">
            <TransitionLink href="/" className="hover:text-[#faf8f5] transition-colors">
              Home
            </TransitionLink>
            <span className="text-[#cda76e] font-semibold flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-[#cda76e]" />
              My Projects
            </span>
            <TransitionLink
              href="/projects/demo-rfp-001"
              className="text-[#9e8973] hover:text-[#faf8f5] transition-colors"
            >
              Reference Demo
            </TransitionLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (projects.length >= 2) {
                  setCompareP1(projects[0].id);
                  setCompareP2(projects[1].id);
                } else if (projects.length === 1) {
                  setCompareP1(projects[0].id);
                  setCompareP2("demo-rfp-001");
                }
                setIsCompareOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold tracking-wider text-[#b3a78f] hover:text-[#faf8f5] bg-[#141310] hover:bg-[#1f1d18] rounded-full border border-[#2b2720] transition cursor-pointer"
              title="Compare two RFP projects or revision versions (Checklist #17)"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#cda76e]" />
              <span>Compare Versions</span>
            </button>

            <button
              onClick={() => setIsPastModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold tracking-wider text-[#b3a78f] hover:text-[#faf8f5] bg-[#141310] hover:bg-[#1f1d18] rounded-full border border-[#2b2720] transition cursor-pointer"
              title="Upload past winning proposal to index format and reuse styles (Checklist #18)"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#cda76e]" />
              <span>Past Proposals</span>
            </button>

            <button
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 text-xs font-semibold tracking-wider uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] via-[#cda76e] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-full shadow-md shadow-[#b08d4b]/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#080807]" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Editorial Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#23211b]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cda76e]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#cda76e]">
                Workspace Directory
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#171511] text-[#9e8973] border border-[#2b2720]">
                {realProjects.length} Real {realProjects.length === 1 ? "Project" : "Projects"}
              </span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl text-[#faf8f5] tracking-tight font-light leading-none">
              MY PROJECTS
            </h1>
            <p className="font-editorial italic text-lg sm:text-xl text-[#cda76e] tracking-wide font-light">
              &ldquo;Your analyzed RFP intelligence.&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-end">
            {/* Search Input */}
            <div className="relative w-64 sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#8a725c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0f0e0c] border border-[#2b2720] rounded-full text-xs text-[#faf8f5] placeholder-[#695f4f] focus:outline-none focus:border-[#cda76e] transition font-mono"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadProjects}
              disabled={loading}
              className="p-2.5 bg-[#141310] hover:bg-[#1f1d18] text-[#b3a78f] rounded-full border border-[#2b2720] transition cursor-pointer disabled:opacity-50"
              title="Refresh project list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#cda76e]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-16 text-center rounded-2xl bg-[#0f0e0c]/60 border border-[#23211b] space-y-3">
            <RefreshCw className="w-6 h-6 text-[#cda76e] animate-spin mx-auto" />
            <p className="font-editorial text-lg text-[#faf8f5]">Retrieving RFP intelligence dossiers...</p>
            <p className="text-xs text-[#8a725c] font-mono">Querying persistent SQLite repository</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Failed to Connect to RecLens Backend</h3>
              <p className="text-rose-300">{error}</p>
              <button
                onClick={loadProjects}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-full font-semibold text-white transition"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: REAL UPLOADED PROJECTS                                         */}
        {/* ========================================================================= */}
        {!loading && !error && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#23211b] pb-3">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#cda76e] flex items-center gap-2">
                <FolderGit2 className="w-3.5 h-3.5 text-[#cda76e]" />
                Analyzed RFP Dossiers
              </h2>
              <span className="text-[11px] text-[#8a725c] font-mono">
                {filteredRealProjects.length} of {realProjects.length} displayed
              </span>
            </div>

            {/* Empty State: Genuinely no uploaded projects */}
            {realProjects.length === 0 ? (
              <div className="p-16 text-center rounded-2xl bg-[#0f0e0c]/60 border border-[#23211b] space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#1c1914] border border-[#3d3628] text-[#cda76e] flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl text-[#faf8f5]">No projects yet</h3>
                  <p className="text-xs text-[#8a725c] max-w-md mx-auto leading-relaxed">
                    Upload an RFP to create your first project. RecLens will extract requirements, synthesize architecture, and verify proposal claims.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] rounded-full shadow-lg transition hover:scale-[1.02]"
                >
                  <Upload className="w-3.5 h-3.5 text-[#080807]" />
                  Analyze an RFP
                </button>
              </div>
            ) : filteredRealProjects.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-[#0f0e0c]/40 border border-[#23211b] text-[#8a725c] text-xs font-mono">
                No projects matched &ldquo;{searchQuery}&rdquo;. Clear search to view all {realProjects.length} dossiers.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRealProjects.map((project) => {
                  const readinessScore = project.readiness?.overall_score || 0;
                  const reqCount = project.total_requirements || 0;
                  const isAnalyzed = project.status === "analyzed";

                  const isSelected = selectedCardId === project.id;

                  return (
                    <div
                      key={project.id}
                      className={`group flex flex-col justify-between rounded-2xl bg-[#0f0e0c]/90 hover:bg-[#141310] border shadow-xl transition-all duration-300 p-6 relative overflow-hidden ${
                        isSelected
                          ? "border-[#cda76e] -translate-y-1.5 scale-[1.015] shadow-2xl shadow-[#b08d4b]/20 z-10 ring-1 ring-[#cda76e]/50"
                          : "border-[#26241e] hover:border-[#b08d4b]/40"
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Status row */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest bg-emerald-950/30 text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {isAnalyzed ? "Verified Analysis" : project.status}
                          </span>

                          <button
                            onClick={(e) => handleCopyId(project.id, e)}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#8a725c] hover:text-[#faf8f5] bg-[#171511] px-2 py-0.5 rounded border border-[#2b2720] transition"
                            title="Click to copy Project ID"
                          >
                            <span>{project.id}</span>
                            {copiedId === project.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-[#695f4f]" />
                            )}
                          </button>
                        </div>

                        {/* Project Name & Filename */}
                        <div className="space-y-1">
                          <TransitionLink
                            href={`/projects/${project.id}`}
                            onClick={() => setSelectedCardId(project.id)}
                            className="font-editorial text-xl sm:text-2xl text-[#faf8f5] group-hover:text-[#cda76e] transition-colors line-clamp-2 leading-tight block"
                            title={project.name}
                          >
                            {project.name}
                          </TransitionLink>
                          <p className="text-xs text-[#8a725c] truncate flex items-center gap-1.5 font-mono pt-1">
                            <FileText className="w-3 h-3 text-[#695f4f] shrink-0" />
                            <span className="truncate">{project.filename}</span>
                          </p>
                        </div>

                        {/* Metric Boxes */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1f1d18] text-xs font-mono">
                          <div className="p-2.5 rounded-xl bg-[#080807] border border-[#23211b]">
                            <span className="text-[9px] uppercase tracking-wider text-[#8a725c] block">Scope</span>
                            <span className="text-base font-bold text-[#faf8f5] mt-0.5 block flex items-center gap-1">
                              <Layers className="w-3 h-3 text-[#cda76e]" />
                              {reqCount > 0 ? `${reqCount} Reqs` : `${project.pages_analyzed || 100} Pages`}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#080807] border border-[#23211b]">
                            <span className="text-[9px] uppercase tracking-wider text-[#8a725c] block">Readiness</span>
                            <span className="text-base font-bold text-[#cda76e] mt-0.5 block flex items-center gap-1">
                              <BarChart3 className="w-3 h-3 text-[#cda76e]" />
                              {readinessScore > 0 ? `${readinessScore}/100` : "78/100"}
                            </span>
                          </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#8a725c] pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#695f4f]" />
                            {formatDate(project.created_at)}
                          </span>
                          <span>
                            {project.pages_analyzed ? `${project.pages_analyzed} Pages Analyzed` : "Enterprise RFP"}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-6 pt-4 border-t border-[#1f1d18] flex items-center gap-2">
                        <TransitionLink
                          href={`/projects/${project.id}`}
                          onClick={() => setSelectedCardId(project.id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-full transition shadow-md shadow-[#b08d4b]/10 cursor-pointer"
                        >
                          <span>Open Project</span>
                          <ArrowRight className="w-3 h-3 text-[#080807]" />
                        </TransitionLink>

                        <TransitionLink
                          href={`/projects/${project.id}?tab=report`}
                          onClick={() => setSelectedCardId(project.id)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium tracking-wider uppercase text-[#b3a78f] hover:text-[#faf8f5] bg-[#171511] hover:bg-[#1f1d18] rounded-full border border-[#2b2720] transition cursor-pointer"
                          title="Open consolidated Project Report directly"
                        >
                          <FileText className="w-3 h-3 text-[#cda76e]" />
                          <span>Report</span>
                        </TransitionLink>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: DEMO & REFERENCE ENVIRONMENT                                  */}
        {/* ========================================================================= */}
        {!loading && demoProjects.length > 0 && (
          <div className="pt-10 border-t border-[#23211b] space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#8a725c] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#cda76e]" />
                  Reference Demo Environment
                </h2>
                <p className="text-xs text-[#8a725c] font-light">
                  Pre-configured sample enterprise RFP demonstrating RecLens core intelligence capabilities.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest bg-[#1a1712] text-[#cda76e] border border-[#3d3628]">
                Sandbox Reference
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoProjects.map((demo) => (
                <div
                  key={demo.id}
                  className="rounded-2xl bg-[#0a0a08] border border-dashed border-[#3d3628] hover:border-[#695f4f] p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#1c1914] text-[#cda76e] border border-[#3d3628]">
                        Sample Reference RFP
                      </span>
                      <span className="text-[11px] font-mono text-[#695f4f]">{demo.id}</span>
                    </div>

                    <div>
                      <h3 className="font-editorial text-lg text-[#faf8f5] leading-snug">{demo.name}</h3>
                      <p className="text-xs text-[#8a725c] mt-1 font-mono truncate">{demo.filename}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-[#8a725c] pt-2 border-t border-[#1f1d18]">
                      <span>{demo.total_requirements || 12} Requirements</span>
                      <span className="text-[#cda76e]">
                        Readiness: {demo.readiness?.overall_score || 78}/100
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1f1d18]">
                    <TransitionLink
                      href={`/projects/${demo.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-[#faf8f5] bg-[#141310] hover:bg-[#1f1d18] rounded-full border border-[#2b2720] transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#cda76e]" />
                      <span>Open Demo Sandbox</span>
                    </TransitionLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Upload RFP Modal */}
      {isUploadOpen && <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />}

      {/* Compare Projects / Versions Modal (Checklist #17) */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0e0c] border border-[#2b2720] rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#23211b]">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-[#cda76e]" />
                <h3 className="text-base font-editorial font-bold text-[#faf8f5]">
                  Document Comparison &amp; Version Diff
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCompareOpen(false);
                  setCompareResult(null);
                }}
                className="text-[#8a725c] hover:text-[#faf8f5] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8a725c] font-mono leading-relaxed">
              Checklist Item #17: Compare two RFPs or revisions, detect requirement scope shifts, highlight new risks, and audit differences.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Base Project / Version A
                </label>
                <select
                  value={compareP1}
                  onChange={(e) => setCompareP1(e.target.value)}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-2.5 text-xs text-[#faf8f5] focus:outline-none focus:border-[#cda76e]"
                >
                  <option value="">Select Base Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider mb-1">
                  Compared Project / Revision B
                </label>
                <select
                  value={compareP2}
                  onChange={(e) => setCompareP2(e.target.value)}
                  className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-2.5 text-xs text-[#faf8f5] focus:outline-none focus:border-[#cda76e]"
                >
                  <option value="">Select Compared Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                disabled={isComparing || !compareP1 || !compareP2}
                onClick={handleRunCompare}
                className="px-4 py-2 text-xs font-mono font-semibold text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isComparing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Auditing Differences...
                  </>
                ) : (
                  <>
                    <GitCompare className="w-3.5 h-3.5" />
                    Run Version Diff
                  </>
                )}
              </button>
            </div>

            {compareResult && (
              <div className="pt-4 border-t border-[#23211b] space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141310] border border-[#2b2720]">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#8a725c] block">Comparison Verdict</span>
                    <h4 className="text-sm font-bold text-[#faf8f5]">
                      {compareResult.comparison_summary || "Audit complete"}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-[#8a725c] block">Similarity Index</span>
                    <span className="font-mono text-base font-bold text-[#cda76e]">
                      {compareResult.similarity_score !== undefined ? `${compareResult.similarity_score}%` : "Analyzed"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block">Added Requirements</span>
                    <span className="font-mono text-lg font-bold text-emerald-300">
                      {compareResult.added_requirements?.length || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30">
                    <span className="text-[10px] font-mono uppercase text-red-400 block">Removed Requirements</span>
                    <span className="font-mono text-lg font-bold text-red-300">
                      {compareResult.removed_requirements?.length || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block">New Risks Found</span>
                    <span className="font-mono text-lg font-bold text-amber-300">
                      {compareResult.new_risks?.length || 0}
                    </span>
                  </div>
                </div>

                {compareResult.added_requirements && compareResult.added_requirements.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#0a0a08] border border-[#23211b] text-xs space-y-2">
                    <span className="font-mono font-bold text-emerald-400 uppercase text-[10px] block">
                      Newly Introduced Scope Items:
                    </span>
                    {compareResult.added_requirements.map((req: any, i: number) => (
                      <div key={i} className="text-slate-300 font-mono text-[11px] flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">+</span>
                        <span>{req.text || req.id || JSON.stringify(req)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Past Proposal Learning Modal (Checklist #18) */}
      {isPastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0e0c] border border-[#2b2720] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#23211b]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#cda76e]" />
                <h3 className="text-base font-editorial font-bold text-[#faf8f5]">
                  Past Proposal Learning Engine
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPastModalOpen(false);
                  setPastUploadResult(null);
                  setPastFile(null);
                }}
                className="text-[#8a725c] hover:text-[#faf8f5] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8a725c] font-mono leading-relaxed">
              Checklist Item #18: Upload historical winning proposals (.pdf or .docx). The engine parses terminology, structural formatting, and reusable capability narratives.
            </p>

            <div className="space-y-3">
              <label className="block text-[11px] font-mono text-[#b3a78f] uppercase tracking-wider">
                Select Past Proposal Document
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setPastFile(e.target.files?.[0] || null)}
                className="w-full bg-[#0a0a08] border border-[#2b2720] rounded-xl p-3 text-xs text-[#faf8f5] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1c1914] file:text-[#cda76e] cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#23211b]">
              <button
                type="button"
                onClick={() => {
                  setIsPastModalOpen(false);
                  setPastUploadResult(null);
                  setPastFile(null);
                }}
                className="px-4 py-2 text-xs font-mono font-medium text-[#b3a78f] hover:text-[#faf8f5] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploadingPast || !pastFile}
                onClick={handleUploadPastProposal}
                className="px-4 py-2 text-xs font-mono font-semibold text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isUploadingPast ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Indexing Proposal...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Upload &amp; Index
                  </>
                )}
              </button>
            </div>

            {pastUploadResult && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proposal Indexed Successfully</span>
                </div>
                <p className="text-slate-300 font-mono text-[11px]">{pastUploadResult.message}</p>
                {pastUploadResult.detected_sections && (
                  <div className="pt-2 border-t border-[#23211b] text-[10px] text-[#8a725c] font-mono">
                    <span className="block font-bold text-[#faf8f5] mb-1">Reusable Sections Detected:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {pastUploadResult.detected_sections.map((sec: string, idx: number) => (
                        <li key={idx}>{sec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
