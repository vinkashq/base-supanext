import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Menu } from "lucide-react"
import { NavItem, navItems } from "@/lib/config"
import { NavMenuImage, NavMenuLabel, NavMenuLink } from "./nav-menu"

export default function MobileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="font-semibold lg:hidden">
        <Menu />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Navigation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {navItems.map((item, index) => {
            if (item.items) {
              return <MobileSubMenu key={index} item={item} />
            }
            return <MobileMenuItem key={index} item={item} />
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileMenuItem({ item }: { item: NavItem }) {
  if (!item.href) return null

  if (item.imageUrl) {
    return (
      <DropdownMenuItem render={<NavMenuLink item={item} />} className="flex gap-4 items-start">
        <NavMenuImage item={item} />
        <NavMenuLabel item={item} />
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem render={<NavMenuLink item={item} />}>
      <NavMenuLabel item={item} />
    </DropdownMenuItem>
  )
}

function MobileSubMenu({ item }: { item: NavItem }) {
  if (!item.items) return null

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="font-semibold">{item.label}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {item.items.map((item, index) => (
            <MobileMenuItem key={index} item={item} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}