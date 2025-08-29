import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle auth routes - redirect authenticated users away from auth pages
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/sign-in') ||
      request.nextUrl.pathname.startsWith('/sign-up'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // Handle protected routes
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/admin') ||
      request.nextUrl.pathname.startsWith('/profile'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Handle admin-specific routes with role checking
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Check admin role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .maybeSingle()

      const roleName = userRole?.roles ? 
        (Array.isArray(userRole.roles) ? userRole.roles[0]?.name : (userRole.roles as any)?.name) 
        : 'viewer'

      // Allow admin and editor access
      if (roleName !== 'admin' && roleName !== 'editor') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(url)
      }

      // Add role info to headers
      response.headers.set('x-user-role', roleName)
    } catch (error) {
      console.error('Role check error in middleware:', error)
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('error', 'auth_error')
      return NextResponse.redirect(url)
    }
  }

  // Handle admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    try {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .maybeSingle()

      const roleName = userRole?.roles ? 
        (Array.isArray(userRole.roles) ? userRole.roles[0]?.name : (userRole.roles as any)?.name) 
        : 'viewer'

      if (roleName !== 'admin') {
        return NextResponse.json({ 
          error: 'Admin access required',
          userRole: roleName
        }, { status: 403 })
      }

      response.headers.set('x-user-role', roleName)
      response.headers.set('x-user-id', user.id)
    } catch (error) {
      console.error('API admin role check error:', error)
      return NextResponse.json({ error: 'Authorization check failed' }, { status: 500 })
    }
  }

  // Handle editor API routes
  if (request.nextUrl.pathname.startsWith('/api/editor')) {
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    try {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .maybeSingle()

      const roleName = userRole?.roles ? 
        (Array.isArray(userRole.roles) ? userRole.roles[0]?.name : (userRole.roles as any)?.name) 
        : 'viewer'

      if (roleName !== 'admin' && roleName !== 'editor') {
        return NextResponse.json({ 
          error: 'Editor access required',
          userRole: roleName
        }, { status: 403 })
      }

      response.headers.set('x-user-role', roleName)
      response.headers.set('x-user-id', user.id)
    } catch (error) {
      console.error('API editor role check error:', error)
      return NextResponse.json({ error: 'Authorization check failed' }, { status: 500 })
    }
  }

  return response
}