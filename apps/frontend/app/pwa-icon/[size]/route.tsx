import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

/**
 * Icônes PWA (/pwa-icon/192 et /pwa-icon/512), générées au build — même
 * design que app/icon.tsx. Le logo occupe ~60 % du carré : compatible avec
 * les icônes `maskable` d'Android (zone sûre = 80 % du centre).
 */

export const dynamic = "force-static"

const SIZES = ["192", "512"] as const

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params
  if (!SIZES.includes(size as (typeof SIZES)[number])) {
    return new Response(null, { status: 404 })
  }
  const px = Number(size)

  const logo = await readFile(join(process.cwd(), "public", "Logo C.E.C.j-BLANC.png"))
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`

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
        <img src={logoSrc} style={{ width: "60%", height: "60%", objectFit: "contain" }} alt="" />
      </div>
    ),
    { width: px, height: px },
  )
}
