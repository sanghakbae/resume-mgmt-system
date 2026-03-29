import type { CompanyProfile, ExperienceItem, Profile, ResumeWorkspace, WorkspaceSummary } from "@/types/resume";

const WORKSPACE_KEY_PREFIX = "resume.workspace.";

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL as string | undefined;
}

function getLocalWorkspaceKey(ownerId: string) {
  return `${WORKSPACE_KEY_PREFIX}${ownerId}`;
}

function createWorkspace(ownerId: string, profile: Profile, companies: CompanyProfile[], experiences: ExperienceItem[]): ResumeWorkspace {
  return {
    ownerId,
    profile,
    companies,
    experiences,
    updatedAt: new Date().toISOString(),
  };
}

export function getStorageMode() {
  return getApiBaseUrl() ? "api" : "local";
}

export async function loadWorkspace(ownerId: string, defaultProfile: Profile, defaultCompanies: CompanyProfile[], defaultExperiences: ExperienceItem[]) {
  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl) {
    const response = await fetch(`${apiBaseUrl}/resume/${encodeURIComponent(ownerId)}`);

    if (response.status === 404) {
      return createWorkspace(ownerId, defaultProfile, defaultCompanies, defaultExperiences);
    }

    if (!response.ok) {
      throw new Error("Failed to load workspace");
    }

    const workspace = (await response.json()) as ResumeWorkspace;
    return {
      ...workspace,
      companies: workspace.companies ?? defaultCompanies,
    };
  }

  try {
    const raw = window.localStorage.getItem(getLocalWorkspaceKey(ownerId));
    if (!raw) return createWorkspace(ownerId, defaultProfile, defaultCompanies, defaultExperiences);
    const workspace = JSON.parse(raw) as ResumeWorkspace;
    return {
      ...workspace,
      companies: workspace.companies ?? defaultCompanies,
    };
  } catch {
    return createWorkspace(ownerId, defaultProfile, defaultCompanies, defaultExperiences);
  }
}

export async function saveWorkspace(workspace: ResumeWorkspace) {
  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl) {
    const response = await fetch(`${apiBaseUrl}/resume/${encodeURIComponent(workspace.ownerId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workspace),
    });

    if (!response.ok) {
      throw new Error("Failed to save workspace");
    }

    return;
  }

  window.localStorage.setItem(getLocalWorkspaceKey(workspace.ownerId), JSON.stringify(workspace));
}

export function listLocalWorkspaceSummaries(): WorkspaceSummary[] {
  if (typeof window === "undefined") return [];

  const items: WorkspaceSummary[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith(WORKSPACE_KEY_PREFIX)) continue;

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const workspace = JSON.parse(raw) as ResumeWorkspace;
      items.push({
        ownerId: workspace.ownerId,
        name: workspace.profile.name,
        updatedAt: workspace.updatedAt,
      });
    } catch {
      // Ignore malformed workspace entries.
    }
  }

  return items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}
