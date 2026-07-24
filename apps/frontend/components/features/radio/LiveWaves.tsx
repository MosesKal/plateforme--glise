import { cn } from "@/lib/utils"

export function LiveWaves({
  active,
  className,
}: {
  active: boolean
  className?: string
}) {
  return (
    <span aria-hidden="true" className={cn("inline-flex h-5 items-center gap-0.5", className)}>
      {[0, 1, 2, 3].map((bar) => (
        <span
          key={bar}
          className={cn(
            "w-0.5 rounded-full bg-current transition-[height] duration-300",
            active ? "animate-pulse motion-reduce:animate-none" : "h-1.5",
            active && ["h-2", "h-4", "h-3", "h-5"][bar],
          )}
          style={active ? { animationDelay: `${bar * 120}ms` } : undefined}
        />
      ))}
    </span>
  )
}
