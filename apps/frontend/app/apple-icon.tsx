import { readFileSync } from "fs"
import { join } from "path"
import { ImageResponse } from "next/og"

/**
 * apple-touch-icon (180×180) : icône « Ajouter à l'écran d'accueil » sur iOS.
 * Même design que app/icon.tsx ; iOS applique lui-même l'arrondi des coins.
 */

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  const logoData = readFileSync(join(process.cwd(), "public", "Logo C.E.C.j-BLANC.png"))
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#024339",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} style={{ width: "70%", height: "70%", objectFit: "contain" }} alt="" />
      </div>
    ),
    { ...size },
  )
}
