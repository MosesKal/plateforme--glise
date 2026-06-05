import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export function Card({ className, padding = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm",
        padding && "p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
