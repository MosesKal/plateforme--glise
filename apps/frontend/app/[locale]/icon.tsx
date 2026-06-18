import { ImageResponse } from "next/og"
import { readFileSync } from "fs"
import { join } from "path"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  const logoData = readFileSync(join(process.cwd(), "public", "Logo C.E.C.j-BLANC.png"))
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        background: "#024339",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "4px",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} style={{ width: "85%", height: "85%", objectFit: "contain" }} alt="" />
    </div>,
    { ...size },
  )
}
