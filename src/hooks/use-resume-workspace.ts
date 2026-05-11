import { useCallback, useEffect, useMemo, useState } from "react";
import { loadWorkspace, saveWorkspace, getStorageMode, listLocalWorkspaceSummaries } from "@/lib/resume-workspace";
import type { CompanyProfile, ExperienceItem, Profile, ResumeWorkspace, WorkspaceSummary } from "@/types/resume";

type UseResumeWorkspaceArgs = {
  ownerId: string;
  fallbackOwnerIds?: string[];
  defaultProfile: Profile;
  defaultCompanies: CompanyProfile[];
  defaultExperiences: ExperienceItem[];
  canSave?: boolean;
};

export function useResumeWorkspace({
  ownerId,
  fallbackOwnerIds = [],
  defaultProfile,
  defaultCompanies,
  defaultExperiences,
  canSave = true,
}: UseResumeWorkspaceArgs) {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [companies, setCompanies] = useState<CompanyProfile[]>(defaultCompanies);
  const [experiences, setExperiences] = useState<ExperienceItem[]>(defaultExperiences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [showSavedNotice, setShowSavedNotice] = useState(false);
  const [hasLoadedWorkspace, setHasLoadedWorkspace] = useState(false);
  const storageMode = useMemo(() => getStorageMode(), []);

  useEffect(() => {
    if (!ownerId) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setHasLoadedWorkspace(false);

    loadWorkspace(ownerId, defaultProfile, defaultCompanies, defaultExperiences, fallbackOwnerIds)
      .then((workspace) => {
        if (!active) return;
        setProfile(workspace.profile);
        setCompanies(workspace.companies);
        setExperiences(workspace.experiences);
        setUpdatedAt(workspace.updatedAt);
        setError(null);
        setHasLoadedWorkspace(true);
      })
      .catch(() => {
        if (!active) return;
        setError("이력서 데이터를 불러오지 못했습니다.");
        setHasLoadedWorkspace(false);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [defaultCompanies, defaultExperiences, defaultProfile, fallbackOwnerIds, ownerId]);

  useEffect(() => {
    if (!ownerId || isLoading) return;
    if (!hasLoadedWorkspace) return;
    if (!canSave) return;

    const timer = window.setTimeout(() => {
      const workspace: ResumeWorkspace = {
        ownerId,
        editorEmail: null,
        profile,
        companies,
        experiences,
        updatedAt: new Date().toISOString(),
      };

      setIsSaving(true);

      saveWorkspace(workspace)
        .then(() => {
          setUpdatedAt(workspace.updatedAt);
          setError(null);
          setShowSavedNotice(true);
        })
        .catch((saveError) => {
          setError(saveError instanceof Error ? saveError.message : "이력서 데이터를 저장하지 못했습니다.");
        })
        .finally(() => {
          setIsSaving(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canSave, companies, experiences, hasLoadedWorkspace, isLoading, ownerId, profile]);

  useEffect(() => {
    if (!showSavedNotice) return;

    const timer = window.setTimeout(() => {
      setShowSavedNotice(false);
    }, 1500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showSavedNotice]);

  const resetWorkspace = () => {
    setProfile(defaultProfile);
    setCompanies(defaultCompanies);
    setExperiences(defaultExperiences);
    setHasLoadedWorkspace(true);
  };

  const listWorkspaces = useCallback(() => listLocalWorkspaceSummaries(), []);

  const saveNow = useCallback(async () => {
    if (!ownerId || !canSave) return;

    const workspace: ResumeWorkspace = {
      ownerId,
      editorEmail: null,
      profile,
      companies,
      experiences,
      updatedAt: new Date().toISOString(),
    };

    setIsSaving(true);

    try {
      await saveWorkspace(workspace);
      setUpdatedAt(workspace.updatedAt);
      setError(null);
      setShowSavedNotice(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "이력서 데이터를 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [canSave, companies, experiences, ownerId, profile]);

  const replaceWorkspace = useCallback(
    async (workspace: ResumeWorkspace) => {
      if (!ownerId || !canSave) return;

      setProfile(workspace.profile);
      setCompanies(workspace.companies);
      setExperiences(workspace.experiences);
      setUpdatedAt(workspace.updatedAt);
      setHasLoadedWorkspace(true);
      setIsSaving(true);

      try {
        await saveWorkspace(workspace);
        setError(null);
        setShowSavedNotice(true);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "이력서 데이터를 저장하지 못했습니다.");
      } finally {
        setIsSaving(false);
      }
    },
    [canSave, ownerId],
  );

  return {
    profile,
    setProfile,
    companies,
    setCompanies,
    experiences,
    setExperiences,
    isLoading,
    isSaving,
    error,
    updatedAt,
    showSavedNotice,
    storageMode,
    resetWorkspace,
    listWorkspaces,
    saveNow,
    replaceWorkspace,
  };
}
