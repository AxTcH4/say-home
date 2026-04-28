"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/lib/routes";
import { prospectService } from "../services/prospect.service";
import type { CreateProspectPayload } from "../types/prospect.types";
import type { AdminUserItem } from "@/features/users/types/user.types";

interface CreateProspectFormProps {
  agents: AdminUserItem[];
  initialValues?: CreateProspectPayload;
  mode?: "create" | "edit";
  prospectId?: number;
}

export function CreateProspectForm({
  agents,
  initialValues,
  mode = "create",
  prospectId,
}: CreateProspectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProspectPayload>({
    firstName: initialValues?.firstName ?? "",
    lastName: initialValues?.lastName ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    city: initialValues?.city ?? "",
    budget: initialValues?.budget ?? null,
    source: initialValues?.source ?? "Manual",
    assignedAgentId: initialValues?.assignedAgentId ?? null,
  });

  const handleChange = (
    field: keyof CreateProspectPayload,
    value: string | number | null
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "edit" && prospectId) {
        await prospectService.updateProspect(prospectId, form);
      } else {
        await prospectService.createProspect(form);
      }
      router.push(APP_ROUTES.PROSPECTS);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create prospect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-[#e7edf5] bg-white p-6 shadow-[0_12px_35px_rgba(20,32,60,0.06)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First Name">
          <input
            required
            value={form.firstName}
            onChange={(event) => handleChange("firstName", event.target.value)}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>

        <Field label="Last Name">
          <input
            required
            value={form.lastName}
            onChange={(event) => handleChange("lastName", event.target.value)}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>

        <Field label="Phone">
          <input
            required
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>

        <Field label="City">
          <input
            required
            value={form.city}
            onChange={(event) => handleChange("city", event.target.value)}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>

        <Field label="Budget">
          <input
            type="number"
            min="0"
            value={form.budget ?? ""}
            onChange={(event) =>
              handleChange(
                "budget",
                event.target.value ? Number(event.target.value) : null
              )
            }
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>

        <Field label="Source">
          <select
            value={form.source}
            onChange={(event) => handleChange("source", event.target.value)}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          >
            <option value="Manual">Manual</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Phone">Phone</option>
            <option value="Walk-in">Walk-in</option>
          </select>
        </Field>

        <Field label="Assigned Agent">
          <select
            value={form.assignedAgentId ?? ""}
            onChange={(event) =>
              handleChange(
                "assignedAgentId",
                event.target.value ? Number(event.target.value) : null
              )
            }
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.fullName} - {agent.role}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {error ? (
        <p className="mt-4 rounded-[10px] bg-[#ffe8e8] px-3 py-2 text-sm text-[#c13d3d]">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[10px] bg-[#2c1a0e] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          {isSubmitting ? (mode === "edit" ? "Saving..." : "Creating...") : mode === "edit" ? "Save Changes" : "Create Prospect"}
        </button>
        <button
          type="button"
          onClick={() => router.push(APP_ROUTES.PROSPECTS)}
          className="rounded-[10px] border border-[#e4eaf4] px-5 py-3 text-sm font-semibold text-[#172033]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#172033]">{label}</span>
      {children}
    </label>
  );
}
