// ---------------------------------------------------------------------------
// Original content for the embedded diagnostic reasoning assessments.
//
// Two instruments, each offered at FOUR time-points (phases) so a student can
// gauge themselves before, during, and after the course:
//   - subject  — Functional Intelligence subject-specific reasoning. Realistic
//     short cases and puzzles about the course material (reasoning-test skills);
//     the best-supported answer is keyed first.
//   - general  — General Reasoning. Genuine reasoning items spanning analysis,
//     inference, evaluation, deduction, and induction (NOT a "docility"/agree-
//     with-authority test).
//
// Each (instrument, phase) is offered in THREE selectable answer formats that
// share the same kind of questions:
//   - mcq     — pick the single best option.
//   - hybrid  — pick the best option AND (optionally) write a short note.
//   - written — no options shown; write a short answer in your own words.
//
// These diagnostics are UNGRADED practice: takeable anytime, unlimited times,
// and they never affect the course grade. Every time a test is started, fresh
// questions are generated (see reasoning.ts) so questions never repeat. The
// items below are the structural BLUEPRINT (style + fallback) for that
// generation, grounded per phase by GEN_SPECS.
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

export type Instrument = "subject" | "general";

export type Phase = "before" | "third" | "twothirds" | "after";

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
  instrument: Instrument;
  phase: Phase;
  format: DiagFormat;
  title: string;
  subtitle: string;
  instructions: string;
  items: DiagItem[];
};

// ===========================================================================
// Phase metadata
// ===========================================================================

export const PHASE_ORDER: Phase[] = ["before", "third", "twothirds", "after"];

export const PHASE_LABEL: Record<Phase, string> = {
  before: "Before the course",
  third: "One-third of the way through",
  twothirds: "Two-thirds of the way through",
  after: "After the course",
};

// ===========================================================================
// Per-(instrument, phase) generation specs
// Used by reasoning.ts to generate fresh, never-repeating questions grounded in
// the right scope for the chosen time-point. `topicFocus` describes WHAT to ask
// about; `level` nudges difficulty for the time-point.
// ===========================================================================

export type GenSpec = { topicFocus: string; level: string };

const SUBJECT_SPECS: Record<Phase, GenSpec> = {
  before: {
    level:
      "Intro level: answerable by a thoughtful newcomer reasoning carefully, BEFORE any lessons. Do not assume prior course knowledge or jargon. No heavy calculation — reward plain-language reasoning about a concrete puzzle or test-taking situation.",
    topicFocus:
      "How reasoning/aptitude tests work and how to think about them: that a matrix or series puzzle is not a memory or talent test but a hunt for the single hidden RULE that governs every case; that the disciplined move is to find the rule from the examples and apply it to the new one; that an analogy turns on a precise relationship rather than loose association; and that doing well is a learnable craft (find the rule, eliminate wrong options, manage time) rather than innate cleverness.",
  },
  third: {
    level:
      "Early course level: covers roughly the first third of the unit. Plain language, short realistic puzzles/cases, light reasoning, no heavy calculation.",
    topicFocus:
      "Topics 1.1-1.2: pattern grids (a 3x3 matrix is a system of rules — read one feature across each row and another down each column, the answer satisfies both, and the transformation families are quantity, rotation, movement, addition/subtraction, alternation; verify a candidate against EVERY feature); and number/letter series (a series hides one repeated operation — take differences first for arithmetic, ratios for geometric, split interleaved series into strands, and convert letters to alphabet positions to reduce a letter series to a number series).",
  },
  twothirds: {
    level:
      "Mid course level: covers roughly the first two-thirds of the unit. Realistic short puzzles/cases requiring a step of reasoning, no heavy calculation.",
    topicFocus:
      "Topics 1.1-1.4: pattern grids and number/letter series, PLUS analogies (an analogy tests a relationship not a resemblance — build a precise 'bridge sentence' linking A to B, transfer it to C, tighten it until exactly one option survives, and guard against wrong-link or reversed-direction distractors) and odd-one-out (find the shared RULE before the exception, choose the cleaner/more fundamental rule when several compete, and prefer structural features over surface features like color or shape).",
  },
  after: {
    level:
      "End-of-course level: covers the whole unit. Integrative short puzzles/cases that apply more than one skill, no heavy calculation.",
    topicFocus:
      "The full unit, topics 1.1-1.6: pattern grids, number/letter series, analogies, and odd-one-out, PLUS spatial reasoning (a rotation preserves shape and handedness while a reflection/mirror-flip reverses handedness — the classic trap; treat each fold line as a mirror so a punch doubles per fold; track one feature and check handedness) and test-craft (budget time and never sink into one hard item, eliminate impossible options to raise guessing odds, and let the scoring rule decide whether to guess — answer everything when wrong answers aren't penalized).",
  },
};

const GENERAL_SPECS: Record<Phase, GenSpec> = {
  before: {
    level: "Everyday, accessible reasoning. One step of inference per item.",
    topicFocus:
      "General reasoning on everyday, neutral topics: identifying assumptions and conclusions, what evidence does and does not support, judging the strength of sources, valid vs. invalid deduction, and the strength of generalizations.",
  },
  third: {
    level: "Everyday reasoning, slightly more demanding than the baseline.",
    topicFocus:
      "General reasoning on everyday, neutral topics: assumptions/conclusions, supported inferences, source quality, deductive validity, and inductive strength.",
  },
  twothirds: {
    level: "Moderately demanding reasoning, sometimes two steps.",
    topicFocus:
      "General reasoning on everyday, neutral topics: assumptions/conclusions, supported inferences, source quality, deductive validity, and inductive strength.",
  },
  after: {
    level: "More demanding, multi-step reasoning where appropriate.",
    topicFocus:
      "General reasoning on everyday, neutral topics: assumptions/conclusions, supported inferences, source quality, deductive validity, and inductive strength.",
  },
};

export function genSpecFor(instrument: Instrument, phase: Phase): GenSpec {
  return instrument === "subject"
    ? SUBJECT_SPECS[phase]
    : GENERAL_SPECS[phase];
}

// ===========================================================================
// Format-specific instructions
// ===========================================================================

const FORMAT_LABEL: Record<DiagFormat, string> = {
  mcq: "Multiple Choice",
  hybrid: "Hybrid",
  written: "Written",
};

function instructionsFor(instrument: Instrument, format: DiagFormat): string {
  const subject =
    instrument === "subject"
      ? "Answer each question about reasoning-test skills — these reward careful reasoning about a concrete puzzle or test-taking case, not memorized facts"
      : "Answer each reasoning question — these measure how you think, not what you recall";
  const body =
    format === "mcq"
      ? `${subject} by selecting the single best option.`
      : format === "hybrid"
        ? `${subject} by selecting the best option. You can add a quick note on your reasoning if you like — it's optional and a few words is plenty.`
        : `${subject}. No answer options are shown — just jot a brief answer in your own words. One or two sentences is plenty; there's no need to write a lot.`;
  return `${body} This is ungraded practice — take it anytime, as many times as you like; it never affects your course grade. Submitting shows your results with written feedback.`;
}

// ===========================================================================
// SUBJECT — Functional Intelligence blueprint cases (best answer keyed FIRST)
// ===========================================================================

const SUBJECT_BEFORE: DiagItem[] = [
  {
    prompt:
      "A friend says a 3x3 grid puzzle (shapes that change cell to cell, with one cell blank) is 'just a test of whether you're naturally good at seeing pictures.' What is the better way to understand what such a puzzle is really testing?",
    options: [
      "Whether you can find the hidden rule that governs every cell and apply it to the blank",
      "Whether you happen to have a photographic visual memory",
      "Whether you can guess faster than other people",
      "Whether you already memorized this exact puzzle before",
    ],
    modelAnswer:
      "A grid puzzle is a hunt for the single hidden rule that produced every cell; you recover the rule from the filled cells and apply it to the blank, so it rewards a learnable method, not innate picture-sense.",
  },
  {
    prompt:
      "To solve 'glove is to hand as sock is to ___,' a careful test-taker should focus mainly on:",
    options: [
      "the precise relationship in the first pair, then transfer it to the second",
      "whichever word simply feels most associated with socks",
      "the longest or most unusual answer option",
      "how the words sound when read aloud",
    ],
    modelAnswer:
      "An analogy tests a relationship, not a resemblance: name the precise link in the first pair (a glove is the snug covering worn on a hand) and transfer it (a sock is the snug covering worn on a foot), rather than grabbing a merely associated word.",
  },
  {
    prompt:
      "Which view best fits how this course treats success on reasoning/aptitude tests?",
    options: [
      "It is a learnable craft — find the rule, eliminate wrong options, and manage time",
      "It is fixed innate cleverness you either have or don't",
      "It is mostly luck on the day of the test",
      "It depends only on how fast you can read",
    ],
    modelAnswer:
      "The course treats test performance as a trainable craft: recognizing pattern types, finding the governing rule, eliminating impossible options, and budgeting time — not a fixed talent.",
  },
];

const SUBJECT_THIRD: DiagItem[] = [
  {
    prompt:
      "In a 3x3 grid, the number of dots rises by one across each row and also by one down each column. A solver checks only that the answer fits the row rule and ignores the columns. Why is this risky?",
    options: [
      "The correct cell must satisfy BOTH the row rule and the column rule, and distractors are built to pass one and fail the other",
      "Columns never matter in any grid puzzle",
      "Rows are always wrong and only columns count",
      "Checking two rules is impossible, so one is enough",
    ],
    modelAnswer:
      "A grid is a system of rules along two axes; the blank is where the row rule and column rule intersect, so the answer must satisfy both. Distractors are engineered to match on one feature and fail another, so checking only the row invites a trap.",
    skillArea: "analysis",
  },
  {
    prompt:
      "Faced with the series 2, 6, 18, 54, ___, a test-taker isn't sure whether to add or multiply. What is the most reliable way to decide?",
    options: [
      "Take differences first (4, 12, 36 — not constant), then ratios (all 3) — a constant ratio means multiply, giving 162",
      "Assume it is always addition and answer 90",
      "Pick the largest option without checking",
      "Average the four numbers and round",
    ],
    modelAnswer:
      "Check differences first; if they aren't constant but the ratios are (6÷2=18÷6=54÷18=3), the series is geometric, so multiply by 3 to get 162. Confirming a constant ratio is what justifies multiplying rather than guessing.",
    skillArea: "inference",
  },
  {
    prompt:
      "A series lurches up and down — 1, 10, 2, 20, 3, 30 — and no single add-or-multiply rule fits the whole thing. What is the best move?",
    options: [
      "Split it into two interleaved strands (1,2,3 and 10,20,30) and analyze each separately",
      "Conclude the series has no rule at all",
      "Add all the numbers together for the answer",
      "Assume a typo and ignore half the terms",
    ],
    modelAnswer:
      "When one rule won't fit a bouncing series, it is usually two patterns braided together; separating the odd-position terms (1,2,3) from the even-position terms (10,20,30) reveals two clean series.",
    skillArea: "evaluation",
  },
];

const SUBJECT_TWOTHIRDS: DiagItem[] = [
  {
    prompt:
      "On the analogy 'thermometer is to temperature as ___,' two options seem to fit because the test-taker's mental link is just 'goes with temperature.' What fixes this?",
    options: [
      "Tighten the bridge to a precise relation — 'an instrument used to measure a quantity' (clock:time, scale:weight) — until exactly one option survives",
      "Pick whichever of the two options is listed first",
      "Choose the option most associated with thermometers in general",
      "Give up, since two options always fit analogies",
    ],
    modelAnswer:
      "A loose bridge like 'goes with' admits several answers; tightening it to the exact relationship (the instrument used to measure a quantity) eliminates all but one, e.g. clock:time or scale:weight.",
    skillArea: "evaluation",
  },
  {
    prompt:
      "Asked which is the odd one out among violin, guitar, flute, and cello, a test-taker stares at each item hoping one looks strange. Why does the disciplined method work better?",
    options: [
      "Find the rule most items share first (three are string instruments), then the flute is the exception that breaks it",
      "The odd one is always the last item listed",
      "Strangeness can be spotted in a single item without any rule",
      "The shortest word is always the odd one out",
    ],
    modelAnswer:
      "You can't name an outlier until you name the shared rule: violin, guitar, and cello are string instruments, so the flute (a wind instrument) is the exception. Characterizing the majority is what reveals the odd one.",
    skillArea: "analysis",
  },
  {
    prompt:
      "Three figures in a set are shaded and one is unshaded, but they also differ in number of sides. A solver picks the unshaded figure as the odd one. What should make them reconsider?",
    options: [
      "Structural features (like number of sides) usually outrank surface features (like shading), so the deeper rule may point elsewhere",
      "Shading is always the only thing that matters",
      "Surface features are always the intended rule",
      "Number of sides can never define a group",
    ],
    modelAnswer:
      "Classification distractors lean on surface features like shading; the intended rule is usually structural (e.g. number of sides). When a surface rule and a structural rule disagree, prefer the structural one.",
    skillArea: "evaluation",
  },
];

const SUBJECT_AFTER: DiagItem[] = [
  {
    prompt:
      "On a spatial item, an option matches the target shape in every way but looks 'subtly backwards,' and the task is to identify a rotation. How should this be read?",
    options: [
      "It is almost certainly a mirror reflection — a trap — because rotation preserves handedness while reflection reverses it",
      "It must be the correct answer, since it matches everything",
      "Backwards-looking shapes are always simple rotations",
      "Handedness is irrelevant to spatial puzzles",
    ],
    modelAnswer:
      "A rotation preserves handedness; a reflection reverses it (like left vs right hands). A shape that looks right but subtly backwards is the classic mirror-image trap offered when a rotation is required.",
    skillArea: "evaluation",
  },
  {
    prompt:
      "Halfway through a timed test with no penalty for wrong answers, a test-taker has burned three minutes on one hard item and is falling behind. What is the best move?",
    options: [
      "Eliminate any impossible options, mark a best guess, flag it, and move on to bank easier points",
      "Keep working only this item until it is solved",
      "Leave it blank and refuse to guess",
      "Erase previous answers to save time",
    ],
    modelAnswer:
      "Never sink time into one item: the minutes cost easier points elsewhere. Eliminate what you can, guess (a no-penalty blank is a guaranteed zero), flag it, and return only if time remains.",
    skillArea: "inference",
  },
  {
    prompt:
      "Someone claims, 'Doing well on these reasoning tests is pure innate IQ — strategy can't help.' Drawing on the whole unit, the strongest rebuttal is that:",
    options: [
      "Performance is a craft: recognizing the pattern type, finding the governing rule, eliminating options, and budgeting time all measurably raise the score",
      "Innate IQ is the only thing that ever matters",
      "Reasoning tests are decided entirely by luck",
      "There are no usable methods for these puzzles",
    ],
    modelAnswer:
      "The unit shows that learnable methods — classifying the item, recovering the rule across rows/columns or via differences/ratios, building precise analogy bridges, distinguishing rotations from reflections, and managing time and guessing — raise scores, so strategy clearly helps.",
    skillArea: "evaluation",
  },
];

// ===========================================================================
// GENERAL — reasoning blueprint (analysis / inference / evaluation /
// deduction / induction). Shared across phases; difficulty is nudged per phase
// at generation time (see GEN_SPECS.level).
// ===========================================================================

const GENERAL_BLUEPRINT: DiagItem[] = [
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
      "It assumes Maria is one of the students covered by 'all students who studied' — that her studying puts her in the group described.",
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
      "Only that daily exercisers are more likely to report good sleep — an association, not a guarantee or a proven cause.",
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
      "A large, peer-reviewed clinical trial — independent, systematic evidence is far stronger than a testimonial, an ad, or a blog.",
    skillArea: "evaluation",
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
      "That both probably rise because of a shared third factor such as hot weather — correlation doesn't mean one causes the other.",
    skillArea: "inference",
  },
];

// ===========================================================================
// Seed expansion — each (instrument, phase) in all three formats
// ===========================================================================

type BaseContent = {
  instrument: Instrument;
  phase: Phase;
  baseTitle: string;
  items: DiagItem[];
};

const BASE_CONTENT: BaseContent[] = PHASE_ORDER.flatMap((phase) => {
  const subjectItems: Record<Phase, DiagItem[]> = {
    before: SUBJECT_BEFORE,
    third: SUBJECT_THIRD,
    twothirds: SUBJECT_TWOTHIRDS,
    after: SUBJECT_AFTER,
  };
  return [
    {
      instrument: "subject" as const,
      phase,
      baseTitle: `Functional Intelligence Check — ${PHASE_LABEL[phase]}`,
      items: subjectItems[phase],
    },
    {
      instrument: "general" as const,
      phase,
      baseTitle: `General Reasoning Check — ${PHASE_LABEL[phase]}`,
      items: GENERAL_BLUEPRINT,
    },
  ];
});

const FORMATS: DiagFormat[] = ["mcq", "hybrid", "written"];

export const DIAGNOSTIC_SEED: DiagnosticSeed[] = BASE_CONTENT.flatMap((base) =>
  FORMATS.map((format) => ({
    instrument: base.instrument,
    phase: base.phase,
    format,
    title: `${base.baseTitle} · ${FORMAT_LABEL[format]}`,
    subtitle: PHASE_LABEL[base.phase],
    instructions: instructionsFor(base.instrument, format),
    items: base.items,
  })),
);
