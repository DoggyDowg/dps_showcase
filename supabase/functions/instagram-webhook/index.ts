// Follow Deno's deployment guide for more details:
// https://deno.land/manual/getting_started/setup_your_environment

interface WebhookRequest extends Request {
  method: string;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
}

interface WebhookResponse {
  status: number;
  body: string;
}

export async function handler(req: WebhookRequest): Promise<WebhookResponse> {
  if (req.method === 'GET') {
    // Handle the verification request
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
      return { status: 200, body: challenge || '' }
    }

    return { status: 403, body: 'Invalid verification token' }
  }

  if (req.method === 'POST') {
    // Handle the webhook event
    const data = await req.json()
    console.log('Received webhook event:', data)

    // Process the webhook data here
    // ...

    return { status: 200, body: 'Event received' }
  }

  return { status: 405, body: 'Method not allowed' }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/instagram-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
