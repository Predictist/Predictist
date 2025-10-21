import { NextResponse } from 'next/server';

export async function POST(req: Request){
  // NOTE: replace with ConvertKit/Beehiiv/etc.
  const { email, list } = await req.json().catch(()=>({}));
  if(!email || !list) return NextResponse.json({ ok:false, error:'missing' }, { status: 400 });

  // pretend we saved it
  console.log('SUBSCRIBE:', { email, list, at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
