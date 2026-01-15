"use client"

type HamburgerProps = {
  open: boolean
  onClick: () => void
}

export default function Hamburger({ open, onClick }: HamburgerProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex h-8 w-8 flex-col items-center justify-center gap-1.5 lg:hidden select-none cursor-pointer"
      aria-label="Toggle menu"
    >
      <span
        className={`h-0.5 w-6 bg-black transition-transform duration-300 ${
          open ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`h-0.5 w-6 bg-black transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`h-0.5 w-6 bg-black transition-transform duration-300 ${
          open ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </button>
  )
}
