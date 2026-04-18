import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', // Local stub
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ey...', // Local stub
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isStudentPublicProfile = /^\/student\/[^/]+$/.test(path) && path !== '/student/dashboard'
  
  const isPublicRoute = path.startsWith('/public') || path === '/' || path.startsWith('/api') || path === '/about' || isStudentPublicProfile || path.startsWith('/auth')
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup')

  if (!user && !isPublicRoute && !isAuthRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages to home routing
  if (user && isAuthRoute) {
    const defaultUrl = request.nextUrl.clone()
    defaultUrl.pathname = '/'
    return NextResponse.redirect(defaultUrl)
  }

  // DB calls removed natively mapping to fast edge latency.
  return supabaseResponse
}
