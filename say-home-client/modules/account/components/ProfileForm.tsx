"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/routes";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { accountService } from "../services/account.service";
import { useAccount } from "../hooks/useAccount";

export default function ProfileForm() {
  const router = useRouter();
  const { user, logout, setCurrentUser } = useAuth();
  const { profile, loading, error } = useAccount(user?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const source = profile || user;

  useEffect(() => {
    if (source) {
      setFormData({
        firstName: source.firstName || "",
        lastName: source.lastName || "",
        phone: source.phone || "",
        email: source.email || "",
      });
    }
  }, [source]);

  const initials = useMemo(() => {
    const first = formData.firstName.trim().charAt(0);
    const last = formData.lastName.trim().charAt(0);
    return `${first}${last}`.toUpperCase() || "SH";
  }, [formData.firstName, formData.lastName]);

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || "Mon profil";

  const handleChange =
    (field: "firstName" | "lastName" | "phone") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setFormError("");
      setSuccess("");
    };

  const handleCancel = () => {
    if (source) {
      setFormData({
        firstName: source.firstName || "",
        lastName: source.lastName || "",
        phone: source.phone || "",
        email: source.email || "",
      });
    }

    setIsEditing(false);
    setFormError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!user?.id) {
      setFormError("Utilisateur introuvable.");
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError("Le prenom et le nom sont obligatoires.");
      return;
    }

    if (formData.phone.trim() && !/^[0-9]{10}$/.test(formData.phone.trim())) {
      setFormError("Le telephone doit contenir exactement 10 chiffres.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      setSuccess("");

      const updatedProfile = await accountService.updateProfile(user.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      });

      setCurrentUser({
        ...user,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
      });

      setFormData({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone || "",
        email: updatedProfile.email,
      });

      setIsEditing(false);
      setSuccess("Profil mis a jour avec succes.");
    } catch (error) {
      setFormError("Impossible de mettre a jour le profil.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace(APP_ROUTES.LOGIN);
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[6px] border border-[#ded8d1] bg-white shadow-[0_14px_35px_rgba(0,0,0,0.08)]">
        <div className="bg-[#2f1b10] px-8 py-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8c8bb]">
            Compte Say Home
          </p>
          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-white/10 text-2xl font-semibold">
                {initials}
              </div>
              <div>
                <h2 className="text-[30px] font-semibold leading-tight">{fullName}</h2>
                <p className="mt-1 text-sm text-[#d8c8bb]">{formData.email}</p>
              </div>
            </div>

            <div className="flex gap-3">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setSuccess("");
                  }}
                  className="rounded-[4px] bg-white px-5 py-2.5 text-sm font-medium text-[#2f1b10] transition hover:bg-[#f5f5f3]"
                >
                  Modifier
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-[4px] border border-white/35 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Deconnexion
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[6px] bg-[#f8f6f2] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#88786c]">Role</p>
              <p className="mt-2 text-sm font-semibold text-[#222222]">{user?.role || "CLIENT"}</p>
            </div>
            <div className="rounded-[6px] bg-[#f8f6f2] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#88786c]">Telephone</p>
              <p className="mt-2 text-sm font-semibold text-[#222222]">{formData.phone || "Non renseigne"}</p>
            </div>
            <div className="rounded-[6px] bg-[#f8f6f2] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#88786c]">Statut</p>
              <p className="mt-2 text-sm font-semibold text-[#222222]">
                {loading ? "Chargement..." : "Compte actif"}
              </p>
            </div>
          </div>

          {(error || formError || success) && (
            <div
              className={`mb-6 rounded-[4px] border px-4 py-3 text-sm ${
                success
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {success || formError || error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field
              label="Prenom"
              value={formData.firstName}
              disabled={!isEditing || isSaving}
              onChange={handleChange("firstName")}
            />
            <Field
              label="Nom"
              value={formData.lastName}
              disabled={!isEditing || isSaving}
              onChange={handleChange("lastName")}
            />
            <Field
              label="Telephone"
              value={formData.phone}
              disabled={!isEditing || isSaving}
              onChange={handleChange("phone")}
            />
            <Field
              label="Email"
              value={formData.email}
              disabled
              hint="L'email ne peut pas etre modifie pour le moment."
            />
          </div>

          {isEditing && (
            <div className="mt-8 flex flex-col gap-3 border-t border-[#ded8d1] pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-[4px] border border-[#cfc7bf] px-6 py-2.5 text-sm font-medium text-[#444444] transition hover:bg-[#f5f5f3] disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-[4px] bg-[#2f1b10] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  disabled,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  hint?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-[#333333]">{label}</label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={onChange}
        className="h-12 rounded-[4px] border border-[#d8d2cb] bg-white px-4 text-sm text-[#222222] outline-none transition focus:border-[#2f1b10] disabled:bg-[#f8f6f2] disabled:text-[#666666]"
      />
      {hint && <p className="text-xs text-[#777777]">{hint}</p>}
    </div>
  );
}
