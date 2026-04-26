export default function ConfirmationModal({
  selectedItem,
  onClose,
  isClosing,
  onConfirm,
}: any) {
  return (
    <div
      className={`transition-all duration-200 ease-in-out ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"} fixed inset-0 bg-black/40 flex items-center justify-center z-50`}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2px] shadow-xl w-[420px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-semibold text-gray-800 text-base">
              You're about to delete this item
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              This action is permanent and cannot be undone.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h1>Do you really want to delete this item?</h1>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className=" flex-1 border border-gray-200 rounded-[2px] py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white rounded-[2px] py-2 text-sm font-semibold hover:bg-red-800 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
