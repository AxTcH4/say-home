"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/lib/routes";
import { userService } from "../services/user.service";
import type { CreateUserPayload, UpdateUserPayload } from "../types/user.types";

interface UserFormProps {
  mode: "create" | "edit";
  userId?: number;
  initialValues?: Omit<UpdateUserPayload, "role">;
}

export function UserForm({ mode, userId, initialValues }: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: initialValues?.firstName ?? "",
    lastName: initialValues?.lastName ?? "",
    email: initialValues?.email ?? "",
    password: "",
    phone: initialValues?.phone ?? "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await userService.createUser({
          ...form,
          role: "AGENT",
        } as CreateUserPayload);
      } else if (userId) {
        await userService.updateUser(userId, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          role: "AGENT",
        } as UpdateUserPayload);
      }

      router.push("/agents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save agent");
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
            onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>
        <Field label="Last Name">
          <input
            required
            value={form.lastName}
            onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>
        <Field label="Phone">
          <input
            required
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
          />
        </Field>
        {mode === "create" ? (
          <Field label="Password">
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="h-12 w-full rounded-[12px] border border-[#e4eaf4] px-4 text-sm outline-none"
            />
          </Field>
        ) : null}
      </div>

      {error ? <p className="mt-4 rounded-[10px] bg-[#ffe8e8] px-3 py-2 text-sm text-[#c13d3d]">{error}</p> : null}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[10px] bg-[#2c1a0e] px-5 py-3 text-sm font-semibold text-white"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Agent" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/agents")}
          className="rounded-[10px] border border-[#e4eaf4] px-5 py-3 text-sm font-semibold text-[#172033]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#172033]">{label}</span>
      {children}
    </label>
  );
}
