import { Props } from "@/types/header"

export default function Container({children}: Props) {
  return (
    <div className="mx-auto max-w-[1280px]">{children}</div>
  )
}