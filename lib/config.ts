export type NavItem = {
  label: string
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  items?: NavItem[]
  imageUrl?: string
  description?: string
}

export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    label: "Submenu",
    items: [
      { label: "Item 1", href: "#item1", target: "_blank" },
      { label: "Item 2", href: "#item2", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", description: "Item 2 description" },
    ]
  },
]