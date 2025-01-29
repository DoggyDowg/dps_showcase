import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client with proper cookie handling
    const supabase = createRouteHandlerClient({ cookies });

    // Get agent's name from the database
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('name, email')
      .eq('id', agentId)
      .single();

    if (agentError) {
      console.error('Error fetching agent:', agentError);
      return NextResponse.json(
        { error: 'Error fetching agent information' },
        { status: 500 }
      );
    }

    // Extract first name from agent's full name and return agent data
    const firstName = agentData.name.split(' ')[0];
    
    return NextResponse.json({
      firstName,
      email: agentData.email,
      name: agentData.name
    });
  } catch (error) {
    console.error('Error in contact API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}