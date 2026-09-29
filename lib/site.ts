// The app's identity in one place. The icon, share card, manifest, robots and sitemap
// templates all read it. This file is yours: the sync script copies it once (--init) and never
// overwrites it.

export const site = {
  /** Shown in the header, the tab title and the share card. */
  name: "Thrifty",
  /** Home-screen label: 12 characters or fewer. */
  shortName: "Thrifty",
  /** One plain sentence: what it does and for whom. */
  description: "A quick arcade shopping game: catch five things before time runs out without going over budget.",
  /** Production URL, no trailing slash. Makes share-image URLs absolute. */
  url: "https://thrifty-kappa.vercel.app",
  /** Brand key: privacy and support links live at kitchenlabs-one.vercel.app/apps/<slug>/. */
  slug: "thrifty",
  /** false for private, single-owner tools: robots.ts then disallows everything. */
  isPublic: true,
  /** Must equal --bg in kl-tokens.css (light, dark) so browser chrome never flashes. */
  themeColor: { light: "#F2F4F9", dark: "#0B0F1A" },
  /** Share-card colours (Satori can't read CSS variables): the app's accent and neutrals. */
  card: { bg: "#F2F4F9", ink: "#121829", ink2: "#5A6479", accent: "#A3C614", accentDeep: "#758F0E", onAccent: "#1E2605" },
} as const;
