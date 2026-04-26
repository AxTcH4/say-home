import { X } from "lucide-react";

export default function TicketModal({
  selectedTicket,
  onClose,
  onConfirm,
  editStatus,
  setEditStatus,
  isClosing,
  editPriority,
  setEditPriority,
}: any) {
  return (
    <div
      className={`transition-all duration-200 ease-in-out ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"} fixed inset-0 bg-black/50 flex items-center justify-center z-50`}
      onClick={onClose}
    >
      <div
        className="relative w-[480px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-white border border-[#e0d8cc]" />
        <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#2f1b10]" />

        <div className="relative z-10 p-8 pt-10">
          {/* header */}
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-3">
              <img src="/logo-w-o-bg.png" alt="SAY HOME" className="w-8 h-8" />
              <div>
                <p className="text-[10px] tracking-widest text-[#2f1b10] uppercase font-bold">Say Home</p>
                <p className="text-[9px] text-gray-400 tracking-wider uppercase">Complaint Form</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Ref. No.</p>
              <p className="text-sm font-bold text-[#2f1b10]">#{String(selectedTicket.id).padStart(5, "0")}</p>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-[#d4c9b8] my-4" />

          {/* subject */}
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Subject</p>
            <p className="text-base font-bold text-gray-800">{selectedTicket.subject}</p>
          </div>

          {/* description */}
          <div className="mb-4 ">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Description</p>
            <div className=" border border-[#e0d8cc]  p-3 min-h-[80px]">
              <p className="text-sm text-gray-700 leading-6">
                {selectedTicket.description.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ") || "No description"}
              </p>
            </div>
          </div>

          {/* status + priority */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Status</p>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-white border border-[#e0d8cc] px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2f1b10]"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Priority</p>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full bg-white border border-[#e0d8cc] px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2f1b10]"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-[#d4c9b8] my-4" />

          {/* actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-[#d4c9b8] py-2 text-sm text-gray-500 hover:scale-101 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-[#2f1b10] text-white py-2 text-sm font-semibold hover:bg-[#1f1208] transition"
            >
              Save
            </button>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-6 text-gray-400 hover:text-gray-600 z-20"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}