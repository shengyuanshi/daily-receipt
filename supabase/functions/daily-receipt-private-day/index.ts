import { createClient } from 'npm:@supabase/supabase-js@^2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  const authHeader = request.headers.get('Authorization') || '';
  const date = new URL(request.url).searchParams.get('date') || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ ok: false, error: 'Expected date=YYYY-MM-DD' }, { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey || !authHeader) {
    return Response.json({ ok: false, error: 'Missing authenticated session' }, { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabase
    .from('daily_receipts')
    .select('receipt_date,data,meta')
    .eq('receipt_date', date)
    .maybeSingle();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
  if (!data) {
    return Response.json({ ok: false, error: 'No private receipt for this date' }, { status: 404, headers: corsHeaders });
  }

  return Response.json({
    ok: true,
    data: data.data,
    meta: {
      ...(data.meta || {}),
      date: data.receipt_date,
      source: 'private-supabase',
    },
  }, { headers: corsHeaders });
});
