import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card(props: CardProps) {
  return <div {...props} />;
}

export function CardContent(props: CardProps) {
  return <div {...props} />;
}
