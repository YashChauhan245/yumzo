export default function FormModal({
  isOpen,
  title,
  description,
  children,
  onCancel,
  onSubmit,
  submitLabel = 'Save Changes',
  submitting = false,
  submittingLabel = 'Saving...',
  disableSubmit = false,
  maxWidthClass = 'max-w-lg',
  cancelButtonClassName = 'rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-2 text-sm text-white hover:border-[#3A3A3A]',
  submitButtonClassName = 'rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2F2F2F] disabled:opacity-60',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className={`w-full ${maxWidthClass} rounded-2xl border border-[#2A2A2A] bg-[#141414] p-5`}>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#A1A1AA]">{description}</p> : null}

        <div className="mt-4 space-y-3">{children}</div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className={cancelButtonClassName}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || disableSubmit}
            className={submitButtonClassName}
          >
            {submitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}