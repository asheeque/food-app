import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/supplier/dashboard', '/restaurant/dashboard']

const ROLE_HOME: Record<string, string> = {
  admin:      '/dashboard',
  supplier:   '/supplier/dashboard',
  restaurant: '/restaurant/dashboard',
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired — must run before any auth check.
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  const isLoginPage = pathname === '/auth/login'

  // No session → block protected routes, preserve intended destination
  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Has session → skip the login page, send to role dashboard
  if (isLoginPage && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const dest = profile?.role ? (ROLE_HOME[profile.role] ?? '/dashboard') : '/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/supplier/dashboard/:path*',
    '/restaurant/dashboard/:path*',
    '/auth/login',
  ],
}
