import Link from 'next/link'

interface BrandLogoProps {
  /** 'light' = on a dark/navy background; 'dark' = on a white/light background */
  variant?: 'light' | 'dark'
  /** 'md' = 2.25rem pill (nav/panel); 'sm' = 2rem pill (mobile, top bars) */
  size?: 'md' | 'sm'
  href?: string
  className?: string
}

function LogoContent({ variant, size }: Required<Pick<BrandLogoProps, 'variant' | 'size'>>) {
  const pillSize = size === 'md' ? 'w-9 h-9' : 'w-8 h-8'
  const wordmarkColor = variant === 'light' ? 'text-[#FAFAF9]' : 'text-creek-500'

  return (
    <div className="flex items-center gap-3">
      <span
        className={`${pillSize} inline-flex items-center justify-center rounded-full bg-gold text-white text-xs font-bold font-sans shrink-0`}
      >
        DF
      </span>
      <span className={`font-display italic font-semibold text-[1.2rem] leading-none ${wordmarkColor}`}>
        Deira Fresh
      </span>
    </div>
  )
}

export function BrandLogo({
  variant = 'dark',
  size = 'md',
  href = '/',
  className = '',
}: BrandLogoProps) {
  if (href) {
    return (
      <Link href={href} className={`no-underline ${className}`}>
        <LogoContent variant={variant} size={size} />
      </Link>
    )
  }
  return (
    <div className={className}>
      <LogoContent variant={variant} size={size} />
    </div>
  )
}
