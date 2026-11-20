"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { FaqItem } from "@/db/schema";
import { inputStyles } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type Row = FaqItem & { key: number };

/** Repeatable question/answer rows serialized into a hidden JSON input. */
export function FaqEditor({ name, initial, errors }: { name: string; initial: FaqItem[]; errors?: string[] }) {
  const nextKey = useRef(initial.length);
  const [rows, setRows] = useState<Row[]>(() => initial.map((item, i) => ({ ...item, key: i })));

  const update = (key: number, patch: Partial<FaqItem>) => setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const move = (index: number, delta: number) =>
    setRows((r) => {
      const target = index + delta;
      if (target < 0 || target >= r.length) return r;
      const next = [...r];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  // Fully empty rows are dropped; half-filled rows are sent so the server can flag them.
  const serialized = JSON.stringify(
    rows
      .map(({ question, answer }) => ({ question: question.trim(), answer: answer.trim() }))
      .filter((row) => row.question || row.answer),
  );

  return (
    <div>
      <input type="hidden" name={name} value={serialized} />
      {rows.length === 0 ? <p className="text-sm text-muted">No questions yet.</p> : null}
      <ol className="space-y-4">
        {rows.map((row, index) => (
          <li key={row.key} className="rounded-xl bg-soft/70 p-4 ring-1 ring-line">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Question {index + 1}</span>
              <span className="flex gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-lg p-1.5 text-muted hover:bg-white disabled:opacity-40">
                  <ArrowUp className="size-4" aria-hidden="true" />
                  <span className="sr-only">Move up</span>
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="rounded-lg p-1.5 text-muted hover:bg-white disabled:opacity-40">
                  <ArrowDown className="size-4" aria-hidden="true" />
                  <span className="sr-only">Move down</span>
                </button>
                <button type="button" onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))} className="rounded-lg p-1.5 text-red-700 hover:bg-white">
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Remove question</span>
                </button>
              </span>
            </div>
            <label className="sr-only" htmlFor={`${name}-q-${row.key}`}>
              Question
            </label>
            <input
              id={`${name}-q-${row.key}`}
              value={row.question}
              maxLength={200}
              placeholder="e.g. Is there parking for residents?"
              onChange={(e) => update(row.key, { question: e.target.value })}
              className={cn(inputStyles, "bg-white font-medium")}
            />
            <label className="sr-only" htmlFor={`${name}-a-${row.key}`}>
              Answer
            </label>
            <textarea
              id={`${name}-a-${row.key}`}
              value={row.answer}
              maxLength={2000}
              rows={3}
              placeholder="A clear, factual answer."
              onChange={(e) => update(row.key, { answer: e.target.value })}
              className={cn(inputStyles, "mt-2 bg-white")}
            />
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => setRows((r) => [...r, { key: nextKey.current++, question: "", answer: "" }])}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-line hover:ring-brand-300"
      >
        <Plus className="size-4" aria-hidden="true" /> Add question
      </button>
      <p className="mt-2 text-xs text-muted">Answer the real questions buyers ask your sales team. These appear on the page and in its structured data.</p>
      {errors?.length ? <p className="mt-1.5 text-sm text-red-700">Every question and answer needs at least 3 characters.</p> : null}
    </div>
  );
}
