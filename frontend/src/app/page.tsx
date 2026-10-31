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
      {/* 283 Frames synchronized directly to standard document scroll             */}
      {/* ========================================================================= */}
      <RecLensScrollExperience />

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
              <span className="w-1.5 h-1.5 rounded-full bg-[#cda76e]" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#b3a78f] font-mono">
                System 01 • Evidence-First AI Intelligence
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#8a725c] font-mono hidden sm:inline-block">
              Bid Precision &amp; Verification
            </span>
          </div>

          {/* Hero Center Display */}
          <div className="my-auto py-12 space-y-8">
            <div className="space-y-4 max-w-5xl">
              <span className="inline-block text-xs font-mono tracking-[0.3em] uppercase text-[#cda76e] bg-[#1a1712]/70 px-3 py-1 rounded-full border border-[#3d3628]">
                Enterprise RFP Intelligence &amp; Claim Firewall
              </span>

              <h1 className="font-editorial text-6xl sm:text-8xl lg:text-9xl font-normal tracking-tight text-[#faf8f5] leading-[0.95]">
                RECLENS
              </h1>

              <p className="font-editorial italic text-2xl sm:text-4xl text-[#cda76e] tracking-wide font-light">
                &ldquo;Read. Reason. Verify. Propose.&rdquo;
              </p>
            </div>

            <p className="max-w-2xl text-base sm:text-lg text-[#b3a78f] leading-relaxed font-light">
              AI-powered RFP intelligence that extracts every requirement with page-level citations, surfaces hidden risks and cross-clause contradictions, and verifies every proposal commitment against client evidence.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-xs font-semibold tracking-widest uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] via-[#cda76e] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] rounded-full shadow-xl shadow-[#b08d4b]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Analyze an RFP</span>
                <ArrowRight className="w-4 h-4 text-[#080807]" />
              </button>

              <TransitionLink
                href="/projects"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-xs font-semibold tracking-widest uppercase text-[#faf8f5] bg-[#141310]/80 hover:bg-[#1f1d18] rounded-full border border-[#332f26] backdrop-blur-md transition-all hover:border-[#cda76e]/50"
              >
                <FolderGit2 className="w-4 h-4 text-[#cda76e]" />
                <span>My Projects</span>
              </TransitionLink>

              <TransitionLink
                href="/projects/demo-rfp-001"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-medium tracking-widest uppercase text-[#9e8973] hover:text-[#faf8f5] transition-colors"
              >
                <span>View Demo RFP →</span>
              </TransitionLink>
            </div>
          </div>

          {/* Bottom Editorial Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[#23211b]/80 text-xs font-mono">
            <div>
              <span className="text-[#8a725c] block text-[10px] uppercase tracking-widest">Scope Extraction</span>
              <span className="text-xl sm:text-2xl font-editorial font-bold text-[#faf8f5] mt-1 block">739 Requirements</span>
              <span className="text-[11px] text-[#9e8973]">100% Page Sourced</span>
            </div>
            <div>
              <span className="text-[#8a725c] block text-[10px] uppercase tracking-widest">Proposal Grounding</span>
              <span className="text-xl sm:text-2xl font-editorial font-bold text-[#cda76e] mt-1 block">Zero Hallucinations</span>
              <span className="text-[11px] text-[#9e8973]">Evidence Claim Firewall</span>
            </div>
            <div>
              <span className="text-[#8a725c] block text-[10px] uppercase tracking-widest">Traceability Chain</span>
              <span className="text-xl sm:text-2xl font-editorial font-bold text-[#faf8f5] mt-1 block">5-Tier Bidirection</span>
              <span className="text-[11px] text-[#9e8973]">Page to Milestone</span>
            </div>
            <div>
              <span className="text-[#8a725c] block text-[10px] uppercase tracking-widest">Readiness Metric</span>
              <span className="text-xl sm:text-2xl font-editorial font-bold text-[#faf8f5] mt-1 block">Deterministic Index</span>
              <span className="text-[11px] text-[#9e8973]">Never Fake Win %</span>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 01 / UNDERSTAND — Turn hundreds of pages into structured requirements   */}
        {/* ======================================================================= */}
        <section id="understand" className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Big Editorial Header */}
            <div className="lg:col-span-5 space-y-6">
              <span className="font-editorial text-7xl sm:text-9xl text-[#473924]/50 leading-none block select-none">
                01
              </span>
              <div className="space-y-3 -mt-6">
                <span className="text-xs uppercase tracking-[0.25em] text-[#cda76e] font-mono block">
                  Phase 1 • Deep Ingestion
                </span>
                <h2 className="font-editorial text-3xl sm:text-5xl text-[#faf8f5] leading-[1.1] font-light">
                  Turn hundreds of pages into structured requirements.
                </h2>
              </div>
              <p className="text-sm text-[#b3a78f] leading-relaxed font-light">
                Enterprise RFPs bury crucial technical caveats and SLA penalties across hundreds of pages. RecLens parses complex PDFs and DOCX documents with native page-grid geometry, extracting discrete requirements with exact page and section citations.
              </p>

              <div className="pt-4 flex items-center gap-3">
                <TransitionLink
                  href="/projects/proj-fbf85b77"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#cda76e] hover:text-[#faf8f5] transition-colors"
                >
                  <span>Explore Real 379-Page RFP Extraction</span>
                  <ChevronRight className="w-4 h-4" />
                </TransitionLink>
              </div>
            </div>

            {/* Right Asymmetric Dossier Card */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0f0e0c]/90 border border-[#2b2720] p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
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
        <section id="challenge" className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="space-y-16">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="font-editorial text-5xl sm:text-7xl text-[#473924]/60 leading-none">02</span>
                  <span className="text-xs uppercase tracking-[0.25em] text-[#cda76e] font-mono">
                    Phase 1 • Deep Ingestion
                  </span>
                </div>
                <h2 className="font-editorial text-3xl sm:text-5xl text-[#faf8f5] leading-[1.1] font-light">
                  Surface risk before it enters the proposal.
                </h2>
              </div>
              <p className="text-sm text-[#b3a78f] max-w-md font-light leading-relaxed">
                Most lost bids fail not from technical incapability, but from unpriced liabilities, vague specifications, and contradictory client clauses discovered after award.
              </p>
            </div>

            {/* Asymmetric 3-Pillar Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Risk Intelligence */}
              <div className="rounded-2xl bg-[#0f0e0c]/80 border border-[#2b2720] p-6 sm:p-8 space-y-4 hover:border-[#b08d4b]/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#261e14] border border-[#473924] text-[#cda76e] flex items-center justify-center font-mono text-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl text-[#faf8f5] font-light">
                  Risk Intelligence
                </h3>
                <p className="text-xs text-[#b3a78f] leading-relaxed font-light">
                  Deterministic detection of unlimited liability clauses, severe per-hour SLA penalty schedules, regulatory cross-border constraints, and aggressive delivery timelines.
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#cda76e]">
                  Exposes: Penalty Clauses • Legal Traps • SLAs
                </div>
              </div>

              {/* Card 2: Ambiguity Detection */}
              <div className="rounded-2xl bg-[#0f0e0c]/80 border border-[#2b2720] p-6 sm:p-8 space-y-4 hover:border-[#b08d4b]/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#261e14] border border-[#473924] text-[#cda76e] flex items-center justify-center font-mono text-sm">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl text-[#faf8f5] font-light">
                  Ambiguity Detection
                </h3>
                <p className="text-xs text-[#b3a78f] leading-relaxed font-light">
                  Identifies vague, unmeasured terminology such as &ldquo;industry standard response&rdquo; or &ldquo;seamless scalability&rdquo; and immediately drafts formal client clarification questions.
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#cda76e]">
                  Generates: Pre-bid Inquiries • Formal RFIs
                </div>
              </div>

              {/* Card 3: Contradiction Engine */}
              <div className="rounded-2xl bg-[#0f0e0c]/80 border border-[#2b2720] p-6 sm:p-8 space-y-4 hover:border-[#b08d4b]/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#261e14] border border-[#473924] text-[#cda76e] flex items-center justify-center font-mono text-sm">
                  <GitBranch className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl text-[#faf8f5] font-light">
                  Contradiction Engine
                </h3>
                <p className="text-xs text-[#b3a78f] leading-relaxed font-light">
                  Cross-validates statements across document sections. Automatically exposes mutually exclusive clauses (e.g. Page 17 on-prem air-gap vs Page 93 public cloud SaaS requirement).
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#cda76e]">
                  Prevents: Conflicting Commitments • Breach
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 03 / DESIGN — Convert requirements into a defensible solution           */}
        {/* ======================================================================= */}
        <section id="design" className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <span className="font-editorial text-7xl sm:text-9xl text-[#473924]/50 leading-none block select-none">
                03
              </span>
              <div className="space-y-3 -mt-6">
                <span className="text-xs uppercase tracking-[0.25em] text-[#cda76e] font-mono block">
                  Phase 2 • Proposal Synthesis
                </span>
                <h2 className="font-editorial text-3xl sm:text-5xl text-[#faf8f5] leading-[1.1] font-light">
                  Convert requirements into a defensible solution.
                </h2>
              </div>
              <p className="text-sm text-[#b3a78f] leading-relaxed font-light">
                RecLens synthesizes technical architecture directly from the normalized requirements pool. Every tier maintains dual provenance: distinguishing what the RFP mandated from what we recommend as the vendor design choice.
              </p>

              <div className="pt-2 space-y-3 text-xs font-mono">
                <div className="flex items-center gap-3 text-[#faf8f5]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Capability Origin: Exact client requirements fulfilled</span>
                </div>
                <div className="flex items-center gap-3 text-[#b3a78f]">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Implementation Origin: Specific tech stack selection</span>
                </div>
              </div>
            </div>

            {/* Right System Component Preview */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0f0e0c]/90 border border-[#2b2720] p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-2xl">
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
        <section id="trace" className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="space-y-12">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="font-editorial text-5xl sm:text-7xl text-[#473924]/60 leading-none">04</span>
                <span className="text-xs uppercase tracking-[0.25em] text-[#cda76e] font-mono">
                  Phase 2 • Proposal Synthesis
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-5xl text-[#faf8f5] leading-[1.1] font-light">
                Connect every downstream decision to evidence.
              </h2>
              <p className="text-sm text-[#b3a78f] font-light leading-relaxed">
                RecLens builds a deterministic 5-tier traceability chain. When evaluators challenge any technical architecture choice or proposal covenant, you can immediately trace it back to the exact client sentence that necessitated it.
              </p>
            </div>

            {/* Full-Width 5-Tier Traceability Ribbon */}
            <div className="rounded-2xl bg-[#0f0e0c]/90 border border-[#2b2720] p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
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
                  className="text-[#cda76e] hover:text-[#faf8f5] flex items-center gap-1 transition-colors"
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
        <section id="verify" className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="font-editorial text-5xl sm:text-7xl text-[#473924]/60 leading-none">05</span>
                  <span className="text-xs uppercase tracking-[0.25em] text-[#cda76e] font-mono">
                    Phase 3 • Autonomous Verification
                  </span>
                </div>
                <h2 className="font-editorial text-3xl sm:text-5xl text-[#faf8f5] leading-[1.1] font-light">
                  AI writes it. AI audits it. Humans approve it.
                </h2>
              </div>
              <p className="text-sm text-[#b3a78f] max-w-md font-light leading-relaxed">
                The Claim Firewall is RecLens&apos;s signature breakthrough. It subjects generated proposals to an adversarial verification engine that checks every sentence against original client evidence.
              </p>
            </div>

            {/* Claim Firewall Audit Showcase */}
            <div className="rounded-2xl bg-[#0f0e0c]/90 border border-[#2b2720] p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
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
                      &ldquo;The RFP establishes requirements for MFA (Page 34). RecLens proposes Keycloak as the vendor-recommended IAM platform.&rdquo;
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
        <section id="deliver" className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-[#23211b]/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <span className="font-editorial text-7xl sm:text-9xl text-[#473924]/50 leading-none block select-none">
                06
              </span>
              <div className="space-y-3 -mt-6">
                <span className="text-xs uppercase tracking-[0.25em] text-[#cda76e] font-mono block">
                  Delivery &amp; Audit Dossier
                </span>
                <h2 className="font-editorial text-3xl sm:text-5xl text-[#faf8f5] leading-[1.1] font-light">
                  A verified proposal and consolidated project report.
                </h2>
              </div>
              <p className="text-sm text-[#b3a78f] leading-relaxed font-light">
                RecLens outputs an enterprise-ready dossier: 16 structured proposal sections, an executive intelligence brief, and direct export to client-formatted DOCX and audited PDF documents.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold tracking-wider uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] to-[#b08d4b] rounded-full shadow-lg transition hover:scale-[1.02] cursor-pointer"
                >
                  <span>Analyze Your RFP</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#080807]" />
                </button>
                <TransitionLink
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold tracking-wider uppercase text-[#faf8f5] bg-[#141310] hover:bg-[#1c1a14] rounded-full border border-[#332f26] transition"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-[#cda76e]" />
                  <span>Open Workspace</span>
                </TransitionLink>
              </div>
            </div>

            {/* Right Report Preview */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0f0e0c]/90 border border-[#2b2720] p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-2xl">
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
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#080807] border border-[#23211b]">
                  <span className="text-[#faf8f5]">Executive Intelligence Dossier</span>
                  <span className="text-[#8a725c] font-mono">13 Consolidated Chapters</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#080807] border border-[#23211b]">
                  <span className="text-[#faf8f5]">Proposal Readiness Heuristic Index</span>
                  <span className="text-[#cda76e] font-mono">69 / 100 Calibrated</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#080807] border border-[#23211b]">
                  <span className="text-[#faf8f5]">Claim Firewall Export Gate</span>
                  <span className="text-emerald-400 font-mono">Verified Analysis</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#080807] border border-[#23211b]">
                  <span className="text-[#faf8f5]">Supported Formats</span>
                  <span className="text-[#b3a78f] font-mono">Client DOCX &amp; Vector PDF</span>
                </div>
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
              <span className="font-bold tracking-widest text-[#faf8f5] uppercase">RECLENS</span>
              <span>—</span>
              <span>Evidence-First Proposal Engineering</span>
            </div>

            <div className="flex items-center gap-6 text-[#b3a78f]">
              <TransitionLink href="/projects" className="hover:text-[#faf8f5] transition-colors">
                My Projects
              </TransitionLink>
              <TransitionLink href="/projects/demo-rfp-001" className="hover:text-[#faf8f5] transition-colors">
                Reference Demo
              </TransitionLink>
              <a href="#understand" className="hover:text-[#faf8f5] transition-colors">
                Back to Top ↑
              </a>
            </div>

            <p>© 2026 RecLens Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Upload RFP Modal */}
      {isUploadOpen && <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />}
    </div>
  );
}
