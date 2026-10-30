"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { UploadModal } from "@/components/UploadModal";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Scale,
  GitBranch,
  Layers,
  FileText,
  Lock,
  ChevronRight,
  TrendingUp,
  Cpu
} from "lucide-react";

export default function LandingPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden bg-gradient-to-b from-navy-950 via-slate-900 to-slate-900 border-b border-slate-800">
        {/* Subtle grid background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-md mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered RFP Intelligence &amp; Proposal Verification</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
            From complex RFPs to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
              defensible proposals
            </span>{" "}
            in minutes.
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            RecLens extracts requirements with exact source citations, exposes hidden risks and contradictions, designs the technical architecture, and verifies every single proposal claim against original client evidence.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Analyze an RFP
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/projects/demo-rfp-001"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              View Demo Project
            </Link>
          </div>

          {/* Tagline */}
          <p className="mt-7 text-xs font-mono tracking-widest text-slate-400 uppercase">
            Read. Reason. Verify. Propose.
          </p>

          {/* Visual Mock Dashboard inside Hero */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-700/50 to-slate-800/20 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
            <div className="rounded-xl bg-navy-900 border border-slate-800 p-6 sm:p-8 text-left">
              {/* Dashboard mock top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Audited Analysis Complete</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">Global Investment Bank — Core Trading RFP</h3>
                  <p className="text-xs text-slate-400">100 Pages Analyzed • 4.8MB PDF • Deterministic Traceability 100%</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
                  <div className="text-right">
                    <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Proposal Readiness</p>
                    <p className="text-2xl font-black text-blue-400 font-mono">78<span className="text-sm text-slate-400">/100</span></p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent flex items-center justify-center text-xs font-bold text-white">
                    78%
                  </div>
                </div>
              </div>

              {/* KPI metrics bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-800">
                <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/40">
                  <p className="text-xs text-slate-400 font-medium">Requirements</p>
                  <p className="text-xl font-bold text-white mt-1">173 <span className="text-xs text-emerald-400 font-normal">122 Mandatory</span></p>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/40">
                  <p className="text-xs text-slate-400 font-medium">Critical Risks</p>
                  <p className="text-xl font-bold text-red-400 mt-1">6 <span className="text-xs text-slate-400 font-normal">Action Required</span></p>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/40">
                  <p className="text-xs text-slate-400 font-medium">Ambiguities</p>
                  <p className="text-xl font-bold text-amber-400 mt-1">11 <span className="text-xs text-slate-400 font-normal">Quantifiable gaps</span></p>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/40">
                  <p className="text-xs text-slate-400 font-medium">Contradictions</p>
                  <p className="text-xl font-bold text-indigo-400 mt-1">4 <span className="text-xs text-slate-400 font-normal">Page-to-Page conflicts</span></p>
                </div>
              </div>

              {/* Critical Finding Highlight */}
              <div className="mt-5 p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-400">Critical Architectural Conflict</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">High Severity</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      <strong className="text-white">Page 17:</strong> &quot;Compute &amp; databases must be on-premise&quot; <span className="text-red-400 font-bold">VS</span> <strong className="text-white">Page 93:</strong> &quot;Databases must utilize AWS RDS PostgreSQL&quot;
                    </p>
                  </div>
                </div>

                <Link
                  href="/projects/demo-rfp-001"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shrink-0 transition"
                >
                  Investigate Evidence →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiation: "Not another AI proposal writer" */}
      <section id="differentiation" className="py-24 bg-navy-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
              The Architecture Differentiator
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Not another generic AI proposal writer.
            </p>
            <p className="text-base text-slate-400 mt-4 leading-relaxed">
              Standard LLM tools take an RFP and immediately hallucinate text without verifying whether the requirements are possible, contradictory, or legally catastrophic. RecLens enforces a rigorous 9-stage engineering discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Traditional generative */}
            <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">Traditional Generative LLM Wrapper</span>
                <h4 className="text-xl font-bold text-slate-300 mt-2">Unchecked Hallucination Pipeline</h4>
                <div className="my-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-400 flex items-center justify-between">
                  <span>RFP</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-red-400 font-bold">Single LLM Prompt</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300">Unverified Proposal</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">✗</span>
                    <span>No citation or source page validation. Invented client constraints.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">✗</span>
                    <span>Ignores cross-document contradictions (e.g. AWS vs On-premise).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">✗</span>
                    <span>Blindly accepts uncapped legal liabilities and unfeasible 12-week deadlines.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                High commercial risk • Zero auditability
              </div>
            </div>

            {/* RecLens Engine */}
            <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/40 shadow-xl shadow-blue-500/5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full" />
              <div>
                <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">RecLens Intelligence Engine</span>
                <h4 className="text-xl font-bold text-white mt-2">Evidence-First Verification Pipeline</h4>
                <div className="my-6 p-4 rounded-xl bg-navy-900 border border-blue-500/30 font-mono text-xs text-blue-300 flex items-center justify-between overflow-x-auto gap-2">
                  <span>Evidence</span>
                  <span className="text-blue-500">→</span>
                  <span>Extract</span>
                  <span className="text-blue-500">→</span>
                  <span>Risks</span>
                  <span className="text-blue-500">→</span>
                  <span>Design</span>
                  <span className="text-blue-500">→</span>
                  <span className="text-emerald-400 font-bold">Claim Firewall</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Every requirement retains exact page number, section, and excerpt.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cross-document semantic contradiction engine spots conflicting mandates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Claim Firewall audits generated text: Grounded vs Proposed vs Assumptions vs Unsupported.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-blue-500/20 text-[11px] text-blue-300 font-medium">
                AI writes it. AI audits it. Humans approve it.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: 6 Stages */}
      <section id="how-it-works" className="py-24 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
              Deterministic Workflow
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              How RecLens Works
            </p>
            <p className="text-base text-slate-400 mt-4">
              A structured 6-phase engineering lifecycle that transforms dense RFPs into winning bids.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Upload & Page-Aware Parsing",
                desc: "Ingests large PDF/DOCX files preserving page geometry, headings, fonts, and source text snippets.",
                icon: FileSearch
              },
              {
                step: "02",
                title: "Understand & Categorize",
                desc: "Normalizes requirements into Functional, Security, Integration, Performance, Legal, and Compliance.",
                icon: Layers
              },
              {
                step: "03",
                title: "Reason & Detect Risks",
                desc: "Spots schedule infeasibility, unmeasurable ambiguities, cross-clause contradictions, and legal traps.",
                icon: AlertTriangle
              },
              {
                step: "04",
                title: "Design Solution Architecture",
                desc: "Synthesizes microservices topologies, data flows, and tech stacks with requirement-backed justifications.",
                icon: Cpu
              },
              {
                step: "05",
                title: "Generate Technical Proposal",
                desc: "Drafts 16 structured enterprise proposal sections strictly informed by parsed data models.",
                icon: FileText
              },
              {
                step: "06",
                title: "Claim Firewall Verification",
                desc: "Independently audits all generated claims against original RFP evidence before DOCX/PDF export.",
                icon: ShieldCheck
              }
            ].map((s, idx) => (
              <div key={idx} className="rounded-xl p-6 bg-navy-950/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-blue-500/80">{s.step}</span>
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-2">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Capabilities */}
      <section id="features" className="py-24 bg-navy-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
              Core Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Built for Enterprise Sales &amp; Solution Engineers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
              <Scale className="w-6 h-6 text-blue-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Claim Firewall</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Color-coded claim classification: Grounded requirements (Green), Proposed designs (Blue), Assumptions (Yellow), and Unsupported claims (Red) with automated corrections.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
              <GitBranch className="w-6 h-6 text-indigo-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Bidirectional Traceability</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct mapping connecting RFP Source Page → Requirement ID → Architecture Component → Proposal Section → Delivery Milestone.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
              <TrendingUp className="w-6 h-6 text-emerald-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Proposal Readiness Index</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic heuristic scoring based on measurable indicators: requirement coverage, clarity, risk resolution, and proposal grounding. Never fake win probability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-t from-navy-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to inspect your next RFP with RecLens?
          </h2>
          <p className="mt-4 text-slate-400 text-sm max-w-xl mx-auto">
            Upload your document now to experience evidence-first requirement intelligence and claim-verified proposal drafting.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              Analyze an RFP
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/projects/demo-rfp-001"
              className="px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700 transition"
            >
              Launch Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-navy-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="font-mono font-bold text-slate-300">RECLENS</span>
            <span>— &quot;Read. Reason. Verify. Propose.&quot;</span>
          </div>
          <p>© 2026 RecLens Platform. Evidence-First Proposal Engineering.</p>
        </div>
      </footer>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}

