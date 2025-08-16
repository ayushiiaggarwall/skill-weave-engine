import { Badge } from "@/components/ui/badge"

interface SectionBadgeProps {
  children: React.ReactNode
  className?: string
}

export function SectionBadge({ children, className = "" }: SectionBadgeProps) {
  return (
    <Badge className={`mb-4 px-4 py-2 bg-yellow-400 text-yellow-900 border-yellow-500 dark:bg-yellow-500 dark:text-yellow-950 dark:border-yellow-600 ${className}`}>
      {children}
    </Badge>
  )
}
