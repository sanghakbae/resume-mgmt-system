import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn("inline-flex items-center justify-center rounded-[10px] px-3 py-1.5 text-sm leading-5", className)} {...props} />;
}
