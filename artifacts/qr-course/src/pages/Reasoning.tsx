import React from "react";
import { useListReasoningAssessments } from "@workspace/api-client-react";
import type { ReasoningAssessmentSummary } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Compass, Brain } from "lucide-react";

const PHASE_LABELS: Record<string, string> = {
  baseline: "Baseline — before the course",
  unit1: "After the unit: Criminal Psychology for Everyone",
};

const PHASE_ORDER = ["baseline", "unit1"];

type Format = "mcq" | "hybrid" | "written";

const FORMAT_ORDER: Format[] = ["mcq", "hybrid", "written"];

const FORMAT_LABELS: Record<Format, string> = {
  mcq: "Multiple Choice",
  hybrid: "Hybrid",
  written: "Written",
};

const FORMAT_BLURBS: Record<Format, string> = {
  mcq: "Pick the single best option.",
  hybrid: "Pick the best option and explain your reasoning.",
  written: "Write a short answer in your own words — no options.",
};

function statusBadge(status: string) {
  const cls =
    status === "passed"
      ? "bg-chart-2/15 text-chart-2"
      : status === "in_progress"
      ? "bg-chart-4/20 text-chart-4"
      : "bg-secondary text-secondary-foreground";
  const label =
    status === "passed" ? "passed" : status === "in_progress" ? "in progress" : "not started";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
  );
}

function InstrumentCard({
  instrument,
  versions,
}: {
  instrument: "ethical" | "critical";
  versions: ReasoningAssessmentSummary[];
}) {
  const isEthical = instrument === "ethical";
  const Icon = isEthical ? Compass : Brain;
  const byFormat = new Map<Format, ReasoningAssessmentSummary>();
  for (const v of versions) byFormat.set(v.format as Format, v);

  return (
    <Card className="flex flex-col" data-testid={`card-reasoning-${instrument}`}>
      <CardHeader>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <Icon className="w-3.5 h-3.5" />
          {isEthical ? "Professional Judgment" : "Critical Reasoning"}
        </span>
        <CardTitle className="text-base leading-snug">
          {isEthical
            ? "A realistic everyday-judgment scenario"
            : "Reasoning across analysis, inference, evaluation, deduction, and induction"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to answer this assessment:
        </p>
        <div className="flex flex-col gap-2">
          {FORMAT_ORDER.map((fmt) => {
            const a = byFormat.get(fmt);
            if (!a) return null;
            const cta =
              a.status === "passed"
                ? "Review"
                : a.status === "in_progress"
                ? "Resume"
                : "Begin";
            return (
              <Link key={fmt} href={`/reasoning/${a.id}`}>
                <button
                  type="button"
                  className="w-full text-left rounded-md border border-border hover:bg-secondary transition-colors p-3 flex items-center justify-between gap-3"
                  data-testid={`button-open-reasoning-${a.id}`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {FORMAT_LABELS[fmt]}
                      </span>
                      {statusBadge(a.status)}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {FORMAT_BLURBS[fmt]}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-primary shrink-0">
                    {cta}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reasoning() {
  const { data: assessments, isLoading } = useListReasoningAssessments();

  // phase -> instrument -> versions (one per format)
  const byPhase = (assessments ?? []).reduce((acc, a) => {
    (acc[a.phase] ||= {} as Record<string, ReasoningAssessmentSummary[]>);
    (acc[a.phase]![a.instrument] ||= []).push(a);
    return acc;
  }, {} as Record<string, Record<string, ReasoningAssessmentSummary[]>>);

  const instrumentOrder: ("ethical" | "critical")[] = ["ethical", "critical"];

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Diagnostic Assessments
          </h1>
          <p className="text-muted-foreground">
            Two short instruments — Professional Judgment and Critical Reasoning — taken
            once at the start and again after the unit. Each is offered in three
            answer formats; pick the one you prefer before you begin. Submitting an
            assessment earns a pass; together they count for 20% of your course grade.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {PHASE_ORDER.filter((p) => byPhase[p]).map((phase) => (
              <div key={phase} className="flex flex-col gap-4">
                <h2 className="text-xl font-serif font-semibold border-b pb-2">
                  {PHASE_LABELS[phase] ?? phase}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {instrumentOrder
                    .filter((inst) => byPhase[phase]![inst]?.length)
                    .map((inst) => (
                      <InstrumentCard
                        key={inst}
                        instrument={inst}
                        versions={byPhase[phase]![inst]!}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
