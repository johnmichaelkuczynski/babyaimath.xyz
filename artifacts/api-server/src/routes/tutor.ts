import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, lecturesTable } from "@workspace/db";
import { AskTutorBody, AskTutorResponse } from "@workspace/api-zod";
import { chatText, chatJson, FAST_MODEL } from "../lib/ai";

const router: IRouter = Router();

router.get("/tutor/suggestions/:lectureId", async (req, res): Promise<void> => {
  const lectureId = Number(req.params.lectureId);
  if (!Number.isFinite(lectureId)) {
    res.status(400).json({ error: "invalid lectureId" });
    return;
  }
  const [lecture] = await db
    .select()
    .from(lecturesTable)
    .where(eq(lecturesTable.id, lectureId));
  if (!lecture) {
    res.status(404).json({ error: "lecture not found" });
    return;
  }

  const SYSTEM_PROMPT =
    'You are a rigorous introductory AI math tutor writing study questions. Reply as strict JSON of the form {"questions": string[]} with NO other keys.';
  const buildUserPrompt = (extra: string) =>
    extra +
    `From the lecture below, write 6 starter questions that make the student APPLY the lecture's ideas to a CONCRETE EXAMPLE. Every question must hang on a specific case and ask the student to reason about that case.\n\n` +
    `THE SINGLE MOST IMPORTANT RULE: every question must contain an explicit, concrete, EVERYDAY example — a specific relatable situation (e.g. "the words 'cat' and 'kitten' end up as two points that sit very close together while 'cat' and 'bicycle' sit far apart", "a music app lines up songs by how similar they are to one you just liked", "a model takes too big a step while learning and shoots straight past the best answer", "a chatbot answers a question with total confidence but gets it completely wrong"). Keep examples plain-language and intuitive — no heavy formulas, study citations, or jargon. The question must ask the student to analyze, explain, judge, or predict something about THAT example. Reuse the lecture's own examples when it has them; otherwise invent a vivid, specific one.\n\n` +
    `ABSOLUTELY FORBIDDEN — never produce any of these:\n` +
    `- Questions that ask for a definition ("What is X?", "What does X mean?", "Define X").\n` +
    `- Questions that ask to distinguish or compare concepts in the abstract ("How do X and Y differ?", "What is the difference between X and Y?", "How does X relate to Y?").\n` +
    `- Questions about terminology, labels, or what something is "called".\n` +
    `- Any question that could be answered without referring to a specific case.\n\n` +
    `If a question does not name a concrete example and ask the student to reason about it, REWRITE it until it does.\n\n` +
    `GOOD vs BAD:\n` +
    `- BAD: "What's the difference between a dot product and cosine similarity?"\n` +
    `- GOOD: "A search engine has two articles whose word-lists point in almost the same direction but one is much longer — what does this suggest about whether raw size or direction should decide which is the better match?"\n` +
    `- BAD: "What is an embedding?"\n` +
    `- GOOD: "The words 'cat' and 'kitten' land as two points sitting right next to each other while 'cat' and 'bicycle' land far apart — explain what this closeness shows about how the model has captured their meaning."\n\n` +
    `Cover several different major ideas from the reading across the 6 questions. One clear sentence each (roughly 12–28 words), in the student's own voice, no compound double-questions. Use $...$ for any inline math.\n\n` +
    `Return exactly 6 questions.\n\nLECTURE TITLE: ${lecture.title}\n\nLECTURE BODY:\n"""\n${lecture.body}\n"""`;

  // Reject abstract / definition / comparison questions so none reach the UI.
  // Kept precise to avoid false-positives on valid case questions (e.g. "What
  // should Alex do after lying?"), since the prompt + retry do the heavy lifting.
  const isAbstract = (q: string): boolean => {
    const t = q.toLowerCase().trim();
    return (
      /\bdefine\b/.test(t) ||
      /\bwhat does .+\bmean\b/.test(t) ||
      /\bwhat (is|are) (the )?(meaning|definition)\b/.test(t) ||
      /\bdifference between\b/.test(t) ||
      /\bhow (do|does) .+ (differ|relate)\b/.test(t) ||
      /\bwhat (distinguishes|makes) .+ (from|rather than)\b/.test(t) ||
      /\bwhat (is|are) .+ called\b/.test(t)
    );
  };

  const generate = async (extra: string): Promise<string[]> => {
    const out = await chatJson<{ questions: string[] }>(
      SYSTEM_PROMPT,
      buildUserPrompt(extra),
      FAST_MODEL,
    );
    return Array.isArray(out?.questions)
      ? out.questions.filter((q) => typeof q === "string" && q.trim().length > 0)
      : [];
  };

  try {
    const good: string[] = [];
    const seen = new Set<string>();
    const retryNote =
      "Your previous attempt included abstract or definition-style questions, which are unacceptable. EVERY question MUST describe a specific situation with a named person or concrete act. ";
    // Bounded refill loop: regenerate until we have 6 concrete questions.
    for (let attempt = 0; attempt < 3 && good.length < 6; attempt++) {
      const batch = (await generate(attempt === 0 ? "" : retryNote)).filter(
        (q) => !isAbstract(q),
      );
      for (const q of batch) {
        if (good.length >= 6) break;
        const key = q.toLowerCase().trim();
        if (!seen.has(key)) {
          good.push(q);
          seen.add(key);
        }
      }
    }
    res.setHeader("Cache-Control", "no-store");
    res.json({ questions: good.slice(0, 6) });
  } catch {
    res.setHeader("Cache-Control", "no-store");
    res.json({ questions: [] });
  }
});

router.post("/tutor/ask", async (req, res): Promise<void> => {
  const parsed = AskTutorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { message, selectedLectureText } = parsed.data;

  const sys =
    "You are an encouraging introductory AI math tutor. Explain step by step, use clear examples and relatable cases, and define key terms (e.g. vectors, embeddings, dot product, cosine similarity, matrices, slope/gradient, gradient descent, probability, backpropagation) when they come up. Keep replies short (3-6 sentences) unless the student asks for more detail. Never just give the answer — guide them.";
  const user = selectedLectureText
    ? `Context from the lecture the student is reading:\n"""\n${selectedLectureText}\n"""\n\nStudent question: ${message}`
    : message;

  let text = "";
  try {
    text = await chatText(sys, user);
  } catch {
    text =
      "I'm having trouble reaching the tutor service right now. Try again in a moment, and consider re-reading the relevant section of the lecture.";
  }
  res.json(AskTutorResponse.parse({ text, audioUrl: null }));
});

export default router;
