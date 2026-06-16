export const prerender = false;

import type { APIRoute } from 'astro';

// ─── Configuration ────────────────────────────────────────────────────────────

const REDIRECT_SUCCESS     = import.meta.env.FORM_SUBMIT_THANK_YOU_URL
  ?? process.env.FORM_SUBMIT_THANK_YOU_URL
  ?? 'https://thegray.company/thank-you';

/**
 * Hard-coded entries require a redeploy; add runtime entries to the
 * IP_BLACKLIST environment variable (comma-separated, no redeploy needed).
 * Accepts both exact IPs and CIDR ranges.
 */
const STATIC_BLACKLIST: string[] = [
  // '203.0.113.5',
  // '198.51.100.0/24',
];

function isBlacklisted(ip: string): boolean {
  const runtimeEntries = (import.meta.env.IP_BLACKLIST ?? process.env.IP_BLACKLIST ?? '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

  return [...STATIC_BLACKLIST, ...runtimeEntries]
    .some(range => ipMatchesRange(ip, range));
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export const POST: APIRoute = async (context) => {
  // clientAddress is provided by the Vercel adapter for non-prerendered routes.
  // The try/catch guards against running outside Vercel (e.g. `astro dev`).
  let ip: string;
  try {
    ip = context.clientAddress;
  } catch {
    const xff = context.request.headers.get('x-forwarded-for');
    ip = xff ? xff.split(',')[0].trim() : '0.0.0.0';
  }

  // ── 1. Blacklist ─────────────────────────────────────────────────────────
  if (isBlacklisted(ip)) {
    console.warn(`[contact] Blocked blacklisted IP: ${ip}`);
    // Silent success redirect — don't signal to the sender that they're blocked
    return context.redirect(REDIRECT_SUCCESS, 302);
  }

  // ── 3. Parse form body ───────────────────────────────────────────────────

  let formData: FormData;
  try {
    formData = await context.request.formData();
  } catch {
    return new Response('Invalid form submission.', { status: 400 });
  }

  const email   = formData.get('email')   as string | null;
  const fname   = formData.get('fname')   as string | null;
  const lname   = formData.get('lname')   as string | null;
  const message = formData.get('message') as string | null;
  const consent = formData.get('consent') as string | null;

  // Email format intentionally not validated here — browser validation and
  // StaticForms handle it upstream. ("There be dragons.")
  if (!email || !fname || !lname || !message) {
    return new Response('Missing required fields.', { status: 400 });
  }

  // ── 4. Proxy to StaticForms with the server-side API key ─────────────────

  const payload = new URLSearchParams({
    apiKey:     import.meta.env.STATICFORMS_API_KEY ?? process.env.STATICFORMS_API_KEY ?? '',
    email,
    fname,
    lname,
    message,
    redirectTo: REDIRECT_SUCCESS, // locked server-side; client can't override
  });

  console.log('payload:', payload);
  return context.redirect(REDIRECT_SUCCESS, 302);

  // const sfBody = await sfRes.text().catch(() => '');
  return new Response('Form submission failed. Please try again.', { status: 502 });
};
