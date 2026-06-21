import { db } from "@workspace/db";
import {
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
  seedMetaTable,
} from "@workspace/db";
import { eq, sql, and, like, notInArray } from "drizzle-orm";
import { logger } from "./logger";

// Content version of the seeded curriculum. BUMP THIS whenever the TOPICS or
// ASSIGNMENTS content below changes. On boot, seedIfEmpty compares this against
// the value stored in seed_meta; a mismatch forces a full re-seed, so content
// edits self-heal in every environment (including a republished production)
// without a manual database wipe.
const SEED_CONTENT_VERSION = "2026-06-20-functional-intelligence-v1";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // Unit 1 — Functional Intelligence: how reasoning tests work, and how to beat them
  {
    slug: "pattern-grids",
    title: "Pattern grids",
    weekNumber: 1,
    blurb: "A grid of shapes with one cell missing isn't a memory test — it's a hunt for the single rule that governs every cell at once.",
    lectureTitle: "1.1 Pattern grids: finding the rule that fills the blank",
    body: `# Pattern grids

The matrix puzzle — a grid of figures with one cell left blank and a row of candidate answers beneath it — is the signature item of almost every reasoning test, from the Raven's Progressive Matrices to the abstract sections of professional aptitude exams. It looks like a test of cleverness or visual memory. It is neither. It is a test of one disciplined habit: finding the **rule** that every filled cell obeys, then applying that rule to the empty one. This unit's first job is to make that habit explicit.

## A grid is a system of rules, not a picture

When you first glance at a 3×3 grid of shapes, your eye tries to take it in as a whole image, and the whole image is overwhelming — too many shapes, colors, and positions at once. The move that unlocks the puzzle is to stop seeing a picture and start seeing a *system*: a set of cells whose contents are determined by hidden rules running across the rows and down the columns. The blank is not missing information; it is the one cell where the rules have not yet been carried out. Your task is to recover the rules from the cells you *can* see, then run them forward.

## Read across, then read down

Almost every grid encodes its logic along two independent axes. **Across each row**, some feature changes in a consistent way — a shape rotates a fixed amount, a count goes up by one, a shading darkens step by step. **Down each column**, a second feature changes in its own consistent way. The reliable method is to pick one feature and trace it across a row: does it grow, rotate, alternate, accumulate? Then trace a second feature down a column. When you can state both the row rule and the column rule in a plain sentence, the missing cell is simply where the two rules intersect — and crucially, the correct answer must satisfy *both* at once.

## The recurring transformation families

The transformations tests reuse are a small, learnable set. **Quantity:** a feature counts up or down (one dot, two dots, three). **Rotation:** a shape turns by a fixed angle each step. **Movement:** an element travels around the cell — corner to corner, clockwise. **Addition and subtraction:** the third cell in a row is the first combined with, or stripped of, the second (overlay two figures, or remove the shared parts). **Alternation:** a feature flips back and forth, on-off-on. Once you recognize you are looking at, say, "rotation across the row and addition down the column," the universe of possible answers collapses to one.

## Isolate one feature at a time

The single most common mistake is trying to track shape, count, shading, and orientation simultaneously and drowning in the combinations. Disciplined solvers decompose: hold every feature constant except one, work out that one feature's rule completely, then move to the next. Distractor answers are engineered to be right on three features and wrong on the fourth — they punish exactly the solver who stops checking after the first feature that matches. So once you predict what belongs in the blank, verify the candidate against *every* feature you identified before you commit.

## In the real world

The matrix puzzle endures because the skill it isolates — extracting an unstated rule from a handful of examples and extending it to a new case — is the core move of nearly all professional reasoning. A radiologist reads a sequence of scans for the rule of how a shadow is changing; an analyst reads three quarters of data and infers the pattern that predicts the fourth; a scientist sees a few results and proposes the law behind them. The grid strips that skill of all domain knowledge so that what remains is pure inference: *given these instances, what rule produced them, and what does it demand here?*`,
  },
  {
    slug: "series",
    title: "Number and letter series",
    weekNumber: 1,
    blurb: "A sequence with a blank at the end hides exactly one operation, applied over and over — find the operation and the next term writes itself.",
    lectureTitle: "1.2 Number and letter series: spotting what comes next",
    body: `# Number and letter series

"2, 6, 18, 54, ___." A series problem hands you the first few outputs of a hidden machine and asks for the next one. The machine is almost always simple — a single operation repeated — and the entire challenge is to identify that operation from the evidence. This is the most procedural skill in the unit, which is good news: with a fixed checklist, series problems go from intimidating to nearly mechanical.

## A series is one repeated operation

The governing assumption is that some single, consistent rule turns each term into the next. So the first thing to compute is the relationship *between adjacent terms*. Subtract each term from the one after it and look at the gaps; if the gaps are not constant, divide instead and look at the ratios. You are interrogating the sequence: "What did you do to get from here to there — and did you do the same thing every time?" The moment one operation explains every step, you have the rule, and the next term is just one more turn of the same crank.

## Arithmetic versus geometric, and how to tell

The two workhorse patterns are **arithmetic** (a constant amount is *added* each step: 3, 7, 11, 15 — always +4) and **geometric** (a constant factor is *multiplied* each step: 2, 6, 18, 54 — always ×3). The diagnostic is quick: take differences first. If the differences are equal, it's arithmetic. If the differences themselves are growing fast, suspect a geometric rule and check the ratios — 6÷2, 18÷6, 54÷18 all equal 3, confirming ×3, so the next term is 162. Confirming with the *second* test (the ratios are constant *and* the differences are not) is what separates a guess from a justified answer.

## Alternating and interleaved series

When neither differences nor ratios are constant, the series is usually two patterns braided together. In an **alternating** series, one rule governs the odd positions and a different rule governs the even ones — "1, 10, 2, 20, 3, 30" is really "1, 2, 3" interleaved with "10, 20, 30." The tell is a sequence that lurches up and down, or whose differences alternate between two values. The fix is to physically split the series into its odd-indexed and even-indexed terms and analyze each strand on its own; each strand will be a clean arithmetic or geometric series.

## Letter series are number series in disguise

A series like "B, D, G, K, ___" looks different but isn't. Convert each letter to its position in the alphabet (A=1, B=2, …) and the letters become numbers: 2, 4, 7, 11 — differences of 2, 3, 4, so the next gap is 5, giving 16 = P. Every technique from numeric series transfers directly once you translate. Watch only for the wrap-around (after Z, count restarts at A) and for series that move *backward* through the alphabet. The lesson generalizes: when a puzzle wears an unfamiliar costume, the first move is to translate it into a representation you already know how to attack.

## In the real world

Extrapolating a sequence is forecasting in its purest form. A clinician watching a fever chart, an investor reading a revenue trend, an engineer monitoring a sensor — each is doing exactly what a series problem demands: infer the rule from the run so far and project the next value, while staying alert to the moment the rule changes. The discipline the puzzle trains — *test the simplest rule first, confirm it against every step, and split the problem when one rule won't fit* — is the same discipline that keeps real forecasts honest.`,
  },
  {
    slug: "analogies",
    title: "Analogies",
    weekNumber: 1,
    blurb: "'A is to B as C is to ___' is solved not by what the words mean but by the precise relationship that binds the first pair — name it, then transfer it.",
    lectureTitle: "1.3 Analogies: how A-to-B locks onto C-to-what",
    body: `# Analogies

"Glove is to hand as sock is to ___." Analogy items test whether you can isolate the *relationship* between two things and transfer it cleanly to a third. They reward precision and punish vague association, which is why a confident, careless reader so often picks a wrong answer that merely "feels related." The skill is to convert a fuzzy sense of connection into an exact, statable rule.

## An analogy is a relationship, not a resemblance

The trap is to ask "what goes with a sock?" and grab the first associated word — shoe, foot, wool, drawer. All of those are *related* to socks; only one preserves the relationship in the first pair. The correct mental move is to ignore the words' meanings at first and focus entirely on the **link** between A and B. A glove is the close-fitting garment worn directly on a hand; a sock is the close-fitting garment worn directly on a foot. The answer is "foot" — and notice that "shoe," though strongly associated with both socks and feet, fails, because a shoe is not the snug cloth layer worn *on* the body part the way a glove and a sock are.

## Name the relation in a precise sentence

The reliable technique is to build a "bridge sentence": a short, specific statement of how A relates to B, precise enough that you can plug C into it and read off the answer. "A glove is worn directly on a hand" is a good bridge; "a glove goes with a hand" is too loose and will admit several answers. The more exact your bridge, the more wrong options it eliminates. If two answer choices both seem to fit, your bridge is not specific enough yet — tighten it until exactly one choice survives.

## The common relation types

Analogy relationships fall into recurring families, and recognizing the family speeds the bridge. **Function** (knife : cut). **Part to whole** (petal : flower). **Category** (sparrow : bird). **Degree or intensity** (warm : hot, the same idea turned up). **Cause and effect** (rain : flood). **Opposite** (expand : contract). **Object to actor** (scalpel : surgeon). When you sense the link but can't phrase it, running through these families ("is this a function relation? a degree relation?") usually surfaces the exact wording you need.

## Defeating the engineered distractors

Strong analogy items always include a distractor that shares the *wrong* link — a word related to C by some relationship other than the one in the A–B pair. If your bridge is "A is a more intense version of B," a distractor will offer a synonym (same idea, not intensified) or an opposite (related, but the reverse link). The defense is twofold: state the bridge before you look hard at the options, and check the *direction* of the relationship (is it A-does-to-B or B-does-to-A?), because reversed-direction answers are the most seductive wrong choices of all.

## In the real world

Analogical reasoning is how expertise transfers across domains. A physician recognizes that a new patient's case "is to" its diagnosis as a remembered case "is to" its outcome; a lawyer argues that the present dispute stands to its precedent as one established case stood to its ruling; an engineer borrows a solution from one field because its structure mirrors a problem in another. Each is identifying a deep relationship and transferring it — and each can be misled by a surface resemblance that shares the wrong link. The puzzle trains the guard against exactly that error: insist on naming the relationship before you trust the match.`,
  },
  {
    slug: "odd-one-out",
    title: "Odd-one-out",
    weekNumber: 1,
    blurb: "To find the item that doesn't belong you must first find the rule that the others share — the exception is defined by the rule, never spotted on its own.",
    lectureTitle: "1.4 Odd-one-out: what doesn't belong, and why",
    body: `# Odd-one-out

"Which does not belong: violin, guitar, flute, cello?" Classification items ask you to spot the outlier in a set. The instinct is to look for the strange one directly, but that instinct fails, because strangeness is not a property of a single item — it is a property *relative to a rule*. You cannot say what doesn't belong until you have found what the others have in common. The task is really "find the shared rule, then the item that breaks it."

## Find the rule first, the exception second

The disciplined order is fixed: survey the set, hunt for a property that most of the items share, then check which lone item lacks it. In the instruments set, three are string instruments and one — the flute — is a wind instrument; the shared rule is "produces sound from vibrating strings," and the flute is the exception. Notice you found the answer by characterizing the *majority*, not by staring at any one item hoping it would look odd. Whenever you feel stuck on an odd-one-out, it is almost always because you have not yet named the rule the group obeys.

## Competing rules, and choosing the strongest

Real items often admit more than one candidate rule, and a well-built puzzle exploits this. You might notice that the guitar is the only one usually played by plucking rather than bowing, which would make the guitar the odd one instead. When two rules each single out a different item, prefer the rule that is **cleaner and more fundamental** — the one that splits the set most decisively (three-versus-one on a basic category) over a rule that depends on a narrower or more arguable property. Test makers design the intended answer to sit under the strongest rule, so explicitly comparing the candidate rules is how you find it.

## Beware the seductive surface feature

Classification distractors lean on superficial similarities — color, size, first letter, visual shape — that feel like rules but cut across the real category. Three figures might all be shaded and one unshaded, tempting you toward shading, while the deeper rule is about the *number of sides*. The defense is to distinguish surface features (how things look) from structural features (what things are or do) and to give structural rules priority. When a surface rule and a structural rule disagree about which item is odd, the structural one is almost always intended.

## When more than one answer "works"

Sometimes you will land on a defensible exception under one rule while sensing another rule lurks. Rather than agonize, make the comparison explicit: write the rule for each candidate, then ask which rule the other items satisfy most uniformly and unarguably. The intended answer is the one whose rule leaves the *fewest* loose ends — where the remaining items form the tightest, least contestable group. This habit of articulating and ranking competing rules is exactly the metacognition these items are built to reward.

## In the real world

Spotting what doesn't belong is the engine of quality control, fraud detection, and diagnosis. An auditor scans transactions for the one that breaks the pattern; a security analyst flags the login that doesn't fit the rule of normal behavior; a doctor notices the symptom that doesn't belong to the otherwise coherent picture. In every case the move is identical to the puzzle: establish what "normal" or "the group" means with a precise rule, and only then can the anomaly be named — and defended against the objection that some other rule would flag something else.`,
  },
  {
    slug: "spatial-reasoning",
    title: "Spatial reasoning",
    weekNumber: 1,
    blurb: "Rotating a shape, folding a flat net into a cube, or tracing a punched hole through layers of paper — spatial items test whether you can run a transformation in your mind's eye and trust the result.",
    lectureTitle: "1.5 Spatial reasoning: rotating, folding, and seeing it in your head",
    body: `# Spatial reasoning

Spatial items ask you to transform a figure in your head and report the result: rotate this shape and pick the match; fold this flat pattern and choose the cube it makes; punch a hole through folded paper and say where the holes land when it opens. They feel like a fixed talent you either have or don't, but they are highly trainable once you replace vague visualization with a few precise procedures. The goal is to manipulate the figure deliberately rather than hope the answer "looks right."

## Rotation: turning without changing

A rotation turns a figure around a point while preserving everything about it — its size, its shape, and critically the *handedness* of its parts. The reliable check is to fix on one distinctive feature (an arrow's tip, a marked corner) and track where that feature must go after the turn, rather than trying to spin the whole shape at once. Then verify a second feature. Distractors are built by rotating *almost* correctly or by sneaking in a change rotation can never make, so confirming two independent features defeats the near-miss option that fooled the careless eye.

## Reflection is not rotation

The most exploited confusion in spatial testing is between a rotation and a **reflection** (a mirror flip). A reflection reverses handedness — it turns a left-pointing structure into a right-pointing one, like the difference between your two hands, which can never be rotated into each other no matter how you turn them. When an answer looks correct in every respect but seems subtly "backwards," it is almost certainly a mirror image offered as a trap. Train the question "is this the same shape turned, or its mirror twin?" because that single distinction resolves a large share of hard spatial items.

## Folding and unfolding

Two classic formats reward systematic tracking. In **net folding**, a flat cross-shaped pattern folds into a cube, and the task is which faces end up adjacent or opposite; the method is to fix one face as the base and fold the neighbors up one at a time, keeping track of which faces become opposite (opposite faces are never adjacent in the net once you account for the fold). In **paper folding with a punch**, treat each fold line as a *mirror*: every hole reflects across each crease when the paper opens. Fold a square once and punch one hole through both layers, and unfolding yields two holes, symmetric across that fold; each additional fold doubles the holes again.

## Strategies for the mind's eye

When pure visualization strains, externalize. Track a single landmark instead of the whole figure. Use your hand to physically mimic a rotation or a fold. Reason by elimination: rather than constructing the answer, test each option against a rule the answer *must* satisfy (a face that can't be opposite itself, a count of holes that must be even after one fold) and discard those that violate it. And exploit symmetry — symmetric figures have fewer truly distinct orientations than they appear to, which shrinks the work.

## In the real world

Mental spatial transformation underlies a surprising range of expert work: a surgeon mapping a two-dimensional scan onto a three-dimensional body, an architect walking through an unbuilt building, a chemist rotating a molecule to see whether it is the same compound or its non-superimposable mirror image (a distinction that can decide whether a drug heals or harms). Each depends on the very skills these puzzles isolate — turning, reflecting, and folding shapes accurately in the mind, and knowing the difference between a rotation that preserves a figure and a reflection that secretly reverses it.`,
  },
  {
    slug: "test-craft",
    title: "Test-craft (capstone)",
    weekNumber: 1,
    blurb: "Knowing the patterns is only half the score — the other half is timing, elimination, and disciplined guessing, the craft that converts ability into points under pressure.",
    lectureTitle: "1.6 Test-craft: timing, elimination, and smart guessing (Capstone)",
    body: `# Test-craft (capstone)

You can recognize every pattern type in this unit and still underperform, because a timed reasoning test measures not just whether you *can* solve an item but whether you can solve enough of them *in the time allowed*. Test-craft is the discipline that converts raw reasoning ability into a score: budgeting time, eliminating wrong options, guessing intelligently, and managing your own mind under pressure. It is the capstone because it governs how every skill from the previous five topics actually gets deployed.

## Timing: budget, and never sink

The first principle is a time budget. Divide the total time by the number of questions to get your per-item pace, and treat that pace as a contract — roughly one minute each for sixty items in an hour. The second principle is the more important one: **never sink** disproportionate time into a single hard item. Every test has a few items engineered to devour minutes, and the cost of fighting one is not just that minute but all the easier points elsewhere you fail to reach. When an item runs well past its budget, mark a provisional answer, flag it, and move on. Points are points; a hard item is worth no more than an easy one.

## Elimination: shrink the field before you choose

On multiple-choice items, you rarely need to construct the answer from scratch — you need to find the one option that survives scrutiny. Eliminating even one or two clearly wrong options transforms the problem: it sharpens your thinking and, if you must guess, dramatically raises your odds. Use the rules you've learned as filters: in a series, an option that breaks the confirmed operation is out; in spatial items, a mirror image when a rotation is required is out; in analogies, an option with the reversed relationship is out. Often the *fastest* route to the answer is to delete the impossible rather than verify the correct.

## Smart guessing: when and how

Whether to guess depends on the scoring rule, so know it before you start. When wrong answers are not penalized (the common case), you should answer *every* question — a blind guess has positive expected value and a blank is a guaranteed zero. When there is a penalty for wrong answers, guess only after eliminating enough options to tip the expected value in your favor. Either way, an *informed* guess after elimination beats a blind one, and a blind guess beats leaving a no-penalty item blank. Guessing well is not luck; it is applying the scoring rules and the elimination habit deliberately.

## Managing the mind under pressure

The last front is psychological. Nerves narrow attention and make careless errors more likely, so the antidotes are procedural: breathe and reset between hard items, do the easy items first to bank certain points and build momentum, and read each question once carefully rather than twice in a panic. Reserve a moment at the end to return to flagged items with whatever time remains and to confirm that every question has at least a guessed answer. The aim is a calm, repeatable routine that lets your trained pattern-recognition operate without interference.

## In the real world

Test-craft generalizes to any high-stakes performance under a clock: triaging a crowded emergency room, allocating a fixed research budget across competing projects, fielding questions in a timed oral defense. In each, raw competence is necessary but not sufficient; what distinguishes strong performers is the meta-skill of spending limited time and attention where they yield the most — refusing to sink into one hard problem, narrowing options decisively, and acting under uncertainty rather than freezing. This unit's final lesson is that intelligence you can actually *use* is intelligence paired with the craft to deploy it when it counts.`,
  },
];

type SeedAssignment = {
  kind: "homework" | "test" | "midterm" | "final";
  title: string;
  weekNumber: number;
  isTimed: boolean;
  timeLimitMinutes: number | null;
  instructions: string;
  problems: Array<{
    topicSlug: string;
    prompt: string;
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }>;
};

const ASSIGNMENTS: SeedAssignment[] = [
  {
    kind: "homework",
    title: "Homework 1.1 — Grids, series, and analogies",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.1–1.3. For each puzzle, give your answer AND explain the rule or relationship you used to get it, in a few sentences (about 3–5) in your own words. State your reasoning, not just the final answer. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "pattern-grids",
        prompt:
          "A 3×3 grid is filled with dots. The top row of cells contains 1, 2, and 3 dots (left to right). The middle row contains 2, 3, and 4 dots. The bottom row contains 3, 4, and a blank cell. How many dots belong in the blank, and what rule did you use? Explain how you can confirm the rule using BOTH the rows and the columns. (3–5 sentences.)",
        correctAnswer:
          "Five dots belong in the blank. Reading across each row, the count goes up by one (1,2,3 / 2,3,4 / 3,4,?), so the bottom row should end in 5. Reading down each column, the count also goes up by one (1,2,3 / 2,3,4 / 3,4,5), so the bottom-right cell is 5 by the column rule too. Because the row rule and the column rule independently both demand 5, the answer is confirmed from two directions — exactly the cross-check a grid is built to reward.",
        explanation:
          "Full credit: answer is 5, identifies the +1 rule across rows AND down columns, and confirms the missing cell satisfies both axes.",
      },
      {
        topicSlug: "series",
        prompt:
          "Consider the series 2, 6, 18, 54, ___. What is the next term, what is the rule, and how would you confirm the series is geometric (multiplying) rather than arithmetic (adding)? (3–5 sentences.)",
        correctAnswer:
          "The next term is 162. The rule is to multiply by 3 each step (2×3=6, 6×3=18, 18×3=54, 54×3=162). To confirm it is geometric rather than arithmetic, take the differences first — 4, 12, 36 — which are not constant, ruling out a fixed addition. Then take the ratios — 6÷2, 18÷6, 54÷18 — which all equal 3, a constant factor, which is the signature of a geometric series, so multiplying by 3 is justified rather than guessed.",
        explanation:
          "Full credit: next term 162, rule is ×3, and confirms geometric by noting differences are not constant while ratios are constant (=3).",
        hint: "Try subtracting adjacent terms first; if the gaps aren't equal and they're growing fast, divide instead.",
      },
      {
        topicSlug: "analogies",
        prompt:
          "Complete the analogy and explain it: 'Glove is to hand as sock is to ___.' Give the answer, state the precise relationship that links the first pair, and explain why a tempting choice like 'shoe' is wrong. (3–5 sentences.)",
        correctAnswer:
          "The answer is 'foot.' The precise relationship is that a glove is the close-fitting garment worn directly on a hand, and a sock is the close-fitting garment worn directly on a foot — so the bridge sentence is 'X is the snug cloth covering worn directly on body part Y.' 'Shoe' is tempting because it is strongly associated with both socks and feet, but it breaks the relationship: a shoe is hard outer footwear, not the snug cloth layer worn against the body the way a glove and a sock are. Stating the bridge precisely is what rules 'shoe' out, since a loose bridge like 'goes with' would wrongly admit it.",
        explanation:
          "Full credit: answer 'foot,' names the precise relation (snug garment worn directly on the body part), and explains why 'shoe' fails by being outer footwear, not the snug layer.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Odd-one-out, spatial reasoning, and test-craft",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.4–1.6. For each item, give your answer AND explain your reasoning in a few sentences (about 3–5) in your own words. Show the rule, transformation, or strategy you used. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "odd-one-out",
        prompt:
          "Which is the odd one out, and why: violin, guitar, flute, cello? Name the rule the others share, identify a second rule under which a DIFFERENT item could be the exception, and say which rule is stronger and why. (3–5 sentences.)",
        correctAnswer:
          "The flute is the odd one out: violin, guitar, and cello all produce sound from vibrating strings, while the flute is a wind instrument, so the shared rule is 'string instrument' and the flute breaks it. A competing rule is that the guitar is the only one normally plucked while the violin and cello are bowed — under that rule the guitar would be the exception. The string-versus-wind rule is stronger because it splits the set cleanly three-against-one on a basic, unarguable category, whereas the plucked-versus-bowed rule is narrower and the guitar can also be bowed. So the intended answer is the flute, found by naming the majority rule first and choosing the most fundamental split.",
        explanation:
          "Full credit: answer is flute (others are string instruments), names a competing rule (e.g. plucked vs bowed → guitar), and justifies preferring the cleaner/more fundamental 3-vs-1 category split.",
      },
      {
        topicSlug: "spatial-reasoning",
        prompt:
          "A square sheet of paper is folded once, left half over right half. A single hole is then punched through both layers near the top of the folded sheet. When the paper is unfolded, how many holes are there and where are they? Explain your reasoning by treating the fold as a mirror. (3–5 sentences.)",
        correctAnswer:
          "When unfolded there are two holes, positioned symmetrically across the vertical center crease, both near the top — one in the left half and one in the right half, each the same distance from the fold line. The reasoning is to treat the fold line as a mirror: punching through two layers makes a hole in each layer, and when the paper opens, the second hole appears as the mirror image of the first reflected across the crease. Because there was one fold, the single punch doubles to two holes; each additional fold would double the count again.",
        explanation:
          "Full credit: answer is 2 holes, mirror-symmetric across the fold line near the top, with reasoning that the crease acts as a mirror and one fold doubles a single punch.",
        hint: "Each fold line acts like a mirror; count how many layers the punch passes through.",
      },
      {
        topicSlug: "test-craft",
        prompt:
          "You have 30 questions to answer in 30 minutes, and wrong answers are not penalized. At the 20-minute mark you have finished 15 questions and you are stuck on a hard spatial item you've already spent 3 minutes on. Walk through what you should do and why, using time-budgeting, elimination, and smart-guessing. (3–5 sentences.)",
        correctAnswer:
          "Your budget is one minute per question, so finishing 15 in 20 minutes means you are behind pace and have 15 questions for the last 10 minutes. You should stop sinking time into the hard item immediately, because the three minutes already spent are gone and each extra minute costs you easier points elsewhere. Before leaving it, eliminate any clearly impossible options — for a spatial item, discard mirror images when a rotation is required — and mark your best remaining guess, since with no penalty a guess can only help and a blank is a guaranteed zero. Then move on to bank the easier questions, and return to the flagged hard item only if time remains at the end.",
        explanation:
          "Full credit: recognizes being behind a ~1 min/question budget, says abandon/flag the sinking item, eliminate to improve the guess, answer everything because no penalty, and return only if time allows.",
      },
    ],
  },
  {
    kind: "test",
    title: "Unit Test — Functional Intelligence: How Reasoning Tests Work",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions:
      "Timed. 30 minutes. Covers sections 1.1–1.6. For each item give your answer AND explain the rule, relationship, transformation, or strategy behind it, in a few sentences (about 4–6) in your own words. No answer earns full credit without the reasoning. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "pattern-grids",
        prompt:
          "Explain the disciplined method for solving a 3×3 matrix puzzle where one cell is blank. Cover why you should treat the grid as a system of rules rather than a picture, how reading across rows and down columns helps, and why you must check a candidate answer against every feature. (4–6 sentences.)",
        correctAnswer:
          "A matrix puzzle should be treated as a system of hidden rules, not a single image, because trying to absorb the whole grid at once is overwhelming and the blank is simply the one cell where the rules haven't been applied yet. The method is to isolate one feature at a time and trace how it changes across a row (it might count up, rotate, or alternate) and then how a second feature changes down a column. The missing cell is where the row rule and the column rule intersect, and the correct answer must satisfy both at once. Crucially, you must verify a candidate against every feature you identified — count, shape, shading, orientation — because distractors are engineered to be correct on most features and wrong on one. Checking only the first matching feature is the most common way to fall for a trap answer.",
        explanation:
          "Full credit: explains grid-as-rules, isolating features across rows and down columns, the answer satisfying both axes, and verifying against all features to beat near-miss distractors.",
      },
      {
        topicSlug: "series",
        prompt:
          "Describe how to attack a number or letter series problem. Explain the checklist (differences, then ratios), how to tell arithmetic from geometric, what to do when neither fits, and how letter series reduce to number series. (4–6 sentences.)",
        correctAnswer:
          "A series hides one repeated operation, so the first step is to compute the relationship between adjacent terms: subtract to get the differences, and if the differences are constant the series is arithmetic (a fixed amount added each step). If the differences are not constant but growing fast, take the ratios instead; a constant ratio means the series is geometric (a fixed factor multiplied each step). When neither differences nor ratios are constant, the series is probably two patterns interleaved, so split it into its odd-position and even-position terms and analyze each strand separately. Letter series reduce to number series by converting each letter to its alphabet position (A=1, B=2, …), solving as numbers, and converting back, watching for wrap-around past Z. The guiding habit is to test the simplest rule first and confirm it holds for every step.",
        explanation:
          "Full credit: differences-then-ratios checklist, arithmetic (constant difference) vs geometric (constant ratio), split interleaved series into strands, and convert letters to alphabet positions.",
      },
      {
        topicSlug: "analogies",
        prompt:
          "Explain how to solve analogy items of the form 'A is to B as C is to ___.' Cover why relationship beats resemblance, the 'bridge sentence' technique, and how to defeat a distractor that shares the wrong link or reverses the direction. (4–6 sentences.)",
        correctAnswer:
          "An analogy tests a relationship, not a resemblance, so the trap is grabbing a word merely associated with C instead of one that preserves the A-to-B link. The reliable technique is a bridge sentence: state precisely how A relates to B (for example, 'A is the tool used to perform action B'), then plug C into the same sentence to read off the answer. The more specific the bridge, the more wrong options it eliminates; if two choices both fit, the bridge is too loose and must be tightened until exactly one survives. Distractors are built to share the wrong link — a synonym when the link is intensity, or an opposite — so naming the bridge before looking at the options is the defense. You must also check the direction of the relationship, because a choice that reverses A-does-to-B into B-does-to-A is the most seductive wrong answer.",
        explanation:
          "Full credit: relationship over resemblance, the precise bridge sentence that eliminates options, and guarding against wrong-link and reversed-direction distractors.",
      },
      {
        topicSlug: "odd-one-out",
        prompt:
          "Explain the correct approach to an odd-one-out (classification) item. Cover why you must find the shared rule before the exception, how to choose between competing rules, and why structural features beat surface features. (4–6 sentences.)",
        correctAnswer:
          "Strangeness is not a property of a single item but of an item relative to a rule, so you cannot find the outlier until you have named what the others share. The disciplined order is to survey the set, find a property most items share, then identify the one item that lacks it. When more than one rule each singles out a different item, prefer the cleaner, more fundamental rule — the one that splits the set most decisively, such as a three-versus-one on a basic category — over a narrow or arguable property. You should also distinguish surface features (color, size, how things look) from structural features (what things are or do) and give structural rules priority, because distractors lean on superficial similarities that cut across the real category. The intended answer is the one whose rule leaves the remaining items as the tightest, least contestable group.",
        explanation:
          "Full credit: find the shared rule first, rank competing rules by cleanness/decisiveness, and prefer structural over surface features.",
      },
      {
        topicSlug: "spatial-reasoning",
        prompt:
          "Explain the key ideas for spatial items. Cover what a rotation preserves, why a reflection (mirror flip) is the classic trap, and the 'fold as a mirror' method for a paper-punch problem. Include one strategy for when visualization is hard. (4–6 sentences.)",
        correctAnswer:
          "A rotation turns a figure around a point while preserving its size, shape, and handedness, so the reliable check is to track one distinctive feature to where it must go after the turn and then confirm a second feature. The classic trap is a reflection, a mirror flip that reverses handedness — turning a left-pointing structure into a right-pointing one, like two hands that can never be rotated onto each other — so an option that looks right but subtly 'backwards' is almost certainly a mirror image. For a paper-folding-and-punch problem, treat each fold line as a mirror: every hole reflects across each crease when the paper opens, so one fold turns a single punch into two symmetric holes and each further fold doubles the count. When visualization strains, externalize — track a single landmark, use your hand to mimic the motion, or eliminate options that violate a rule the answer must satisfy (such as an odd hole count after one fold).",
        explanation:
          "Full credit: rotation preserves shape/handedness (track a feature), reflection reverses handedness (the trap), fold-as-mirror doubling for punches, and an externalize/eliminate strategy.",
      },
      {
        topicSlug: "test-craft",
        prompt:
          "Explain the core of test-craft on a timed reasoning test. Cover the time budget and the 'never sink' rule, how elimination helps even when you can't construct the answer, and how the scoring rule decides whether to guess. (4–6 sentences.)",
        correctAnswer:
          "Test-craft converts reasoning ability into a score, and it starts with a time budget: divide total time by the number of questions to set a per-item pace and treat it as a contract. The most important rule is never to sink disproportionate time into one hard item, because the cost is not just that minute but all the easier points elsewhere you fail to reach — when an item runs past its budget, mark a guess, flag it, and move on. Elimination matters even when you cannot build the answer outright: deleting one or two impossible options sharpens your thinking and, if you must guess, sharply raises your odds. Whether to guess depends on the scoring rule, so know it first: with no penalty for wrong answers you should answer every question, since a guess can only help and a blank is a guaranteed zero, while with a penalty you guess only after eliminating enough options to make the expected value positive. An informed guess after elimination beats a blind one, and a blind guess beats a blank on a no-penalty test.",
        explanation:
          "Full credit: time budget + never-sink rule, elimination to raise guessing odds, and using the scoring rule to decide whether/when to guess (answer all if no penalty).",
      },
    ],
  },
  {
    kind: "final",
    title: "Final — Functional Intelligence: How Reasoning Tests Work",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 45,
    instructions:
      "Timed cumulative final. 45 minutes. Covers the whole course (sections 1.1–1.6). Answer each question in a paragraph (about 5–7 sentences) in your own words, giving both your answer and the reasoning behind it. No answer earns full credit without the reasoning. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "test-craft",
        prompt:
          "Using ideas from across the whole course, describe how you would work through a mixed, timed reasoning test efficiently. Show how at least four different topics fit together — for example, recognizing a pattern type quickly (grids, series, analogies, odd-one-out, or spatial), using elimination, budgeting time, and guessing wisely. (5–7 sentences.)",
        correctAnswer:
          "I would start by setting a time budget — total time divided by the number of items — and commit to a roughly even pace, doing the easier items first to bank certain points and build momentum. As I read each item I would classify it: a grid is a system of rules to read across rows and down columns, a series hides one repeated operation found by checking differences then ratios, an analogy needs a precise bridge sentence, an odd-one-out needs the shared rule before the exception, and a spatial item needs me to track a feature through a rotation while watching for a mirror-flip trap. On multiple-choice items I would eliminate impossible options using those very rules — a term that breaks a confirmed series operation, a reversed-direction analogy, a mirror image when a rotation is required — which both speeds the choice and raises my odds if I must guess. If any item runs well past its budget I would mark a best guess, flag it, and move on rather than sink time, because every item is worth the same and a hard one costs me easier points elsewhere. Knowing wrong answers usually aren't penalized, I would make sure every question has at least a guess and never leave a blank. Finally I would reserve the last minutes to revisit flagged items. This ties together pattern recognition, elimination, time-budgeting, and smart guessing into one repeatable routine.",
        explanation:
          "Full credit: integrates at least four topics — fast pattern-type recognition (grids/series/analogies/odd-one-out/spatial), elimination, time budgeting + never-sink, and scoring-aware guessing — into a coherent routine.",
      },
      {
        topicSlug: "pattern-grids",
        prompt:
          "Someone says, 'Matrix grid puzzles are just about being naturally good at seeing pictures — you either get it or you don't.' Using the course, argue why this is wrong, and explain the systematic method that makes grids solvable. Use a concrete example of a rule. (5–7 sentences.)",
        correctAnswer:
          "The 'you either get it or you don't' view is wrong because grids reward a learnable procedure, not innate picture-sense. The key shift is to stop seeing the grid as one overwhelming image and treat it as a system of hidden rules, where the blank is just the cell where the rules haven't been carried out yet. The method is to isolate one feature at a time and trace how it changes across a row and then down a column — for example, if the number of dots increases by one across each row and also by one down each column, the bottom-right blank is fixed by both rules at once. Because the transformations come from a small, recognizable set — quantity, rotation, movement, addition/subtraction, alternation — naming the family collapses the possible answers to one. Finally, the answer must be checked against every feature, since distractors are built to match on most features and fail on one. None of that depends on talent; it depends on decomposing the grid and verifying systematically.",
        explanation:
          "Full credit: rejects the innate-talent claim, explains grid-as-system, isolate-and-trace across rows/columns with a concrete rule, the small set of transformation families, and verifying against all features.",
      },
      {
        topicSlug: "analogies",
        prompt:
          "A test-taker reads 'Thermometer is to temperature as ___' and immediately picks an answer that just 'feels related' to thermometers. Using the course, explain why this approach is risky and how the bridge-sentence method and a direction check would lead to a better answer. Use a concrete example. (5–7 sentences.)",
        correctAnswer:
          "Picking what 'feels related' is risky because an analogy tests a specific relationship, not loose association, and many words are associated with a thermometer without preserving its link to temperature. The better approach is to state a precise bridge sentence: a thermometer is the instrument used to measure temperature, so the second pair must be 'an instrument used to measure its quantity' — for example, clock is to time, or scale is to weight. A loose bridge like 'goes with temperature' would wrongly admit associated words such as 'heat' or 'fever,' so the bridge must be tightened until exactly one choice fits. You also have to check direction: the link runs instrument-measures-quantity, so a choice that reverses it (a quantity and the thing it is measured by, in the wrong order) is a classic trap. Applying the precise bridge plus a direction check turns a vague impression into a defensible single answer. That discipline — name the relationship exactly, then transfer it in the right direction — is the whole skill of analogies.",
        explanation:
          "Full credit: explains relationship-over-association risk, builds a precise bridge (instrument measures quantity) with a concrete parallel (clock:time / scale:weight), tightens it to one answer, and checks direction.",
      },
      {
        topicSlug: "spatial-reasoning",
        prompt:
          "A test-taker keeps choosing answers on spatial items that look almost right but are 'subtly backwards,' and keeps getting them wrong. Using the course, diagnose what is going wrong and explain the rotation-versus-reflection distinction and a reliable checking method. Use a concrete example. (5–7 sentences.)",
        correctAnswer:
          "The diagnosis is that the test-taker is falling for reflections — mirror images offered as traps — when the item calls for a rotation. A rotation turns a figure while preserving its size, shape, and handedness, whereas a reflection reverses handedness, turning a left-pointing structure into a right-pointing one, the way your left and right hands are mirror twins that can never be rotated onto each other. That is exactly why a trap option can look correct in every respect yet feel 'subtly backwards.' The reliable method is to fix on one distinctive feature — say an arrow's tip or a marked corner — and track where it must go under the rotation, then confirm a second feature, rather than spinning the whole shape at once. Asking explicitly 'is this the same shape turned, or its mirror twin?' resolves a large share of hard spatial items. The fix, then, is to add a deliberate handedness check before committing, instead of trusting that an option simply looks right.",
        explanation:
          "Full credit: diagnoses reflection-vs-rotation confusion, explains rotation preserves handedness while reflection reverses it (hands example), and gives the track-a-feature + explicit handedness check method.",
      },
    ],
  },
];

type SeedPrimer = SeedTopic;

const REASONING_PRIMERS: SeedPrimer[] = [
  {
    slug: "reasoning-primer-subject",
    title: "How to reason about functional-intelligence cases",
    weekNumber: 1,
    blurb:
      "Diagnostic primer: applying the course's reasoning-test skills to concrete puzzles and situations.",
    lectureTitle: "Primer: How to reason about functional-intelligence cases",
    body: `# How to reason about functional-intelligence cases

This short primer prepares you for the **Functional Intelligence** diagnostic. That check is *ungraded practice* — it never affects your course grade. It is drawn from the six topics of this unit and asks you to *apply* what you have learned to a specific puzzle or situation, not to recite a definition.

## It tests application, not memorization

A diagnostic question gives you a small, concrete case — a grid whose cells change by a rule, a series with one hidden operation, an analogy that hinges on a precise relationship, a set with one outlier, a shape to rotate or fold, or a timing decision under pressure — and asks what the course's skills tell you about it. Knowing the words "geometric series" or "reflection" is not enough; the question wants you to recognize *when* you are looking at one and *what move it demands here*.

## What the questions reward

- **Naming the right skill** — match the case to the technique that fits it: reading a grid across rows and down columns, taking differences then ratios on a series, building a precise bridge sentence for an analogy, finding the shared rule before the odd one out, distinguishing a rotation from a mirror reflection, or budgeting time and guessing wisely.
- **Using evidence from the case** — point to the detail that decides it (the constant ratio, the reversed relationship, the backwards-looking mirror image) rather than answering from a general impression.
- **Avoiding the surface trap** — the best answers resist the option that merely *looks* related or "feels right," and instead apply the exact rule the case calls for.

## How to do this activity well

1. **Read the case first**, then ask which topic's skill it belongs to.
2. **Find the detail that decides it** — what in the case makes one answer better than the others.
3. For written items, **give the core idea in a sentence or two** — clear and correct beats long and padded.

Take it as often as you like; the questions are freshly generated every time, and there is no penalty for any answer.`,
  },
  {
    slug: "reasoning-primer-general",
    title: "Core reasoning skills",
    weekNumber: 1,
    blurb:
      "Diagnostic primer: analysis, inference, evaluation, deduction, and induction.",
    lectureTitle: "Primer: Core reasoning skills",
    body: `# Core reasoning skills

This short primer prepares you for the **General Reasoning** diagnostic — an *ungraded* check that tests five genuine reasoning skills. These are the same skills you use to decide what a set of facts really shows, so they reinforce the disciplined thinking the rest of this course trains.

## The five skills

- **Analysis** — break an argument into parts: find its **point** (the conclusion), the **reasons** given for it, and any hidden assumption it leans on. Ask: "What is this trying to convince me of, and what does it take for granted?"
- **Inference** — work out what *follows* from what you're told, and how strongly. Tell apart what *must* be true, what is *likely*, and what is only *possible*.
- **Evaluation** — judge how much the reasons actually support the point. Notice when evidence is beside the point, a source isn't trustworthy, or a step doesn't really connect.
- **Deduction** — reasoning where true starting facts *guarantee* the conclusion. If the starting facts are true, the conclusion can't be false. Watch for sneaky forms that only *look* airtight.
- **Induction** — reasoning from a few examples to a *probable* general rule or prediction. Strong induction uses many fair examples; weak induction over-generalizes from too few.

## A recurring trap: things that move together

Most wrong answers are statements that *sound* reasonable but are **not actually backed up by what you were told**. The discipline this check rewards is the same one careful reasoning always demands: keep apart what the facts **show**, what you're **assuming**, and what only *sounds* right. Two things happening together does not prove one causes the other.

## How to do this activity well

1. Find the **point** (conclusion) first, then the reasons.
2. Ask which of the five skills the question is testing (a hidden-assumption question is analysis; a "what follows" question is inference or deduction; a "how good is this reasoning" question is evaluation).
3. Pick the option that follows **only** from what you were given — not the one that merely sounds true or appealing.

Take it as often as you like; the questions are freshly generated every time, and it never affects your grade.`,
  },
];

// Insert any teaching-to-the-test primer lectures whose slug is not yet present.
// Safe to run on every boot: it only adds what is missing.
export async function seedReasoningPrimersIfMissing(): Promise<void> {
  const currentSlugs = REASONING_PRIMERS.map((p) => p.slug);
  // Remove any obsolete primer topics from earlier diagnostic models (their
  // lectures cascade-delete), so renamed/retired primers self-heal instead of
  // stranding stale content in existing or republished databases.
  const stale = await db
    .delete(topicsTable)
    .where(
      and(
        like(topicsTable.slug, "reasoning-primer-%"),
        notInArray(topicsTable.slug, currentSlugs),
      ),
    )
    .returning({ slug: topicsTable.slug });
  if (stale.length > 0) {
    logger.info(
      { removed: stale.map((s) => s.slug) },
      "Reasoning primers: removed obsolete primers",
    );
  }
  let added = 0;
  for (let i = 0; i < REASONING_PRIMERS.length; i++) {
    const t = REASONING_PRIMERS[i]!;
    const existing = await db
      .select({ id: topicsTable.id })
      .from(topicsTable)
      .where(eq(topicsTable.slug, t.slug));
    if (existing.length > 0) continue;
    const [inserted] = await db
      .insert(topicsTable)
      .values({
        slug: t.slug,
        title: t.title,
        weekNumber: t.weekNumber,
        blurb: t.blurb,
        position: 900 + i,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert primer ${t.slug}`);
    await db.insert(lecturesTable).values({
      topicId: inserted.id,
      weekNumber: t.weekNumber,
      title: t.lectureTitle,
      body: t.body,
    });
    added += 1;
  }
  if (added > 0) {
    logger.info({ added }, "Reasoning primers seeded");
  } else {
    logger.info("Reasoning primers: already present, skipping");
  }
}

export async function seedIfEmpty(): Promise<void> {
  // The course was migrated to the Functional Intelligence syllabus. Detect the
  // marker topic; if present and the content version matches, the content is
  // current and we skip. This makes the seed self-healing across environments: a
  // database that still holds older content (e.g. a previous curriculum) is
  // detected and replaced on boot.
  const markerTopic = await db
    .select({ id: topicsTable.id })
    .from(topicsTable)
    .where(eq(topicsTable.slug, "pattern-grids"));
  // Read the stored content version. Tolerate the seed_meta table not yet
  // existing (e.g. a boot that races ahead of schema migration): treat that as
  // "no version recorded", which forces a reseed once the table is present.
  let currentVersion: string | null = null;
  try {
    const storedVersion = await db
      .select({ value: seedMetaTable.value })
      .from(seedMetaTable)
      .where(eq(seedMetaTable.key, "content_version"));
    currentVersion = storedVersion[0]?.value ?? null;
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "Seed: seed_meta unavailable, treating version as unset");
    currentVersion = null;
  }
  if (markerTopic.length > 0 && currentVersion === SEED_CONTENT_VERSION) {
    logger.info("Seed: course content present and current, skipping");
    return;
  }
  if (markerTopic.length > 0) {
    logger.warn(
      { storedVersion: currentVersion, expected: SEED_CONTENT_VERSION },
      "Seed: course content present but out of date — re-seeding with the current curriculum",
    );
  }

  // No current content. Either the database is empty (fresh) or it still holds
  // an older curriculum. Do the (optional) wipe and the full reseed in a SINGLE
  // transaction so the marker topic only ever becomes visible once the entire
  // curriculum has committed. A crash mid-seed rolls back, so the next boot
  // retries instead of leaving partial content that the marker check would
  // wrongly treat as healthy. TRUNCATE also takes an ACCESS EXCLUSIVE lock, so
  // concurrent readers never observe a half-empty course during the replace
  // window. The diagnostic tables are truncated here too so the (non
  // version-gated) diagnostic seed repopulates them with the current content on
  // the same boot.
  await db.transaction(async (tx) => {
    const existing = await tx.execute(sql`select count(*)::int as n from topics`);
    const row = (existing.rows[0] ?? {}) as { n?: number };
    if ((row.n ?? 0) > 0) {
      logger.warn(
        "Seed: stale course content detected — replacing with the Functional Intelligence curriculum",
      );
      await tx.execute(
        sql`TRUNCATE TABLE answers, attempts, practice_attempts, practice_problems, practice_sessions, problems, assignments, lectures, topics, diagnostic_responses, diagnostic_attempts, diagnostic_items, diagnostic_assessments RESTART IDENTITY CASCADE`,
      );
    } else {
      logger.info("Seed: populating course content");
    }

    // Topics + lectures
    const slugToTopicId = new Map<string, number>();
    for (let i = 0; i < TOPICS.length; i++) {
      const t = TOPICS[i]!;
      const [inserted] = await tx
        .insert(topicsTable)
        .values({
          slug: t.slug,
          title: t.title,
          weekNumber: t.weekNumber,
          blurb: t.blurb,
          position: i,
        })
        .returning();
      if (!inserted) throw new Error(`Failed to insert topic ${t.slug}`);
      slugToTopicId.set(t.slug, inserted.id);
      await tx.insert(lecturesTable).values({
        topicId: inserted.id,
        weekNumber: t.weekNumber,
        title: t.lectureTitle,
        body: t.body,
      });
    }

    // Assignments + problems
    for (let i = 0; i < ASSIGNMENTS.length; i++) {
      const a = ASSIGNMENTS[i]!;
      const [inserted] = await tx
        .insert(assignmentsTable)
        .values({
          kind: a.kind,
          title: a.title,
          weekNumber: a.weekNumber,
          position: i,
          isTimed: a.isTimed,
          timeLimitMinutes: a.timeLimitMinutes,
          instructions: a.instructions,
        })
        .returning();
      if (!inserted) throw new Error(`Failed to insert assignment ${a.title}`);
      for (let p = 0; p < a.problems.length; p++) {
        const prob = a.problems[p]!;
        const topicId = slugToTopicId.get(prob.topicSlug);
        if (!topicId) throw new Error(`Unknown topic slug ${prob.topicSlug}`);
        await tx.insert(problemsTable).values({
          assignmentId: inserted.id,
          topicId,
          position: p,
          prompt: prob.prompt,
          correctAnswer: prob.correctAnswer,
          explanation: prob.explanation,
          hint: prob.hint ?? null,
        });
      }
    }

    // Stamp the content version last, inside the same transaction, so the
    // marker check on the next boot only treats the course as "current" once
    // the entire curriculum has committed.
    await tx
      .insert(seedMetaTable)
      .values({ key: "content_version", value: SEED_CONTENT_VERSION })
      .onConflictDoUpdate({
        target: seedMetaTable.key,
        set: { value: SEED_CONTENT_VERSION, updatedAt: new Date() },
      });
  });

  logger.info(
    { topics: TOPICS.length, assignments: ASSIGNMENTS.length, version: SEED_CONTENT_VERSION },
    "Seed complete",
  );
}
