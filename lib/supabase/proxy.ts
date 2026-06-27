import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const adminPaths = ['/admin', '/api/admin']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  const pathname = request.nextUrl.pathname
  const protectedPaths = adminPaths

  if (
    pathname !== "/" &&
    !user &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth") &&
    protectedPaths.some((path) => pathname.startsWith(path))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user) {
    if (adminPaths.some((path) => pathname.startsWith(path))) {
      if (!user.roles?.includes("admin")) {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}