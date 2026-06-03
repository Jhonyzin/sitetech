/** Bloco de saída com numeração de linhas (terminal / stderr). */
export default function LineOutput({ value = "", variant = "stdout", emptyLabel = "(vazio)" }) {
  const lines = value ? value.replace(/\r\n/g, "\n").split("\n") : [""];
  const isEmpty = !value?.trim();

  return (
    <div className={`lc-output lc-output--${variant}`}>
      <div className="lc-output__gutter" aria-hidden="true">
        {lines.map((_, index) => (
          <div key={index} className="lc-output__line-num">
            {index + 1}
          </div>
        ))}
      </div>
      <pre className="lc-output__content">
        {isEmpty ? <span className="lc-output__empty">{emptyLabel}</span> : lines.join("\n")}
      </pre>
    </div>
  );
}
