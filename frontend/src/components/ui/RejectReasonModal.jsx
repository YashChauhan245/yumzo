import FormModal from './FormModal';
import { formFieldFullFocusClass } from './formFieldStyles';

export default function RejectReasonModal({
  isOpen,
  title = 'Reject assigned order',
  description = 'This will return the order to the available queue for other drivers.',
  reasons = [],
  selectedReason,
  onReasonChange,
  customReason,
  onCustomReasonChange,
  customReasonPlaceholder = 'Add short reason for dispatch notes',
  maxCustomReasonLength = 200,
  isSubmitting = false,
  disableSubmit = false,
  submitLabel = 'Confirm Reject',
  onCancel,
  onSubmit,
}) {
  return (
    <FormModal
      isOpen={isOpen}
      title={title}
      description={description}
      onCancel={onCancel}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      submitting={isSubmitting}
      submittingLabel="Rejecting..."
      disableSubmit={disableSubmit}
      submitButtonClassName="rounded-xl border border-rose-600/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-white">Reason</label>
        <select
          value={selectedReason}
          onChange={(e) => onReasonChange?.(e.target.value)}
          className={formFieldFullFocusClass}
        >
          {reasons.map((reason) => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      </div>

      {selectedReason === 'Other' ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-white">Custom reason</label>
          <textarea
            value={customReason}
            onChange={(e) => onCustomReasonChange?.(e.target.value)}
            rows={3}
            maxLength={maxCustomReasonLength}
            placeholder={customReasonPlaceholder}
            className={formFieldFullFocusClass}
          />
          <p className="mt-1 text-xs text-[#7E7E87]">{(customReason || '').length}/{maxCustomReasonLength}</p>
        </div>
      ) : null}
    </FormModal>
  );
}