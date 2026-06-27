import UsersTable from "@/components/admin/users-table"
import { createAdminClient } from "@/lib/supabase/admin"
import { Suspense } from "react"

async function UsersList() {
  const supabase = await createAdminClient()

  // Fetch the list of users from Supabase Auth admin
  const { data, error } = await supabase.auth.admin.listUsers()

  const users = data?.users || []
  const errorMessage = error?.message
  users.sort((a, b) => {
    const lastSignInA = a.last_sign_in_at
    const lastSignInB = b.last_sign_in_at

    // If both have last_sign_in_at, compare them (newest first)
    if (lastSignInA && lastSignInB) {
      return lastSignInB.localeCompare(lastSignInA)
    }

    // If only b has last_sign_in_at, b comes first (newer)
    if (lastSignInA) {
      return -1
    }

    // If only a has last_sign_in_at, a comes first (newer)
    if (lastSignInB) {
      return 1
    }

    // If neither has last_sign_in_at, maintain relative order or use ID
    return 0
  })

  return (
    <>
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and view all registered users in your application.
          </p>
        </div>
        <div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {users.length} {users.length === 1 ? "user" : "users"}
          </span>
        </div>
      </div>

      <UsersTable initialUsers={users} error={errorMessage} />
    </>
  )
}

export default function Page() {
  return (
    <div className="flex-1 p-6 space-y-6 bg-background">
      <Suspense
        fallback={
          <>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Loading users...
                </p>
              </div>
            </div>
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-muted rounded w-full" />
              <div className="h-64 bg-muted rounded w-full" />
            </div>
          </>
        }
      >
        <UsersList />
      </Suspense>
    </div>
  )
}