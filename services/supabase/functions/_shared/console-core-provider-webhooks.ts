export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, cronofy-hmac-sha256',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function required(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export function optional(name: string): string {
  return Deno.env.get(name) ?? '';
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export async function readRawBody(req: Request): Promise<string> {
  return await req.text();
}

export function safeJsonParse<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

export function headerMap(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of req.headers.entries()) {
    out[key] = value;
  }
  return out;
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function hmacSha256Base64(secret: string, payload: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(payload));
  let binary = '';
  for (const byte of new Uint8Array(signature)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function headerContainsSignature(headerValue: string, expected: string): boolean {
  return headerValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .some((candidate) => timingSafeEqual(candidate, expected));
}
