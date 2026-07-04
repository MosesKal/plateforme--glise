import type { ComponentType } from "react"

export type IconComponent = ComponentType<{ className?: string }>

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

export function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  )
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.66 9.184 8.438 9.94v-7.03H8.078v-2.91h2.36V9.845c0-2.33 1.393-3.62 3.504-3.62.996 0 2.04.177 2.04.177v2.85H14.61c-1.18 0-1.547.736-1.547 1.49v1.79h2.642l-.422 2.91h-2.22v7.03C18.34 21.244 22 17.08 22 12.06Z" />
    </svg>
  )
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" d="M13 3v11.5a3.25 3.25 0 1 1-2.5-3.16" />
      <path strokeLinecap="round" d="M13 6.2c.5 2 2.1 3.5 4 3.8" />
    </svg>
  )
}

export function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.2v5.6l5-2.8-5-2.8Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function RadioIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="12" cy="14.5" r="1.6" fill="currentColor" stroke="none" />
      <path strokeLinecap="round" d="M8.5 11a5 5 0 0 1 7 0M6 8.5a8.5 8.5 0 0 1 12 0" />
      <rect x="4" y="14" width="16" height="7" rx="1.8" />
      <path strokeLinecap="round" d="M8 17.5h.01" />
    </svg>
  )
}

export function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5a8.5 8.5 0 0 0-7.27 12.87L3.5 20.5l4.3-1.18A8.5 8.5 0 1 0 12 3.5Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.8 9.4c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.5 1.2c.1.2 0 .5-.1.6l-.4.4c-.1.1-.1.3 0 .4.5.9 1.3 1.7 2.2 2.2.1.1.3.1.4 0l.4-.4c.2-.2.4-.2.6-.1l1.2.5c.3.1.4.3.4.5v.5c0 .3 0 .6-.5.8-.6.3-1.5.2-2.6-.4-1.4-.7-2.6-1.9-3.3-3.3-.6-1.1-.7-2-.4-2.6Z"
      />
    </svg>
  )
}
