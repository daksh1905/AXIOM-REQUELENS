"use client";

import React, { useState } from "react";
import { EditorialPageShell } from "@/components/editorial/EditorialPageShell";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { EditorialCTA } from "@/components/editorial/EditorialCTA";
import { EditorialLink } from "@/components/editorial/EditorialLink";
import { UploadModal } from "@/components/UploadModal";
import { TransitionLink } from "@/context/TransitionContext";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Layers,
  Scale,
  Sparkles,
  Search,
  UserCheck,
  HelpCircle,
  Eye,
  Check
} from "lucide-react";

export default function AboutUsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const workflowSteps = [
    {
      num: "01",
      name: "INGEST",
      desc: "Decompose complex multi-hundred-page RFPs across section hierarchies, schedules, and tables without data loss.",
    },
    {
      num: "02",
      name: "EXTRACT",
      desc: "Isolate and normalize testable requirements categorized by domain, maintaining exact page and paragraph citations.",
    },
    {
      num: "03",
      name: "ANALYZE",
      desc: "Detect cross-clause contradictions, high-risk penalties, and compliance ambiguities before response kickoff.",
    },
    {
      num: "04",
      name: "DESIGN",
      desc: "Synthesize target cloud architecture, technology stacks, delivery timelines, and explicit operational assumptions.",
    },
    {
      num: "05",
      name: "GENERATE",
      desc: "Draft structured proposal chapters, executive summaries, and compliance matrices from verified project models.",
    },
    {
      num: "06",
      name: "VERIFY",
      desc: "The Claim Firewall audits every generated assertion against source evidence before outputs are trusted.",
    },
    {
      num: "07",
      name: "TRACE",
      desc: "Bind requirements, architectural choices, proposal text, and verification records into an unbroken audit chain.",
    },
  ];

  const claimClassifications = [
    {
      label: "RFP FACT",
      badge: "Direct Ground Truth",
      color: "text-[#cda76e]",
      bg: "bg-[#181510]",
      border: "border-[#4a3d28]",
      desc: "Information directly grounded in the source RFP text with verifiable section coordinates.",
    },
    {
      label: "PROPOSED DESIGN",
      badge: "Engineering Choice",
      color: "text-[#8cb4e6]",
      bg: "bg-[#0f151c]",
      border: "border-[#25374e]",
      desc: "A solution, architecture pattern, or technology recommendation proposed by RequeLens.",
    },
    {
      label: "ASSUMPTION",
      badge: "Explicit Baseline",
      color: "text-[#e6c280]",
      bg: "bg-[#16130b]",
      border: "border-[#443820]",
      desc: "An operational prerequisite or planning premise not guaranteed by the tender text.",
    },
    {
      label: "NEEDS REVIEW",
      badge: "Human Attention",
      color: "text-[#f07b7b]",
      bg: "bg-[#1a0f0f]",
      border: "border-[#4d2424]",
      desc: "A statement requiring human proposal manager verification, clarification, or legal approval.",
    },
    {
      label: "UNSUPPORTED CLAIM",
      badge: "Unbacked Assertion",
      color: "text-[#e05252]",
      bg: "bg-[#210d0d]",
      border: "border-[#5c2424]",
      desc: "An assertive statement that cannot be substantiated by source RFP evidence or design rationale.",
    },
  ];

  const principles = [
    {
      num: "01",
      title: "TRACE EVERYTHING",
      desc: "Important conclusions, architecture decisions, and commercial promises should remain permanently connected to their origin.",
    },
    {
      num: "02",
      title: "SEPARATE FACT FROM DESIGN",
      desc: "What the RFP requires and what RequeLens proposes must never be confused. Conflating design choices with client mandates invites disqualification.",
    },
    {
      num: "03",
      title: "SURFACE UNCERTAINTY",
      desc: "Ambiguity, conflicting requirements, and unbacked assumptions should remain visible rather than being hidden behind confident AI language.",
    },
    {
      num: "04",
      title: "VERIFY BEFORE TRUST",
      desc: "Generated proposal content must be challenged by independent audit mechanisms before becoming final proposal commitments.",
    },
  ];

  return (
    <EditorialPageShell pageWatermark="/ about requelens story">
      {/* ========================================================================= */}
      {/* HERO SECTION — EDITORIAL HEADER + INTERACTIVE 360° CINEMATIC VISUAL       */}
      {/* ========================================================================= */}
      <EditorialHero
        category="/ about requelens story"
        pageNumber="01/04"
        title="ABOUT REQUELENS"
        subtitle="Turning complex RFPs into traceable, verifiable proposal intelligence."
      />

      {/* Hero Narrative Intro */}
      <section className="py-12 sm:py-20 border-b border-[#24211a]/80 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-7">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#f4f2ec] leading-snug font-serif">
            Large enterprise and public sector RFPs can span hundreds of pages.
            <span className="block text-[#cda76e] font-normal mt-2">
              Critical requirements are scattered across technical, legal, security, and delivery chapters.
            </span>
          </h2>
        </div>

        <div className="lg:col-span-5 space-y-4 text-sm sm:text-base text-[#9e8e7a] font-sans leading-relaxed">
          <p>
            When responding to complex solicitations, bid teams navigate dense annexures, contradictory schedules,
            and stringent compliance mandates. A single overlooked penalty or unverified architecture claim can result
            in immediate bid disqualification or severe liquidated damages.
          </p>
          <p>
            RequeLens was engineered to transform these dense documents into structured, evidence-backed proposal
            intelligence—while ensuring every conclusion, recommendation, and commitment remains anchored to its source.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 01 / THE PROBLEM — RFPs ARE DIFFICULT FOR THE WRONG REASONS                */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            01 / The Problem
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            The Proposal Dilemma
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#f4f2ec] leading-snug font-serif">
              RFPs are difficult for the wrong reasons.
            </h3>
            <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
              Proposal teams spend 80% of their time on manual forensic document work rather than crafting superior
              solutions. They manually sift through 500-page tenders to isolate mandatory clauses, identify contradictory
              SLA penalties, and reconcile conflicting commercial guidelines.
            </p>
            <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
              The problem is not simply writing a proposal. The harder problem is maintaining a reliable, auditable chain
              from source text to final commitments.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0d0b] border border-[#24211a] space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#cda76e]">
                The Broken Manual Chain
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { step: "SOURCE", desc: "Hundreds of dense, unindexed pages" },
                  { step: "REQUIREMENT", desc: "Scattered across conflicting annexures" },
                  { step: "DECISION", desc: "Ungrounded technical assumptions" },
                  { step: "PROPOSAL", desc: "Fluent narrative lacking citations" },
                  { step: "VERIFICATION", desc: "Late-stage panic during executive review" },
                ].map((item, idx) => (
                  <div key={item.step} className="p-3 rounded-xl bg-[#14120f] border border-[#23201a] space-y-1">
                    <span className="text-[10px] font-mono text-[#8a7a67]">0{idx + 1}</span>
                    <h5 className="text-xs font-mono uppercase text-[#f4f2ec] font-semibold">{item.step}</h5>
                    <p className="text-[10px] text-[#9e8e7a] leading-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 02 / WHAT WE BUILT — FROM DOCUMENT TO DECISION INTELLIGENCE               */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            02 / What We Built
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            7-Stage Pipeline
          </span>
        </div>

        <div className="space-y-4 max-w-3xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#f4f2ec] leading-snug font-serif">
            From document to decision intelligence.
          </h3>
          <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
            RequeLens is an AI-powered proposal intelligence and verification system. It decomposes tender documents
            into a structured knowledge graph, generates compliant solution architectures, and independently verifies
            its own claims before stakeholder submission.
          </p>
        </div>

        {/* 7-Step Workflow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 pt-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.num}
              className="p-5 rounded-2xl bg-[#0e0d0b] border border-[#23201a] space-y-2 relative group hover:border-[#3d3628] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#cda76e]">{step.num}</span>
                {idx < 6 && (
                  <span className="hidden lg:inline text-xs font-mono text-[#4a4233]">→</span>
                )}
              </div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#f4f2ec] font-mono">
                {step.name}
              </h4>
              <p className="text-[11px] text-[#9e8e7a] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03 / CORE PRINCIPLE — AI SHOULD NOT JUST GENERATE                          */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            03 / Core Principle
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Evidence-Backed Generation
          </span>
        </div>

        <div className="space-y-6 max-w-4xl">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#f4f2ec] font-serif leading-tight">
            &ldquo;AI should not just generate.
            <span className="block text-[#cda76e] mt-1">
              It should be able to explain why.&rdquo;
            </span>
          </h3>
          <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
            In standard generative workflows, a fluent sentence generated by an LLM is treated as fact. RequeLens
            fundamentally separates tender requirements from proposed solutions and operational assumptions.
            Every generated claim is audited into one of five rigorous classifications:
          </p>
        </div>

        {/* 5 Claim Classifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
          {claimClassifications.map((item) => (
            <div
              key={item.label}
              className={`p-5 rounded-2xl ${item.bg} border ${item.border} space-y-3 transition-all`}
            >
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-mono font-bold tracking-wider ${item.color}`}>
                  {item.label}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#8a7a67]">
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-[#f4f2ec]/85 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04 / CLAIM FIREWALL — GENERATION IS ONLY HALF THE SYSTEM                   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            04 / Claim Firewall
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Independent Verification Engine
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#f4f2ec] leading-snug font-serif">
              Generation is only half the system.
            </h3>
            <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
              The core differentiator of RequeLens is its <span className="text-[#f4f2ec] font-semibold">Claim Firewall</span>.
              Proposal generation and proposal verification are intentionally isolated into opposing systems.
              RequeLens does not blindly trust its own generated narrative.
            </p>
            <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
              Every sentence of generated architecture, technology stack, and timeline commitments is extracted into
              individual claims, verified against source RFP evidence, and scored for proposal grounding.
            </p>

            <div className="p-6 rounded-2xl bg-[#14120f] border border-[#2d271e] space-y-2">
              <span className="text-[10px] font-mono text-[#cda76e] uppercase tracking-widest block">
                The RequeLens Firewall Mandate
              </span>
              <p className="text-lg sm:text-xl font-light text-[#f4f2ec] font-serif italic">
                &ldquo;AI writes it. AI audits it. Humans approve it.&rdquo;
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0d0b] border border-[#24211a] space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
                Firewall Verification Sequence
              </span>

              <div className="space-y-3">
                {[
                  { step: "01", name: "PROPOSAL GENERATION", desc: "Automated synthesis of compliant response chapters" },
                  { step: "02", name: "CLAIM EXTRACTION", desc: "Deconstruct text into atomic factual assertions" },
                  { step: "03", name: "EVIDENCE VERIFICATION", desc: "Cross-check assertions against source tender text" },
                  { step: "04", name: "CLASSIFICATION", desc: "Categorize into Fact, Proposed Design, or Assumption" },
                  { step: "05", name: "HUMAN REVIEW", desc: "Accept proposed rewrites or flag unsupported assertions" },
                  { step: "06", name: "VERIFIED PROPOSAL", desc: "Locked, fully grounded proposal dossier for submission" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-3 rounded-xl bg-[#14120f] border border-[#23201a]">
                    <span className="text-xs font-mono text-[#cda76e] pt-0.5">{item.step}</span>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-mono uppercase text-[#f4f2ec] font-semibold">{item.name}</h5>
                      <p className="text-[11px] text-[#9e8e7a]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 05 / TRACEABILITY — EVERY DECISION SHOULD HAVE A PATH BACK                */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            05 / Traceability
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Full Provenance Lineage
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#f4f2ec] leading-snug font-serif">
              Every decision should have a path back.
            </h3>
            <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
              When an evaluator asks why a specific database engine, clustering topology, or security cipher was
              chosen, the response team must possess an immediate, auditable trail.
            </p>
            <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
              RequeLens connects each architectural component, timeline duration, and compliance declaration back to
              the exact requirement ID, section number, and page coordinates of the source RFP.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0d0b] border border-[#24211a] space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
                Live Traceability Lineage
              </span>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { level: "SOURCE RFP", val: "Section 4.2.1 • Security & Sovereignty Mandates (Page 84)" },
                  { level: "REQUIREMENT", val: "REQ-SEC-012: In-transit encryption using TLS 1.3 with AES-256 GCM" },
                  { level: "ARCHITECTURE", val: "Kong API Gateway Ingress Controller • TLS Termination Layer" },
                  { level: "DECISION", val: "Private subnet termination with automated cert rotation via ACM" },
                  { level: "PROPOSAL SECTION", val: "Chapter 3.4 • Security Architecture & Data Protection Controls" },
                  { level: "VERIFIED CLAIM", val: "CLM-004: Classified as RFP Fact • Grounding Score 100/100" },
                ].map((item, idx) => (
                  <div key={item.level} className="p-3 rounded-xl bg-[#14120f] border border-[#23201a] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[#8a7a67] text-[10px] tracking-wider uppercase shrink-0">
                      0{idx + 1} / {item.level}
                    </span>
                    <span className="text-[#f4f2ec] text-[11px] sm:text-right truncate">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 06 / HUMAN IN THE LOOP — ASSIST JUDGMENT, NOT REPLACE IT                  */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            06 / Human in the Loop
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Responsible AI
          </span>
        </div>

        <div className="space-y-6 max-w-4xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#f4f2ec] leading-snug font-serif">
            Built to assist judgment, not replace it.
          </h3>
          <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
            RequeLens never hides uncertainty behind polished prose. When tender clauses are ambiguous, contradictory,
            or missing critical specifications, the system surfaces those ambiguities with explicit risk scores.
          </p>
          <p className="text-sm sm:text-base text-[#9e8e7a] leading-relaxed">
            Human proposal managers retain complete control: accepting recommended rewrites, editing architectural
            assumptions, or overriding claim classifications prior to final export.
          </p>

          <div className="p-8 sm:p-10 rounded-2xl bg-[#14120f] border border-[#2d271e] text-center space-y-2">
            <span className="text-[10px] font-mono text-[#cda76e] uppercase tracking-widest block">
              Core Philosophy
            </span>
            <p className="text-xl sm:text-2xl md:text-3xl font-light text-[#f4f2ec] font-serif italic">
              &ldquo;Confidence should come from evidence, not fluent language.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 07 / WHAT MAKES REQUELENS DIFFERENT — THE ARCHITECTURAL COMPARISON        */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            07 / What Makes RequeLens Different
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Architectural Differentiation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Traditional Workflow */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0b0a] border border-[#24211a] space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
                Traditional Generative Workflow
              </span>
              <h4 className="text-lg sm:text-xl font-light text-[#f4f2ec] font-serif">
                Unstructured Text Ingestion
              </h4>
              <p className="text-xs sm:text-sm text-[#9e8e7a] leading-relaxed">
                Generic LLMs ingest RFP text as an undifferentiated token block, hallucinating architectural versions,
                inventing unrequested certifications, and burying legal risks behind confident wording.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#12100d] border border-[#23201a] font-mono text-xs text-[#8a7a67] space-y-2">
              <div className="flex items-center gap-2 text-[#9e8e7a]">
                <span className="text-red-400">✕</span> RFP Document
              </div>
              <div className="text-[#3d3628] pl-4">↓ Generic Prompt</div>
              <div className="flex items-center gap-2 text-[#9e8e7a]">
                <span className="text-red-400">✕</span> Unverified Proposal (High Risk)
              </div>
            </div>
          </div>

          {/* RequeLens Workflow */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#14120f] border border-[#4a3d28] space-y-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#cda76e]">
                <Sparkles className="w-3 h-3 text-[#cda76e]" />
                <span>RequeLens Intelligence Pipeline</span>
              </div>
              <h4 className="text-lg sm:text-xl font-light text-[#f4f2ec] font-serif">
                Evidence-First Verification Architecture
              </h4>
              <p className="text-xs sm:text-sm text-[#f4f2ec]/90 leading-relaxed">
                RequeLens treats proposal response as an intelligence and verification challenge. Requirements are
                normalized, contradictions detected, architectures grounded, and all claims independently challenged.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#181510] border border-[#3d3220] font-mono text-xs text-[#cda76e] space-y-1.5">
              <div className="flex items-center gap-2 text-[#f4f2ec]">
                <Check className="w-3.5 h-3.5 text-[#5cb85c]" /> RFP Source Ingestion
              </div>
              <div className="text-[#5c4c33] pl-4">↓ Requirement Intelligence & Risk Scoring</div>
              <div className="flex items-center gap-2 text-[#f4f2ec]">
                <Check className="w-3.5 h-3.5 text-[#5cb85c]" /> Grounded Architecture Design
              </div>
              <div className="text-[#5c4c33] pl-4">↓ Claim Firewall Audit & Grounding Score</div>
              <div className="flex items-center gap-2 text-[#f4f2ec]">
                <Check className="w-3.5 h-3.5 text-[#5cb85c]" /> Verified, Auditable Proposal Dossier
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 08 / WHY THE NAME REQUELENS                                               */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-8">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            08 / Brand Etymology
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Identity
          </span>
        </div>

        <div className="max-w-2xl space-y-4">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#f4f2ec] leading-snug font-serif">
            Why RequeLens?
          </h3>
          <p className="text-base sm:text-lg text-[#f4f2ec]/90 leading-relaxed font-light">
            <span className="text-[#cda76e] font-semibold">&ldquo;Reque&rdquo;</span> represents the complex, distributed universe of tender <span className="text-[#f4f2ec] font-semibold">Requirements</span>.
          </p>
          <p className="text-base sm:text-lg text-[#f4f2ec]/90 leading-relaxed font-light">
            <span className="text-[#cda76e] font-semibold">&ldquo;Lens&rdquo;</span> represents the analytical <span className="text-[#f4f2ec] font-semibold">Lens</span> through which requirements are brought into sharp focus, connected, and independently verified.
          </p>
          <p className="text-sm text-[#9e8e7a] pt-2">
            Together, RequeLens stands for requirements viewed through a lens of intelligence, precision, and evidence.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 09 / OUR PRINCIPLES — FOUR PILLARS                                        */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            09 / Our Principles
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Foundational Charter
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {principles.map((principle) => (
            <div
              key={principle.num}
              className="p-6 sm:p-8 rounded-2xl bg-[#0e0d0b] border border-[#23201a] space-y-3 hover:border-[#3d3628] transition-all"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
                {principle.num} / Principle
              </span>
              <h4 className="text-lg sm:text-xl font-light text-[#f4f2ec] font-serif uppercase tracking-tight">
                {principle.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#9e8e7a] leading-relaxed">
                {principle.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10 / FINAL CTA — FROM RFP TO VERIFIED PROPOSAL                             */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-32 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#cda76e]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-3xl mx-auto px-4 relative z-10 flex flex-col items-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2d2922] bg-[#171512] text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            <Sparkles className="w-3 h-3 text-[#cda76e]" />
            <span>REQUELENS PLATFORM</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#f4f2ec] uppercase leading-tight font-serif">
            FROM RFP TO VERIFIED PROPOSAL.
          </h2>

          <p className="text-base sm:text-lg text-[#9e8e7a] tracking-wide font-sans">
            &ldquo;Read. Reason. Verify. Propose.&rdquo;
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#080807] bg-gradient-to-r from-[#d4af7a] via-[#cda76e] to-[#b08d4b] hover:from-[#e0c79b] hover:to-[#cda76e] shadow-lg shadow-[#b08d4b]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>ANALYZE AN RFP</span>
              <ArrowUpRight className="w-4 h-4 text-[#080807] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <TransitionLink
              href="/insights"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-xs sm:text-sm font-medium tracking-widest uppercase text-[#f4f2ec] bg-[#14120f] hover:bg-[#1d1a15] border border-[#2d271e] transition-all"
            >
              <span>EXPLORE INSIGHTS →</span>
            </TransitionLink>
          </div>
        </div>
      </section>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </EditorialPageShell>
  );
}
