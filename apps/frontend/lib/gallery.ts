import "server-only"
import { readdirSync } from "fs"
import path from "path"

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i

/** Photos épinglées en tête de la galerie (ordre = ordre d'affichage), le reste suit par ordre alphabétique. */
const FEATURED_ORDER = [
  "650731373_122201476070573866_644263338686884455_n.jpg",
  "670515348_122205384620573866_452393700888848750_n.jpg",
  "668566958_122205384536573866_8105236588643463794_n.jpg",
]

/** Photos reléguées en fin de galerie (n'apparaissent pas dans l'aperçu des 8 premières). */
const DEPRIORITIZED = [
  "657945765_122203740698573866_2002728537333051687_n.jpg",
]

export function getGalleryImages(): string[] {
  const dir = path.join(process.cwd(), "public", "gallerie")
  const files = readdirSync(dir).filter((file) => IMAGE_EXTENSIONS.test(file)).sort()

  const featured = FEATURED_ORDER.filter((file) => files.includes(file))
  const deprioritized = DEPRIORITIZED.filter((file) => files.includes(file) && !FEATURED_ORDER.includes(file))
  const rest = files.filter((file) => !FEATURED_ORDER.includes(file) && !DEPRIORITIZED.includes(file))

  return [...featured, ...rest, ...deprioritized].map((file) => `/gallerie/${file}`)
}
