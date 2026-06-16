import type { MouseEvent } from "react";
import { categoryMeta } from "@/data/resume";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { renderRichText } from "@/lib/rich-text";
import type { ExperienceItem } from "@/types/resume";

type ExperienceCardProps = {
  item: ExperienceItem;
  isEditMode: boolean;
  onEdit: (item: ExperienceItem) => void;
  onRemove: (id: number) => void;
};

export function ExperienceCard({ item, isEditMode, onEdit, onRemove }: ExperienceCardProps) {
  const linkPreview = getLinkPreview(item.url);
  const images = getExperienceImages(item);

  return (
    <div className="min-w-0 overflow-hidden rounded-[10px] border border-slate-200 px-2.5 py-1.5 sm:p-4" data-export-project-card>
      <div className="flex min-w-0 flex-col gap-2 sm:gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h4 className="break-keep text-[14px] font-semibold leading-5 text-slate-900 md:text-base md:leading-6">{item.title}</h4>
          <p className="mt-1 break-keep text-[13px] leading-4 text-slate-500 md:leading-5">{item.period}</p>
        </div>

        {isEditMode ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 sm:w-auto" onClick={() => onEdit(item)}>
              <Pencil className="mr-2 h-4 w-4" />
              수정
            </Button>
            <Button className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-rose-600 sm:w-auto" onClick={() => onRemove(item.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-2 grid min-w-0 gap-2 sm:mt-3 sm:gap-3">
        <div className="min-w-0">
          <div
            className="resume-rich resume-project-description-desktop break-keep break-words text-sm leading-5 text-slate-600 md:leading-6"
            dangerouslySetInnerHTML={{ __html: renderRichText(item.description) }}
          />

          <details className="resume-project-description-mobile rounded-[8px] border border-slate-200 bg-slate-50/70">
            <summary className="cursor-pointer select-none px-3 py-2 text-[13px] font-semibold leading-5 text-slate-800">
              프로젝트 상세 보기
            </summary>
            <div
              className="resume-rich break-keep break-words border-t border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-600"
              dangerouslySetInnerHTML={{ __html: renderRichText(item.description) }}
            />
          </details>

          {item.url ? (
            <div className="mt-2 border-t border-dashed border-slate-200 pt-2 sm:mt-4 sm:pt-3">
              <p className="mb-2 inline-flex items-center gap-1 rounded-[6px] bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                <ExternalLink className="h-3 w-3" />
                관련 링크
              </p>
              {linkPreview ? (
                <a
                  href={item.url}
                  onClick={(event) => openProjectPopup(event, item.url)}
                  rel="noreferrer"
                  className="flex items-center gap-2.5 overflow-hidden rounded-[10px] border-l-4 border-l-sky-500 border-y border-r border-slate-200 bg-gradient-to-r from-sky-50 to-white p-2 transition hover:from-sky-100"
                >
                  <div className="aspect-[16/10] h-14 shrink-0 overflow-hidden rounded-[6px] border border-slate-200 bg-slate-100 sm:h-16">
                    <img
                      src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(item.url)}?w=320&h=200`}
                      alt={`${linkPreview.hostname} 미리보기`}
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                      onError={(event) => {
                        const target = event.currentTarget;
                        target.parentElement?.style.setProperty("display", "none");
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={linkPreview.favicon}
                        alt=""
                        className="h-4 w-4 shrink-0 rounded-[3px] border border-slate-200 bg-white object-cover"
                      />
                      <p className="truncate text-[12px] font-semibold leading-4 text-slate-900">{linkPreview.hostname}</p>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] leading-4 text-slate-500">{item.url}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-[6px] bg-sky-600 px-2 py-1 text-[11px] font-medium text-white">
                    팝업 열기
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </a>
              ) : (
                <a
                  href={item.url}
                  onClick={(event) => openProjectPopup(event, item.url)}
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
                >
                  프로젝트 링크 팝업 열기
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ) : null}

          {images.length ? (
            <div className="resume-project-images mt-2 grid gap-2 sm:mt-3 sm:grid-cols-2">
              {images.map((image, index) => (
                <div key={`${item.id}-image-${index}`} className="w-full overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
                  <img src={image} alt={`${item.title} 이미지 ${index + 1}`} className="h-auto max-h-[374px] w-full object-contain" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {item.highlight.length ? (
        <div className="mt-2 flex flex-wrap items-center gap-1 sm:mt-3">
          <span className="inline-flex min-h-5 items-center justify-center rounded-[5px] border border-slate-200 bg-slate-900 px-1.5 py-0.5 text-[10px] leading-none text-white">
            {categoryMeta[item.category].label}
          </span>
          {item.highlight.map((tag) => (
            <span
              key={`${item.id}-${tag}`}
              className="inline-flex min-h-5 items-center justify-center rounded-[5px] border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] leading-none text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-1 sm:mt-3">
          <span className="inline-flex min-h-5 items-center justify-center rounded-[5px] border border-slate-200 bg-slate-900 px-1.5 py-0.5 text-[10px] leading-none text-white">
            {categoryMeta[item.category].label}
          </span>
        </div>
      )}
    </div>
  );
}

function getExperienceImages(item: ExperienceItem) {
  return Array.from(new Set([...(item.images ?? []), item.image].filter((image): image is string => Boolean(image))));
}

function openProjectPopup(event: MouseEvent<HTMLAnchorElement>, url: string) {
  event.preventDefault();
  window.dispatchEvent(new CustomEvent("resume:openLink", { detail: { url } }));
}

function getLinkPreview(url?: string) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    return {
      hostname,
      favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=64`,
    };
  } catch {
    return null;
  }
}
