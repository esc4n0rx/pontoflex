import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e/ou Anon Key não foram configurados corretamente nas variáveis de ambiente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
