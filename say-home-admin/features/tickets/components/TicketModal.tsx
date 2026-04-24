import { on } from "events";
import { cp } from "fs";
import {  X } from "lucide-react";
import { useEffect } from "react";




export default function TicketModal({
    selectedTicket,  
    onClose,
    onConfirm,
    editStatus,
    setEditStatus,
    editPriority,
    setEditPriority

    }:any) {
    console.log("seleted in modal",selectedTicket)
    console.log("status passed ", editStatus, "priority passed", editPriority);
    return (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 "
          onClick={onClose}
        >
          <div
            className="bg-white rounded-[2px] shadow-xl w-[420px] p-6 "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6 pb-2 border-b border-[#ded8d1] text-600">
              <div>
                <h2 className="font-semibold text-gray-800 text-base">
                  {selectedTicket.subject}
                </h2>
                <span className="text-xs text-gray-400">
                  Ticket {selectedTicket.id}
                </span>

              </div>
              <X
                onClick={onClose}/>
              
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Description
              </h3>

              <div className="border border-gray-600 rounded-[2px] px-3 py-3">
                  <p  className="text-sm">
                  {selectedTicket.description
                    .replace(/<[^>]+>/g, "")
                    .replace(/&nbsp;/g, " ") || "No description"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Status
                </label>
                <select
                value={editStatus}
                  onChange={(e) => {setEditStatus(e.target.value)
                    console.log("edit status", e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-[2px] px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2f1b10]"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-[2px] px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2f1b10]"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
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
                className="flex-1 bg-[#2f1b10] text-white rounded-[2px] py-2 text-sm font-semibold hover:bg-[#1f1208] transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
    )
}