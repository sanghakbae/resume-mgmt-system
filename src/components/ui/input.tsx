import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn("w-full rounded-[10px] border px-2.5 py-1.5 text-sm leading-5", className)} {...props} />;
}
