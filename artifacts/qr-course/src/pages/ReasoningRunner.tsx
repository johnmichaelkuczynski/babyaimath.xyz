import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import {
  useGetReasoningAssessment,
  useStartReasoningAttempt,
  useSubmitReasoningAttempt,
} from "@workspace/api-client-react";
import type {
  ReasoningItem,
  ReasoningResponseInput,
  ReasoningResult,
  ReasoningReviewItem,
  ReasoningMetric,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnswerInput } from "@/components/AnswerInput";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

type Format = "mcq" | "hybrid" | "written";

export default function ReasoningRunner() {
  const params = useParams();
  const assessmentId = Number(params.id);

  const { data: assessment, isLoading } = useGetReasoningAssessment(assessmentId);
  const startAttempt = useStartReasoningAttempt();
  const submitAttempt = useSubmitReasoningAttempt();

  const [result, setResult] = useState<ReasoningResult | null>(null);
  const [alreadyPassed, setAlreadyPassed] = useState<{
    feedback: string | null;
    headline: string | null;
    metrics: ReasoningMetric[] | null;
    review: ReasoningReviewItem[] | null;
  } | null>(null);

  // The items to present for THIS attempt. The first take uses the seeded
  // template; each retake returns freshly generated questions of the same kind.
  const [items, setItems] = useState<ReasoningItem[] | null>(null);

  // Option selections (mcq / hybrid): itemId -> optionIndex
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  // Written answers (written / hybrid): itemId -> text
  const [writtenAnswers, setWrittenAnswers] = useState<Record<number, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  const format = (assessment?.format ?? "mcq") as Format;

  useEffect(() => {
    if (!assessmentId || startAttempt.isPending || result) return;
    startAttempt.mutate(
      { assessmentId },
      {
        onSuccess: (data) => {
          setItems(data.items);
          if (data.status === "submitted") {
            setAlreadyPassed({
              feedback: data.feedback ?? null,
              headline: data.headline ?? null,
              metrics: data.metrics ?? null,
              review: data.review ?? null,
            });
          }
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  function buildResponses(list: ReasoningItem[]): ReasoningResponseInput[] {
    return list.map((item) => {
      const base: ReasoningResponseInput = { itemId: item.id };
      if (format !== "written") {
        base.selectedIndex = mcqAnswers[item.id] ?? null;
      }
      if (format !== "mcq") {
        base.writtenAnswer = (writtenAnswers[item.id] ?? "").trim() || null;
      }
      return base;
    });
  }

  function validate(list: ReasoningItem[]): string | null {
    for (const item of list) {
      if (format !== "written" && mcqAnswers[item.id] === undefined) {
        return "Please choose an option for every question before submitting.";
      }
      if (format !== "mcq" && !(writtenAnswers[item.id] ?? "").trim()) {
        return "Please write an answer for every question before submitting.";
      }
    }
    return null;
  }

  function handleRetake() {
    setError(null);
    startAttempt.mutate(
      { assessmentId, data: { retake: true } },
      {
        onSuccess: (data) => {
          setItems(data.items);
          setResult(null);
          setAlreadyPassed(null);
          setMcqAnswers({});
          setWrittenAnswers({});
        },
      },
    );
  }

  function handleSubmit() {
    if (!items) return;
    const v = validate(items);
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    submitAttempt.mutate(
      { assessmentId, data: { responses: buildResponses(items) } },
      { onSuccess: (data) => setResult(data) },
    );
  }

  if (isLoading || !assessment || (!items && !alreadyPassed && !result)) {
    return (
      <Layout>
        <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  // Result / already-passed screen
  if (result || alreadyPassed) {
    const feedback = result?.feedback ?? alreadyPassed?.feedback ?? "";
    const headline = result?.headline ?? alreadyPassed?.headline ?? null;
    const metrics = result?.metrics ?? alreadyPassed?.metrics ?? [];
    const review = result?.review ?? alreadyPassed?.review ?? [];
    return (
      <Layout>
        <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary mb-1">{assessment.title}</h1>
              <span className="inline-flex items-center gap-1.5 text-chart-2 font-medium">
                <CheckCircle2 className="w-5 h-5" /> Passed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRetake}
                disabled={startAttempt.isPending}
                data-testid="button-retake-reasoning"
              >
                {startAttempt.isPending ? "Starting…" : "Retake assessment"}
              </Button>
              <Link href="/reasoning">
                <Button variant="outline" data-testid="button-back-reasoning">Back to Assessments</Button>
              </Link>
            </div>
          </div>

          {headline && (
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="font-serif text-lg">{headline}</p>
            </div>
          )}

          {metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-md border border-border p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
                  <div className="text-xl font-semibold">{m.value}</div>
                  {m.detail && <div className="text-xs text-muted-foreground mt-1">{m.detail}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
            <h3 className="font-serif font-semibold mb-2">Feedback</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line">{feedback}</p>
          </div>

          {review.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-serif font-semibold text-lg">Your answers</h3>
              {review.map((r, i) => (
                <ReviewCard key={r.itemId} item={r} index={i} />
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-8 pb-28">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-serif font-bold text-primary">{assessment.title}</h1>
          {assessment.subtitle && <p className="text-sm text-muted-foreground mt-1">{assessment.subtitle}</p>}
          <p className="text-sm text-muted-foreground mt-3">{assessment.instructions}</p>
        </div>

        <div className="flex flex-col gap-10">
          {(items ?? []).map((item, idx) => (
            <Question
              key={item.id}
              index={idx}
              item={item}
              format={format}
              selected={mcqAnswers[item.id]}
              onSelect={(opt) => setMcqAnswers((p) => ({ ...p, [item.id]: opt }))}
              written={writtenAnswers[item.id] ?? ""}
              onWrite={(val) =>
                setWrittenAnswers((p) => ({ ...p, [item.id]: val }))
              }
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex justify-end border-t pt-5">
          <Button
            onClick={handleSubmit}
            disabled={submitAttempt.isPending}
            className="bg-chart-2 hover:bg-chart-2/90 text-white"
            data-testid="button-submit-reasoning"
          >
            {submitAttempt.isPending ? "Submitting…" : "Submit Assessment"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}

function Question({
  index,
  item,
  format,
  selected,
  onSelect,
  written,
  onWrite,
}: {
  index: number;
  item: ReasoningItem;
  format: Format;
  selected: number | undefined;
  onSelect: (opt: number) => void;
  written: string;
  onWrite: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4" data-testid={`question-${item.id}`}>
      <h3 className="font-medium whitespace-pre-line leading-relaxed">
        <span className="text-muted-foreground mr-2">{index + 1}.</span>
        {item.prompt}
      </h3>

      {format !== "written" && (
        <div className="flex flex-col gap-2">
          {(item.options ?? []).map((opt, oi) => {
            const active = selected === oi;
            return (
              <button
                key={oi}
                type="button"
                onClick={() => onSelect(oi)}
                className={`text-left px-4 py-3 rounded-md border transition-colors ${
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-secondary"
                }`}
                data-testid={`option-${item.id}-${oi}`}
              >
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  {String.fromCharCode(65 + oi)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {format !== "mcq" && (
        <div className="flex flex-col gap-1.5">
          {format === "hybrid" && (
            <p className="text-sm font-medium text-muted-foreground">
              Explain your reasoning in a sentence or two:
            </p>
          )}
          <AnswerInput
            value={written}
            onChange={(val) => onWrite(val)}
            placeholder="Write your answer in your own words…"
          />
        </div>
      )}
    </div>
  );
}

function ReviewCard({ item, index }: { item: ReasoningReviewItem; index: number }) {
  const options = item.options ?? null;
  return (
    <div
      className="rounded-lg border border-border bg-card p-5"
      data-testid={`review-item-${item.itemId}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-medium whitespace-pre-line">
          <span className="text-muted-foreground mr-2">{index + 1}.</span>
          {item.prompt}
        </p>
        {item.isCorrect === null ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground text-sm font-medium shrink-0">
            <AlertCircle className="w-4 h-4" /> No answer
          </span>
        ) : item.isCorrect ? (
          <span className="inline-flex items-center gap-1 text-chart-2 text-sm font-medium shrink-0">
            <CheckCircle2 className="w-4 h-4" /> Correct
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-destructive text-sm font-medium shrink-0">
            <XCircle className="w-4 h-4" /> Incorrect
          </span>
        )}
      </div>

      {options && (
        <div className="flex flex-col gap-2">
          {options.map((opt, oi) => {
            const isCorrect = oi === item.correctIndex;
            const isSelected = oi === item.selectedIndex;
            const cls = isCorrect
              ? "border-chart-2 bg-chart-2/10"
              : isSelected
                ? "border-destructive bg-destructive/10"
                : "border-border";
            return (
              <div
                key={oi}
                className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm ${cls}`}
              >
                <span>{opt}</span>
                <span className="flex items-center gap-2 text-xs shrink-0">
                  {isSelected && <span className="text-muted-foreground">Your answer</span>}
                  {isCorrect && (
                    <span className="inline-flex items-center gap-1 text-chart-2 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct answer
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {item.writtenAnswer && (
        <div className="mt-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Your answer
          </div>
          <p className="text-sm whitespace-pre-line">{item.writtenAnswer}</p>
        </div>
      )}

      {item.rationale && (
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {item.rationale}
        </p>
      )}

      {item.modelAnswer && (
        <div className="mt-3 rounded-md border border-chart-2/30 bg-chart-2/5 p-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Model answer
          </div>
          <p className="text-sm whitespace-pre-line">{item.modelAnswer}</p>
        </div>
      )}
    </div>
  );
}
