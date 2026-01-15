"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { DropdownProps } from "../../types/header"

export default function Dropdown({ label, links }: DropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative group">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 py-2 cursor-pointer select-none"
      >
        {label}
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
        />
      </button>

      {/* Menu */}
      <div
        className={`
          lg:absolute left-0 top-full mt-2 min-w-[180px] rounded-md bg-white lg:shadow-lg z-50
          
          /* Mobile: click toggle */
          ${open ? "flex flex-col" : "hidden"}
          
          /* Desktop: hover toggle */
          lg:invisible lg:opacity-0 lg:group-hover:visible lg:group-hover:opacity-100 lg:flex lg:flex-col
          transition-all duration-200
        `}
      >
        <ul className="flex flex-col gap-2">
          {links?.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black w-full whitespace-nowrap"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
