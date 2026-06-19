export type SectionKind = "title" | "paragraph" | "quote" | "image";

export interface BlogSection {
  id: string;
  blog_id: string;
  kind: SectionKind;
  content: string | null;
  image_url: string | null;
  position: number;
}

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
