const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/api/projects`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function fetchProject(id: string) {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

export async function fetchDemoProject() {
  const res = await fetch(`${API_BASE}/api/projects/demo`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch demo project");
  return res.json();
}

export async function fetchProgress(id: string) {
  const res = await fetch(`${API_BASE}/api/projects/${id}/progress`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json();
}

export async function uploadRFP(file: File, projectName?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (projectName) {
    formData.append("project_name", projectName);
  }
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function updateReview(projectId: string, reviewId: string, status: string, notes?: string) {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/reviews/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error("Failed to update review status");
  return res.json();
}

export async function updateClarification(projectId: string, clarId: string, status: string, response?: string) {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/clarifications/${clarId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, response }),
  });
  if (!res.ok) throw new Error("Failed to update clarification");
  return res.json();
}

export async function askChat(projectId: string, query: string) {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Failed to execute query");
  return res.json();
}

export function getExportDocxUrl(projectId: string) {
  return `${API_BASE}/api/projects/${projectId}/export/docx`;
}

export function getExportPdfUrl(projectId: string) {
  return `${API_BASE}/api/projects/${projectId}/export/pdf`;
}

