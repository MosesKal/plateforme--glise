import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

/**
 * Image Open Graph par défaut du site (1200×630), servie sur /og et référencée
 * par OG_DEFAULTS (lib/seo.ts). Générée au build à partir du logo — pas
 * d'asset statique à maintenir.
 *
 * Route handler plutôt que la convention opengraph-image : dans cette version
 * de Next, l'image par convention ne se propage pas aux pages enfants qui
 * définissent leur propre `openGraph` — une URL stable référencée
 * explicitement est le seul comportement prévisible.
 */

export const dynamic = "force-static"

const SIZE = { width: 1200, height: 630 }

export async function GET() {
  const logo = await readFile(join(process.cwd(), "public", "Logo C.E.C.j-BLANC.png"))
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "linear-gradient(135deg, #024339 0%, #013128 100%)",
        }}
      >
        {/* Ratio du logo source : 8123 × 10326 (portrait) */}
        <img src={logoSrc} width={189} height={240} alt="" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Église Camp de Jésus-Christ Bel-Air Fizi
          </div>
          <div style={{ width: 72, height: 6, background: "#ffcb32", borderRadius: 3 }} />
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.65)" }}>
            Enseignements · Événements · Vie de l&apos;église
          </div>
        </div>
      </div>
    ),
    SIZE,
  )
}
