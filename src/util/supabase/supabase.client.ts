import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 환경 변수에 설정되지 않았습니다.'
      );
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
};