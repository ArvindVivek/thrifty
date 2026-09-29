import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// The link-preview card (docs/web/seo-and-icons.md, step 4). Satori renders it: flexbox only,
// every box declares display:flex, inline styles only, colours inlined from lib/site.ts.
export const alt = `${site.name}: ${site.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** lucide's "tag" (ISC), the same mark as app/icon.svg. */
const TAG =
  "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z M7.5 5.5a2 2 0 1 0 0 4a2 2 0 1 0 0-4z";

const PRICES = ["$300", "$950", "$1,600", "$4,700"];

function Card({ title, sentence, art }: { title: string; sentence: string; art: boolean }) {
  const c = site.card;
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", padding: 80, background: c.bg, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 40 }}>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            fontSize: 26,
            fontWeight: 700,
            color: c.onAccent,
            background: c.accent,
            borderRadius: 999,
            padding: "8px 22px",
          }}
        >
          Arcade budget game
        </div>
        <div style={{ display: "flex", fontSize: 120, fontWeight: 700, color: c.ink, letterSpacing: -2, marginTop: 24 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 38, color: c.ink2, marginTop: 12, lineHeight: 1.3 }}>{sentence}</div>
        {art && (
          <div style={{ display: "flex", marginTop: 36 }}>
            {PRICES.map((p) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 700,
                  color: c.ink,
                  background: "#FFFFFF",
                  borderRadius: 999,
                  padding: "6px 18px",
                  marginRight: 14,
                  boxShadow: "0 3px 0 rgba(18,24,41,0.12)",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", fontSize: 26, color: c.ink2, marginTop: 40 }}>Made by Kitchen Labs</div>
      </div>
      {art && (
        <div
          style={{
            display: "flex",
            width: 360,
            height: 360,
            borderRadius: 80,
            background: `linear-gradient(135deg, #B5D62A, ${c.accentDeep})`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="230" height="230" viewBox="0 0 24 24">
            <path d={TAG} fill={c.onAccent} fillRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function OpengraphImage() {
  // A share image must never throw: a preview that 500s is a link nobody clicks. Keep anything
  // that can fail (data fetches, font loads) inside this try.
  try {
    return new ImageResponse(<Card title={site.name} sentence="Catch five things. Don't bust the budget." art />, size);
  } catch (err) {
    console.error("[og] falling back to the plain card", err);
    return new ImageResponse(<Card title="Thrifty" sentence="" art={false} />, size);
  }
}
