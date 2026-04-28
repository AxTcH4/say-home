"use client";

import Link from "next/link";
import { useState } from "react";
import { pipelineService } from "../services/pipeline.service";
import type { PipelineBoardResponse, PipelineCard } from "../types/pipeline.types";

interface PipelineBoardProps {
  board: PipelineBoardResponse;
}

export function PipelineBoard({ board }: PipelineBoardProps) {
  const [localBoard, setLocalBoard] = useState(board);
  const [draggedProspect, setDraggedProspect] = useState<PipelineCard | null>(null);

  const handleDrop = async (targetStatus: string) => {
    if (!draggedProspect || draggedProspect.status === targetStatus) {
      return;
    }

    const nextColumns = localBoard.columns.map((column) => {
      if (column.key === draggedProspect.status) {
        return {
          ...column,
          count: Math.max(0, column.count - 1),
          prospects: column.prospects.filter((prospect) => prospect.id !== draggedProspect.id),
        };
      }

      if (column.key === targetStatus) {
        return {
          ...column,
          count: column.count + 1,
          prospects: [
            ...column.prospects,
            {
              ...draggedProspect,
              status: targetStatus,
            },
          ],
        };
      }

      return column;
    });

    setLocalBoard((current) => ({ ...current, columns: nextColumns }));

    try {
      await pipelineService.updateProspectStatus({
        prospectId: draggedProspect.id,
        status: targetStatus,
      });
    } catch (error) {
      setLocalBoard(board);
      alert(error instanceof Error ? error.message : "Unable to update status");
    } finally {
      setDraggedProspect(null);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {localBoard.columns.map((column) => (
        <section key={column.key} className="min-w-0">
          <div
            className="mb-3 h-[3px] rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#172033]">
                {column.title} <span className="text-[#7d8ca2]">({column.count})</span>
              </h2>
            </div>
            <span className="text-[#9aa8bc]">...</span>
          </div>

          <div
            className="min-h-[220px] rounded-[16px]"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(column.key)}
          >
            <div className="space-y-3">
              {column.prospects.length === 0 ? (
                <div className="rounded-[16px] border border-dashed border-[#d9e2ef] bg-white px-4 py-10 text-center text-sm text-[#9aa8bc]">
                  Drop card here
                </div>
              ) : (
                column.prospects.map((prospect) => (
                  <article
                    key={prospect.id}
                    draggable
                    onDragStart={() => setDraggedProspect(prospect)}
                    className="cursor-grab rounded-[16px] border border-[#e7edf5] bg-white p-4 shadow-[0_10px_30px_rgba(20,32,60,0.05)] active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#172033]">
                          {prospect.fullName}
                        </h3>
                        <p className="mt-2 text-xs text-[#70819a]">{prospect.city}</p>
                        <p className="mt-1 text-xs text-[#70819a]">{prospect.budgetLabel}</p>
                      </div>

                      <span className="rounded-full bg-[#edf3ff] px-2 py-1 text-[11px] font-semibold text-[#376fd9]">
                        {prospect.aiScore}% AI
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-[#70819a]">
                        {prospect.assignedAgentName ?? "Unassigned"}
                      </p>
                      <Link
                        href={`/prospects/${prospect.id}`}
                        className="rounded-full border border-[#e4eaf4] px-3 py-1 text-[11px] font-semibold text-[#172033]"
                      >
                        Detail
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
