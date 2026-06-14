// ---------------------------------------------------------------------------
// Original content for the embedded diagnostic reasoning assessments.
//
// Two instruments, each administered at a baseline (before the course) and a
// checkpoint (after the single unit), with MUTUALLY UNIQUE items:
//   - Professional Judgment: realistic everyday-judgment scenarios where
//     legitimate considerations conflict. The principled choice is keyed first.
//   - Critical Reasoning (CCTST-style): items spanning analysis, inference,
//     evaluation, deduction, and induction.
//
// Each (instrument, phase) is offered in THREE selectable answer formats that
// share the same questions:
//   - mcq     — pick the single best option.
//   - hybrid  — pick the best option AND write a short justification.
//   - written — no options shown; write a short answer in your own words.
//
// All items are ORIGINAL. For every item the correct option is written FIRST;
// at seed time options are rotated so the correct answer lands at a varied
// index (see seedDiagnostics.ts). `modelAnswer` is the ideal short written
// response used to grade the written/hybrid formats.
// ---------------------------------------------------------------------------

export type SkillArea =
  | "analysis"
  | "inference"
  | "evaluation"
  | "deduction"
  | "induction";

export type Phase = "baseline" | "unit1";

export type DiagFormat = "mcq" | "hybrid" | "written";

// A single unified diagnostic item. The correct option is listed FIRST and is
// rotated to a random index at seed time. `modelAnswer` is the reference answer
// for grading the written/hybrid formats.
export type DiagItem = {
  prompt: string;
  options: string[];
  modelAnswer: string;
  skillArea?: SkillArea;
};

export type DiagnosticSeed = {
  instrument: "ethical" | "critical";
  phase: Phase;
  format: DiagFormat;
  title: string;
  subtitle: string;
  instructions: string;
  items: DiagItem[];
};

// ===========================================================================
// Format-specific instructions
// ===========================================================================

const FORMAT_LABEL: Record<DiagFormat, string> = {
  mcq: "Multiple Choice",
  hybrid: "Hybrid",
  written: "Written",
};

function instructionsFor(
  instrument: "ethical" | "critical",
  format: DiagFormat,
): string {
  const subject =
    instrument === "ethical"
      ? "Read each scenario and decide what the person should do"
      : "Answer each question — these measure reasoning, not recall";
  const body =
    format === "mcq"
      ? `${subject} by selecting the single best option.`
      : format === "hybrid"
        ? `${subject} by selecting the best option. You can add a quick note on your reasoning if you like — it's optional and a few words is plenty.`
        : `${subject}. No answer options are shown — just jot a brief answer in your own words. One sentence is plenty; there's no need to write a lot.`;
  return `${body} Submitting completes the assessment and you'll receive written feedback${
    instrument === "ethical" ? " on your reasoning" : " on your performance"
  }.`;
}

// ===========================================================================
// PROFESSIONAL JUDGMENT — two unique everyday-judgment scenarios
// (principled choice keyed FIRST)
// ===========================================================================

const ETHICAL_BASELINE: DiagItem[] = [
  {
    prompt:
      "Mia helped run a small experiment for her group's science-fair project, testing whether people remember a short list of words better in a quiet room than in a noisy one. The real difference her group found was tiny. The day before judging, a teammate asks Mia to describe the result on their poster as a 'huge, dramatic difference,' even though it was barely there, because it 'sounds more impressive.' The actual numbers wouldn't change — only how they're described.\n\nWhat should Mia do?",
    options: [
      "Refuse and present the result honestly, describing the difference as the small one it actually was.",
      "Go along with the teammate and describe the tiny difference as 'huge and dramatic' because it sounds more impressive.",
      "Quietly remove the result from the poster so no one has to decide how to describe it.",
      "Leave the wording up to whichever teammate cares most, since the numbers don't change.",
    ],
    modelAnswer:
      "Mia should refuse and describe the result honestly. The judges and audience are entitled to an accurate account, and calling a tiny difference 'huge' misleads them and undermines the honesty the whole project depends on — looking like a cooperative team player matters far less than reporting the truth.",
  },
];

const ETHICAL_UNIT1: DiagItem[] = [
  {
    prompt:
      "Theo runs the sign-up sheet for the school chess club. People wrote down their phone numbers only so they could get reminders about chess meetings. Now a friend running an unrelated bake-sale fundraiser asks Theo to share those numbers to send out fundraiser texts. The friend says 'it's for a good cause, and you have the numbers anyway.'\n\nWhat should Theo do?",
    options: [
      "Refuse to share the numbers, since people gave them only for chess reminders and were promised privacy.",
      "Hand the numbers over because it's for a good cause and he already has them anyway.",
      "Share only the numbers of people he personally likes, and keep the rest private.",
      "Pass the list to his friend and let the friend decide who to text.",
    ],
    modelAnswer:
      "Theo should refuse to share the numbers. People gave them only for chess reminders and were promised privacy; a good cause doesn't override that promise, and honoring it is what keeps club members able to trust the club — his friend's gratitude doesn't justify breaking that trust.",
  },
];

// ===========================================================================
// CRITICAL REASONING — two unique 10-item forms (correct option listed first)
// ===========================================================================

const CRITICAL_BASELINE: DiagItem[] = [
  {
    prompt:
      "Consider: 'All students who studied passed the exam. Maria studied. So Maria passed.' Which unstated assumption does the argument rely on?",
    options: [
      "Maria is among the students the first statement describes.",
      "Studying is the only way to pass the exam.",
      "Maria always studies for her exams.",
      "The exam was unusually difficult.",
    ],
    modelAnswer:
      "It assumes Maria is one of the students covered by 'all students who studied' — that her studying puts her in the group the first statement describes.",
    skillArea: "analysis",
  },
  {
    prompt:
      "'Since the new policy cut accidents by 40%, and fewer accidents mean lower insurance costs, the city should keep the policy. After all, saving money benefits everyone.' What is the main conclusion?",
    options: [
      "The city should keep the policy.",
      "The new policy cut accidents by 40%.",
      "Fewer accidents mean lower insurance costs.",
      "Saving money benefits everyone.",
    ],
    modelAnswer:
      "The main conclusion is that the city should keep the policy; the other statements are reasons offered in support of it.",
    skillArea: "analysis",
  },
  {
    prompt:
      "A survey finds 70% of people who exercise daily report good sleep, versus 30% of those who never exercise. Which conclusion is best supported?",
    options: [
      "People who exercise daily are more likely to report good sleep than those who never exercise.",
      "Exercise guarantees good sleep for everyone.",
      "Poor sleep is what causes people to stop exercising.",
      "Anyone who wants good sleep must exercise daily.",
    ],
    modelAnswer:
      "Only that daily exercisers are more likely to report good sleep than non-exercisers — an association, not a guarantee or a proven cause.",
    skillArea: "inference",
  },
  {
    prompt:
      "A report notes that ice-cream sales and drowning deaths rise in the same months. A careful reader should infer that:",
    options: [
      "Both may be linked to a third factor, such as hot weather.",
      "Eating ice cream causes drowning.",
      "Drowning incidents cause ice-cream sales.",
      "The data must simply be mistaken.",
    ],
    modelAnswer:
      "That both probably rise because of a shared third factor such as hot weather — the correlation doesn't mean one causes the other.",
    skillArea: "inference",
  },
  {
    prompt: "Which source would most strengthen the claim 'this medication is safe'?",
    options: [
      "A large, peer-reviewed clinical trial.",
      "A testimonial from one satisfied customer.",
      "An advertisement produced by the manufacturer.",
      "A popular wellness blog post.",
    ],
    modelAnswer:
      "A large, peer-reviewed clinical trial — independent, systematic evidence is far stronger than a single testimonial, an ad, or a blog post.",
    skillArea: "evaluation",
  },
  {
    prompt:
      "'My grandfather smoked daily and lived to 95, so smoking isn't really harmful.' The main weakness of this argument is that it:",
    options: [
      "Relies on a single example against strong statistical evidence.",
      "Quotes an unreliable expert.",
      "Contains an internal contradiction.",
      "Appeals purely to emotion.",
    ],
    modelAnswer:
      "It rests on one anecdote and ignores the strong statistical evidence that smoking is harmful; a single exception doesn't overturn the overall pattern.",
    skillArea: "evaluation",
  },
  {
    prompt:
      "'All mammals are warm-blooded. All whales are mammals. Therefore all whales are warm-blooded.' This argument is:",
    options: [
      "Valid.",
      "Invalid, because whales live in water.",
      "Invalid, because it assumes what it proves.",
      "Invalid, because the premises are uncertain.",
    ],
    modelAnswer:
      "Valid — the conclusion follows necessarily from the two premises.",
    skillArea: "deduction",
  },
  {
    prompt:
      "'If it rained, the streets are wet. The streets are not wet.' What necessarily follows?",
    options: [
      "It did not rain.",
      "It rained.",
      "The streets are dry for some other reason.",
      "Nothing at all follows.",
    ],
    modelAnswer:
      "It did not rain — if rain would have made the streets wet and they are not wet, then it cannot have rained.",
    skillArea: "deduction",
  },
  {
    prompt:
      "A pollster surveys five of her friends and predicts how the whole country will vote. The strongest objection is that:",
    options: [
      "The sample is far too small and unrepresentative.",
      "Friends never tell the truth.",
      "Polls are always wrong.",
      "Voting is supposed to be private.",
    ],
    modelAnswer:
      "Five friends are far too small and unrepresentative a sample to support a prediction about the whole country.",
    skillArea: "induction",
  },
  {
    prompt:
      "Plants given a new fertilizer grew taller than otherwise identical plants without it, all else held equal. The best-supported conclusion is:",
    options: [
      "The fertilizer probably caused the extra growth.",
      "Taller plants attract more fertilizer.",
      "Fertilizer is required for any plant growth at all.",
      "The result was pure coincidence.",
    ],
    modelAnswer:
      "Because everything else was held equal, the fertilizer probably caused the extra growth.",
    skillArea: "induction",
  },
];

const CRITICAL_UNIT1: DiagItem[] = [
  {
    prompt: "'We should ban the chemical because it's unnatural.' This argument assumes that:",
    options: [
      "Natural things are always safe and unnatural things are harmful.",
      "The chemical is expensive to produce.",
      "Bans are easy to enforce.",
      "Most people dislike the chemical.",
    ],
    modelAnswer:
      "It assumes that natural things are safe and unnatural ones harmful — an unsupported leap from 'unnatural' to 'should be banned.'",
    skillArea: "analysis",
  },
  {
    prompt:
      "'The bridge must be inspected, because cracks have appeared and ignoring cracks has caused collapses before.' Which is a premise supporting the conclusion?",
    options: [
      "Cracks have appeared on the bridge.",
      "The bridge must be inspected.",
      "The bridge is quite old.",
      "Inspections are expensive.",
    ],
    modelAnswer:
      "'Cracks have appeared on the bridge' is a premise; 'the bridge must be inspected' is the conclusion it supports.",
    skillArea: "analysis",
  },
  {
    prompt:
      "A study finds students who eat breakfast score higher on morning tests than those who skip it. Which is best supported?",
    options: [
      "Eating breakfast is associated with higher morning test scores.",
      "Breakfast makes everyone a genius.",
      "Skipping breakfast should be banned.",
      "Tests should always be held in the afternoon.",
    ],
    modelAnswer:
      "Only that eating breakfast is associated with higher morning test scores — an association, not a sweeping cause or a policy.",
    skillArea: "inference",
  },
  {
    prompt: "'All items on the shelf are on sale. The blue mug is on the shelf.' Therefore:",
    options: [
      "The blue mug is on sale.",
      "The blue mug is expensive.",
      "Only mugs are on sale.",
      "The shelf is completely full.",
    ],
    modelAnswer:
      "The blue mug is on sale — it's on the shelf, and everything on the shelf is on sale.",
    skillArea: "inference",
  },
  {
    prompt: "To evaluate the claim 'crime is rising,' which is the most relevant evidence?",
    options: [
      "Official crime statistics gathered over several years.",
      "A friend's sense that things seem worse lately.",
      "A dramatic recent news headline.",
      "A popular movie about crime.",
    ],
    modelAnswer:
      "Official crime statistics gathered over several years — systematic data over time, not impressions, a headline, or a movie.",
    skillArea: "evaluation",
  },
  {
    prompt:
      "'You can't trust her argument for the policy — she's not even an economist.' This response is weak because it:",
    options: [
      "Attacks the person rather than the argument.",
      "Relies on too much data.",
      "Is far too detailed.",
      "Simply restates the policy.",
    ],
    modelAnswer:
      "It attacks the person instead of addressing her actual argument — an ad hominem that leaves the argument itself unanswered.",
    skillArea: "evaluation",
  },
  {
    prompt:
      "'If a number is divisible by 4, it is even. Twelve is divisible by 4.' What necessarily follows?",
    options: [
      "Twelve is even.",
      "Twelve is odd.",
      "All even numbers are divisible by 4.",
      "Nothing follows.",
    ],
    modelAnswer:
      "Twelve is even — it's divisible by 4, and anything divisible by 4 is even.",
    skillArea: "deduction",
  },
  {
    prompt:
      "'If she practiced, she improved. She improved. Therefore she practiced.' This reasoning is:",
    options: [
      "Invalid, because she might have improved for another reason.",
      "Valid and certain.",
      "Invalid, because practice never helps.",
      "Valid only on weekends.",
    ],
    modelAnswer:
      "Invalid — improvement could have come from another cause, so it doesn't follow that she practiced (affirming the consequent).",
    skillArea: "deduction",
  },
  {
    prompt:
      "After three rainy Mondays in a row, someone concludes 'it always rains on Mondays.' This generalization is:",
    options: [
      "Hasty — based on far too few cases.",
      "A valid logical deduction.",
      "Certainly true.",
      "Impossible to evaluate at all.",
    ],
    modelAnswer:
      "Hasty — three cases are far too few to support an 'always' generalization.",
    skillArea: "induction",
  },
  {
    prompt:
      "A new drug cured 95% of patients in a large, well-designed trial. The best-supported prediction is:",
    options: [
      "The drug will likely help most future patients with the condition.",
      "The drug will cure every disease.",
      "The drug works only inside trials.",
      "The drug is probably unsafe.",
    ],
    modelAnswer:
      "That it will likely help most future patients with the condition — a strong, well-designed trial supports a probable prediction, not a certainty about every disease.",
    skillArea: "induction",
  },
];

// ===========================================================================
// Seed expansion — each (instrument, phase) in all three formats
// ===========================================================================

type BaseContent = {
  instrument: "ethical" | "critical";
  phase: Phase;
  baseTitle: string;
  subtitle: string;
  items: DiagItem[];
};

const BASE_CONTENT: BaseContent[] = [
  {
    instrument: "ethical",
    phase: "baseline",
    baseTitle: "Professional Judgment Inventory — Baseline",
    subtitle: "Before the course",
    items: ETHICAL_BASELINE,
  },
  {
    instrument: "critical",
    phase: "baseline",
    baseTitle: "Critical Reasoning Assessment — Baseline",
    subtitle: "Before the course",
    items: CRITICAL_BASELINE,
  },
  {
    instrument: "ethical",
    phase: "unit1",
    baseTitle: "Professional Judgment Inventory — Course Checkpoint",
    subtitle: "After the unit: Criminal Psychology for Everyone",
    items: ETHICAL_UNIT1,
  },
  {
    instrument: "critical",
    phase: "unit1",
    baseTitle: "Critical Reasoning Assessment — Course Checkpoint",
    subtitle: "After the unit: Criminal Psychology for Everyone",
    items: CRITICAL_UNIT1,
  },
];

const FORMATS: DiagFormat[] = ["mcq", "hybrid", "written"];

export const DIAGNOSTIC_SEED: DiagnosticSeed[] = BASE_CONTENT.flatMap((base) =>
  FORMATS.map((format) => ({
    instrument: base.instrument,
    phase: base.phase,
    format,
    title: `${base.baseTitle} · ${FORMAT_LABEL[format]}`,
    subtitle: base.subtitle,
    instructions: instructionsFor(base.instrument, format),
    items: base.items,
  })),
);
