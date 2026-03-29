import { categoryMeta } from "@/data/resume";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExperienceItem } from "@/types/resume";

type ExperienceCardProps = {
  item: ExperienceItem;
  isEditMode: boolean;
  onEdit: (item: ExperienceItem) => void;
  onRemove: (id: number) => void;
};

export function ExperienceCard({ item, isEditMode, onEdit, onRemove }: ExperienceCardProps) {
  return (
    <div className="rounded-[10px] border border-slate-200 p-3.5 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-base font-semibold leading-6 text-slate-900">{item.title}</h4>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">{item.period}</p>
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

      <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>

      {item.image ? (
        <div className="mt-3 overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
          <img src={item.image} alt={`${item.title} 이미지`} className="h-auto max-h-72 w-full object-contain" />
        </div>
      ) : null}

      {item.highlight.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-900 px-2.5 py-1 text-[12px] leading-4 text-white">
            {categoryMeta[item.category].label}
          </span>
          {item.highlight.map((tag) => (
            <span key={`${item.id}-${tag}`} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] leading-4 text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-900 px-2.5 py-1 text-[12px] leading-4 text-white">
            {categoryMeta[item.category].label}
          </span>
        </div>
      )}
    </div>
  );
}
