const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Best-effort newsletter signup. Never let this block a download: it times out
// after a few seconds and callers should treat failures as non-fatal.
export async function subscribeEmail(email, { timeoutMs = 4000 } = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
      method: 'POST',
      signal: ctrl.signal,
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
  } finally {
    clearTimeout(timer);
  }
}
