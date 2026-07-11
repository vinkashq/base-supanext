import { Button } from "../ui/button"
import Link from "next/link"
import UserMenu from "./user-menu"
import DesktopMenu from "./desktop-menu"
import MobileMenu from "./mobile-menu"

export default function Header() {
  return (
    <header className="w-full bg-background">
      <div className="container-wrapper px-6 group-has-data-[slot=designer]/layout:max-w-none 3xl:fixed:px-0">
        <div className="flex flex-row justify-between h-(--header-height) items-center **:data-[slot=separator]:h-4! group-has-data-[slot=designer]/layout:fixed:max-w-none 3xl:fixed:container">
          <Button render={<Link className="flex items-center gap-2" href="/" />} nativeButton={false} variant="ghost" className="h-12 my-1">
            Vinkas Base
          </Button>
          <DesktopMenu />
          <div className="flex items-center gap-2">
            <MobileMenu />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}