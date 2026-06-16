import type { IconComponent } from "@/components/ui/icons"

interface SocialLinkProps {
  href?: string
  label: string
  icon: IconComponent
  comingSoonLabel?: string
}

export function SocialLink({ href, label, icon: Icon, comingSoonLabel }: SocialLinkProps) {
  if (!href) {
    return (
      <button
        type="button"
        disabled
        aria-label={label}
        title={comingSoonLabel}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/40"
      >
        <Icon className="h-5 w-5" />
      </button>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-cecj-gold hover:text-cecj-green"
    >
      <Icon className="h-5 w-5" />
    </a>
  )
}
