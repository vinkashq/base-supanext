"use client"

import { useState, useMemo } from "react"
import type { User } from "@supabase/supabase-js"
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  MailIcon,
  SmartphoneIcon,
  ShieldIcon,
  EyeIcon,
  DatabaseIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface UsersTableProps {
  initialUsers: User[]
  error?: string
}

const ITEMS_PER_PAGE = 10

export default function UsersTable({ initialUsers, error }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const email = user.email?.toLowerCase() || ""
      const fullName = (user.user_metadata?.full_name || "").toLowerCase()
      const userId = user.id.toLowerCase()
      const query = searchQuery.toLowerCase()

      return email.includes(query) || fullName.includes(query) || userId.includes(query)
    })
  }, [initialUsers, searchQuery])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredUsers, currentPage])

  // Reset page when search changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const getInitials = (user: User) => {
    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "?"
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
          <AlertTriangleIcon className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Error Loading Users</h4>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email or ID..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Sign In</th>
                <th className="p-4">Created At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isConfirmed = !!user.email_confirmed_at
                  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0]
                  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={avatarUrl} alt={displayName} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                              {getInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate group-hover:text-primary transition-colors">
                              {displayName}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold select-none",
                            isConfirmed
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          )}
                        >
                          {isConfirmed ? "Confirmed" : "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(user.last_sign_in_at)}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedUser(user)
                          }}
                          title="Inspect User"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span className="sr-only">Inspect User</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t p-4 bg-muted/10 text-xs">
            <span className="text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Inspector Drawer */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l shadow-2xl">
          {selectedUser && (
            <>
              <SheetHeader className="p-6 border-b bg-muted/10">
                <SheetTitle className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage
                      src={selectedUser.user_metadata?.avatar_url || selectedUser.user_metadata?.picture}
                      alt={selectedUser.user_metadata?.full_name || selectedUser.email}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {getInitials(selectedUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <h3 className="text-base font-semibold leading-none truncate max-w-[240px]">
                      {selectedUser.user_metadata?.full_name || selectedUser.email?.split("@")[0]}
                    </h3>
                    <span className="text-xs text-muted-foreground truncate max-w-[240px] mt-1">
                      ID: {selectedUser.id}
                    </span>
                  </div>
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-2">
                  Inspect authentication metadata and provider mappings.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Account Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Account Details
                  </h4>
                  <div className="rounded-lg border p-4 space-y-3 text-xs bg-muted/5">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <MailIcon className="h-3.5 w-3.5" /> Email
                      </span>
                      <span className="font-medium select-all">{selectedUser.email}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <SmartphoneIcon className="h-3.5 w-3.5" /> Phone
                      </span>
                      <span className="font-medium">{selectedUser.phone || "None"}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <ShieldIcon className="h-3.5 w-3.5" /> Auth Role
                      </span>
                      <span className="font-semibold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-sm">
                        {selectedUser.role || "Authenticated"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" /> Created At
                      </span>
                      <span>{formatDate(selectedUser.created_at)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" /> Last Sign In
                      </span>
                      <span>{formatDate(selectedUser.last_sign_in_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Identity Providers */}
                {selectedUser.app_metadata && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Authentication Providers
                    </h4>
                    <div className="rounded-lg border p-4 space-y-3 text-xs bg-muted/5">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Primary Provider</span>
                        <span className="font-medium capitalize bg-muted px-2.5 py-0.5 rounded-full">
                          {selectedUser.app_metadata.provider || "Email"}
                        </span>
                      </div>

                      {selectedUser.app_metadata.providers && (
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground">Linked Identities</span>
                          <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                            {(selectedUser.app_metadata.providers as string[]).map((prov) => (
                              <span
                                key={prov}
                                className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[10px] capitalize font-medium"
                              >
                                {prov}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* User Metadata */}
                {selectedUser.user_metadata && Object.keys(selectedUser.user_metadata).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      User Metadata
                    </h4>
                    <div className="rounded-lg border p-4 space-y-2.5 text-xs bg-muted/5">
                      {Object.entries(selectedUser.user_metadata).map(([key, value]) => {
                        if (typeof value === "object") return null
                        return (
                          <div key={key} className="flex justify-between items-start gap-4">
                            <span className="text-muted-foreground truncate capitalize">{key.replace("_", " ")}</span>
                            <span className="font-medium break-all text-right">{String(value)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Raw JSON */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <DatabaseIcon className="h-3.5 w-3.5" /> Raw User Object
                  </h4>
                  <pre className="rounded-lg border p-4 bg-muted/30 text-[10px] font-mono overflow-x-auto max-h-60 text-muted-foreground">
                    {JSON.stringify(selectedUser, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
