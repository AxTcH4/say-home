export default function MainFooter() {
  return (
    <footer className="mt-auto w-full">
      <div className="grid min-h-[240px] w-full grid-cols-1 md:grid-cols-[42%_58%]">
        <div className="flex items-end bg-[#e8e8e8] px-10 py-8">
          <div className="text-[32px] font-extrabold uppercase text-[#111111]">
            LOGO
          </div>
        </div>

        <div className="bg-[#2f2f2f] px-6 py-6 text-white">
          <div className="mx-auto flex max-w-[720px] flex-col items-center bg-[#f8f8f8] px-10 py-10 text-[#222222] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="w-full max-w-[420px] space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-base">📍</span>
                <span>Marrakech, Maroc</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base">📞</span>
                <span>0687654321</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base">✉️</span>
                <span>sayhome.app@gmail.com</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4 text-sm">
              <span>◉</span>
              <span>◉</span>
              <span>◉</span>
              <span>◉</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-10 text-sm text-white">
            <span>A propos</span>
            <span>Services</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
