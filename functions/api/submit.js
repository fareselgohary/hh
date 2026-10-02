import { QUESTIONS, assess, valid } from '../../public/logic.js';

// POST /api/submit  { answers: { q1: '25-39', ... } }  → stores one anonymous row in D1
export async function onRequestPost({ request, env }) {
  let answers;
  try { ({ answers } = await request.json()); } catch { return new Response('Bad JSON', { status: 400 }); }
  if (!valid(answers)) return new Response('Invalid answers', { status: 400 });

  // keep only known keys; pathway recomputed server-side so stored data can't be spoofed
  const clean = Object.fromEntries(QUESTIONS.map(q => [q.id, answers[q.id]]));
  const { pathway } = assess(clean);

  await env.DB.prepare('INSERT INTO submissions (pathway, answers) VALUES (?, ?)')
    .bind(pathway, JSON.stringify(clean)).run();
  return Response.json({ ok: true });
}
