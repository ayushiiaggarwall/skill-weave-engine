interface TextLogoProps {
  className?: string
}

export function TextLogo({ className = "" }: TextLogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="font-bold text-2xl md:text-3xl">
        <span className="bg-gradient-to-r from-yellow-400 via-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Tech With
        </span>
      </div>
      <div className="text-[10px] md:text-xs font-medium text-foreground/70 tracking-wider uppercase">
        AYUSHI AGGARWAL
      </div>
    </div>
  )
}