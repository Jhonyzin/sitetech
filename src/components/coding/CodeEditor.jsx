import { useCallback, useEffect, useMemo, useRef } from "react";

const TAB_SPACES = "    ";

export default function CodeEditor({
  value,
  onChange,
  disabled = false,
  language = "C",
  highlightLines = [],
  placeholder = "",
  minLines = 14,
  onExecute
}) {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  const lineCount = useMemo(() => {
    const lines = value.split("\n").length;
    return Math.max(lines, minLines);
  }, [value, minLines]);

  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount]
  );

  const highlightSet = useMemo(() => new Set(highlightLines), [highlightLines]);

  const syncScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    syncScroll();
  }, [value, syncScroll]);

  function handleKeyDown(event) {
    if (disabled) return;
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      onExecute?.();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = `${value.slice(0, start)}${TAB_SPACES}${value.slice(end)}`;
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + TAB_SPACES.length;
      });
    }
  }

  return (
    <div className={`lc-editor ${disabled ? "is-disabled" : ""}`}>
      <div className="lc-editor__toolbar">
        <span className="lc-editor__lang">{language}</span>
        <span className="lc-editor__hint">Tab insere recuo · Ctrl+Enter para executar</span>
      </div>
      <div className="lc-editor__body">
        <div className="lc-editor__gutter" ref={gutterRef} aria-hidden="true">
          {lineNumbers.map((num) => (
            <div
              key={num}
              className={`lc-editor__line-num ${highlightSet.has(num) ? "is-error" : ""}`}
            >
              {num}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="lc-editor__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={placeholder}
          aria-label="Editor de código"
        />
      </div>
    </div>
  );
}
