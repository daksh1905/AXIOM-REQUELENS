"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  fetchProjects,
  compareProjects,
  uploadPastProposal,
} from "@/lib/api";
import { UploadModal } from "@/components/UploadModal";
import { EditorialPageShell } from "@/components/editorial/EditorialPageShell";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { EditorialCTA } from "@/components/editorial/EditorialCTA";
import { TransitionLink } from "@/context/TransitionContext";
import {
  Search,
  RefreshCw,
  FolderGit2,
  Copy,
  Check,
  Upload,
  GitCompare,
  BookOpen,
  X,
  LogIn,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
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

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.filename?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  return (
    <EditorialPageShell pageWatermark="/ my projects workspace">
      {/* 1. Hero Section */}
      <EditorialHero
        category="/ workspace directory"
        pageNumber="01/07"
        title="MY PROJECTS"
        subtitle="Your RFP intelligence workspace. Access, inspect, and verify analyzed tender proposals."
      />

      {/* 2. Directory Toolbar & Metrics */}
      <section className="py-8 sm:py-12 border-b border-[#24211a]/80">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a67]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by project name, RFP file, or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0e0d0b] border border-[#26221b] rounded-full text-xs text-[#f4f2ec] placeholder-[#736655] focus:outline-none focus:border-[#cda76e] transition-colors"
            />
          </div>

          {/* Actions & Refresh */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadProjects}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#9e8e7a] hover:text-[#f4f2ec] bg-[#14120f] border border-[#26221b] rounded-full transition-colors cursor-pointer"
              title="Refresh project list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

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
      </section>

      {/* 3. Editorial Project Rows / Panels (Matching Requested Asymmetric Layout) */}
      <section className="py-12 sm:py-20 space-y-8 sm:space-y-12">
        {loading && projects.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#584936]/40 border-t-[#cda76e] animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest text-[#9e8e7a]">
              Loading persisted projects...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-[#1f1212] border border-[#4a2424] text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-[#f07b7b] mx-auto" />
            <p className="text-sm text-[#f4f2ec]">{error}</p>
            <button
              onClick={loadProjects}
              className="px-4 py-2 text-xs font-mono uppercase bg-[#2e1919] border border-[#5a2e2e] rounded-full text-[#f4f2ec]"
            >
              Try Again
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center space-y-4 border border-dashed border-[#24211a] rounded-3xl p-8">
            <FolderGit2 className="w-10 h-10 text-[#6e6150] mx-auto" />
            <h3 className="text-lg font-light text-[#f4f2ec] font-serif">No projects match your search</h3>
            <p className="text-xs text-[#8a7a67]">Try adjusting your search criteria or upload a new tender document.</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {filteredProjects.map((proj, idx) => {
              const projectNumber = String(idx + 1).padStart(2, "0");
              const score = proj.readiness?.overall_score ?? (proj.is_demo ? 74 : null);
              const totalReqs = proj.total_requirements ?? (proj.is_demo ? 739 : "Analyzed");

              return (
                <div
                  key={proj.id}
                  className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-[#0e0d0b] border border-[#23201a] hover:border-[#4d4231] hover:-translate-y-0.5 hover:scale-[1.004] hover:shadow-xl hover:shadow-black/50 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Background highlight */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#cda76e]/3 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-[#cda76e]/6 transition-all" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                    {/* Left: Project Number + Title */}
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
                          PROJECT {projectNumber}
                        </span>
                        <span className="text-[#3a3429]">•</span>
                        <span className="text-[11px] font-mono text-[#8a7a67]">
                          {formatDate(proj.created_at)}
                        </span>
                        {proj.is_demo && (
                          <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-[#211c15] text-[#cda76e] border border-[#3d3424]">
                            Demo Model
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-[#f4f2ec] font-serif tracking-tight leading-snug group-hover:text-[#f4f2ec]">
                        {proj.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8a7a67]">
                        <span className="truncate max-w-xs">{proj.filename}</span>
                        <button
                          onClick={(e) => handleCopyId(proj.id, e)}
                          className="inline-flex items-center gap-1 hover:text-[#cda76e] transition-colors"
                          title="Copy project identifier"
                        >
                          <span className="text-[11px] opacity-75">{proj.id}</span>
                          {copiedId === proj.id ? (
                            <Check className="w-3 h-3 text-[#5cb85c]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Middle: Metrics (Requirements + Readiness) */}
                    <div className="flex items-center gap-8 sm:gap-12 py-3 lg:py-0 border-y lg:border-y-0 border-[#1d1b17]">
                      <div>
                        <div className="text-xl sm:text-2xl font-light text-[#f4f2ec] font-mono">
                          {totalReqs}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8a7a67] mt-0.5">
                          Requirements
                        </div>
                      </div>

                      {score !== null && (
                        <div>
                          <div className="text-xl sm:text-2xl font-light text-[#cda76e] font-mono">
                            {score}%
                          </div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8a7a67] mt-0.5">
                            Readiness Score
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5cb85c]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5cb85c] animate-pulse" />
                          <span className="uppercase tracking-wider">Complete</span>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8a7a67] mt-0.5">
                          Claim Audit
                        </div>
                      </div>
                    </div>

                    {/* Right: Open Project Link / Action */}
                    <div className="flex items-center justify-end">
                      <TransitionLink
                        href={`/projects/${proj.id}`}
                        className="group/btn inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full text-xs font-semibold tracking-widest uppercase text-[#f4f2ec] bg-[#1a1713] hover:bg-[#26211a] border border-[#383124] hover:border-[#cda76e] transition-all cursor-pointer whitespace-nowrap shadow-md"
                      >
                        <span>OPEN PROJECT</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#cda76e] transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </TransitionLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>
        {/* 4. Closing CTA */}
        <EditorialCTA
          label="REQUELENS"
          title="READY TO ANALYZE A NEW SOLICITATION?"
          subtitle="Ingest PDF or Word tenders to begin extraction and claim verification."
          ctaText="ANALYZE AN RFP ↗"
          onAction={() => setIsUploadOpen(true)}
        />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

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
              </EditorialPageShell>
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
    </EditorialPageShell>
  );
}
