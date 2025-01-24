// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

interface WebhookRequest extends Request {
  method: string;
  url: string;
}

interface WebhookBody {
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      field: string;
      value: any;
    }>;
  }>;
}

const VERIFY_TOKEN = Deno.env.get('INSTAGRAM_VERIFY_TOKEN')
const APP_SECRET = Deno.env.get('INSTAGRAM_APP_SECRET')

// Function to verify webhook signature
const verifySignature = (signature: string | null, body: WebhookBody): boolean => {
  if (!signature || !APP_SECRET) return false;
  
  // Use the body in signature verification
  console.log('Verifying signature for body:', body);
  // TODO: Implement proper signature verification
  return true;
}

serve(async (req: WebhookRequest) => {
  // Handle GET request for webhook verification
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified!')
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // Handle POST request for webhook updates
  if (req.method === 'POST') {
    try {
      const signature = req.headers.get('x-hub-signature')
      const body = await req.json() as WebhookBody

      // Verify the webhook signature
      if (!verifySignature(signature, body)) {
        return new Response('Invalid signature', { status: 401 })
      }

      console.log('Received webhook:', body)

      // Here you can process the Instagram updates
      // For example, store new posts in your database

      return new Response('OK', { status: 200 })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/instagram-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
