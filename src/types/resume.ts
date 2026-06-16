import type { LucideIcon } from "lucide-react";

export type ResumeCategory = "모의해킹" | "취약점 진단" | "보안 컨설팅" | "클라우드 보안" | "개발/자동화" | "인증";
export type ExperienceDocumentType = "portfolio" | "technical";
export type SkillView = "orbit" | "chips" | "bars" | "list";

export type ExperienceItem = {
  id: number;
  title: string;
  organization: string;
  period: string;
  category: ResumeCategory;
  description: string;
  highlight: string[];
  url?: string;
  image?: string;
  images?: string[];
  featured?: boolean;
  documentType?: ExperienceDocumentType;
};

export type Profile = {
  name: string;
  role: string;
  summary: string;
  photo?: string;
  photoPositionX: number;
  photoPositionY: number;
  photoScale: number;
  education: string;
  career: string;
  specialty: string;
  military: string;
  industries: string;
  hobby: string;
  hobbyUrl: string;
  contactEmail: string;
  certifications: string;
  defaultSkillView?: SkillView;
};

export type ExperienceFormValues = {
  title: string;
  organization: string;
  period: string;
  category: ResumeCategory;
  description: string;
  url: string;
  image: string;
  images: string[];
  featured: boolean;
  documentType: ExperienceDocumentType;
  highlight: string[];
};

export type ExperienceValidationErrors = Partial<Record<keyof ExperienceFormValues, string>>;

export type CategoryMeta = {
  label: string;
  icon: LucideIcon;
};

export type GoogleUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export type ResumeWorkspace = {
  ownerId: string;
  editorEmail?: string | null;
  profile: Profile;
  companies: CompanyProfile[];
  experiences: ExperienceItem[];
  updatedAt: string;
};

export type WorkspaceSummary = {
  ownerId: string;
  name: string;
  updatedAt: string;
};

export type VisitLogItem = {
  id: string;
  visitedAt: string;
  mode: "편집 모드" | "공개 보기";
  ownerName: string;
  userLabel: string;
  ipAddress?: string;
  locationLabel?: string;
  countryCode?: string;
  referrer?: string;
};

export type CompanyProfile = {
  organization: string;
  department?: string;
  position?: string;
  period?: string;
  summary: string;
  responsibilities: string[];
  /** Rich-text (HTML) version of 핵심 업무; when set it takes precedence over `responsibilities`. */
  responsibilitiesHtml?: string;
};

export type CompanyFormValues = {
  organization: string;
  department: string;
  position: string;
  period: string;
  summary: string;
  responsibilitiesHtml: string;
};

export type CompanyValidationErrors = Partial<Record<keyof CompanyFormValues, string>>;
