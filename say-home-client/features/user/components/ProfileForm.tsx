"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { accountService } from "../services/account.service";
import { useAccount } from "../hooks/useAccount";
import { toast } from "sonner";

export default function ProfileForm() {
  const router = useRouter();
  const { user, logout, setCurrentUser } = useAuth();
  const { profile, loading, error } = useAccount(user?.id);
  const [isEditing, setIsEditing] = useState(true);
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

  const fullName =
    `${formData.firstName} ${formData.lastName}`.trim() || "Mon profil";

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
      toast.success("Profil mis a jour avec succes.");
    } catch (error) {
      setFormError("Impossible de mettre a jour le profil.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-center gap-5">
          {" "}
          <div className="w-20 h-20 rounded-full bg-[#F5F5F5] cursor-pointer hover:brightness-90  flex items-center justify-center text-2xl text-bold font-medium uppercase opacity-70 hover:opacity-90">
            {initials}
          </div>
          <div>
            <div className="flex flex-row items-center justify-between gap-4">
              <h2 className="text-[30px] font-semibold leading-tight">
                {fullName}
              </h2>

              <div className="h-5 w-[1px] bg-[#d8c8bb]" aria-hidden="true" />

              <h2 className="text-[16px] text-[#d8c8bb] leading-tight">
                {!user?.role
                  ? " "
                  : user?.role.charAt(0).toUpperCase() +
                    user?.role.slice(1).toLowerCase()}
              </h2>
            </div>

            <p className="mt-1 text-sm text-[#d8c8bb]">{formData.email}</p>
                        
              {loading ? 
              <p className="mt-1 text-sm text-[#d8c8bb]">Chargement... </p> :
              <p className="mt-1 text-sm text-[green]">Compte actif </p>
              }
          </div>
        </div>

        <div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setSuccess("");
              }}
              className={`-fit px-5 py-2 text-sm  font-medium hover:bg-[#2C1A0E] border border-black hover:border-transparent hover:text-white transition rounded-[1px]`}
            >
              Modifier
            </button>
          )}
        </div>

      </div>
      <div className="space-y-8 flex align-center justify-center  ">
        <div className=" min-w-[35vw]  ">

          {/* <div className=" px-5 py-5 border border-black">
            <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              //TODO:Add pfp upload
            </div>
          </div> */}

          <div className="px-8 py-8">
            {(error || formError || success) && (
              <div
                className={`mb-6 rounded-[2px] border px-4 py-3 text-sm ${
                  success
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {success || formError || error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
              <Field
                label="Prénom"
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
                  className="rounded-[2px] border border-[#cfc7bf] px-6 py-2.5 text-sm font-medium text-[#444444] transition hover:bg-[#f5f5f3] disabled:opacity-60"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-[2px] bg-[#2f1b10] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
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
        className="h-12 rounded-[2px] border border-[#d8d2cb] bg-white px-4 text-sm text-[#222222] outline-none transition focus:border-[#2f1b10] disabled:bg-[#f8f6f2] disabled:text-[#666666]"
      />
      {hint && <p className="text-xs text-[#777777]">{hint}</p>}
    </div>
  );
}
