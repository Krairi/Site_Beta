import { createClient } from '@supabase/supabase-js';

// Configuration credentials from the prompt
const SUPABASE_URL = 'https://ofizytudknfdaevhfqdj.supabase.co';
const SUPABASE_KEY = 'sb_publishable__viaQHb3aVkGFC0xx0YD0w_BoEAQmN7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);