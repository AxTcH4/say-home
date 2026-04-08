import Image from 'next/image';

export default function AboutSection() {
  return (
    <>
      <section className="flex w-full relative" style={{ minHeight: '550px' }}>
        {/* Left - grande image riad qui dépasse */}
        <div className="w-[40%] relative" style={{ marginTop: '-60px', zIndex: 10 }}>
          <Image
            src="/riad.png"
            alt="Riad"
            fill
            sizes="40vw"
            className="object-cover object-center"
          />
        </div>

        {/* Right - contenu gris */}
        <div className="w-[60%] bg-gray-100 p-16 flex flex-col justify-center">
          <p className="text-xs text-[#2C1A0E] uppercase tracking-widest mb-4">TITLE</p>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 leading-tight">
            We know how everything works and why your business is failing over and over again.
          </h2>

          {/* Two small images */}
          <div className="flex gap-4 mb-8 items-end">
            <div className="relative" style={{ width: '200px', height: '160px' }}>
              <Image
                src="/cuisine.png"
                alt="Cuisine"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <div className="relative" style={{ width: '150px', height: '120px' }}>
              <Image
                src="/salon.png"
                alt="Salon"
                fill
                sizes="150px"
                className="object-cover"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
            We share common trends and strategies for improving your rental income and making sure
            you stay in high demand. With lots of unique blocks, you can easily build a page without
            coding. Build your next landing page.
          </p>
        </div>
      </section>

      {/* Bande blanche de séparation */}
      <div className="w-full h-6 bg-white" />
    </>
  );
}