const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function fetchWithFallback(urlPath: string, options: RequestInit = {}): Promise<Response> {
  const primaryUrl = `${API_BASE}${urlPath}`;
  const altBase = API_BASE.includes("127.0.0.1")
    ? API_BASE.replace("127.0.0.1", "localhost")
    : API_BASE.replace("localhost", "127.0.0.1");
  const secondaryUrl = `${altBase}${urlPath}`;

  try {
    const res = await fetch(primaryUrl, { ...options, cache: "no-store" });
    if (res.ok) return res;
    // If not ok (e.g. 404 or 500), try secondary if host might differ
    if (res.status >= 500 || res.status === 404) {
      const altRes = await fetch(secondaryUrl, { ...options, cache: "no-store" }).catch(() => null);
      if (altRes && altRes.ok) return altRes;
    }
    return res;
  } catch (primaryErr) {
    // Network error on primary host (e.g. refused IPv6), try secondary host
    try {
      const res2 = await fetch(secondaryUrl, { ...options, cache: "no-store" });
      return res2;
    } catch (secErr) {
      throw primaryErr;
    }
  }
}

export async function fetchProjects() {
  const res = await fetchWithFallback("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function fetchProject(id: string) {
  const res = await fetchWithFallback(`/api/projects/${id}`);
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch project (${res.status}: ${errText || res.statusText})`);
  }
  return res.json();
}

export async function fetchDemoProject() {
  const res = await fetchWithFallback("/api/projects/demo");
  if (!res.ok) throw new Error("Failed to fetch demo project");
  return res.json();
}

export async function fetchProgress(id: string) {
  const res = await fetchWithFallback(`/api/projects/${id}/progress`);
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

export function getReportDocxUrl(projectId: string) {
  return `${API_BASE}/api/projects/${projectId}/report/docx`;
}

export function getReportPdfUrl(projectId: string) {
  return `${API_BASE}/api/projects/${projectId}/report/pdf`;
}

export async function updateClaimAction(
  projectId: string,
  claimId: string,
  action: "accept_rewrite" | "reject" | "edit" | "mark_reviewed" | string,
  customText?: string,
  notes?: string
) {
  const urlPath = `/api/projects/${projectId}/claims/${claimId}/action`;
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, custom_text: customText || null, notes: notes || null }),
  };

  const res = await fetchWithFallback(urlPath, options);
  if (!res.ok) {
    let detailMsg = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData && errData.detail) {
        detailMsg = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore parsing error
    }
    console.error(`[API] Claim action failed (${urlPath}):`, { status: res.status, detail: detailMsg, action });
    throw new Error(detailMsg);
  }
  return res.json();
}

