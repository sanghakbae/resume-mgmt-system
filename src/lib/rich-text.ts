import DOMPurify from "dompurify";

// Tags/attributes allowed in stored résumé rich text (formatting + tables).
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "span",
  "h1", "h2", "h3", "ul", "ol", "li", "a", "blockquote",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col",
];
const ALLOWED_ATTR = ["href", "target", "rel", "colspan", "rowspan", "style", "class", "colwidth", "data-colwidth"];

const HTML_TAG_RE = /<\/?[a-z][\s\S]*>/i;

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_RE.test(value);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Sanitize stored HTML before injecting via dangerouslySetInnerHTML. */
export function sanitizeRichHtml(html: string): string {
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
  });
}

/**
 * Produce safe HTML for display. Legacy plain-text values (no HTML tags) are
 * escaped and newline-converted so existing data renders unchanged.
 */
export function renderRichText(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (looksLikeHtml(raw)) return sanitizeRichHtml(raw);
  return escapeHtml(raw).replace(/\r?\n/g, "<br>");
}

/** True when the rich text has no visible content. */
export function isEmptyRichText(value: string | null | undefined): boolean {
  const stripped = (value ?? "")
    .replace(/<br\s*\/?>(?=)/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  return stripped.length === 0;
}

/** Convert a legacy string[] (e.g. responsibilities chips) into an HTML list. */
export function listToHtml(items: string[] | null | undefined): string {
  const clean = (items ?? []).map((item) => item.trim()).filter(Boolean);
  if (!clean.length) return "";
  return `<ul>${clean.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}
