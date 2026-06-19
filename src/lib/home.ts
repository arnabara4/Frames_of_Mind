export interface FrameItem {
  image_url: string;
  caption: string;
}

export interface HomeContent {
  kicker: string;
  title: string;
  accent: string;
  subline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  bgWord: string;
  frames: FrameItem[]; // exactly 3 — hero scrapbook
  quote: string;
  quoteCaption: string;
  gallery: FrameItem[]; // exactly 3 — moments
}

export const DEFAULT_HOME: HomeContent = {
  kicker: "a quiet place to keep my autumn thoughts",
  title: "Collected thoughts,",
  accent: "like falling leaves.",
  subline:
    "A sanctuary of words — where the written self steps forward when the spoken one falters. Pull up a chair; the kettle's warm.",
  ctaPrimary: "Read the journal",
  ctaSecondary: "About me",
  bgWord: "Pranavi",
  frames: [
    { image_url: "", caption: "frames of mind" },
    { image_url: "", caption: "october light" },
  ],
  quote:
    "Never stop fighting until you arrive at your destined place — that is, the unique you.",
  quoteCaption: "— a whisper carried on the autumn wind",
  gallery: [
    { image_url: "", caption: "morning ink" },
    { image_url: "", caption: "amber hours" },
    { image_url: "", caption: "last warmth" },
  ],
};

/** Merge stored partial content over the defaults, padding arrays to fixed sizes. */
export function mergeHome(data: Partial<HomeContent> | null | undefined): HomeContent {
  const d = data ?? {};
  const pad = (arr: FrameItem[] | undefined, fallback: FrameItem[], n: number) => {
    const out = [...(arr ?? [])];
    for (let i = 0; i < n; i++) out[i] = { ...fallback[i], ...(out[i] ?? {}) };
    return out.slice(0, n);
  };
  return {
    ...DEFAULT_HOME,
    ...d,
    frames: pad(d.frames, DEFAULT_HOME.frames, 2),
    gallery: pad(d.gallery, DEFAULT_HOME.gallery, 3),
  };
}
