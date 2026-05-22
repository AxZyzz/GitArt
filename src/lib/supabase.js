const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function subscribeEmail(email) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ email, source: 'gitart-download' }),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`Failed to save email (${res.status})`);
  }
}
