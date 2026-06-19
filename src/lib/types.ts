export type SectionKind = "title" | "paragraph" | "quote" | "image";
export type Align = "left" | "center" | "right";

export interface BlogSection {
  id: string;
  blog_id: string;
  kind: SectionKind;
  content: string | null;
  image_url: string | null;
  align: Align;
  position: number;
}

export const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/* ── About page builder ─────────────────────────────────────────────── */
export type AboutKind =
  | "heading"
  | "paragraph"
  | "list"
  | "quote"
  | "image"
  | "divider"
  | "split";
export type FontChoice = "display" | "serif" | "sans";
export type TextSize = "sm" | "md" | "lg" | "xl";
export type ImgWidth = "sm" | "md" | "lg" | "full";

export interface AboutBlock {
  id: string;
  kind: AboutKind;
  content: string | null;
  image_url: string | null;
  align: Align;
  font: FontChoice;
  size: TextSize;
  img_width: ImgWidth;
  img_pct: number | null;
  img_h: number | null;
  img_side: "left" | "right";
  position: number;
}

/** Preset image widths map to a percentage for the drag-resize model. */
export const IMG_PCT_PRESET: Record<ImgWidth, number> = {
  sm: 30,
  md: 50,
  lg: 75,
  full: 100,
};

export const FONT_CLASS: Record<FontChoice, string> = {
  display: "font-display",
  serif: "font-serif",
  sans: "font-body",
};

export const SIZE_CLASS: Record<TextSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-4xl md:text-5xl",
};

export const IMG_WIDTH_CLASS: Record<ImgWidth, string> = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-2xl",
  full: "max-w-full",
};

export const FONT_LABEL: Record<FontChoice, string> = {
  display: "Display",
  serif: "Serif",
  sans: "Sans",
};

export interface Blog {
  id: string;
  title: string;
  cover_image: string | null;
  excerpt: string | null;
  read_time: string | null;
  author_id: string | null;
  created_at: string;
}

export interface BlogWithSections extends Blog {
  blog_sections: BlogSection[];
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
