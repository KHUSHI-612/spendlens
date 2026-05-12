import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { LeadInput } from '@/types';
import { Resend } from 'resend';



export async function POST(request: Request) {
  // Initialize Resend inside the handler to prevent build-time errors
  const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

  try {
    const body: LeadInput = await request.json();
    const { email, company, role, auditId, savingsAmount, website } = body;

    // 1. Honeypot check (spam protection)
    if (website) {
      console.warn('Honeypot triggered - silent skip');
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!email || !auditId) {
      return NextResponse.json(
        { error: 'Email and Audit ID are required' },
        { status: 400 }
      );
    }

    // 2. Rate Limiting: Check if same email submitted in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: existingLeads, error: checkError } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .gt('created_at', oneHourAgo)
      .limit(1);

    if (checkError) {
      console.error('Rate limit check error:', checkError);
    }

    if (existingLeads && existingLeads.length > 0) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    // 3. Save to Supabase
    const { error: dbError } = await supabase
      .from('leads')
      .insert([
        {
          audit_id: auditId,
          email,
          company: company || null,
          role: role || null,
          savings_amount: savingsAmount || null,
        }
      ]);

    if (dbError) {
      console.error('Supabase lead insert error:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 4. Send confirmation email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: email, // Send to the user who submitted
          subject: 'Your SpendLens Savings Report',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #3b82f6;">Your SpendLens Audit is Ready</h1>
              <p>Hi there,</p>
              <p>Thanks for using SpendLens. We've captured your audit results and our team is reviewing them now.</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h2 style="margin-top: 0;">Estimated Savings: <span style="color: #10b981;">$${savingsAmount}/mo</span></h2>
                <p><strong>Audit ID:</strong> ${auditId}</p>
              </div>

              <p>You can view your full interactive report at any time using this link:</p>
              <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/audit/${auditId}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View My Report</a></p>
              
              <p>One of our savings experts will reach out shortly to help you implement these optimizations.</p>
              <p>Best,<br>The SpendLens Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Resend email error:', emailError);
        // We don't fail the whole request if email fails, but we've logged it
      }
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
