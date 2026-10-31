"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, ArrowRight, Sparkles } from "lucide-react";
import { uploadRFP, fetchProgress } from "@/lib/api";
import { usePageTransition } from "@/context/TransitionContext";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const router = useRouter();
  const { navigateTo } = usePageTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pipeline state
  const [isUploading, setIsUploading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("Initializing...");
  const [percent, setPercent] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setError("Unsupported file format. Please upload a .pdf or .docx document.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File exceeds 50MB limit.");
      return;
    }
    setSelectedFile(file);
    if (!projectName) {
      setProjectName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const pollPipeline = async (pId: string) => {
    const interval = setInterval(async () => {
      try {
        const prog = await fetchProgress(pId);
        setCurrentStep(prog.current_step);
        setPercent(prog.percent);
        setCompletedSteps(prog.completed_steps || []);
        
        if (prog.percent >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onClose();
            navigateTo(`/projects/${pId}`);
          }, 600);
        }
      } catch (e) {
        console.error("Progress poll failed", e);
      }
    }, 1000);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    setCurrentStep("Uploading RFP document...");
    setPercent(5);

    try {
      const res = await uploadRFP(selectedFile, projectName);
      setProjectId(res.project_id);
      pollPipeline(res.project_id);
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || "Failed to initiate analysis pipeline.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Sleek, lighter container matching site palette with high contrast and simplicity */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#1d1f2b] border border-zinc-600/70 shadow-2xl p-6 sm:p-7 text-zinc-100">
        {!isUploading && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/25 mb-2.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            AI RFP Intelligence Engine
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-white">
            {isUploading ? "Analyzing Client RFP Document" : "Upload RFP Specification"}
          </h3>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
            {isUploading
              ? "RecLens is extracting requirements, auditing risks, and synthesizing architecture..."
              : "Upload client PDF or DOCX documents to extract requirements with page-accurate evidence citations."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {!isUploading ? (
          <div className="space-y-4">
            {/* Lighter, simplified Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-amber-400 bg-amber-500/15"
                  : selectedFile
                  ? "border-emerald-500/60 bg-emerald-950/30"
                  : "border-zinc-600/70 hover:border-amber-400/60 bg-zinc-800/40 hover:bg-zinc-800/70"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="mx-auto w-12 h-12 rounded-xl bg-zinc-800 text-amber-400 border border-zinc-600 flex items-center justify-center mb-2.5 shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-zinc-100">
                {selectedFile ? selectedFile.name : "Choose an RFP file or drag & drop"}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Supports PDF or DOCX (up to 50MB) with full table & OCR extraction
              </p>
            </div>

            {/* File Info Preview */}
            {selectedFile && (
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-600/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-zinc-100 truncate">{selectedFile.name}</span>
                  <span className="text-zinc-400 font-mono shrink-0">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-zinc-400 hover:text-red-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Optional Project Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-200 mb-1">
                Project Name (Optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Enterprise Cloud ITSM Platform"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-800/80 border border-zinc-600/70 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile}
                onClick={handleStartAnalysis}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition cursor-pointer"
              >
                <span>Run Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Simplified Live Processing Pipeline View */
          <div className="space-y-4 py-1">
            {/* Progress Bar & Current Status */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 text-zinc-100 font-medium">
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  {currentStep}
                </span>
                <span className="font-mono text-amber-400 font-bold text-sm">{percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Simplified 4-Stage Workflow Checklist */}
            <div className="rounded-xl border border-zinc-600/70 bg-zinc-800/50 p-4 space-y-3 text-xs">
              {[
                { label: "Document Ingestion & OCR", check: "parsing" },
                { label: "Requirement Extraction & Normalization", check: "extracting" },
                { label: "Risk & Contradiction Audit", check: "analyzing" },
                { label: "Architecture & Proposal Generation", check: "proposal" },
              ].map((stage, idx) => {
                const isDone = completedSteps.some(s => s.toLowerCase().includes(stage.check));
                const isCurrent = currentStep.toLowerCase().includes(stage.check);
                return (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-zinc-700/50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-zinc-500 flex items-center justify-center text-[10px] text-zinc-400">
                          {idx + 1}
                        </span>
                      )}
                      <span className={isDone ? "text-zinc-100 font-medium" : isCurrent ? "text-amber-300 font-medium" : "text-zinc-400"}>
                        {stage.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono">
                      {isDone ? (
                        <span className="text-emerald-400 font-medium">Completed</span>
                      ) : isCurrent ? (
                        <span className="text-amber-300 font-semibold">In Progress</span>
                      ) : (
                        <span className="text-zinc-500">Pending</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-center text-zinc-400 italic">
              Evidence-first processing: parsing every requirement with source page and section verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
