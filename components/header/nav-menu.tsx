import { NavItem } from "@/lib/config"
import Image from "next/image"
import Link from "next/link"

export function NavMenuLink({ item }: { item: NavItem }) {
  if (!item.href) {
    return <a target={item.target} />
  }
  return <Link href={item.href} target={item.target} />
}

export function NavMenuLabel({ item }: { item: NavItem }) {
  if (!item.description) {
    return <span className="font-semibold">{item.label}</span>
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="font-bold">{item.label}</span>
      <span className="text-sm text-muted-foreground">{item.description}</span>
    </div>
  )
}

export function NavMenuImage({ item }: { item: NavItem }) {
  if (!item.imageUrl) return null
  return <Image src={item.imageUrl} alt={item.label} width={40} height={40} />
}
