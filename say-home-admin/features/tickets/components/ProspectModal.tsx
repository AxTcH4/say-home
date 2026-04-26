import { use } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { url } from "inspector";
export default function ProspectModal({ prospect, onClose, isClosing }: any) {
  return (
    <div
      className={`transition-all duration-200 ease-in-out ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"} fixed inset-0 bg-black/40 flex items-center justify-center z-50`}
      onClick={onClose}
    >
      <div className="relative  bg-white rounded-[2px] shadow-xl w-[500px] h-[250px] overflow-hidden">
          {/* <div className=" absolute left-0 top-0 bg-white border border-[#e0d8cc]" /> */}
          <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#2c1a0e]" />
        {/* bg image layer */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/card-texture.jpg')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.45,
          }}
        />
        <div className="flex flex-col mb-0">
          <div className="flex justify-between items-center px-6 pt-2">
            <h2 className="font-semibold text-gray-800 text-sm">
              Prospect Details
            </h2>
            <X
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="cursor-pointer"
            />
          </div>

          {/* content layer */}
          <div className="relative z-10 flex flex-row justify-between items-center h-full p-14 gap-6">
            {/* Left — logo */}
            <div className="flex flex-col items-center justify-center border-r border-gray-200 pr-6">
              <img
                src="/logo-w-o-bg.png"
                alt="SAY HOME"
                className="w-22 h-22"
              />
            </div>

            {/* Right — info */}
            <div className="flex flex-col gap-2">
              <p className="text-2xl font-bold text-gray-800">
                {prospect.firstName} {prospect.lastName}
              </p>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex flex-row gap-2 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    {prospect.phone ?? "N/A"}
                  </p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">{prospect.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
