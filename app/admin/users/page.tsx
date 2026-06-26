import { createClient } from "@/lib/supabase/server"
import UsersTable from "@/components/admin/users-table"

export default async function Page() {
  const supabase = await createClient()

  // Authenticate user and verify claims as done in the dashboard
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  if (claimsError || !claimsData?.claims) {
    throw new Error("Unauthorized")
  }

  // Fetch the list of users from Supabase Auth admin
  const { data, error } = await supabase.auth.admin.listUsers()

  const users = data?.users || []
  const errorMessage = error?.message

  return (
    <div className="flex-1 p-6 space-y-6 bg-background">
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
    </div>
  )
}