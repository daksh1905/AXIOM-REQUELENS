"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, ArrowRight } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900">
        {!isUploading && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            Evidence-First RFP Analysis
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            {isUploading ? "Analyzing Client RFP Document" : "Upload Client RFP"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {isUploading
              ? "RecLens is extracting requirements, auditing risks, and synthesizing architecture..."
              : "Upload PDF or DOCX RFP specifications to begin automated evidence extraction."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isUploading ? (
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50"
                  : selectedFile
                  ? "border-emerald-500 bg-emerald-50/30"
                  : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
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

              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {selectedFile ? selectedFile.name : "Click to browse or drag & drop document"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF or DOCX up to 50MB with full page citations
              </p>
            </div>

            {/* File info preview */}
            {selectedFile && (
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{selectedFile.name}</span>
                  <span className="text-slate-500 shrink-0">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Optional Project Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name (Optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Global Bank Core Trading RFP"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile}
                onClick={handleStartAnalysis}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-blue-500/20 transition"
              >
                Analyze RFP
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Live Processing Pipeline View */
          <div className="space-y-5 py-2">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  {currentStep}
                </span>
                <span className="font-mono text-blue-600">{percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 text-xs">
              {[
                "Parsing document & page metadata",
                "Page-aware chunking",
                "Extracting requirements",
                "Analyzing ambiguities",
                "Checking contradictions",
                "Analyzing risks",
                "Generating clarifications",
                "Generating solution architecture",
                "Estimating delivery timeline & team",
                "Generating technical proposal",
                "Proposal Claim Firewall audit",
                "Traceability matrix"
              ].map((step, idx) => {
                const isDone = completedSteps.some(s => s.toLowerCase().includes(step.toLowerCase().slice(0, 8)));
                const isCurrent = currentStep.toLowerCase().includes(step.toLowerCase().slice(0, 8));
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span className={isDone ? "text-slate-800 font-medium" : isCurrent ? "text-blue-600 font-semibold flex items-center gap-1.5" : "text-slate-400"}>
                      {isCurrent && <Loader2 className="w-3 h-3 animate-spin" />}
                      {step}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">In Progress</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-200" />
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-center text-slate-500 italic">
              Evidence-first processing: parsing every requirement with source page and section verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

