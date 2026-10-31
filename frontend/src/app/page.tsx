"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { UploadModal } from "@/components/UploadModal";
import { RecLensScrollExperience } from "@/components/RecLensScrollExperience";
import { TransitionLink } from "@/context/TransitionContext";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Layers,
  Cpu,
  GitBranch,
  FolderGit2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  Check,
  Scale
} from "lucide-react";

export default function LandingPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#080807] text-[#f4f2ec] flex flex-col selection:bg-[#b08d4b]/30 selection:text-white">
      {/* ========================================================================= */}
      {/* CINEMATIC FULL-VIEWPORT SCROLL BACKGROUND                                 */}
      {/* 284 Frames synchronized directly to standard document scroll             */}
      {/* ========================================================================= */}
      <RecLensScrollExperience />

      {/* Subtle fixed global veil for frame-wide contrast leveling (14% neutral dark) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] bg-[#050503]/14 pointer-events-none"
      />

      {/* ========================================================================= */}
      {/* EDITORIAL CONTENT: SCROLLS OVER THE CINEMATIC BACKGROUND                 */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

        {/* ======================================================================= */}
        {/* HERO SECTION — LUXURY EDITORIAL ART DIRECTION                          */}
        {/* ======================================================================= */}
        <section className="relative min-h-[92vh] flex flex-col justify-between pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
          {/* Top Eyebrow */}
          <div className="flex items-center justify-between border-b border-[#23211b]/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfbd86] shadow-[0_0_8px_rgba(223,189,134,0.4)]" />
              <span className="text-[11px] uppercase tracking-[0.25em] editorial-meta font-mono">
                System 01 • Evidence-First AI Intelligence
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.25em] editorial-eyebrow font-mono hidden sm:inline-block">
              Bid Precision &amp; Verification
            </span>
          </div>

          {/* Hero Center Display */}
          <div className="editorial-text-zone-hero my-auto py-12 space-y-8">
            <div className="space-y-4 max-w-5xl">
              <span className="inline-block text-xs font-mono tracking-[0.3em] uppercase editorial-eyebrow bg-[#1a1712]/80 px-3 py-1 rounded-full border border-[#3d3628]">
                Enterprise RFP Intelligence &amp; Claim Firewall
              </span>

              <h1 className="editorial-heading font-editorial text-6xl sm:text-8xl lg:text-9xl font-normal tracking-tight leading-[0.95]">
                REQUELENS
              </h1>

              <p className="font-editorial italic text-2xl sm:text-4xl text-[#dfbd86] tracking-wide font-light drop-shadow-md">
                &ldquo;Read. Reason. Verify. Propose.&rdquo;
              </p>
            </div>

            <p className="editorial-body max-w-2xl text-base sm:text-lg font-light leading-relaxed">
              AI-powered RFP intelligence that extracts every requirement with page-level citations, surfaces hidden risks and cross-clause contradictions, and verifies every proposal commitment against client evidence.
            </p>

            {/* Primary Hero Action: Analyze RFP */}
            <div className="pt-2">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="group inline-flex items-center gap-3 px-6 py-2.5 text-xs sm:text-sm font-mono tracking-[0.2em] uppercase font-semibold text-[#faf8f5] bg-[#14120f]/90 hover:bg-[#1e1b14] border border-[#cda76e]/70 hover:border-[#dfbd86] rounded-full backdrop-blur-md shadow-lg shadow-black/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span className="text-[#dfbd86] group-hover:text-[#faf8f5] transition-colors">
                  Analyze RFP
                </span>
                <span className="text-sm text-[#dfbd86] group-hover:text-[#faf8f5] transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Editorial Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[#23211b]/80 text-xs font-mono">
            <div>
              <span className="editorial-eyebrow block text-[10px] uppercase tracking-widest">Scope Extraction</span>
              <span className="text-xl sm:text-2xl font-editorial font-bold text-[#faf8f5] mt-1 block drop-shadow-sm">739 Requirements</span>
              <span className="text-[11px] editorial-meta">100% Page Sourced</span>
            </div>
            <div>
              <span className="editorial-eyebrow block text-[10px] uppercase tracking-widest">Proposal Grounding</span>
              <span className="text-xl sm:text-2xl font-editorial font-bold text-[#dfbd86] mt-1 block drop-shadow-sm">Zero Hallucinations</span>
              <span className="text-[11px] editorial-meta">Evidence Claim Firewall</span>
            </div>
            <div>
              <span className="editorial-eyebrow block text-[10px] uppercase tracking-widest">Traceability Chain</span>
              <span className="text-xl sm:text-2xl font-editorial font-bold text-[#faf8f5] mt-1 block drop-shadow-sm">5-Tier Bidirection</span>
              <span className="text-[11px] editorial-meta">Page to Milestone</span>
            </div>
            <div>
              <span className="editorial-eyebrow block text-[10px] uppercase tracking-widest">Readiness Metric</span>
              <span className="text-xl sm:text-2xl font-editorial font-bold text-[#faf8f5] mt-1 block drop-shadow-sm">Deterministic Index</span>
              <span className="text-[11px] editorial-meta">Never Fake Win %</span>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 01 / UNDERSTAND — Turn hundreds of pages into structured requirements   */}
        {/* ======================================================================= */}
        <section id="understand" className="relative py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 editorial-text-zone-left space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="editorial-numeral font-editorial text-2xl sm:text-3xl font-light select-none tracking-wider">
                    01
                  </span>
                  <span className="h-px w-6 bg-[#3d3425]" />
                  <span className="editorial-eyebrow text-[11px] uppercase tracking-[0.25em] font-mono">
                    Phase 1 • Deep Ingestion
                  </span>
                </div>
                <h2 className="editorial-heading font-editorial text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.12] font-light">
                  Turn hundreds of pages into structured requirements.
                </h2>
              </div>
              <p className="editorial-body text-sm font-light leading-relaxed">
                Enterprise RFPs bury crucial technical caveats and SLA penalties across hundreds of pages. RequeLens parses complex PDFs and DOCX documents with native page-grid geometry, extracting discrete requirements with exact page and section citations.
              </p>

              <div className="pt-2">
                <TransitionLink
                  href="/projects/proj-fbf85b77"
                  className="editorial-eyebrow group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider hover:text-[#faf8f5] transition-colors"
                >
                  <span>Explore Real 379-Page RFP Extraction</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </TransitionLink>
              </div>
            </div>

            {/* Right Asymmetric Dossier Card */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0f0e0c]/85 border border-[#2b2720] p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#b08d4b]/5 blur-3xl pointer-events-none rounded-full" />

              <div className="flex items-center justify-between border-b border-[#23211b] pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#faf8f5]">
                    Model RFP Cloud Services 20260811
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8a725c] bg-[#191713] px-2.5 py-1 rounded border border-[#2e2a22]">
                  379 Pages • 739 Requirements
                </span>
              </div>

              {/* Sample Evidence Extraction Snippet */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9e8973] block">
                  Live Extraction Snippet with Page Geometry
                </span>

                <div className="rounded-xl bg-[#080807] border border-[#23211b] p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#cda76e] font-semibold">
                      REQ-BCP-014 • Disaster Recovery &amp; RPO
                    </span>
                    <span className="text-[10px] font-mono text-[#8a725c] bg-[#141310] px-2 py-0.5 rounded">
                      RFP Page 84 • §4.2.1
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#faf8f5] italic font-editorial leading-relaxed pl-3 border-l-2 border-[#b08d4b]">
                    &ldquo;The proposed cloud service platform must provide automated multi-region active-active replication with zero committed data loss (RPO = 0) and full service failover restoration within sixty seconds (RTO &lt; 60s).&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-[#9e8973]">
                    <span className="px-2 py-0.5 rounded bg-[#1c1914] text-[#b3a78f]">Category: Business Continuity</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Scope: Mandatory</span>
                    <span className="px-2 py-0.5 rounded bg-[#1c1914] text-[#b3a78f]">Target: MeitY-Empanelled Cloud</span>
                  </div>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#141310] border border-[#23211b]">
                  <span className="text-lg font-bold text-[#faf8f5] block">658</span>
                  <span className="text-[10px] text-[#8a725c] uppercase">Mandatory Scope</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141310] border border-[#23211b]">
                  <span className="text-lg font-bold text-[#cda76e] block">100%</span>
                  <span className="text-[10px] text-[#8a725c] uppercase">Source Attribution</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141310] border border-[#23211b]">
                  <span className="text-lg font-bold text-[#faf8f5] block">0</span>
                  <span className="text-[10px] text-[#8a725c] uppercase">Unassigned Clauses</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 02 / CHALLENGE — Surface risk before it enters the proposal             */}
        {/* ======================================================================= */}
        <section id="challenge" className="relative py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="editorial-text-zone-top space-y-16">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="editorial-numeral font-editorial text-2xl sm:text-3xl font-light select-none tracking-wider">
                    02
                  </span>
                  <span className="h-px w-6 bg-[#3d3425]" />
                  <span className="editorial-eyebrow text-[11px] uppercase tracking-[0.25em] font-mono">
                    Phase 1 • Risk &amp; Ambiguity Analysis
                  </span>
                </div>
                <h2 className="editorial-heading font-editorial text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.12] font-light">
                  Surface risk before it enters the proposal.
                </h2>
              </div>
              <p className="editorial-body text-sm max-w-md font-light leading-relaxed">
                Most lost bids fail not from technical incapability, but from unpriced liabilities, vague specifications, and contradictory client clauses discovered after award.
              </p>
            </div>

            {/* Asymmetric 3-Pillar Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Risk Intelligence */}
              <div className="rounded-2xl bg-[#0f0e0c]/85 border border-[#2b2720] p-6 sm:p-8 space-y-4 hover:border-[#cda76e]/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#261e14] border border-[#473924] text-[#cda76e] flex items-center justify-center font-mono text-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl text-[#faf8f5] font-light">
                  Risk Intelligence
                </h3>
                <p className="text-xs text-[#e2d8c7]/90 leading-relaxed font-light">
                  Deterministic detection of unlimited liability clauses, severe per-hour SLA penalty schedules, regulatory cross-border constraints, and aggressive delivery timelines.
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#dfbd86]">
                  Exposes: Penalty Clauses • Legal Traps • SLAs
                </div>
              </div>

              {/* Card 2: Ambiguity Detection */}
              <div className="rounded-2xl bg-[#0f0e0c]/85 border border-[#2b2720] p-6 sm:p-8 space-y-4 hover:border-[#cda76e]/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#261e14] border border-[#473924] text-[#cda76e] flex items-center justify-center font-mono text-sm">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl text-[#faf8f5] font-light">
                  Ambiguity Detection
                </h3>
                <p className="text-xs text-[#e2d8c7]/90 leading-relaxed font-light">
                  Identifies vague, unmeasured terminology such as &ldquo;industry standard response&rdquo; or &ldquo;seamless scalability&rdquo; and immediately drafts formal client clarification questions.
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#dfbd86]">
                  Generates: Pre-bid Inquiries • Formal RFIs
                </div>
              </div>

              {/* Card 3: Contradiction Engine */}
              <div className="rounded-2xl bg-[#0f0e0c]/85 border border-[#2b2720] p-6 sm:p-8 space-y-4 hover:border-[#cda76e]/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#261e14] border border-[#473924] text-[#cda76e] flex items-center justify-center font-mono text-sm">
                  <GitBranch className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl text-[#faf8f5] font-light">
                  Contradiction Engine
                </h3>
                <p className="text-xs text-[#e2d8c7]/90 leading-relaxed font-light">
                  Cross-validates statements across document sections. Automatically exposes mutually exclusive clauses (e.g. Page 17 on-prem air-gap vs Page 93 public cloud SaaS requirement).
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#dfbd86]">
                  Prevents: Conflicting Commitments • Breach
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 03 / DESIGN — Convert requirements into a defensible solution           */}
        {/* ======================================================================= */}
        <section id="design" className="relative py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-16 items-center">
            {/* Left Narrative */}
            <div className="editorial-text-zone-left space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="editorial-numeral font-editorial text-2xl sm:text-3xl font-light select-none tracking-wider">
                    03
                  </span>
                  <span className="h-px w-6 bg-[#3d3425]" />
                  <span className="editorial-eyebrow text-[11px] uppercase tracking-[0.25em] font-mono">
                    Phase 2 • Proposal Synthesis
                  </span>
                </div>
                <h2 className="editorial-heading font-editorial text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.12] font-light">
                  Convert requirements into a defensible solution.
                </h2>
              </div>
              <p className="editorial-body text-sm font-light leading-relaxed">
                RequeLens synthesizes technical architecture directly from the normalized requirements pool. Every tier maintains dual provenance: distinguishing what the RFP mandated from what we recommend as the vendor design choice.
              </p>

              <div className="pt-2 space-y-2.5 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="editorial-meta">
                    <strong className="text-[#faf8f5] font-semibold">Capability Origin:</strong> Exact client requirements fulfilled
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                  <span className="editorial-meta">
                    <strong className="text-[#faf8f5] font-semibold">Implementation Origin:</strong> Specific tech stack selection
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <TransitionLink
                  href="/insights"
                  className="editorial-eyebrow group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider hover:text-[#faf8f5] transition-colors"
                >
                  <span>Explore Dual-Provenance Architecture</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </TransitionLink>
              </div>
            </div>

            {/* Right System Component Preview */}
            <div className="rounded-2xl bg-[#0f0e0c]/85 border border-[#2b2720] p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#23211b] pb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#cda76e]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#faf8f5]">
                    Synthesized Architecture Stack
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#cda76e] bg-[#211c14] px-2.5 py-0.5 rounded border border-[#3d3425]">
                  Dual-Provenance Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#080807] border border-[#23211b] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#faf8f5] font-semibold">Compute Platform</span>
                    <span className="text-blue-400">Proposed Design</span>
                  </div>
                  <p className="text-xs text-[#b3a78f]">Managed Cloud Kubernetes (EKS / AKS) on MeitY-Empanelled Cloud</p>
                  <p className="text-[10px] font-mono text-[#8a725c]">Fulfills 48 SLA &amp; Scalability Clauses</p>
                </div>

                <div className="p-4 rounded-xl bg-[#080807] border border-[#23211b] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#faf8f5] font-semibold">Security &amp; IAM</span>
                    <span className="text-emerald-400">RFP Mandated</span>
                  </div>
                  <p className="text-xs text-[#b3a78f]">Keycloak / Okta FIDO2 MFA with mTLS 1.3 Encryption</p>
                  <p className="text-[10px] font-mono text-[#8a725c]">Fulfills Page 34 Mandatory Security Spec</p>
                </div>

                <div className="p-4 rounded-xl bg-[#080807] border border-[#23211b] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#faf8f5] font-semibold">Database Engine</span>
                    <span className="text-blue-400">Proposed Design</span>
                  </div>
                  <p className="text-xs text-[#b3a78f]">PostgreSQL 16 Multi-AZ with Read Replicas &amp; AES-256</p>
                  <p className="text-[10px] font-mono text-[#8a725c]">Automated PITR Backup &amp; Failover</p>
                </div>

                <div className="p-4 rounded-xl bg-[#080807] border border-[#23211b] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#faf8f5] font-semibold">Delivery Estimation</span>
                    <span className="text-[#cda76e]">Heuristic Sizing</span>
                  </div>
                  <p className="text-xs text-[#b3a78f]">20–24 Weeks Phased Delivery with 30-Day Hypercare</p>
                  <p className="text-[10px] font-mono text-[#8a725c]">Calibrated Against 739 Scope Clauses</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 04 / TRACE — Connect every downstream decision to evidence               */}
        {/* ======================================================================= */}
        <section id="trace" className="relative py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="editorial-text-zone-top space-y-12">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="editorial-numeral font-editorial text-2xl sm:text-3xl font-light select-none tracking-wider">
                  04
                </span>
                <span className="h-px w-6 bg-[#3d3425]" />
                <span className="editorial-eyebrow text-[11px] uppercase tracking-[0.25em] font-mono">
                  Phase 2 • Traceability Chain
                </span>
              </div>
              <h2 className="editorial-heading font-editorial text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.12] font-light">
                Connect every downstream decision to evidence.
              </h2>
              <p className="editorial-body text-sm font-light leading-relaxed pt-1">
                RequeLens builds a deterministic 5-tier traceability chain. When evaluators challenge any technical architecture choice or proposal covenant, you can immediately trace it back to the exact client sentence that necessitated it.
              </p>
            </div>

            {/* Full-Width 5-Tier Traceability Ribbon */}
            <div className="rounded-2xl bg-[#0f0e0c]/85 border border-[#2b2720] p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-[#080807] border border-[#23211b] space-y-2 relative">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#cda76e] block">1. RFP Evidence</span>
                  <p className="text-xs font-bold text-[#faf8f5]">Page 84 • §4.2.1</p>
                  <p className="text-[11px] text-[#9e8973] line-clamp-3">&ldquo;Active-active replication RPO=0, RTO&lt;60s&rdquo;</p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-[#080807] border border-[#23211b] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#cda76e] block">2. Normalized Req</span>
                  <p className="text-xs font-bold text-[#faf8f5]">REQ-BCP-014</p>
                  <p className="text-[11px] text-[#9e8973]">Mandatory high-availability disaster recovery scope</p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-[#080807] border border-[#23211b] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#cda76e] block">3. Architecture</span>
                  <p className="text-xs font-bold text-[#faf8f5]">COMP-DR-02</p>
                  <p className="text-[11px] text-[#9e8973]">Multi-Region Cross-Cluster Aurora Global Database</p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-[#080807] border border-[#23211b] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#cda76e] block">4. Proposal Section</span>
                  <p className="text-xs font-bold text-[#faf8f5]">Section 04 • BCP</p>
                  <p className="text-[11px] text-[#9e8973]">Defensible contractual SLA commitment language</p>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl bg-[#080807] border border-[#23211b] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#cda76e] block">5. Milestone</span>
                  <p className="text-xs font-bold text-[#faf8f5]">Sprint 8 • DR Drill</p>
                  <p className="text-[11px] text-[#9e8973]">Simulated live failover validation milestone</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#23211b] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8a725c]">
                <span>100% Deterministic Coverage • Zero Hallucinations</span>
                <TransitionLink
                  href="/projects/proj-fbf85b77"
                  className="editorial-eyebrow hover:text-[#faf8f5] flex items-center gap-1 transition-colors"
                >
                  View Complete Traceability Matrix →
                </TransitionLink>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 05 / VERIFY — AI writes it. AI audits it. Humans approve it. (FIREWALL) */}
        {/* ======================================================================= */}
        <section id="verify" className="relative py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="editorial-text-zone-top space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="editorial-numeral font-editorial text-2xl sm:text-3xl font-light select-none tracking-wider">
                    05
                  </span>
                  <span className="h-px w-6 bg-[#3d3425]" />
                  <span className="editorial-eyebrow text-[11px] uppercase tracking-[0.25em] font-mono">
                    Phase 3 • Autonomous Verification
                  </span>
                </div>
                <h2 className="editorial-heading font-editorial text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.12] font-light">
                  AI writes it. AI audits it. Humans approve it.
                </h2>
              </div>
              <p className="editorial-body text-sm max-w-md font-light leading-relaxed">
                The Claim Firewall is RequeLens&apos;s signature breakthrough. It subjects generated proposals to an adversarial verification engine that checks every sentence against original client evidence.
              </p>
            </div>

            {/* Claim Firewall Audit Showcase */}
            <div className="rounded-2xl bg-[#0f0e0c]/85 border border-[#2b2720] p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
              {/* Classification Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs font-mono">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <span className="font-bold block">RFP FACT</span>
                  <span className="text-[10px] text-emerald-400/80">Direct client quote</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-blue-300">
                  <span className="font-bold block">PROPOSED DESIGN</span>
                  <span className="text-[10px] text-blue-400/80">Vendor tech choice</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300">
                  <span className="font-bold block">ASSUMPTION</span>
                  <span className="text-[10px] text-amber-400/80">Scoped boundary</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300">
                  <span className="font-bold block">UNSUPPORTED CLAIM</span>
                  <span className="text-[10px] text-rose-400/80">Flagged &amp; Gated</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-300">
                  <span className="font-bold block">NEEDS REVIEW</span>
                  <span className="text-[10px] text-slate-400">Human sign-off</span>
                </div>
              </div>

              {/* Real Audit Interaction Demo */}
              <div className="space-y-4 pt-4 border-t border-[#23211b]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#faf8f5] font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#cda76e]" />
                    Audit Record: CLM-001 (Automated Safe Rewrite)
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/30">
                    Flagged as Vendor-Biased Claim
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Before */}
                  <div className="p-4 rounded-xl bg-[#080807] border border-rose-950/50 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-rose-400 block font-semibold">
                      Raw AI Draft (Flagged by Firewall)
                    </span>
                    <p className="text-[#faf8f5] italic font-editorial leading-relaxed">
                      &ldquo;The RFP mandates Keycloak as the required Identity and Access Management platform for all MFA integration.&rdquo;
                    </p>
                    <p className="text-[10px] text-[#8a725c] font-mono">
                      Why Flagged: Vendor tech Keycloak is not named in client text. RFP only specified standard MFA.
                    </p>
                  </div>

                  {/* After */}
                  <div className="p-4 rounded-xl bg-[#080807] border border-emerald-950/50 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">
                      Verified Defensible Rewrite (Accepted)
                    </span>
                    <p className="text-[#faf8f5] italic font-editorial leading-relaxed">
                      &ldquo;The RFP establishes requirements for MFA (Page 34). RequeLens proposes Keycloak as the vendor-recommended IAM platform.&rdquo;
                    </p>
                    <p className="text-[10px] text-emerald-400/80 font-mono">
                      Audit Verdict: Converted to defensible Proposed Design. Zero contractual misrepresentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 06 / DELIVER — A verified proposal and consolidated project report     */}
        {/* ======================================================================= */}
        <section id="deliver" className="relative py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 editorial-text-zone-left space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="editorial-numeral font-editorial text-2xl sm:text-3xl font-light select-none tracking-wider">
                    06
                  </span>
                  <span className="h-px w-6 bg-[#3d3425]" />
                  <span className="editorial-eyebrow text-[11px] uppercase tracking-[0.25em] font-mono">
                    Phase 4 • Delivery &amp; Audit Dossier
                  </span>
                </div>
                <h2 className="editorial-heading font-editorial text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.12] font-light">
                  A verified proposal and consolidated project report.
                </h2>
              </div>
              <p className="editorial-body text-sm font-light leading-relaxed">
                RequeLens outputs an enterprise-ready dossier: 16 structured proposal sections, an executive intelligence brief, and direct export to client-formatted DOCX and audited PDF documents.
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-mono editorial-meta">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfbd86]" />
                  <span>Complete 16-chapter proposal document package</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfbd86]" />
                  <span>Audit-provenance verification appendix</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfbd86]" />
                  <span>Turnkey export to editable DOCX and signed PDF</span>
                </div>
              </div>

              <div className="pt-2">
                <TransitionLink
                  href="/insights"
                  className="editorial-eyebrow group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider hover:text-[#faf8f5] transition-colors"
                >
                  <span>Review Dossier Output Standards</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </TransitionLink>
              </div>
            </div>

            {/* Right Report Preview */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0f0e0c]/85 border border-[#2b2720] p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#23211b] pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#cda76e]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#faf8f5]">
                    Consolidated Project Report Dossier
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  Export Ready
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#080807] border border-[#23211b]">
                  <span className="text-[#faf8f5] font-medium">Executive Intelligence Dossier</span>
                  <span className="text-[#8a725c] font-mono text-[11px]">13 Consolidated Chapters</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#080807] border border-[#23211b]">
                  <span className="text-[#faf8f5] font-medium">Proposal Readiness Heuristic Index</span>
                  <span className="text-[#cda76e] font-mono text-[11px]">69 / 100 Calibrated</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#080807] border border-[#23211b]">
                  <span className="text-[#faf8f5] font-medium">Claim Firewall Export Gate</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Verified Analysis</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#080807] border border-[#23211b]">
                  <span className="text-[#faf8f5] font-medium">Supported Formats</span>
                  <span className="text-[#b3a78f] font-mono text-[11px]">Client DOCX &amp; Vector PDF</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#8a725c] border-t border-[#23211b]">
                <span>Deterministic Compilation Complete</span>
                <span className="text-[#cda76e]">§1–16 Full Coverage</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* FINAL CONVERSION SECTION — HIGH-IMPACT EDITORIAL CTA                    */}
        {/* ======================================================================= */}
        <section className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="relative rounded-3xl bg-gradient-to-b from-[#14120e]/90 to-[#0a0908]/95 border border-[#2b2720] p-8 sm:p-14 lg:p-16 text-center backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Subtle warm glow behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#cda76e]/5 blur-3xl pointer-events-none rounded-full" />

            <div className="relative max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1b15] border border-[#3d3425] text-[11px] font-mono uppercase tracking-widest editorial-eyebrow">
                <span>Enterprise RFP Intelligence</span>
              </div>

              <h2 className="editorial-heading font-editorial text-3xl sm:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight">
                Ready to turn complex RFPs into defensible proposals?
              </h2>

              <p className="editorial-body text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
                Deploy deterministic page-geometry extraction, automated risk audit, and bid-ready architecture on your next critical RFP.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-semibold tracking-wider uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] hover:from-[#dfbe8c] hover:to-[#be9b5a] rounded-full shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Analyze An RFP</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#080807]" />
                </button>

                <TransitionLink
                  href="/projects"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-semibold tracking-wider uppercase text-[#faf8f5] bg-[#141310] hover:bg-[#1c1a14] rounded-full border border-[#332f26] hover:border-[#4d4434] transition-all"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-[#cda76e]" />
                  <span>Open Workspace</span>
                </TransitionLink>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-mono editorial-meta border-t border-[#23211b] mt-8">
                <span>✓ 100% Page-Sourced Evidence</span>
                <span>✓ Deterministic Claim Firewall</span>
                <span>✓ Zero Hallucinations</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* FOOTER — RESTRAINED EDITORIAL FINISH                                    */}
        {/* ======================================================================= */}
        <footer className="border-t border-[#23211b]/80 py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full text-xs font-mono text-[#8a725c]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="font-bold tracking-widest text-[#faf8f5] uppercase">REQUELENS</span>
              <span>—</span>
              <span>Evidence-First Proposal Engineering</span>
            </div>

            <div className="flex items-center gap-6 text-[#b3a78f]">
              <TransitionLink href="/projects" className="hover:text-[#faf8f5] transition-colors">
                My Projects
              </TransitionLink>
              <TransitionLink href="/insights" className="hover:text-[#faf8f5] transition-colors">
                Insights
              </TransitionLink>
              <TransitionLink href="/about" className="hover:text-[#faf8f5] transition-colors">
                About Us
              </TransitionLink>
            </div>

            <p>© 2026 RequeLens Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Upload RFP Modal */}
      {isUploadOpen && <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />}
    </div>
  );
}
