import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/admin/dashboard'

  console.log('Auth confirm called with:', { token_hash: !!token_hash, type, next })

  if (token_hash && type) {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (!error && data?.user) {
        console.log('Auth confirmation successful for user:', data.user.id)
        
        // Create or update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || 
                       data.user.user_metadata?.name || 
                       data.user.email?.split('@')[0] || 'User',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Error creating/updating profile:', profileError)
        }

        // Redirect user to specified redirect URL or dashboard
        const redirectUrl = next.startsWith('/') ? next : '/admin/dashboard'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      } else {
        console.error('Auth confirmation failed:', error)
      }
    } catch (err) {
      console.error('Auth confirmation error:', err)
    }
  } else {
    console.error('Missing token_hash or type in auth confirmation')
  }

  // redirect the user to an error page with some instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}