// Desarrollado por BlacKraken Solutions
export const PAGE_SIZE = 20;

export function Pagination({
  page,
  totalPages,
  total,
  shown,
  onPrev,
  onNext,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  shown: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Show at most 7 page buttons with ellipsis compression.
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-4 py-3 text-sm">
      <span className="text-component">
        {shown === total
          ? `${total} elemento${total !== 1 ? "s" : ""}`
          : `${shown} de ${total}`}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={onPrev}
          className="border border-hairline px-2.5 py-1 text-component transition-colors hover:border-panda hover:text-panda disabled:pointer-events-none disabled:opacity-30"
        >
          ←
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-component">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p as number)}
              className={`min-w-[2rem] border px-2.5 py-1 transition-colors ${
                p === page
                  ? "border-panda bg-panda text-vanilla"
                  : "border-hairline text-component hover:border-panda hover:text-panda"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={onNext}
          className="border border-hairline px-2.5 py-1 text-component transition-colors hover:border-panda hover:text-panda disabled:pointer-events-none disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  );
}
