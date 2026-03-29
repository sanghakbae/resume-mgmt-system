import type { LucideIcon } from "lucide-react";

type InfoBoxProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function InfoBox({ icon: Icon, label, value }: InfoBoxProps) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="mb-1.5 flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-[12px] leading-4">{label}</span>
      </div>
      <p className="text-[13px] font-medium leading-5 text-slate-900">{value}</p>
    </div>
  );
}
