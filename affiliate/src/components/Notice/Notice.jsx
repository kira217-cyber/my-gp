import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const Notice = () => {
  const { isBangla } = useLanguage();

  const { data } = useQuery({
    queryKey: ["aff-notice"],
    queryFn: async () => {
      const res = await api.get("/api/aff-notice");
      return res?.data?.data || null;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const noticeText = useMemo(() => {
    if (!data) {
      return isBangla
        ? "আজই আমাদের প্ল্যাটফর্মে যোগ দিন এবং নিরাপদ, দ্রুত ও বিশ্বস্ত সার্ভিস উপভোগ করুন।"
        : "Join our platform today and enjoy safe, fast, and trusted service.";
    }

    return isBangla
      ? data?.text?.bn || data?.text?.en || ""
      : data?.text?.en || data?.text?.bn || "";
  }, [data, isBangla]);

  if (!noticeText) return null;

  const primary = data?.primaryColor || "#2f79c9";
  const secondary = data?.secondaryColor || "#f07a2a";
  const speed = Number(data?.speed || 16);

  return (
    <div className="w-full bg-[#07111f] pt-2 md:pt-6">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
        <div
          className="overflow-hidden rounded-md px-6 py-3 shadow-lg shadow-black/20"
          style={{
            background: `linear-gradient(90deg, ${primary}, ${secondary})`,
          }}
        >
          <div className="notice-viewport">
            <div
              className="notice-single whitespace-nowrap text-sm font-bold text-white sm:text-base md:text-lg"
              style={{ animationDuration: `${speed}s` }}
            >
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
          animation-name: noticeMove;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
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
