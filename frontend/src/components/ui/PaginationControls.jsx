export default function PaginationControls({
  page,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPrev,
  onNext,
  className = '',
}) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`.trim()}>
      <button
        onClick={onPrev}
        disabled={!hasPrevPage}
        className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-[#A1A1AA]">Page {page} of {totalPages}</span>
      <button
        onClick={onNext}
        disabled={!hasNextPage}
        className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
