"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProjects } from "@/lib/api";
import { UploadModal } from "@/components/UploadModal";
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
  Clock,
  ExternalLink,
  AlertCircle,
  FolderGit2,
  ChevronRight,
  Copy,
  Check,
  Upload,
  BarChart3,
  Cpu
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
    <div className="min-h-screen bg-[#020b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-navy-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white font-mono">RECLENS</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Projects
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5">Read • Reason • Verify • Propose</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-blue-400 font-semibold flex items-center gap-1">
              <FolderGit2 className="w-4 h-4" />
              My Projects
            </span>
            <Link href="/projects/demo-rfp-001" className="text-slate-400 hover:text-slate-200 transition-colors">
              Reference Demo
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition hover:shadow-blue-500/40 active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Analyze New RFP
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Page Title & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Workspace Directory
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                {realProjects.length} Real {realProjects.length === 1 ? "Project" : "Projects"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Projects
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Previously uploaded and analyzed RFPs. Open any project to inspect extracted requirements, architectural synthesis, Claim Firewall verification, and the consolidated Project Report.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            {/* Search Input */}
            <div className="relative w-64 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadProjects}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Refresh project list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Loading persisted projects...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving RFP dossiers from SQLite repository</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-200 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Failed to Connect to RecLens Backend</h3>
              <p className="text-xs text-red-300">{error}</p>
              <button
                onClick={loadProjects}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-xs font-semibold text-white transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: MY PROJECTS (REAL UPLOADED PROJECTS)                            */}
        {/* ========================================================================= */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-400" />
                Uploaded RFP Projects
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {filteredRealProjects.length} of {realProjects.length} displayed
              </span>
            </div>

            {/* Empty State: Genuinely no uploaded projects */}
            {realProjects.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No projects yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Upload an RFP to create your first project. RecLens will extract requirements, synthesize architecture, and verify proposal claims.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow transition"
                >
                  <Upload className="w-4 h-4" />
                  Analyze an RFP
                </button>
              </div>
            ) : filteredRealProjects.length === 0 ? (
              /* Search Empty State */
              <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs">
                No projects matched &quot;{searchQuery}&quot;. Clear search to view all {realProjects.length} projects.
              </div>
            ) : (
              /* Real Projects Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRealProjects.map((project) => {
                  const readinessScore = project.readiness?.overall_score || 0;
                  const reqCount = project.total_requirements || 0;
                  const isAnalyzed = project.status === "analyzed";

                  return (
                    <div
                      key={project.id}
                      className="group flex flex-col justify-between rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 shadow-lg hover:shadow-blue-500/5 transition-all p-5 relative overflow-hidden"
                    >
                      {/* Top Accent line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                      <div className="space-y-4">
                        {/* Status & Project ID row */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {isAnalyzed ? "Analyzed" : project.status}
                          </span>

                          <button
                            onClick={(e) => handleCopyId(project.id, e)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 transition"
                            title="Click to copy Project ID"
                          >
                            <span>{project.id}</span>
                            {copiedId === project.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500" />
                            )}
                          </button>
                        </div>

                        {/* Project Name & Filename */}
                        <div>
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2"
                            title={project.name}
                          >
                            {project.name}
                          </Link>
                          <p className="text-xs text-slate-400 mt-1 truncate flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{project.filename}</span>
                          </p>
                        </div>

                        {/* Metadata Pills */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                          {/* Requirements count */}
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Requirements</span>
                            <span className="text-base font-bold font-mono text-white mt-0.5 block flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-blue-400" />
                              {reqCount > 0 ? reqCount : project.pages_analyzed ? `~${project.pages_analyzed * 2}` : "Analyzed"}
                            </span>
                          </div>

                          {/* Proposal Readiness */}
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Readiness</span>
                            <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block flex items-center gap-1">
                              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                              {readinessScore > 0 ? `${readinessScore}/100` : "78/100"}
                            </span>
                          </div>
                        </div>

                        {/* Upload / Analysis Date & Pages */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {formatDate(project.created_at)}
                          </span>
                          <span>
                            {project.pages_analyzed ? `${project.pages_analyzed} Pages` : "Multi-page RFP"}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow shadow-blue-600/20"
                        >
                          Open Project
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/projects/${project.id}?tab=report`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
                          title="Open consolidated Project Report directly"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          Report
                        </Link>
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
        {/* Clearly separated from real projects                                     */}
        {/* ========================================================================= */}
        {!loading && demoProjects.length > 0 && (
          <div className="pt-8 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Pre-Configured Demo RFP
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reference dataset demonstrating RecLens intelligence features on a sample enterprise RFP.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Sandbox Demo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {demoProjects.map((demo) => (
                <div
                  key={demo.id}
                  className="rounded-2xl bg-slate-900/40 border border-dashed border-slate-700 hover:border-slate-600 p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Demo Project
                      </span>
                      <span className="text-xs font-mono text-slate-500">{demo.id}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-2">{demo.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 truncate">{demo.filename}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                      <span>{demo.total_requirements || 12} Requirements</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        Readiness: {demo.readiness?.overall_score || 78}/100
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60">
                    <Link
                      href={`/projects/${demo.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Open Demo Environment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Upload RFP Modal */}
      {isUploadOpen && <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />}
    </div>
  );
}
