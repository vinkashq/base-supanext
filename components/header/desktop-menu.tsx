import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../ui/navigation-menu"
import { navItems, NavItem } from "@/lib/config"
import { NavMenuImage, NavMenuLabel, NavMenuLink } from "./nav-menu"

export default function DesktopMenu() {
  return (
    <NavigationMenu className="font-semibold hidden lg:block">
      <NavigationMenuList>
        {navItems.map((item, index) => {
          if (item.items) {
            return <DesktopSubMenu key={index} item={item} />
          }
          return <DesktopMenuItem key={index} item={item} />
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function DesktopMenuItem({ item }: { item: NavItem }) {
  if (!item.href) return null

  if (item.imageUrl) {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink render={<NavMenuLink item={item} />} className="flex gap-4 items-start">
          <NavMenuImage item={item} />
          <NavMenuLabel item={item} />
        </NavigationMenuLink>
      </NavigationMenuItem>
    )
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuLink render={<NavMenuLink item={item} />}>
        <NavMenuLabel item={item} />
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

function DesktopSubMenu({ item }: { item: NavItem }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="font-semibold">{item.label}</NavigationMenuTrigger>
      <NavigationMenuContent className="min-w-40">
        {item.items?.map((item, index) => (
          <DesktopMenuItem key={index} item={item} />
        ))}
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}