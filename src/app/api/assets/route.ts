import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.error('Authentication error:', {
        error: authError,
        message: authError?.message,
        name: authError?.name,
        status: authError?.status
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the asset data from the request
    const assetData = await request.json();
    console.log('Received asset data:', assetData);

    // Insert the asset record
    const { data, error } = await supabase
      .from('assets')
      .insert([assetData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        assetData
      });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('Asset created successfully:', data);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error in asset creation:', {
      error: err,
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 