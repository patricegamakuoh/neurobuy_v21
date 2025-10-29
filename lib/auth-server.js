// Server-side auth utilities - only for use in API routes and server components
import { createClient } from '@/lib/supabase/server'

export const getCurrentUserServer = async () => {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}
