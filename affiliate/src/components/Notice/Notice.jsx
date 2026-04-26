import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const Notice = () => {
  const { isBangla } = useLanguage();

  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  const noticeText = useMemo(
    () =>
      isBangla
        ? "আজই আমাদের প্ল্যাটফর্মে যোগ দিন এবং নিরাপদ, দ্রুত ও বিশ্বস্ত সার্ভিস উপভোগ করুন।"
        : "Join our platform today and enjoy safe, fast, and trusted service.",
    [isBangla],
  );

  return (
    <div className="w-full bg-[#07111f] pt-2 md:pt-6">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
        <div
          className="overflow-hidden rounded-md px-6 py-3 shadow-lg shadow-black/20"
          style={{
            background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`,
          }}
        >
          <div className="notice-viewport">
            <div className="notice-single whitespace-nowrap text-sm font-bold text-white sm:text-base md:text-lg">
              {noticeText}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .notice-viewport {
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .notice-single {
          display: inline-block;
          will-change: transform;
          animation: noticeMove 16s linear infinite;
        }

        @keyframes noticeMove {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .notice-single {
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Notice;
