import { RadioIcon } from "@/components/ui/icons"

interface RadioPreviewProps {
  name: string
  description: string
  coverImage: string
  isActive: boolean
}

export function RadioPreview({
  name,
  description,
  coverImage,
  isActive,
}: RadioPreviewProps) {
  return (
    <aside className="overflow-hidden rounded-2xl bg-cecj-green text-white shadow-xl">
      <div className="relative aspect-[16/6] bg-white/5">
        {coverImage ? (
          // L’URL vient exclusivement du champ validé et de l’upload administrateur.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,203,50,0.2),transparent_65%)]">
            <RadioIcon className="h-12 w-12 text-cecj-gold" />
          </div>
        )}
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-white" />
          En direct
        </span>
      </div>

      <div className="space-y-2.5 p-3">
        <div>
          <p className="text-sm font-bold">{name || "Nom de la radio"}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/65">
            {description || "La description publique apparaîtra ici."}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cecj-gold text-cecj-green">
            <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold">Aperçu du lecteur</p>
            <p className="text-[10px] text-white/55">
              {isActive ? "Visible sur le site public" : "Radio actuellement inactive"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
