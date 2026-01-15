"use client"

import Link from "next/link"

type PrimaryButtonProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export default function PrimaryButton({
  href,
  children,
  className = "",
}: PrimaryButtonProps) {
  return (
    <Link
      href={href}
      className={`rounded-lg bg-linear-to-r from-gray-500 to-gray-600 px-5 py-2 text-white font-medium hover:opacity-90 transition ${className}`}
    >
      {children}
    </Link>
  )
}
