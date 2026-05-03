import { Button } from "../ui/button"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "../ui/navigation-menu"
import Link from "next/link"
import UserMenu from "./user-menu"

export default function Header() {
  return (
    <header className="w-full bg-background">
      <div className="container-wrapper px-6 group-has-data-[slot=designer]/layout:max-w-none 3xl:fixed:px-0">
        <div className="flex flex-col lg:flex-row lg:justify-between h-(--header-height) items-center **:data-[slot=separator]:h-4! group-has-data-[slot=designer]/layout:fixed:max-w-none 3xl:fixed:container">
          <Button render={<Link className="flex items-center gap-2" href="/" />} nativeButton={false} variant="ghost" className="h-12 my-1">
            Vinkas Base
          </Button>
          <NavigationMenu className="font-semibold">
            <NavigationMenuList>
              <NavigationMenuItem className="hidden md:list-item">
                <NavigationMenuLink href="/">Home</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}