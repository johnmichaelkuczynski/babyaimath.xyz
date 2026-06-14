import React, { useRef, useState, useEffect, useCallback } from "react";
import { KeystrokeTrace } from "@workspace/api-client-react";
import { useAdminMode } from "@/lib/adminMode";
import { MathKeyboard, insertAtTextareaCursor } from "@/components/MathKeyboard";

interface AnswerInputProps {
  value: string;
  onChange: (val: string, trace: KeystrokeTrace) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Use a shorter textarea for brief answers (a sentence or two). */
  compact?: boolean;
  /** Allow pasting (used where there is no authorship detection, e.g. diagnostics). */
  allowPaste?: boolean;
}

export function AnswerInput({ value, onChange, placeholder, disabled, compact, allowPaste }: AnswerInputProps) {
  const [adminMode] = useAdminMode();
  const [sessionValue, setSessionValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const traceRef = useRef<KeystrokeTrace>({
    keystrokeCount: 0,
    eraseCount: 0,
    bulkInsertCount: 0,
    longestBulkInsertChars: 0,
    rewriteSegments: 0,
    durationMs: 0,
  });

  const sessionStartRef = useRef<number>(Date.now());
  const lastKeyWasEraseRef = useRef<boolean>(false);

  useEffect(() => {
    setSessionValue(value);
  }, [value]);

  const emitChange = useCallback(
    (newVal: string) => {
      const trace = {
        ...traceRef.current,
        durationMs: Date.now() - sessionStartRef.current,
      };
      onChange(newVal, trace);
    },
    [onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const diff = newVal.length - sessionValue.length;

    if (diff > 5) {
      traceRef.current.bulkInsertCount = (traceRef.current.bulkInsertCount || 0) + 1;
      if (diff > (traceRef.current.longestBulkInsertChars || 0)) {
        traceRef.current.longestBulkInsertChars = diff;
      }
    }

    setSessionValue(newVal);
    emitChange(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isErase = e.key === "Backspace" || e.key === "Delete";

    if (isErase) {
      traceRef.current.eraseCount += 1;
      if (!lastKeyWasEraseRef.current) {
        traceRef.current.rewriteSegments = (traceRef.current.rewriteSegments || 0) + 1;
      }
      lastKeyWasEraseRef.current = true;
    } else if (e.key.length === 1 || e.key === "Enter") {
      traceRef.current.keystrokeCount += 1;
      lastKeyWasEraseRef.current = false;
    }
  };

  const pasteAllowed = adminMode || allowPaste;
  const handlePaste = (e: React.ClipboardEvent) => {
    if (!pasteAllowed) e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    if (!pasteAllowed) e.preventDefault();
  };

  // Inserting a symbol from the math keyboard counts as genuine typing, so it
  // updates the keystroke trace as keystrokes (not a bulk insert) to avoid
  // false-flagging legitimate symbol entry by the authorship detector.
  const handleMathInsert = (text: string, cursorBack = 0) => {
    const el = textareaRef.current;
    if (!el || disabled) return;
    const { value: newVal, cursor } = insertAtTextareaCursor(el, text, cursorBack);
    traceRef.current.keystrokeCount += text.length;
    lastKeyWasEraseRef.current = false;
    setSessionValue(newVal);
    emitChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        ref={textareaRef}
        value={sessionValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        placeholder={placeholder || "Type your answer here..."}
        disabled={disabled}
        className={`w-full ${
          compact ? "min-h-[80px] p-3 text-base" : "min-h-[180px] p-5 text-lg"
        } bg-card border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-y`}
      />
      {!disabled && <MathKeyboard onInsert={handleMathInsert} />}
      {!pasteAllowed && (
        <span className="text-xs text-muted-foreground px-1">
          Pasting is disabled.
        </span>
      )}
      {pasteAllowed && adminMode && (
        <span className="text-xs text-muted-foreground px-1">
          Administrator mode — pasting enabled.
        </span>
      )}
    </div>
  );
}
