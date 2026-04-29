"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { prospectService } from "../services/prospect.service";

export function AddInteractionForm({ prospectId }: { prospectId: number }) {
  const router = useRouter();
  const [type, setType] = useState("Call");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await prospectService.addInteraction(prospectId, { type, comment });
      router.push(`/prospects/${prospectId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add interaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[18px] border border-[#e7edf5] bg-white p-6 shadow-[0_12px_35px_rgba(20,32,60,0.06)]">
      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#172033]">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none">
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Note">Note</option>
            <option value="Visit">Visit</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#172033]">Comment</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows={5} className="w-full rounded-[12px] border border-[#e4eaf4] px-4 py-3 text-sm outline-none" />
        </label>
      </div>
      {error ? <p className="mt-4 rounded-[10px] bg-[#ffe8e8] px-3 py-2 text-sm text-[#c13d3d]">{error}</p> : null}
      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={isSubmitting} className="rounded-[10px] bg-[#2c1a0e] px-5 py-3 text-sm font-semibold text-white">
          {isSubmitting ? "Saving..." : "Add Interaction"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-[10px] border border-[#e4eaf4] px-5 py-3 text-sm font-semibold text-[#172033]">
          Cancel
        </button>
      </div>
    </form>
  );
}
