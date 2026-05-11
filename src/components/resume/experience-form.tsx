import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { CalendarDays, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ExperienceFormValues, ExperienceItem, ExperienceValidationErrors } from "@/types/resume";
import { FormField } from "./form-field";

type ExperienceFormProps = {
  ownerId: string;
  form: ExperienceFormValues;
  errors: ExperienceValidationErrors;
  editingId: number | null;
  organizations?: string[];
  experiences: ExperienceItem[];
  isUploading?: boolean;
  onChange: Dispatch<SetStateAction<ExperienceFormValues>>;
  onSubmit: () => void;
  onCancel: () => void;
  onEdit: (experience: ExperienceItem) => void;
  onRemove: (id: number) => void;
  onUploadImages?: (files: File[]) => Promise<void>;
};

export function ExperienceForm({
  ownerId,
  form,
  errors,
  editingId,
  organizations = [],
  experiences,
  isUploading = false,
  onChange,
  onSubmit,
  onCancel,
  onEdit,
  onRemove,
  onUploadImages,
}: ExperienceFormProps) {
  const sortedExperiences = [...experiences].sort((left, right) => getExperiencePeriodScore(right.period) - getExperiencePeriodScore(left.period));
  const periodDates = parsePeriodToDateInputs(form.period);

  const updateField = <K extends keyof ExperienceFormValues>(key: K, value: ExperienceFormValues[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    if (files.some((file) => !file.type.startsWith("image/"))) {
      event.target.value = "";
      return;
    }

    if (onUploadImages && ownerId) {
      await onUploadImages(files);
      event.target.value = "";
      return;
    }

    const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
    onChange((prev) => {
      const images = [...prev.images, ...dataUrls];
      return { ...prev, image: images[0] ?? "", images };
    });
    event.target.value = "";
  };

  const removeImage = (imageToRemove: string) => {
    onChange((prev) => {
      const images = prev.images.filter((image) => image !== imageToRemove);
      return { ...prev, image: images[0] ?? "", images };
    });
  };

  return (
    <Card className="rounded-[10px] border border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-slate-900 text-white">
            {editingId === null ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          </div>
          <div>
            <h2 className="text-base font-semibold leading-6">{editingId === null ? "수행 업무 추가" : "수행 업무 수정"}</h2>
            <p className="text-[13px] leading-5 text-slate-500">설명 내용을 기준으로 보안 태그와 카테고리를 자동으로 생성합니다.</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] xl:items-start">
          <div className="space-y-3">
            <FormField label="업무명 / 프로젝트명" error={errors.title}>
              <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </FormField>
            <FormField label="고객사 / 조직명" error={errors.organization}>
              <>
                <Input value={form.organization} onChange={(e) => updateField("organization", e.target.value)} list="experience-organizations" />
                {organizations.length ? (
                  <datalist id="experience-organizations">
                    {organizations.map((organization) => (
                      <option key={organization} value={organization} />
                    ))}
                  </datalist>
                ) : null}
              </>
            </FormField>
            <FormField label="기간" error={errors.period}>
              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[12px] font-medium leading-4 text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      시작
                    </span>
                    <Input
                      type="date"
                      value={periodDates.startDate}
                      onChange={(e) => updateField("period", buildPeriodValue(e.target.value, periodDates.endDate, periodDates.isPresent))}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[12px] font-medium leading-4 text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      종료
                    </span>
                    <Input
                      type="date"
                      value={periodDates.endDate}
                      disabled={periodDates.isPresent}
                      onChange={(e) => updateField("period", buildPeriodValue(periodDates.startDate, e.target.value, periodDates.isPresent))}
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-[12px] font-medium leading-4 text-slate-600">
                  <input
                    type="checkbox"
                    checked={periodDates.isPresent}
                    onChange={(e) => updateField("period", buildPeriodValue(periodDates.startDate, periodDates.endDate, e.target.checked))}
                    className="h-4 w-4 accent-slate-900"
                  />
                  현재 진행 중
                </label>
                <p className="text-[12px] leading-4 text-slate-500">{form.period || "시작일과 종료일을 선택하세요."}</p>
              </div>
            </FormField>
            <FormField label="수행 업무 설명" error={errors.description}>
              <textarea
                className="min-h-[96px] w-full rounded-[10px] border border-slate-200 px-2.5 py-1.5 text-sm leading-5 outline-none"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </FormField>
            <FormField label="프로젝트 URL">
              <Input
                value={form.url}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="예: https://example.com/project"
              />
            </FormField>
            <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-medium leading-5 text-slate-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
                className="h-4 w-4 accent-slate-900"
              />
              대표 성과 하이라이트에 표시
            </label>
            <FormField label="표시 위치">
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: "portfolio", label: "포트폴리오" },
                  { value: "technical", label: "경력기술서" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      form.documentType === option.value
                        ? "min-h-8 rounded-[8px] border border-slate-950 bg-slate-950 px-2 text-[12px] font-semibold leading-4 text-white"
                        : "min-h-8 rounded-[8px] border border-slate-200 bg-white px-2 text-[12px] font-semibold leading-4 text-slate-600"
                    }
                    onClick={() => updateField("documentType", option.value as ExperienceFormValues["documentType"])}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="업무 이미지">
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-[13px] font-medium leading-5 text-slate-700">
                  <ImagePlus className="h-4 w-4" />
                  {isUploading ? "이미지 업로드 중" : "이미지 업로드"}
                  <input type="file" accept="image/*,.gif" multiple className="hidden" onChange={(event) => void handleImageChange(event)} disabled={isUploading} />
                </label>
                <p className="text-[12px] leading-4 text-slate-500">여러 이미지를 한 번에 선택할 수 있으며 PNG, JPG, GIF 모두 가능합니다.</p>
                {form.images.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {form.images.map((image, index) => (
                      <div key={`${image}-${index}`} className="overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
                        <img src={image} alt={`업무 미리보기 ${index + 1}`} className="h-auto max-h-44 w-full object-contain" />
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-1.5 border-t border-slate-200 bg-white px-2 py-1.5 text-[12px] font-medium leading-4 text-rose-600"
                          onClick={() => removeImage(image)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          이미지 제거
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                {form.images.length ? (
                  <Button className="w-full border border-slate-200 bg-white px-4 py-2 text-slate-700 sm:w-auto" onClick={() => onChange((prev) => ({ ...prev, image: "", images: [] }))}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    전체 이미지 제거
                  </Button>
                ) : null}
              </div>
            </FormField>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="flex w-full flex-1 items-center justify-center bg-slate-900 px-4 py-2 text-white" onClick={onSubmit}>
                {editingId === null ? <Plus className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {editingId === null ? "수행 업무 추가" : "수정 내용 저장"}
              </Button>
              {editingId !== null ? (
                <Button className="w-full border border-slate-200 bg-white px-4 py-2 text-slate-700 sm:w-auto" onClick={onCancel}>
                  <X className="mr-2 h-4 w-4" />
                  취소
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2 rounded-[10px] border border-slate-200 bg-slate-50 p-3 xl:border-l xl:border-slate-200 xl:bg-transparent xl:pl-4">
            <p className="text-[13px] font-medium leading-5 text-slate-700">등록된 수행 업무</p>
            {experiences.length ? (
              <div className="space-y-2">
                {sortedExperiences.map((experience) => (
                  <div
                    key={experience.id}
                    className={
                      editingId === experience.id
                        ? "flex flex-col gap-2 rounded-[10px] border border-slate-300 bg-slate-100 px-3 py-3"
                        : "flex flex-col gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-3"
                    }
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">{experience.title}</p>
                      <p className="text-[12px] leading-4 text-slate-500">
                        {[experience.organization, experience.period].filter(Boolean).join(" / ")}
                      </p>
                      {experience.highlight.length ? (
                        <p className="text-[12px] leading-4 text-slate-500">{experience.highlight.join(" · ")}</p>
                      ) : null}
                      {experience.featured ? (
                        <span className="inline-flex w-fit rounded-[5px] border border-slate-200 bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                          대표 성과
                        </span>
                      ) : null}
                      <span className="inline-flex w-fit rounded-[5px] border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-600">
                        {getDocumentTypeLabel(experience.documentType)}
                      </span>
                    </div>

                    <p className="line-clamp-3 text-[12px] leading-5 text-slate-600">{experience.description}</p>

                    <div className="flex gap-2">
                      <Button className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 sm:w-auto" onClick={() => onEdit(experience)}>
                        <Save className="mr-2 h-4 w-4" />
                        수정
                      </Button>
                      <Button className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-rose-600 sm:w-auto" onClick={() => onRemove(experience.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] leading-5 text-slate-500">등록된 수행 업무가 없습니다.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getDocumentTypeLabel(documentType: ExperienceItem["documentType"]) {
  if (documentType === "portfolio") return "포트폴리오";
  return "경력기술서";
}

function getExperiencePeriodScore(period: string) {
  const normalized = period.trim();
  if (!normalized) return 0;
  if (normalized.includes("현재")) return 9999.99;

  const candidates = normalized
    .split("/")
    .flatMap((range) => range.split("~"))
    .flatMap((range) => range.split("-"))
    .map((part) => Number.parseFloat(part.trim().replace(/\./g, ".")))
    .filter((value) => Number.isFinite(value));

  return Math.max(...candidates, 0);
}

function parsePeriodToDateInputs(period: string) {
  const isPresent = period.includes("현재");
  const [startRaw = "", endRaw = ""] = period
    .split(/~|-/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    startDate: toDateInputValue(startRaw),
    endDate: isPresent ? "" : toDateInputValue(endRaw),
    isPresent,
  };
}

function buildPeriodValue(startDate: string, endDate: string, isPresent: boolean) {
  const start = formatDateForPeriod(startDate);
  const end = isPresent ? "현재" : formatDateForPeriod(endDate);

  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
}

function toDateInputValue(value: string) {
  if (!value || value.includes("현재")) return "";

  const matched = value.match(/(\d{4})\D+(\d{1,2})(?:\D+(\d{1,2}))?/);
  if (!matched) return "";

  const [, year, month, day = "01"] = matched;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function formatDateForPeriod(value: string) {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${year}.${month}.${day}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("이미지를 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}
