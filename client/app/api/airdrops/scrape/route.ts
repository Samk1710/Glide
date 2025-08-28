import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbConnect } from '@/lib/db';
import AirdropModel from '@/lib/models/Airdrop';
import { extractJSONArray } from '@/lib/utils/json';
import { AirdropZ } from '@/types/airdrop';
import { AIRDROP_JSON_PROMPT } from '@/lib/prompt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { count = 10 } = await req.json().catch(() => ({ count: 10 }));

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (!apiKey) return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = AIRDROP_JSON_PROMPT;

    const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    const text = res.response.text();

    const jsonRaw = extractJSONArray(text);
    const parsed = JSON.parse(jsonRaw);

    if (!Array.isArray(parsed)) throw new Error('Model output not an array');

    // Validate and upsert
    const saved: any[] = [];
    for (const item of parsed.slice(0, count)) {
      const result = AirdropZ.safeParse(item);
      if (!result.success) {
        console.warn('Validation failed for item', result.error.flatten());
        continue;
      }
      const doc = result.data;
      await AirdropModel.findOneAndUpdate({ slug: doc.slug }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
      saved.push(doc);
    }

    return NextResponse.json({ ok: true, count: saved.length, data: saved });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
