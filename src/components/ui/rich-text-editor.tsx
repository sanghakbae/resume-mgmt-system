import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import {
  Bold,
  Columns3,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Rows3,
  Strikethrough,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { looksLikeHtml, renderRichText, sanitizeRichHtml } from "@/lib/rich-text";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel?: string;
};

function toEditorHtml(value: string): string {
  if (looksLikeHtml(value)) return sanitizeRichHtml(value) || "<p></p>";
  return renderRichText(value) || "<p></p>";
}

export function RichTextEditor({ value, onChange, ariaLabel }: RichTextEditorProps) {
  const lastEmitted = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TableKit.configure({ table: { resizable: true } }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        class: "resume-rich tiptap-editor focus:outline-none",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
    },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
  });

  // Sync when the value changes from outside (e.g. switching which item is edited).
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    editor.commands.setContent(toEditorHtml(value), false);
    lastEmitted.current = value;
  }, [value, editor]);

  if (!editor) {
    return <div className="min-h-[120px] rounded-[10px] border border-slate-200 bg-slate-50" />;
  }

  const isActive = (name: string, attrs?: Record<string, unknown>) => editor.isActive(name, attrs);
  const btn = (active: boolean) =>
    `flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[12px] leading-none transition ${
      active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
    }`;

  return (
    <div className="rounded-[10px] border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-2 py-1.5">
        <button type="button" className={btn(isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="굵게">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn(isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="기울임">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn(isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="취소선">
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
        <span className="mx-0.5 h-4 w-px bg-slate-200" />
        <button type="button" className={btn(isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="제목">
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn(isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="글머리 목록">
          <List className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn(isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="번호 목록">
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <span className="mx-0.5 h-4 w-px bg-slate-200" />
        <button
          type="button"
          className={btn(false)}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          aria-label="표 삽입"
        >
          <TableIcon className="h-3.5 w-3.5" />
        </button>
        {editor.isActive("table") ? (
          <>
            <button type="button" className={btn(false)} onClick={() => editor.chain().focus().addColumnAfter().run()} aria-label="열 추가" title="열 추가">
              <Columns3 className="h-3.5 w-3.5" />
              <span className="ml-0.5">+</span>
            </button>
            <button type="button" className={btn(false)} onClick={() => editor.chain().focus().deleteColumn().run()} aria-label="열 삭제" title="열 삭제">
              <Columns3 className="h-3.5 w-3.5" />
              <span className="ml-0.5">−</span>
            </button>
            <button type="button" className={btn(false)} onClick={() => editor.chain().focus().addRowAfter().run()} aria-label="행 추가" title="행 추가">
              <Rows3 className="h-3.5 w-3.5" />
              <span className="ml-0.5">+</span>
            </button>
            <button type="button" className={btn(false)} onClick={() => editor.chain().focus().deleteRow().run()} aria-label="행 삭제" title="행 삭제">
              <Rows3 className="h-3.5 w-3.5" />
              <span className="ml-0.5">−</span>
            </button>
            <button type="button" className={btn(false)} onClick={() => editor.chain().focus().deleteTable().run()} aria-label="표 삭제" title="표 삭제">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : null}
      </div>
      <EditorContent editor={editor} className="px-2.5 py-2" />
    </div>
  );
}
