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
const SEED_CONTENT_VERSION = "2026-06-16-basic-ai-math-v2";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // Unit 1 — Basic AI Math: the math behind the machine
  {
    slug: "why-ai-is-really-math",
    title: "Why AI is really math",
    weekNumber: 1,
    blurb: "When a chatbot writes a poem it feels like magic — but underneath it is all numbers and arithmetic, done at enormous scale.",
    lectureTitle: "1.1 Why AI is really math (the idea behind the machine)",
    body: `# Why AI is really math

You type a question and a chatbot answers in fluent, natural sentences — it really does feel like there's a mind inside the box. There isn't. Underneath the human-sounding words, an AI is doing one thing: an unimaginable amount of plain arithmetic on lists of numbers. This whole course is about that surprising truth — **AI is really math** — and the good news is the math behind it is far gentler than its reputation.

## Everything becomes numbers

A computer can't think about the *word* "cat" or the *idea* of a sunset. The very first thing any AI does is turn whatever you give it — text, images, sound — into numbers. A word becomes a list of numbers; a photo becomes a giant grid of numbers (one per dot of color); a sound becomes numbers measuring the wave. Once the world is numbers, the machine can do the only thing it's good at: arithmetic. Every clever-looking thing AI does starts with this quiet translation step.

## A giant pile of tunable dials

Inside the model is a huge collection of numbers called **weights** — picture millions or billions of little dials. When numbers flow through the model, each dial multiplies and nudges them along the way. The exact settings of all those dials are what make one model good at writing code and another good at describing pictures. The model isn't a brain full of facts; it's a mountain of dials whose particular settings happen to produce useful answers.

## Learning is just adjusting numbers

So where do the right dial settings come from? Nobody sets them by hand — there are far too many. Instead the model **learns** them: it makes a guess, sees how wrong it was, and nudges the dials a tiny bit toward "less wrong." Do that billions of times on billions of examples and the dials drift into settings that work. Everything people call "training" or "learning" is, at bottom, this patient adjusting of numbers — no understanding required, just relentless tuning.

## Why "math, not magic" matters

Seeing AI as math instead of magic changes how you treat it. Magic is mysterious and trustworthy; math is understandable and checkable. Because it's all arithmetic on numbers, AI has no secret wisdom — it can be confidently wrong, it reflects whatever examples it learned from, and it can be measured, tested, and improved. Knowing the machine is "just math" is exactly what lets us use it well and not be fooled by it.

## In the real world

When you send one short message to a large chatbot, your words are turned into numbers and pushed through billions of multiply-and-add steps before a single word of the reply appears — a stack of arithmetic so tall it needs warehouse-sized computers to run. The astonishing part isn't that a mind is thinking; it's that *pure arithmetic, at a scale humans can't picture, can look so much like thinking.* That gap between "simple math" and "feels like magic" is the mystery this course is here to take apart.`,
  },
  {
    slug: "vectors-and-embeddings",
    title: "Vectors and embeddings",
    weekNumber: 1,
    blurb: "AI turns every word and idea into a point in space — and where that point sits is what 'meaning' becomes for a machine.",
    lectureTitle: "1.2 Numbers as meaning: vectors and embeddings",
    body: `# Vectors and embeddings

We said AI turns everything into numbers. But a single number can't capture much — how would one number hold the meaning of the word "ocean"? The trick is to use a *whole list* of numbers at once. That list is called a **vector**, and the clever way AI arranges those vectors so they actually carry meaning is called an **embedding.** This is one of the most beautiful ideas in the whole field.

## A vector is just a list of numbers

A vector sounds intimidating, but it's nothing more than an ordered list of numbers, like \`[2, 5, 1]\`. You can think of it as a location: \`[2, 5]\` is a spot on a map, two steps east and five steps north. AI uses much longer lists — hundreds of numbers — which is just a spot in a space with hundreds of directions instead of two. We can't picture that, but the math doesn't care; a location is a location whether it has 2 numbers or 500.

## Meaning as a place in space

Here's the leap. AI gives every word its own vector — its own location — and arranges them so that **words with similar meanings sit close together.** "Dog," "puppy," and "cat" land in the same neighborhood; "helicopter" is far away across town. The machine has no dictionary and no idea what a dog *is.* It just knows that the word "dog" lives near the word "puppy," and that nearness is what meaning becomes for a machine. An **embedding** is exactly this: a map where distance means similarity.

## Directions can carry meaning too

The map has an even more surprising feature: the *directions* between points mean something. The step that takes you from "man" to "woman" turns out to be roughly the same step that takes you from "king" to "queen." So you can do arithmetic on meaning: take the vector for "king," subtract "man," add "woman," and you land right next to "queen." Meaning isn't just stored as locations — it's woven into the geometry, so relationships become directions you can travel.

## Why this is so powerful

Once meaning is a location, everything downstream gets easy. To find similar documents, look for nearby vectors. To translate, line up two languages' maps. To recommend a song, find the ones sitting near the ones you love. Turning fuzzy meaning into hard geometry is what lets a machine that only does arithmetic still handle something as slippery as language. Almost every modern AI rests on this one move.

## In the real world

When a search engine understands that "how to fix a flat tire" and "repairing a punctured wheel" are asking the same thing — despite sharing almost no words — it's because both phrases land in nearly the same spot on the embedding map. The old way matched keywords and missed it; the new way matches *locations* and nails it. That quiet shift, from matching words to matching places in space, is why search and chatbots suddenly got so much better at knowing what you actually meant.`,
  },
  {
    slug: "dot-product-and-distance",
    title: "The dot product and distance",
    weekNumber: 1,
    blurb: "If meaning is a location, AI needs a way to measure 'how alike' two locations are — that ruler is the dot product and distance.",
    lectureTitle: "1.3 Measuring likeness: the dot product and distance",
    body: `# The dot product and distance

In the last topic, meaning became a location — every word a point on a vast map. But a map is only useful if you can measure it. How does a machine actually *tell* that "dog" and "puppy" are close while "dog" and "helicopter" are far? It needs a ruler for comparing vectors. The two rulers AI reaches for constantly are **distance** and the **dot product** — and almost everything AI does involves measuring likeness with one of them.

## Distance: how far apart

The most natural ruler is plain distance — the straight-line gap between two points, exactly like measuring between two cities on a map. Two vectors that sit close together have a small distance and are counted as similar; two that sit far apart have a large distance and are counted as different. It's the same intuition you already use: things near each other are alike, things far apart aren't. AI just does this in a space with hundreds of directions instead of two.

## The dot product: do they point the same way

The **dot product** is a second, slightly different ruler, and it's the workhorse of AI. Instead of asking "how far apart are these points," it asks "**do these two arrows point in the same direction?**" You get it by multiplying the matching numbers of two vectors and adding the results up. When two vectors point the same way, the dot product is large and positive; when they point in opposite directions, it's negative; when they're unrelated, it's near zero. A big dot product is the machine's way of saying "these two things agree."

## Cosine similarity: direction over size

Sometimes you care about *direction* but not *size.* A long document and a short one can be about the exact same thing, even though one vector is "bigger" just because there's more text. **Cosine similarity** fixes this: it's the dot product after ignoring length, so it only measures the angle between two vectors — are they pointing the same way, regardless of how long the arrows are? This is the most common likeness score in AI precisely because it focuses on meaning and shrugs off size.

## Why AI measures likeness constantly

This sounds like a small bit of bookkeeping, but it's everywhere. Search compares your question's vector to every document's vector and returns the closest. A recommender compares what you liked to everything available and ranks by similarity. Even inside a chatbot, deciding which earlier words to "pay attention" to is mostly a flurry of dot products. Measuring likeness is one of the handful of operations AI does over and over, billions of times.

## In the real world

When a music app builds you a playlist of songs "you might like," it has turned every song into a vector and is quietly computing similarity between the songs you love and millions you've never heard. The ones with the highest similarity score float to the top of your recommendations. You experience it as the app "getting your taste" — but under the hood it's just a ruler being run across a map, again and again, asking the same humble question: *how alike are these two points?*`,
  },
  {
    slug: "matrices",
    title: "Matrices",
    weekNumber: 1,
    blurb: "A matrix is a grid of numbers that takes one list of numbers in and reshapes it into another — it's how a network moves information.",
    lectureTitle: "1.4 Matrices: how a network moves information",
    body: `# Matrices

We have vectors (lists of numbers that carry meaning) and rulers for comparing them. But an AI doesn't just *store* vectors — it *transforms* them, step after step, turning the numbers for your question into the numbers for its answer. The tool that does that transforming is the **matrix.** If a vector is a single list of numbers, a matrix is a whole grid of them, and it's the engine that moves information through a network.

## A matrix is a grid of numbers

A matrix is simply numbers arranged in a rectangle — rows and columns, like a tiny spreadsheet. That's the whole definition; there's nothing mystical about it. What makes it interesting is what it *does:* a matrix is a machine for taking a vector in one end and producing a new, transformed vector out the other. Feed in a list of numbers, and the matrix hands you back a different list. It's a recipe for reshaping numbers.

## Multiplying mixes and reshapes

How does the reshaping work? Each number that comes out is a **weighted blend** of all the numbers that went in — you multiply each input by a weight in the grid and add them up (yes, that's a pile of dot products again). One row of the matrix might mostly listen to the first two inputs; another might blend all of them differently. So a matrix lets every output number draw a little from every input number, in whatever proportions its weights specify. That's how information gets mixed and routed.

## A layer of a network is a matrix

This is the punchline that connects everything: **one layer of a neural network is basically one matrix multiply.** The "weights" — those millions of tunable dials from topic 1.1 — are exactly the numbers filling the matrices. When data flows through a layer, the layer's matrix blends and reshapes it into a more useful set of numbers. So a neural network isn't a brain; it's a stack of grids that each transform the numbers a little.

## Stacking transformations

One matrix can only reshape so much, so networks chain many of them: the output of one becomes the input to the next, with a small non-linear "bend" added between them so the steps don't collapse into one. Layer after layer, the original numbers get refined — raw word-numbers near the bottom, rich meaning near the top. Depth is just lots of these transformations stacked, each handing its reshaped numbers to the next.

## In the real world

When a translation model turns an English sentence into Spanish, your words enter as vectors and then pass through layer after layer of matrices, each one blending and reshaping the numbers — gradually carrying information from "what these English words mean" toward "what Spanish words say the same thing." No single matrix knows Spanish; the translation emerges from dozens of humble grid-multiplications in a row. Moving information is what matrices do, and stacking them is how a network thinks its way from a question to an answer.`,
  },
  {
    slug: "slopes-and-gradients",
    title: "Slopes and gradients",
    weekNumber: 1,
    blurb: "Before an AI can improve, it needs to know which way is 'better' — a slope, generalized to a gradient, is the arrow that tells it.",
    lectureTitle: "1.5 Slopes and gradients: which way is 'better'?",
    body: `# Slopes and gradients

So far we have a machine that turns inputs into outputs by pushing numbers through matrices. But out of the box, its millions of dials are set to nonsense and its answers are wrong. To learn, it has to figure out, for every single dial, *which way should I turn this to do better?* The mathematical idea that answers "which way is better" is the **slope**, and its higher-dimensional version — the **gradient** — is the compass that all of AI learning is built on.

## Slope: how steep, and which way

You already know slopes from walking up a hill: the slope tells you how steep the ground is and which direction is up. In math it's the same — given a curve, the slope at a point says how fast things are changing and whether they're rising or falling. A big slope means a steep change; a slope of zero means you're on flat ground, at a peak or the bottom of a valley. That little "which way and how fast" number is the seed of everything in this topic.

## A loss score: how wrong the AI is

To use slopes for learning, AI first needs something to measure: a single number for **how wrong** the model currently is, called the **loss.** Good answers give a low loss; bad answers give a high loss. Now learning has a clear goal — make the loss as small as possible. Picture the loss as a landscape where height means error: the model is standing somewhere on it, and it wants to get downhill to the low ground where its answers are good.

## The gradient points uphill

Here's where the slope earns its keep. A model doesn't have one dial; it has millions, so it needs a slope for *each* of them at once. That bundle of slopes — "if I nudge this dial, does the loss go up or down, and how fast?" for every dial — is the **gradient.** The gradient is an arrow pointing in the direction the loss increases *fastest* — straight uphill toward more error. Which is wonderfully convenient: to improve, you just go the **opposite** way.

## Why slopes matter for learning

The gradient turns a hopeless problem into a simple instruction. Instead of guessing settings for millions of dials, the model asks "which way is downhill?" and steps that way. Every dial gets its own little "turn me up a bit / turn me down a bit" from the gradient. Without this compass, training would be blind trial-and-error across an impossibly huge space; with it, the model always knows which way is *better* right now.

## In the real world

Think of a hiker caught in thick fog on a mountain, trying to reach the valley. They can't see the bottom, but they can feel the ground under their feet sloping one way or another — and as long as they keep stepping in the downhill direction, they make progress. The gradient is exactly that felt-slope for an AI: a local sense of "which way is down" computed for millions of dials at once. It can't see the whole error landscape, but it always knows which direction is better from right where it stands.`,
  },
  {
    slug: "gradient-descent",
    title: "Gradient descent",
    weekNumber: 1,
    blurb: "Learning, for an AI, is just rolling downhill: feel which way reduces error, take a small step, and repeat until you reach the valley.",
    lectureTitle: "1.6 Gradient descent: learning by rolling downhill",
    body: `# Gradient descent

We now have the compass — the gradient tells the model which way is downhill toward less error. **Gradient descent** is simply the act of *using* that compass over and over: take a small step downhill, check the slope again, take another step, and keep going until you can't get any lower. It is, almost unbelievably, the core method by which essentially every modern AI learns. Learning is rolling downhill.

## The error landscape

Picture the loss from the last topic as a vast, hilly landscape, where high ground means "very wrong" and low valleys mean "very right." The model, with its current dial settings, is standing at one spot on this landscape. Training is the journey from wherever it starts — usually high up, since random dials give terrible answers — down into a low valley where its answers are good. The whole drama of learning is this descent.

## Take a step downhill, then repeat

The recipe is short. Compute the gradient (which way is downhill). Nudge every dial a small amount in the downhill direction. You're now standing a little lower — a little less wrong. Then do it again from the new spot, and again, thousands or millions of times. Each step alone is tiny and unimpressive, but repeated relentlessly they carry the model from nonsense down to genuinely useful behavior. Patience, not insight, is what does the work.

## Step size matters: the learning rate

How big each step should be is set by the **learning rate**, and it matters more than you'd think. Steps that are too big make the model leap right over the valley and bounce around — or fly off the mountain entirely — never settling. Steps that are too small make learning crawl, taking forever to get anywhere. Good training picks a step size that's brisk enough to make progress but careful enough not to overshoot the bottom. It's the difference between sprinting downhill in the dark and inching down one careful foot at a time.

## Getting stuck in local valleys

Real landscapes aren't a single smooth bowl; they're rugged, with lots of little dips. A roller can settle into a shallow **local valley** that isn't the true lowest point and get stuck, since every direction from there looks like "uphill." This is a genuine challenge in training, and much of the cleverness in modern AI is tricks — a bit of randomness, momentum, clever step sizes — to avoid getting trapped and keep finding deeper valleys.

## In the real world

Imagine a ball set down on a bumpy hillside: it doesn't need a map or a plan, it just rolls in whatever direction is downhill and eventually comes to rest in a low spot. Training an AI is shockingly close to that — billions of dials all nudged a little downhill, step after step, until the whole system settles where its answers are good. The mind-bending part is that something as simple as "keep rolling downhill" is enough, given enough steps and examples, to produce a system that can write, translate, and converse.`,
  },
  {
    slug: "probability",
    title: "Probability",
    weekNumber: 1,
    blurb: "An AI never really 'knows' the answer — it assigns probabilities to many possibilities and goes with the likely ones.",
    lectureTitle: "1.7 Probability: how AI handles uncertainty and guesses",
    body: `# Probability

It's tempting to imagine an AI looking up the one true answer and handing it to you. That's not what happens. Underneath, an AI deals in **probabilities** — it spreads its bet across many possible answers, scoring each by how likely it seems, and then picks from the top. Understanding that AI is fundamentally a *guessing machine that manages uncertainty* explains both why it's so flexible and why it sometimes gets things confidently wrong.

## AI thinks in probabilities, not certainties

Whenever an AI produces an output, it isn't choosing between "right" and "wrong" — it's producing a **probability for every option.** For a yes/no medical screen it might output "85% likely, 15% unlikely." For a photo it might say "70% cat, 20% fox, 10% dog." It almost never declares total certainty, because it's working from patterns in past examples, not from facts it knows to be true. Living in probabilities is what lets it handle a messy, ambiguous world instead of breaking on anything it hasn't seen exactly before.

## Predicting the next word

A chatbot is, at heart, a next-word probability machine. Given the words so far, it computes a probability for *every* word that could come next — after "The cat sat on the," words like "mat" or "floor" score high and "democracy" scores almost zero. It picks a likely word, adds it, and repeats, one word at a time. There's no sentence planned in advance; the fluent paragraph you read is just thousands of "what's the most likely next word?" guesses chained together.

## Confidence — and being confidently wrong

Because every answer is a probability, an AI always has a *confidence* attached, and here's the catch: high confidence is not the same as being right. A model can assign 95% to an answer that's flatly false, simply because that answer *looked* likely based on its training patterns. This is why AI can state a made-up "fact" in a calm, sure voice. The number reflects how well the answer fits learned patterns — not whether it's actually true — so confident-sounding output should never be mistaken for verified truth.

## Why a little randomness helps

If a chatbot always grabbed the single highest-probability word, it would sound stiff and repetitive. So AI usually adds a pinch of **randomness**, often called *temperature:* instead of always taking the top choice, it sometimes picks a slightly less likely word. Low temperature makes it safe and predictable; high temperature makes it surprising and creative (and sometimes weird). That deliberate dash of chance is why asking the same question twice can give two different, equally fluent answers.

## In the real world

The autocomplete that suggests your next word while texting is a small, visible cousin of what a big chatbot does constantly. It looks at what you've typed, ranks the likely next words by probability, and offers the top few — and you've surely seen it suggest something confidently wrong. A large language model is the same idea scaled up enormously: a probability-over-words guesser, chaining one likely guess after another. Once you see AI as managing uncertainty rather than knowing facts, both its fluency and its confident mistakes finally make sense.`,
  },
  {
    slug: "backpropagation",
    title: "Backpropagation (capstone)",
    weekNumber: 1,
    blurb: "Backpropagation is how a network figures out the blame for its mistakes and fixes itself — the idea that ties the whole course together.",
    lectureTitle: "1.8 Backpropagation: how the whole thing teaches itself (Capstone)",
    body: `# Backpropagation (capstone)

We've collected all the pieces: numbers and vectors, matrices that transform them, a loss that scores how wrong the output is, gradients that point downhill, and gradient descent that steps that way. **Backpropagation** is the idea that snaps them together into a machine that teaches itself. It answers the one question we left open — *with millions of dials, how does the model know how much to turn each one?* — and so it's the perfect capstone for the whole course.

## Putting the pieces together

Learning runs as a loop with three beats: make a guess, measure how wrong it was, and adjust. Every idea in this course lives somewhere in that loop. The guess is numbers flowing forward through matrices (topics 1.2–1.4). The "how wrong" is the loss, and "which way to adjust" is the gradient (topic 1.5), applied by stepping downhill (topic 1.6). Backpropagation is the clever step that connects the mistake at the end back to every dial that helped cause it.

## The forward pass: a guess

It starts with a **forward pass.** Your input is turned into vectors and pushed through layer after layer of matrices, getting reshaped at each step, until the model produces an output and a confidence — a probability-flavored guess (topic 1.7). Then the loss measures the gap between that guess and the right answer. At this moment the model knows *that* it was wrong and by how much, but not yet *whose fault* it was among its millions of dials.

## Assigning blame backward

Now the magic. Backpropagation works **backward** from the mistake, layer by layer, asking at each step: "how much did each dial here contribute to the error?" Because every layer is just arithmetic, the blame can be passed back through it with the same slope idea from topic 1.5 — each layer hands the layer before it its share of responsibility. By the time this sweep reaches the front, every single dial has a gradient: a precise "you should turn up a little / down a little" to reduce the error. That's how blame gets fairly assigned across an enormous network.

## The learning loop, millions of times

With the blame assigned, gradient descent takes one small downhill step — every dial nudged the way its gradient says — and the model is now a hair less wrong. Then the loop runs again on the next example: guess, measure, blame backward, nudge. Repeat across billions of examples and the network slowly tunes itself from random nonsense into something that writes, translates, and reasons. No one programs the dials; the loop discovers them.

## Tying the course together

Step back and the whole course is one sentence: an AI turns things into **numbers**, arranges them so location means **meaning**, measures **likeness** with dot products, transforms them through **matrices**, scores its errors with a **loss**, finds "better" with a **gradient**, rolls downhill with **gradient descent**, expresses its guesses as **probabilities**, and assigns blame for its mistakes with **backpropagation** so it can fix itself. Every "intelligent" thing AI does is built from these humble, understandable parts.

## The biggest questions stay open

And plenty remains genuinely unsolved. Why do networks this simple work *so* well? How do we make their confident guesses more honest, their reasoning more reliable, their behavior safe and fair? Seeing that AI is "just math" doesn't make it small — it makes it *understandable*, which is exactly what we need to use it wisely. The single habit worth carrying out of this course is this: whenever AI seems like magic, ask, "what's the simple math underneath?" — because there always is some.`,
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
    title: "Homework 1.1 — Numbers, vectors, likeness, and matrices",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.1–1.4. Answer each question in a few sentences (about 3–5) in your own words. You don't need to do any calculations — just explain the idea clearly. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "why-ai-is-really-math",
        prompt:
          "A friend says, 'AI must understand things — it answers my questions just like a person would, so there's clearly a little mind in there.' Using the idea that AI is really math, explain why this is a misunderstanding. (3–5 sentences.)",
        correctAnswer:
          "There's no little mind inside; underneath the human-sounding words an AI is only doing an enormous amount of plain arithmetic on lists of numbers. It first turns the input (text, images, sound) into numbers, then pushes them through millions of tunable numbers called weights, multiplying and adding along the way. What looks like understanding is really patterns in those numbers producing a likely-looking output, not a mind grasping meaning. So the fluent answer is the result of math at huge scale, which can look like thinking without any thinking actually happening.",
        explanation:
          "Full credit: explains AI is arithmetic on numbers (inputs become numbers, weights transform them) and that fluent output isn't genuine understanding/a mind.",
      },
      {
        topicSlug: "vectors-and-embeddings",
        prompt:
          "An AI places the word 'puppy' very close to 'dog' on its map, and places 'helicopter' far away — even though it has no dictionary and doesn't know what a dog is. Explain how this can work, using the idea of vectors and embeddings. (3–5 sentences.)",
        correctAnswer:
          "Each word is given a vector — a list of numbers that acts like a location in space — and an embedding arranges those locations so that words with similar meanings sit close together. The machine doesn't need to know what a dog is; it just learned from lots of text that 'puppy' is used like 'dog,' so their locations end up near each other, while 'helicopter' lands far away. For a machine, that nearness IS meaning: distance on the map stands in for similarity of meaning. So it can act as if it understands relationships between words purely by where it has placed their points.",
        explanation:
          "Full credit: explains a vector is a list of numbers/location, an embedding places similar-meaning words near each other, and nearness stands in for meaning (no real 'knowing' needed).",
        hint: "What does 'close together on the map' represent for a machine that only handles numbers?",
      },
      {
        topicSlug: "dot-product-and-distance",
        prompt:
          "A music app builds a playlist of songs 'you might like.' Explain how measuring likeness between vectors (distance or the dot product) could let it do this, even though it has no idea what the songs sound like. (3–5 sentences.)",
        correctAnswer:
          "The app turns every song into a vector — a location in space — and then measures how alike two songs are by how close their vectors are (small distance) or by a large dot product, which checks whether two vectors point the same way. To build the playlist it compares the songs you already love to millions of others and ranks them by that similarity score, floating the closest ones to the top. It doesn't need to 'hear' anything; it just runs a ruler across a map of points. So the feeling that it 'gets your taste' is really just repeated likeness measurements between vectors.",
        explanation:
          "Full credit: explains songs become vectors and the app ranks by similarity (small distance / large dot product) between your liked items and candidates, with no real understanding of the audio.",
      },
      {
        topicSlug: "matrices",
        prompt:
          "Someone asks, 'If a neural network is so smart, what is actually happening inside one of its layers?' Using what you know about matrices, explain what a layer really does to information. (3–5 sentences.)",
        correctAnswer:
          "A layer is basically one matrix — a grid of numbers — and what it does is transform a vector into a new vector. Each number that comes out is a weighted blend of all the numbers that went in: you multiply each input by a weight in the grid and add them up, so information gets mixed and reshaped. Those weights are exactly the tunable dials the network learns. So a layer isn't 'thinking' — it's reshaping numbers, and stacking many such matrix steps is how the network gradually turns the numbers for a question into the numbers for an answer.",
        explanation:
          "Full credit: explains a layer is a matrix (grid of numbers) that reshapes a vector by taking weighted blends of inputs, and that stacking these transformations moves information through the network.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Slopes, descent, probability, and backpropagation",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Untimed practice covering sections 1.5–1.8. Answer each question in a few sentences (about 3–5) in your own words. No calculations are required — explain your reasoning. One-word answers won't receive credit.",
    problems: [
      {
        topicSlug: "slopes-and-gradients",
        prompt:
          "A model just gave a very wrong answer, and it has millions of dials it could adjust. Explain how the ideas of a 'loss' and a 'gradient' tell it which way to change those dials to do better. (3–5 sentences.)",
        correctAnswer:
          "First the model needs a single number for how wrong it is, called the loss — high loss means bad answers, low loss means good ones, so the goal becomes making the loss small. The gradient is the bundle of slopes that says, for each dial, whether nudging it makes the loss go up or down and how fast. The gradient actually points in the direction the loss increases fastest — straight uphill toward more error — so to improve, the model turns each dial the opposite way, downhill. That gives every one of the millions of dials a precise 'turn up a little / turn down a little' instruction instead of blind guessing.",
        explanation:
          "Full credit: explains the loss measures how wrong the model is, the gradient gives a per-dial slope pointing uphill (toward more error), and the model moves the opposite way (downhill) to improve.",
      },
      {
        topicSlug: "gradient-descent",
        prompt:
          "An AI starts out with random settings giving terrible answers, and after training it works well — yet each training step only makes a tiny change. Explain how gradient descent turns tiny steps into real learning, and why the step size matters. (3–5 sentences.)",
        correctAnswer:
          "Gradient descent treats the model's error as a hilly landscape and repeatedly takes a small step downhill: compute which way reduces error, nudge every dial a little that way, then repeat thousands or millions of times. Each step is tiny and unimpressive, but relentlessly repeated they carry the model from high-up nonsense down into a low valley where its answers are good — patience, not insight, does the work. The step size (the learning rate) matters because steps too big make it leap over the valley and bounce around or fly off, while steps too small make learning crawl. Good training picks a size brisk enough to progress but careful enough not to overshoot the bottom.",
        explanation:
          "Full credit: explains gradient descent repeats small downhill steps to reach a low-error valley, and that the learning rate must be balanced (too big overshoots/diverges, too small is too slow).",
        hint: "Picture rolling downhill: what goes wrong if your steps are huge, and what goes wrong if they're tiny?",
      },
      {
        topicSlug: "probability",
        prompt:
          "A chatbot states a made-up 'fact' in a calm, confident voice, and it turns out to be false. Using what you know about how AI handles probability and uncertainty, explain why this happens. (3–5 sentences.)",
        correctAnswer:
          "An AI never looks up a known truth; it produces a probability for each possible output and goes with the likely ones, so it's fundamentally a guessing machine. A chatbot in particular predicts the next word by probability over and over, chaining likely guesses into fluent sentences. The confidence number reflects how well an answer fits the patterns it learned, not whether the answer is actually true — so it can assign high probability to something flatly false. That's why it can deliver a made-up fact in a sure, calm voice: the fluent confidence is about pattern-fit, not verified truth.",
        explanation:
          "Full credit: explains AI assigns probabilities rather than knowing facts, predicts likely words, and that high confidence reflects pattern-fit (not truth), so it can be confidently wrong.",
      },
      {
        topicSlug: "backpropagation",
        prompt:
          "A network made a mistake, but it has millions of dials and no one tells it which ones were at fault. Explain how backpropagation figures out how much to change each dial. (3–5 sentences.)",
        correctAnswer:
          "After a forward pass produces a guess, the loss measures how wrong it was — but not whose fault it was among millions of dials. Backpropagation works backward from the mistake, layer by layer, asking at each step how much each dial contributed to the error, passing the blame back using the same slope idea behind gradients. By the time it reaches the front, every dial has its own gradient: a precise 'turn up a little / down a little' to reduce the error. Gradient descent then takes one small downhill step using all those instructions, and repeating the whole loop is how the network teaches itself.",
        explanation:
          "Full credit: explains backprop assigns blame backward through the layers to give each dial a gradient, which gradient descent then uses to nudge every dial — the self-teaching loop.",
      },
    ],
  },
  {
    kind: "test",
    title: "Unit Test — Basic AI Math: The Math Behind the Machine",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions:
      "Timed. 30 minutes. Covers sections 1.1–1.8. Answer each question in a few sentences (about 4–6) in your own words. No calculations are required. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "why-ai-is-really-math",
        prompt:
          "Explain the claim at the heart of this course — that 'AI is really math, not magic' — covering how everything becomes numbers, what 'weights' are, and what 'learning' really means. Why does seeing AI as math (not magic) matter? (4–6 sentences.)",
        correctAnswer:
          "The core claim is that an AI, however human it sounds, is only doing an enormous amount of plain arithmetic on lists of numbers. First it turns whatever you give it — text, images, sound — into numbers, because that's the only thing a computer can actually work with. Those numbers flow through millions or billions of tunable numbers called weights (think of dials) that multiply and nudge them along the way, and the particular dial settings are what make a model useful. 'Learning' is just adjusting those numbers: the model guesses, sees how wrong it was, and nudges the dials toward 'less wrong,' billions of times. Seeing this as math rather than magic matters because math is understandable, checkable, and fallible — so we know AI has no secret wisdom, can be confidently wrong, and can be measured and improved rather than blindly trusted.",
        explanation:
          "Full credit: explains inputs become numbers, weights are tunable numbers/dials, learning is repeatedly adjusting them toward less error, and why 'math not magic' matters (understandable, checkable, can be wrong).",
      },
      {
        topicSlug: "vectors-and-embeddings",
        prompt:
          "Explain what a vector and an embedding are, how 'meaning' becomes a location in space, and what it means that directions (like king − man + woman ≈ queen) can carry meaning too. (4–6 sentences.)",
        correctAnswer:
          "A vector is just an ordered list of numbers, which you can picture as a location — a spot in a space with as many directions as there are numbers. An embedding gives every word its own vector and arranges them so that words with similar meanings sit close together, so 'dog,' 'puppy,' and 'cat' land in one neighborhood while 'helicopter' is far away. For a machine that only does arithmetic, that nearness IS meaning: it has no dictionary, it just knows which points sit near which. Even more surprising, the directions between points carry meaning too — the step from 'man' to 'woman' is about the same as the step from 'king' to 'queen,' so you can do arithmetic on meaning and land near 'queen.' This turns slippery meaning into hard geometry, which is what lets an arithmetic machine handle language at all.",
        explanation:
          "Full credit: defines a vector (list of numbers/location) and an embedding (similar meanings placed near each other), explains nearness = meaning, and that directions encode relationships (king−man+woman≈queen).",
      },
      {
        topicSlug: "dot-product-and-distance",
        prompt:
          "Explain how AI measures 'likeness' between two vectors using distance and the dot product, why cosine similarity ignores size, and why AI needs to measure likeness so constantly. (4–6 sentences.)",
        correctAnswer:
          "Once meaning is a location, AI compares vectors with a ruler. Distance is the plain straight-line gap between two points — small distance means similar, large means different — just like measuring between two cities. The dot product is a second ruler that asks whether two vectors point the same way: multiply matching numbers and add them up, and you get a large positive number when they agree, near zero when unrelated, and negative when opposed. Cosine similarity is the dot product after ignoring length, so it measures only the angle (direction) between vectors — useful because a long and a short document can mean the same thing even though one vector is 'bigger.' AI needs this constantly because search, recommendations, and even a chatbot deciding which earlier words to attend to all come down to measuring likeness, billions of times.",
        explanation:
          "Full credit: explains distance (gap between points), the dot product (same-direction agreement), cosine similarity (direction not size), and that likeness-measuring underlies search/recommendation/attention.",
      },
      {
        topicSlug: "matrices",
        prompt:
          "Explain what a matrix is, how multiplying a vector by it 'mixes and reshapes' information, why one layer of a neural network is basically a matrix, and what stacking many of them achieves. (4–6 sentences.)",
        correctAnswer:
          "A matrix is just numbers arranged in a grid of rows and columns, and what makes it useful is that it transforms a vector into a new vector. Each output number is a weighted blend of all the input numbers — you multiply each input by a weight in the grid and add them up — so every output can draw a little from every input, mixing and reshaping the information. Those grid weights are exactly the tunable dials the network learns, which is why one layer of a neural network is basically one matrix multiply. A single matrix can only reshape so much, so networks stack many of them, with a small non-linear 'bend' between layers so the steps don't collapse into one. Layer after layer, the numbers get refined — raw word-numbers near the bottom, rich meaning near the top — which is how information moves from a question to an answer.",
        explanation:
          "Full credit: defines a matrix (grid of numbers) that reshapes vectors via weighted blends, identifies a layer as a matrix of learned weights, and explains stacking (with non-linearities) refines information.",
      },
      {
        topicSlug: "slopes-and-gradients",
        prompt:
          "Explain how AI uses a 'loss' and a 'gradient' to know which way is 'better.' Include what the loss measures, what the gradient is, and why the model moves opposite to the gradient. (4–6 sentences.)",
        correctAnswer:
          "To improve, a model first needs a single number for how wrong it is, called the loss — low loss means good answers, high loss means bad ones, so learning becomes 'make the loss small.' It helps to picture the loss as a landscape where height means error and the model is standing somewhere on it. A slope tells you how steep something is and which way is up; since the model has millions of dials, it needs a slope for each one at once, and that bundle is the gradient. The gradient points in the direction the loss increases fastest — straight uphill toward more error. So to get better, the model steps the opposite way, downhill, giving every dial a precise 'turn up or down a bit' instruction instead of blind trial-and-error.",
        explanation:
          "Full credit: explains the loss measures error, the gradient is the per-dial slope pointing uphill (toward more error), and moving opposite (downhill) reduces error for all dials at once.",
      },
      {
        topicSlug: "gradient-descent",
        prompt:
          "Explain gradient descent as 'learning by rolling downhill': the error landscape, why tiny repeated steps work, why the learning rate matters, and the problem of local valleys. (4–6 sentences.)",
        correctAnswer:
          "Gradient descent pictures the model's error as a hilly landscape where high ground is 'very wrong' and low valleys are 'very right,' with the model starting high up because random dials give terrible answers. The method is short: compute which way is downhill (the gradient), nudge every dial a small amount that way, then repeat from the new spot thousands or millions of times. Each step is tiny, but relentlessly repeated they carry the model from nonsense down into a good valley — patience, not insight, does the work. The step size, called the learning rate, matters because too-big steps leap over the valley and bounce around or diverge, while too-small steps make learning crawl. A further problem is local valleys: the landscape is bumpy, so the model can settle in a shallow dip that isn't the true lowest point, which is why training uses tricks like randomness and momentum to avoid getting stuck.",
        explanation:
          "Full credit: explains the error landscape, repeated small downhill steps reaching a low-error valley, the learning-rate tradeoff, and local valleys/getting stuck.",
      },
      {
        topicSlug: "probability",
        prompt:
          "Explain how AI handles uncertainty with probability: that it assigns probabilities rather than knowing facts, how a chatbot predicts the next word, why it can be confidently wrong, and why a little randomness ('temperature') is used. (4–6 sentences.)",
        correctAnswer:
          "An AI doesn't look up a true answer; for any output it produces a probability for each possibility and goes with the likely ones, so it's really a guessing machine that manages uncertainty. A chatbot in particular is a next-word probability machine: given the words so far, it scores every possible next word, picks a likely one, adds it, and repeats, so the fluent paragraph is thousands of 'most likely next word' guesses chained together — nothing is planned in advance. Because every answer is a probability, it always has a confidence attached, but confidence reflects how well an answer fits learned patterns, not whether it's true — so it can assign high probability to something false and state it calmly. A little randomness, often called temperature, is added so it doesn't always grab the single top word and sound stiff: low temperature is safe and predictable, high temperature is more creative (and sometimes weird), which is why the same question can give different answers.",
        explanation:
          "Full credit: explains probabilities over options (not knowing facts), next-word prediction, confidence ≠ truth (confidently wrong), and temperature/randomness and its effect.",
      },
      {
        topicSlug: "backpropagation",
        prompt:
          "Explain how backpropagation lets a network 'teach itself': the forward pass, how blame is assigned backward, how it connects to gradient descent, and how repeating the loop produces learning. (4–6 sentences.)",
        correctAnswer:
          "Learning runs as a loop: guess, measure how wrong, and adjust. The guess is the forward pass — the input becomes vectors and flows through layer after layer of matrices until the model produces an output and a confidence — and the loss then measures the gap from the right answer, telling the model that it was wrong but not whose fault it was among millions of dials. Backpropagation works backward from the mistake, layer by layer, asking how much each dial contributed to the error and passing the blame back using the same slope idea behind gradients. By the time it reaches the front, every dial has its own gradient, a precise 'turn up or down a little' to reduce the error. Gradient descent then takes one small downhill step using all those instructions, and repeating the whole loop across billions of examples slowly tunes the network from random nonsense into something useful — no one programs the dials, the loop discovers them.",
        explanation:
          "Full credit: explains the forward pass produces a guess + loss, backprop assigns blame backward to give each dial a gradient, gradient descent steps downhill, and repeating the loop is self-teaching.",
      },
    ],
  },
  {
    kind: "final",
    title: "Final — Basic AI Math: The Math Behind the Machine",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 45,
    instructions:
      "Timed cumulative final. 45 minutes. Covers the whole course (sections 1.1–1.8). Answer each question in a paragraph (about 5–7 sentences) in your own words. No calculations are required. Pasting is disabled; keystrokes are screened for AI use.",
    problems: [
      {
        topicSlug: "backpropagation",
        prompt:
          "Using ideas from across the whole course, trace how a single piece of input becomes an answer and how the model learns from its mistake. Show how at least four different topics fit together (for example: numbers/vectors, embeddings, matrices, loss/gradient, gradient descent, probability, backpropagation). (5–7 sentences.)",
        correctAnswer:
          "It starts by turning the input into numbers — specifically vectors, lists of numbers arranged by an embedding so that location stands for meaning, with similar things placed near each other. Those vectors flow forward through layer after layer of matrices, grids of weights that mix and reshape the numbers, carrying information from 'what the question means' toward 'what the answer should be.' The model's output is really a set of probabilities — for a chatbot, a likely next word — so its answer is a confident guess, not a looked-up fact. To learn, a loss scores how wrong that guess was, and the gradient gives a per-dial slope pointing toward more error, so the model knows which way is 'better.' Backpropagation passes the blame for the mistake backward through the layers so every weight gets its own gradient, and gradient descent nudges them all a small step downhill. Repeat this guess-measure-blame-nudge loop across billions of examples and the network tunes itself from random nonsense into something that works. Every 'intelligent' step is really one of these humble math operations chained together.",
        explanation:
          "Full credit: traces input → numbers/vectors/embeddings → matrices → probabilistic output → loss/gradient → backprop → gradient descent loop, correctly connecting at least four distinct topics.",
      },
      {
        topicSlug: "vectors-and-embeddings",
        prompt:
          "Someone insists, 'A search engine can only match the exact words you type — if you use different words, it can't possibly know what you mean.' Using the course's ideas about vectors, embeddings, and measuring likeness, argue why modern systems can do better. Use a concrete example. (5–7 sentences.)",
        correctAnswer:
          "The 'only exact words' view describes the old way of searching, which did just match keywords and missed anything phrased differently. Modern systems instead turn each phrase into a vector — a location in space — using an embedding that places similar meanings close together, regardless of the exact words used. So 'how to fix a flat tire' and 'repairing a punctured wheel' land in nearly the same spot even though they share almost no words. To find matches, the system measures likeness between vectors — small distance, or a large dot product / high cosine similarity — and returns the closest ones, which is comparing locations rather than spellings. That's why search and chatbots got dramatically better at understanding what you meant rather than just what you typed. The key shift was treating meaning as geometry: once meaning is a place in space, different words for the same idea sit in the same neighborhood.",
        explanation:
          "Full credit: explains embeddings place similar meanings near each other and likeness is measured by distance/dot product/cosine, so different words for the same idea match — with a concrete example.",
      },
      {
        topicSlug: "gradient-descent",
        prompt:
          "A skeptic says, 'There's no way a machine could learn to write and translate just by doing arithmetic — something smarter must be going on.' Using the ideas of loss, gradients, and gradient descent, explain why simple 'rolling downhill' really can produce capable AI. Use a concrete image or example. (5–7 sentences.)",
        correctAnswer:
          "It really is mostly arithmetic, and the engine is gradient descent. The model first measures how wrong it is with a single number, the loss, which you can picture as height on a hilly error landscape where it starts high up because random settings give terrible answers. The gradient tells it, for every one of its millions of dials, which way is downhill toward less error, and it takes a small step that way, then recomputes and steps again. Like a ball set on a bumpy hillside that simply rolls downhill until it rests in a low spot, the model needs no map or plan — just 'keep going downhill.' Each step is tiny, but repeated across billions of examples those steps carry it from nonsense to genuinely useful behavior, which is why patience, not insight, does the work. Nothing 'smarter' is required: capable writing and translation emerge from an immense number of humble downhill nudges, which is exactly the surprising lesson of the course.",
        explanation:
          "Full credit: explains the loss as an error landscape, the gradient as the downhill direction over many dials, and repeated small steps (rolling downhill) producing capable behavior, with a concrete image/example.",
      },
      {
        topicSlug: "probability",
        prompt:
          "A user says, 'The chatbot sounded so confident, so I trusted it — but it was wrong. Isn't that a glitch?' Using the course, explain why confident-but-wrong is expected, not a glitch, and what it means about how AI 'knows' things. Use a concrete example. (5–7 sentences.)",
        correctAnswer:
          "It's not a glitch — it follows directly from how AI works. An AI never looks up a known fact; it assigns probabilities to many possibilities and goes with the likely ones, so it's fundamentally a guessing machine. A chatbot predicts the next word by probability over and over, chaining likely guesses into fluent sentences, which is why it sounds smooth even when it's making something up. The confidence attached to an answer reflects how well that answer fits the patterns it learned, not whether it's actually true, so it can assign high probability to a flat falsehood and state it in a calm, sure voice — much like phone autocomplete confidently suggesting the wrong word. That means 'sounding confident' is about pattern-fit, not verified truth, so it should never be mistaken for being right. The practical lesson is to treat fluent, confident AI output as a plausible guess to be checked, not as authority.",
        explanation:
          "Full credit: explains AI assigns probabilities rather than knowing facts, confidence reflects pattern-fit not truth (so confident-wrong is expected), with a concrete example and the takeaway to verify output.",
      },
    ],
  },
];

type SeedPrimer = SeedTopic;

const REASONING_PRIMERS: SeedPrimer[] = [
  {
    slug: "reasoning-primer-subject",
    title: "How to reason about AI-math cases",
    weekNumber: 1,
    blurb:
      "Diagnostic primer: applying the course's ideas to concrete situations about how AI really works.",
    lectureTitle: "Primer: How to reason about AI-math cases",
    body: `# How to reason about AI-math cases

This short primer prepares you for the **AI Math** diagnostic. That check is *ungraded practice* — it never affects your course grade. It is drawn from the eight topics of this unit and asks you to *apply* what you have learned to a specific situation, not to recite a definition.

## It tests application, not memorization

A diagnostic question gives you a small, concrete scene — a search engine matching two differently-worded phrases, a chatbot answering confidently but wrongly, a model overshooting because its steps are too big — and asks what the course's ideas tell you about it. Knowing the words "embedding" or "gradient descent" is not enough; the question wants you to recognize *when* you are looking at one and *why* it matters here.

## What the questions reward

- **Naming the right idea** — match the situation to the concept that fits it: whether something is about turning things into numbers, meaning as location (embeddings), measuring likeness (distance/dot product), reshaping with matrices, finding "better" with a gradient, learning by rolling downhill, handling uncertainty with probability, or self-teaching with backpropagation.
- **Using evidence from the scene** — point to the detail in the situation that supports your answer, rather than answering from a general impression.
- **Avoiding the "magic" story** — the course replaces "AI just understands" with careful explanation. The best answers resist "there's a mind in there" or "it must know the truth," and stay grounded in the math.

## How to do this activity well

1. **Read the situation first**, then ask which topic it belongs to.
2. **Find the detail that decides it** — what in the scene makes one answer better than another.
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

This short primer prepares you for the **General Reasoning** diagnostic — an *ungraded* check that tests five genuine reasoning skills. These are the same skills you use to decide what a set of facts really shows, so they matter directly for thinking clearly about how AI works.

## The five skills

- **Analysis** — break an argument into parts: find its **point** (the conclusion), the **reasons** given for it, and any hidden assumption it leans on. Ask: "What is this trying to convince me of, and what does it take for granted?"
- **Inference** — work out what *follows* from what you're told, and how strongly. Tell apart what *must* be true, what is *likely*, and what is only *possible*.
- **Evaluation** — judge how much the reasons actually support the point. Notice when evidence is beside the point, a source isn't trustworthy, or a step doesn't really connect.
- **Deduction** — reasoning where true starting facts *guarantee* the conclusion. If the starting facts are true, the conclusion can't be false. Watch for sneaky forms that only *look* airtight.
- **Induction** — reasoning from a few examples to a *probable* general rule or prediction. Strong induction uses many fair examples; weak induction over-generalizes from too few.

## A recurring trap: things that move together

Most wrong answers are statements that *sound* reasonable but are **not actually backed up by what you were told**. The discipline this check rewards is the same one careful thinking about technology demands: keep apart what the facts **show**, what you're **assuming**, and what only *sounds* right. Two things happening together does not prove one causes the other.

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
  // The course was migrated to the Basic AI Math syllabus. Detect the marker
  // topic; if present and the content version matches, the content is current
  // and we skip. This makes the seed self-healing across environments: a
  // database that still holds older content (e.g. a previous curriculum) is
  // detected and replaced on boot.
  const markerTopic = await db
    .select({ id: topicsTable.id })
    .from(topicsTable)
    .where(eq(topicsTable.slug, "why-ai-is-really-math"));
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
        "Seed: stale course content detected — replacing with the Basic AI Math curriculum",
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
