import Link from "next/link"
import { Button } from "../ui/button"

export default function GuestMenu() {
  return (
    <Button render={<Link href="/auth/login" />}>
      Login
    </Button>
  )
}