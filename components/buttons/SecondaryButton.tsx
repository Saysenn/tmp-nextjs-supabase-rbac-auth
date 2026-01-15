"use client"

import Link from "next/link"

type SecondaryButtonProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export default function SecondaryButton({
  href,
  children,
  className = "",
}: SecondaryButtonProps) {
  return (
    <Link
      href={href}
      className={`rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 transition ${className}`}
    >
      {children}
    </Link>
  )
}
