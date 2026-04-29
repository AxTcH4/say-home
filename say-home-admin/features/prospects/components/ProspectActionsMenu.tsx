"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { prospectService } from "../services/prospect.service";

interface ProspectActionsMenuProps {
  prospectId: number;
  prospectName: string;
}

export function ProspectActionsMenu({
  prospectId,
  prospectName,
}: ProspectActionsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!confirm(`Delete ${prospectName}?`)) {
      return;
    }
    await prospectService.deleteProspect(prospectId);
    router.push("/prospects");
    router.refresh();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-full px-2 py-1 text-lg leading-none hover:bg-[#f7f9fc] hover:text-[#172033]"
        aria-label={`Open actions for ${prospectName}`}
      >
        ...
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-[12px] border border-[#e4eaf4] bg-white p-2 shadow-[0_18px_40px_rgba(20,32,60,0.12)]">
          <Link
            href={`/prospects/${prospectId}`}
            className="block rounded-[8px] px-3 py-2 text-sm text-[#172033] hover:bg-[#f7f9fc]"
          >
            View detail
          </Link>
          <Link
            href={`/prospects/${prospectId}/edit`}
            className="block rounded-[8px] px-3 py-2 text-sm text-[#172033] hover:bg-[#f7f9fc]"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="block w-full rounded-[8px] px-3 py-2 text-left text-sm text-[#d24a4a] hover:bg-[#fff5f5]"
          >
            Delete
          </button>
          <Link
            href={`/prospects/${prospectId}/interactions/new`}
            className="block rounded-[8px] px-3 py-2 text-sm text-[#172033] hover:bg-[#f7f9fc]"
          >
            Add interaction
          </Link>
          <Link
            href={`/appointments/new?prospectId=${prospectId}`}
            className="block rounded-[8px] px-3 py-2 text-sm text-[#172033] hover:bg-[#f7f9fc]"
          >
            Add meeting
          </Link>
        </div>
      ) : null}
    </div>
  );
}
