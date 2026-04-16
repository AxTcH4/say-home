import ProfileForm from "@/features/user/components/ProfileForm";

export default function ProfilePage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-[32px] font-semibold text-[#222222]">
          Mon profil
        </h1>

        <p className="mt-2 text-sm text-[#666666]">
          Consultez et modifiez vos informations personnelles
        </p>
      </div>

      <ProfileForm />
    </section>
  );
}