"use client";

import React, { useState } from "react";
import { EditorialPageShell } from "@/components/editorial/EditorialPageShell";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { EditorialCTA } from "@/components/editorial/EditorialCTA";
import { EditorialLink } from "@/components/editorial/EditorialLink";
import { UploadModal } from "@/components/UploadModal";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  Database,
  Search,
  Layers,
  Scale,
  Cpu,
  Target
} from "lucide-react";

export default function InsightsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const claimTaxonomy = [
    {
      type: "RFP FACT",
      badge: "Source Grounded",
      color: "text-[#cda76e]",
      border: "border-[#4a3d28]",
      bg: "bg-[#181510]",
      desc: "Direct tender mandates, explicit security standards, technical constraints, and evaluation criteria explicitly cited in the RFP text with exact page and section coordinates.",
      example: "Mandatory TLS 1.3 in-transit, AES-256 at-rest, MeitY cloud service provider empanelment, FIDO2/TOTP multi-factor authentication.",
    },
    {
      type: "PROPOSED DESIGN",
      badge: "Engineered Solution",
      color: "text-[#8cb4e6]",
      border: "border-[#25374e]",
      bg: "bg-[#0f151c]",
      desc: "Technical architecture choices, component topologies, software versions, and delivery methodologies engineered to satisfy tender requirements without violating RFP bounds.",
      example: "PostgreSQL 16 HA cluster with streaming replication, Kong API Gateway ingress controller, Amazon EKS multi-AZ deployment across private subnets.",
    },
    {
      type: "ASSUMPTION",
      badge: "Explicit Baseline",
      color: "text-[#e6c280]",
      border: "border-[#443820]",
      bg: "bg-[#16130b]",
      desc: "Operational baselines, client-provided prerequisites, network readiness dependencies, and sizing assumptions recorded in the project assumption ledger to protect delivery scope.",
      example: "Client security team provides SAML 2.0 / OIDC federation endpoints by Implementation Week 2; direct staging VPC peering pre-provisioned.",
    },
    {
      type: "NEEDS REVIEW",
      badge: "High Risk / Ambiguous",
      color: "text-[#f07b7b]",
      border: "border-[#4d2424]",
      bg: "bg-[#1a0f0f]",
      desc: "Statements carrying commercial risk, ambiguous tender clauses, unbacked aggressive delivery timelines, or commitments that require human proposal manager sign-off.",
      example: "Unbacked zero-downtime database cross-region cutover in 4 hours; unsupported proprietary licensing waivers without formal client addendum.",
    },
  ];

  const intelligencePillars = [
    {
      num: "01",
      title: "DOCUMENT GEOMETRY & GROUNDING",
      desc: "RFPs are not flat text. RequeLens parses multi-level section trees, tables, annexures, and schedules. Every extracted requirement retains exact document coordinates.",
      icon: <FileText className="w-5 h-5 text-[#cda76e]" />,
    },
    {
      num: "02",
      title: "REQUIREMENT NORMALIZATION",
      desc: "Raw tender sentences are normalized into atomic, testable requirements categorized by domain (Security, Architecture, SLAs, Governance) with priority weighting.",
      icon: <Layers className="w-5 h-5 text-[#cda76e]" />,
    },
    {
      num: "03",
      title: "RISK & CONTRADICTION AUDIT",
      desc: "Cross-clause contradiction engine identifies conflicting clauses across legal, commercial, and technical chapters before proposal response kickoff.",
      icon: <Scale className="w-5 h-5 text-[#cda76e]" />,
    },
    {
      num: "04",
      title: "CLAIM FIREWALL INDEPENDENT AUDIT",
      desc: "Generated proposal assertions are challenged against source RFP evidence before acceptance. Every sentence is audited into a verified grounding score.",
      icon: <ShieldCheck className="w-5 h-5 text-[#cda76e]" />,
    },
  ];

  return (
    <EditorialPageShell pageWatermark="/ rfp intelligence & insights">
      {/* 1. Hero Section */}
      <EditorialHero
        category="/ rfp intelligence & insights"
        pageNumber="02/04"
        title="RFP INTELLIGENCE & INSIGHTS"
        subtitle="How RequeLens transforms hundreds of distributed RFP pages into structured, auditable, and evidence-grounded intelligence."
      />

      {/* 2. Intro Statement: Beyond Document Summarization */}
      <section className="py-12 sm:py-20 border-b border-[#24211a]/80 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-7">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#f4f2ec] leading-snug font-serif">
            RequeLens does more than summarize documents.
            <span className="block text-[#cda76e] font-normal mt-2">
              It converts raw RFP text into structured, auditable decision intelligence.
            </span>
          </h2>
        </div>

        <div className="lg:col-span-5 space-y-4 text-sm sm:text-base text-[#9e8e7a] font-sans leading-relaxed">
          <p>
            Traditional generative AI tools treat complex solicitations as generic prompts, generating fluent answers
            that blur the line between what the client actually requested and what the model hallucinated.
          </p>
          <p>
            In high-stakes enterprise bids, an ungrounded claim is a legal and delivery liability. RequeLens operates
            under an evidence-first standard: every requirement, risk score, architectural choice, and proposal commitment
            maintains an unbroken lineage back to the originating tender.
          </p>
        </div>
      </section>

      {/* 3. The 4 Pillars of RFP Intelligence */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            01 / RFP Intelligence Architecture
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Deterministic & Traceable
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {intelligencePillars.map((pillar) => (
            <div
              key={pillar.num}
              className="p-6 rounded-2xl bg-[#0e0d0b] border border-[#23201a] space-y-4 hover:border-[#3d3628] transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-light text-[#cda76e] font-serif">
                  {pillar.num}
                </span>
                <div className="p-2 rounded-lg bg-[#171512] border border-[#2b261f]">
                  {pillar.icon}
                </div>
              </div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-[#f4f2ec] font-mono">
                {pillar.title}
              </h4>
              <p className="text-xs text-[#9e8e7a] leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. End-to-End Traceability Chain */}
      <section className="py-16 sm:py-24 border-b border-[#24211a]/80 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            02 / Continuous Provenance Chain
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Source to Claim Lineage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { step: "01", name: "SOURCE RFP", desc: "Original PDF/Word text, section hierarchy, and table coordinates." },
            { step: "02", name: "REQUIREMENT", desc: "Normalized atomic requirement tagged with domain, priority, and ambiguity score." },
            { step: "03", name: "RISK AUDIT", desc: "Contradiction matrix and high-risk penalty identification." },
            { step: "04", name: "SOLUTION DESIGN", desc: "Target architectural component or process engineered to satisfy the requirement." },
            { step: "05", name: "PROPOSAL CONTENT", desc: "Synthesized executive response, compliance statement, and technical narrative." },
            { step: "06", name: "CLAIM FIREWALL", desc: "Phase 3 independent audit classifying claim validity and grounding score." },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl bg-[#0e0d0b] border border-[#23201a] space-y-3 relative group hover:border-[#3d3628] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#cda76e]">{item.step}</span>
                {idx < 5 && (
                  <span className="hidden lg:inline text-xs font-mono text-[#4a4233]">→</span>
                )}
              </div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#f4f2ec] font-mono">
                {item.name}
              </h4>
              <p className="text-[11px] text-[#9e8e7a] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Claim Classification Taxonomy (Phase 3 Verification Engine) */}
      <section className="py-16 sm:py-24 space-y-12">
        <div className="flex items-center justify-between border-b border-[#24211a] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#cda76e]">
            03 / Claim Classification Taxonomy
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#8a7a67]">
            Claim Firewall Standards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {claimTaxonomy.map((item) => (
            <div
              key={item.type}
              className={`p-6 sm:p-8 rounded-2xl ${item.bg} border ${item.border} space-y-4 transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-base sm:text-lg font-bold font-mono tracking-widest ${item.color}`}>
                  {item.type}
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#080807] border border-[#2d2922] text-[#8a7a67]">
                  {item.badge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#f4f2ec]/90 leading-relaxed">
                {item.desc}
              </p>

              <div className="pt-3 border-t border-[#23201a]/80 text-[11px] font-mono text-[#8a7a67] space-y-1">
                <span className="text-[#a89b87] font-semibold block">Example in Live Analysis:</span>
                <span className="text-[#cda76e]/90 italic">{item.example}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Project Reference Callout */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#14120f] border border-[#2d271e] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#cda76e]">
              Real-World Verification
            </span>
            <h4 className="text-lg sm:text-xl font-light text-[#f4f2ec] font-serif">
              Inspect 42 real audited claims in Project Model RFP Cloud Services
            </h4>
          </div>

          <EditorialLink href="/projects/proj-fbf85b77">
            Open Real Project Workspace
          </EditorialLink>
        </div>
      </section>

      {/* 6. Closing CTA */}
      <EditorialCTA
        label="VERIFIED INTELLIGENCE"
        title="EXPERIENCE AUDITABLE PROPOSAL INTELLIGENCE."
        subtitle="Read. Reason. Verify. Propose."
        ctaText="ANALYZE AN RFP ↗"
        onAction={() => setIsUploadOpen(true)}
      />

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </EditorialPageShell>
  );
}

