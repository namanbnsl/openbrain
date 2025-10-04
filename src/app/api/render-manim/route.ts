import { NextResponse } from 'next/server';
import type { RenderRequest } from '../../../lib/e2b';
import { renderManimVideo } from '../../../lib/e2b';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RenderRequest;
    if (!body || !body.script || !body.prompt) {
      return NextResponse.json({ error: 'script and prompt are required' }, { status: 400 });
    }
    const dataUrl = await renderManimVideo(body);
    return NextResponse.json({ dataUrl });
  } catch (err: unknown) {
    console.error('render-manim route error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'render failed' }, { status: 500 });
  }
}
