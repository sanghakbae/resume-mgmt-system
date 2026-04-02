import { Award, BarChart3, BriefcaseBusiness, CalendarRange, ShieldCheck, Sparkles, Target, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { categoryMeta, categoryOptions, profileHeaderIcon, profileInfoItems } from "@/data/resume";
import type { CompanyProfile, ExperienceItem, Profile } from "@/types/resume";
import { ExperienceCard } from "./experience-card";
import { InfoBox } from "./info-box";

type ResumePreviewProps = {
  isEditMode: boolean;
  profile: Profile;
  companies: CompanyProfile[];
  experiences: ExperienceItem[];
  onEditExperience: (item: ExperienceItem) => void;
  onRemoveExperience: (id: number) => void;
};

export function ResumePreview({
  isEditMode,
  profile,
  companies,
  experiences,
  onEditExperience,
  onRemoveExperience,
}: ResumePreviewProps) {
  const HeaderIcon = profileHeaderIcon;
  const companyGroups = buildCompanyGroups(experiences, companies);

  return (
    <Card className="rounded-[10px] border border-slate-200 bg-white shadow-sm" data-export-resume>
      <CardContent className="p-3.5 sm:p-4 md:p-5" data-export-resume-content>
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between" data-export-intro>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100">
              {profile.photo ? (
                <img src={profile.photo} alt={`${profile.name} 프로필 사진`} className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-slate-900 text-white">
                  <HeaderIcon className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="space-y-2.5">
              <div>
                <h2 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{profile.name}</h2>
                <p className="text-[13px] leading-5 text-slate-500">{profile.role}</p>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">{profile.summary}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {profileInfoItems.map(({ key, label, icon }) => (
              <InfoBox key={key} icon={icon} label={label} value={profile[key]} />
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {companyGroups.map(({ company, items }) => (
            <section key={company.organization} className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5" data-export-company>
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold leading-6 text-slate-950">{company.organization}</h3>
                    <p className="mt-1 text-[13px] leading-5 text-slate-600">
                      {[company.department, company.position].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-medium leading-4 text-slate-600">
                    {company.period}
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-600">{company.summary}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {company.responsibilities.map((responsibility) => (
                    <div key={responsibility} className="rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[13px] leading-5 text-slate-700">
                      {responsibility}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-slate-900 text-white">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold leading-6 text-slate-950">대표 프로젝트</h4>
                    <p className="text-[13px] leading-5 text-slate-500">해당 회사에서 수행한 핵심 업무와 프로젝트</p>
                  </div>
                </div>

                {items.length ? (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <ExperienceCard
                        key={item.id}
                        item={item}
                        isEditMode={isEditMode}
                        onEdit={onEditExperience}
                        onRemove={onRemoveExperience}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[12px] border border-dashed border-slate-300 bg-white px-3 py-4 text-[13px] leading-5 text-slate-500">
                    아직 연결된 수행 업무가 없습니다. 편집 모드에서 이 회사에 프로젝트를 추가하면 여기에 표시됩니다.
                  </div>
                )}
              </div>
            </section>
          ))}

          {!companyGroups.length ? (
            <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              등록된 수행 업무가 없습니다. 편집 모드에서 항목을 추가하면 여기에 표시됩니다.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function buildCompanyGroups(items: ExperienceItem[], companies: CompanyProfile[]) {
  const groups = new Map<string, ExperienceItem[]>();
  const companyLookup = new Map(companies.map((company) => [company.organization, company]));

  for (const company of companies) {
    groups.set(company.organization, []);
  }

  for (const item of items) {
    const current = groups.get(item.organization) ?? [];
    current.push(item);
    groups.set(item.organization, current);
  }

  return [...groups.entries()]
    .map(([organization, companyItems]) => {
      const company = companyLookup.get(organization) ?? createFallbackCompanyProfile(organization, companyItems);
      const sortedItems = [...companyItems].sort((left, right) => getPeriodScore(right.period) - getPeriodScore(left.period));
      return { company, items: sortedItems };
    })
    .sort((left, right) => getCompanyPeriodScore(right.company.period) - getCompanyPeriodScore(left.company.period));
}

function createFallbackCompanyProfile(organization: string, items: ExperienceItem[]): CompanyProfile {
  const sortedItems = [...items].sort((left, right) => getPeriodScore(right.period) - getPeriodScore(left.period));
  return {
    organization,
    period: `${sortedItems.at(-1)?.period ?? ""} ~ ${sortedItems[0]?.period ?? ""}`,
    summary: `${organization}에서 다양한 보안 업무와 프로젝트를 수행했습니다.`,
    responsibilities: ["보안 프로젝트 수행", "보안 운영 및 점검", "이력서 데이터 기반 자동 생성"],
  };
}

export function CareerDashboard({
  items,
  profile,
  companies,
}: {
  items: ExperienceItem[];
  profile: Profile;
  companies: CompanyProfile[];
}) {
  const totalProjects = items.length;
  const activeCategories = categoryOptions.filter((category) => items.some((item) => item.category === category)).length;
  const topCategory = categoryOptions
    .map((category) => ({
      category,
      count: items.filter((item) => item.category === category).length,
    }))
    .sort((left, right) => right.count - left.count)[0];
  const recentProject = [...items].sort((left, right) => getPeriodScore(right.period) - getPeriodScore(left.period))[0];
  const keywordCounts = new Map<string, number>();

  for (const item of items) {
    for (const keyword of item.highlight) {
      const normalizedKeyword = normalizeHighlightKeyword(keyword);
      if (!normalizedKeyword) continue;
      keywordCounts.set(normalizedKeyword, (keywordCounts.get(normalizedKeyword) ?? 0) + 1);
    }
  }

  const topKeywords = [...keywordCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);
  const totalImages = items.filter((item) => item.image).length;
  const organizations = new Set(items.map((item) => item.organization)).size;
  const specialties = profile.specialty
    .split("/")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 6);
  const certifications = profile.certifications
    .split("/")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 6);
  const roleTimeline = companies
    .filter((company) => company.position)
    .slice()
    .sort((left, right) => getCompanyPeriodScore(right.period) - getCompanyPeriodScore(left.period))
    .map((company) => ({
      label: company.position ?? "",
      organization: company.organization,
      period: company.period ?? "",
    }));
  const highlightProjects = [...items]
    .sort((left, right) => {
      const scoreGap = right.highlight.length - left.highlight.length;
      if (scoreGap !== 0) return scoreGap;
      return getPeriodScore(right.period) - getPeriodScore(left.period);
    })
    .slice(0, 4);
  const complianceCoverage = collectCoverageKeywords(items, profile);
  const categoryBucketMap: Partial<Record<ResumeCategory, ResumeCategory[]>> = {
    "보안 컨설팅": ["보안 컨설팅", "인증"],
    "인증": ["보안 컨설팅", "인증"],
  };
  const categoryStats = categoryOptions.map((category) => {
    const bucketCategories = categoryBucketMap[category] ?? [category];
    const categoryItems = items.filter((item) => bucketCategories.includes(item.category));
    const count = categoryItems.length;
    const ratio = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
    const tagCounts = new Map<string, number>();

    for (const item of categoryItems) {
      for (const tag of item.highlight) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    const topTags = [...tagCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 2)
      .map(([tag]) => tag);

    return {
      category,
      count,
      ratio,
      topTags,
    };
  });

  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-[linear-gradient(140deg,#0f172a_0%,#1e293b_38%,#e2e8f0_38%,#f8fafc_100%)] p-[1px]">
      <div className="rounded-[19px] bg-[linear-gradient(145deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.96)_100%)] p-4 sm:p-5">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-slate-950 text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)]">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-6 text-slate-950">경력 대시보드</h3>
              <p className="text-[13px] leading-5 text-slate-500">현재 입력된 수행 업무 기준으로 경력 흐름을 요약합니다.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[18px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#334155_100%)] p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">Positioning</p>
            <h4 className="mt-3 max-w-3xl text-xl font-semibold leading-8 sm:text-2xl">{profile.role}</h4>
            <p className="mt-3 max-w-3xl text-[13px] leading-6 text-slate-300">{profile.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {specialties.map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12px] leading-4 text-slate-100">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <AccentPanel icon={ShieldCheck} title="인증 / 컴플라이언스">
              <div className="flex flex-wrap gap-2">
                {complianceCoverage.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[12px] leading-4 text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </AccentPanel>
            <AccentPanel icon={Award} title="주요 자격">
              <div className="flex flex-wrap gap-2">
                {certifications.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[12px] leading-4 text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </AccentPanel>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <DashboardStat icon={BriefcaseBusiness} label="총 프로젝트" value={`${totalProjects}건`} />
          <DashboardStat icon={Sparkles} label="활성 카테고리" value={`${activeCategories}개`} />
          <DashboardStat icon={BarChart3} label="가장 많은 분야" value={topCategory ? categoryMeta[topCategory.category].label : "-"} />
          <DashboardStat icon={Sparkles} label="근무 조직" value={`${organizations}곳`} />
          <DashboardStat icon={CalendarRange} label="최근 프로젝트" value={recentProject?.period ?? "-"} />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[0.58fr_1.42fr]">
          <div className="rounded-[16px] border border-slate-200 bg-white/90 p-3 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
            <p className="text-sm font-semibold text-slate-900">카테고리 분포</p>
            <div className="mt-3 space-y-2">
              {categoryStats.map(({ category, count, ratio, topTags }) => {
                const width = totalProjects > 0 ? Math.max((count / totalProjects) * 100, count > 0 ? 10 : 0) : 0;

                return (
                  <div key={category} className="rounded-[12px] border border-slate-200 bg-slate-50/80 px-2.5 py-2">
                    <div className="flex items-center justify-between gap-3 text-[13px] leading-5">
                      <span className="font-medium text-slate-700">{categoryMeta[category].label}</span>
                      <span className="text-slate-500">
                        {count}건 · {ratio}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#334155_100%)]" style={{ width: `${width}%` }} />
                    </div>
                    {topTags.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {topTags.map((tag) => (
                          <span key={`${category}-${tag}`} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] leading-4 text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <AccentPanel icon={TrendingUp} title="역할 변화 타임라인">
                <div className="space-y-3">
                  {roleTimeline.slice(0, 5).map((item) => (
                    <div key={`${item.organization}-${item.label}`} className="flex items-start gap-3">
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-900" />
                      <div>
                        <p className="text-[13px] font-medium leading-5 text-slate-900">{item.label}</p>
                        <p className="text-[12px] leading-4 text-slate-500">{item.organization}</p>
                        <p className="text-[12px] leading-4 text-slate-400">{item.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccentPanel>

              <AccentPanel icon={Target} title="대표 성과 하이라이트">
                <div className="space-y-2.5">
                  {highlightProjects.map((item) => (
                    <div key={item.id} className="rounded-[12px] border border-slate-200 bg-white px-3 py-2.5">
                      <p className="text-[13px] font-medium leading-5 text-slate-900">{item.title}</p>
                      <p className="mt-1 text-[12px] leading-4 text-slate-500">
                        {item.organization} · {item.period}
                      </p>
                    </div>
                  ))}
                </div>
              </AccentPanel>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white/90 p-4 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
              <p className="text-sm font-semibold text-slate-900">핵심 키워드</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {topKeywords.length ? (
                  topKeywords.map(([keyword, count]) => (
                    <span key={keyword} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] leading-4 text-slate-700">
                      {keyword} {count}
                    </span>
                  ))
                ) : (
                  <p className="text-[13px] leading-5 text-slate-500">아직 키워드가 없습니다.</p>
                )}
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white/90 p-4 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
              <p className="text-sm font-semibold text-slate-900">최근 이력</p>
              {recentProject ? (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[13px] font-medium leading-5 text-slate-900">{recentProject.title}</p>
                  <p className="text-[12px] leading-4 text-slate-500">
                    {recentProject.organization} · {recentProject.period}
                  </p>
                  <p className="whitespace-pre-wrap text-[13px] leading-5 text-slate-600">{recentProject.description}</p>
                </div>
              ) : (
                <p className="mt-3 text-[13px] leading-5 text-slate-500">최근 이력이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white/85 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-[12px] leading-4">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold leading-6 text-slate-950">{value}</p>
    </div>
  );
}

function AccentPanel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BriefcaseBusiness;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white/90 p-4 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
      <div className="flex items-center gap-2 text-slate-900">
        <Icon className="h-4 w-4 text-slate-600" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function collectCoverageKeywords(items: ExperienceItem[], profile: Profile) {
  const source = [profile.specialty, profile.certifications, ...items.flatMap((item) => [item.title, item.description, ...item.highlight])].join(" ");
  const keywords = ["ISMS", "ISMS-P", "ISO 27001", "ISO 27017", "CSAP", "PCI-DSS", "OT Security", "GDPR"];
  return keywords.filter((keyword) => source.toLowerCase().includes(keyword.toLowerCase())).slice(0, 8);
}

function normalizeHighlightKeyword(keyword: string) {
  const trimmed = keyword.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const lowSignalKeywords = new Set(["pm", "pl", "leader", "팀장", "운영"]);
  if (lowSignalKeywords.has(lower)) return null;

  if (lower.includes("isms-p")) return "ISMS-P";
  if (lower === "isms") return "ISMS";
  if (lower.includes("iso 27017") || lower.includes("iso27017")) return "ISO 27017";
  if (lower.includes("iso 27001") || lower.includes("iso27001")) return "ISO 27001";
  if (lower.includes("csap")) return "CSAP";
  if (lower.includes("ot")) return "OT 보안";
  if (lower.includes("nozomi")) return "Nozomi";
  if (lower.includes("웹 모의해킹")) return "웹 모의해킹";
  if (lower.includes("관리체계")) return "정보보호 관리체계";
  if (lower.includes("위험")) return "위험평가";
  if (lower.includes("망분리")) return "망분리";
  if (lower.includes("하드닝")) return "하드닝";
  if (lower.includes("개인정보")) return "개인정보보호";

  return trimmed;
}

function getPeriodScore(period: string) {
  const [start = "0.00", end = start] = period.split("-").map((part) => part.trim());
  return toNumericPeriod(end || start);
}

function getCompanyPeriodScore(period?: string) {
  if (!period) return 0;

  return period
    .split("/")
    .map((range) => range.trim())
    .reduce((highest, range) => Math.max(highest, getPeriodScore(range)), 0);
}

function toNumericPeriod(value: string) {
  if (value.includes("현재")) {
    return 999999;
  }

  const normalized = value.replace(/[^0-9.]/g, "");
  const [year = "0", month = "0"] = normalized.split(".");
  return Number(year) * 100 + Number(month);
}
