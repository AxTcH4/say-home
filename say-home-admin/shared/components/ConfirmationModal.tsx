interface ConfirmationModalProps {
  selectedItem?: unknown;
  onClose: () => void;
  isClosing: boolean;
  onConfirm: () => void;
}

export default function ConfirmationModal({
  selectedItem,
  onClose,
  isClosing,
  onConfirm,
}: ConfirmationModalProps) {
  void selectedItem;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-all duration-200 ease-in-out ${
        isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
      }`}
      onClick={onClose}
    >
      <div
        className="w-[420px] rounded-[2px] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              You&apos;re about to delete this item
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              This action is permanent and cannot be undone.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            x
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h1>Do you really want to delete this item?</h1>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-[2px] border border-gray-200 py-2 text-sm text-gray-500 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-[2px] bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
