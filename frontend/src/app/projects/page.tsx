"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchProjects } from "@/lib/api";
import { UploadModal } from "@/components/UploadModal";
import { EditorialPageShell } from "@/components/editorial/EditorialPageShell";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { EditorialCTA } from "@/components/editorial/EditorialCTA";
import { TransitionLink } from "@/context/TransitionContext";
import {
  ShieldCheck,
  FileText,
  Search,
  RefreshCw,
  FolderGit2,
  Copy,
  Check,
  Upload,
  ArrowUpRight,
  Layers,
  Sparkles,
  AlertCircle
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
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] via-[#cda76e] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-full shadow-md shadow-[#b08d4b]/15 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#080807]" />
              <span>Upload New RFP</span>
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

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </EditorialPageShell>
  );
}
