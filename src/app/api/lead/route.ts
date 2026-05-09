import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { LeadInput } from '@/types';

export async function POST(request: Request) {
  try {
    const body: LeadInput = await request.json();
    const { email, companyName, role, auditId } = body;

    if (!email || !auditId) {
      return NextResponse.json(
        { error: 'Email and Audit ID are required' },
        { status: 400 }
      );
    }

    // 1. Insert into Supabase (using 'company' as per schema)
    const { error: dbError } = await supabase
      .from('leads')
      .insert([
        {
          audit_id: auditId,
          email,
          company: companyName || null,
          role: role || null,
        }
      ]);

    if (dbError) {
      console.error('Supabase lead insert error:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
