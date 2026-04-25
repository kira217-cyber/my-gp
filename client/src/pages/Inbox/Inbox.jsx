import React from "react";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Inbox = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const t = {
    title: isBangla ? "ইনবক্স" : "Inbox",
    noData: isBangla ? "কোনো ডাটা নেই" : "No Data",
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#1f2937]">
      <div className="sticky top-0 z-30 flex h-[66px] items-center justify-center bg-[#2f79c9] px-4 shadow-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>

        <h1 className="text-[22px] font-black text-white sm:text-[25px]">
          {t.title}
        </h1>
      </div>

      <div className="flex min-h-[calc(100vh-66px)] items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#2f79c9]/15 bg-white px-10 py-12 shadow-sm">
          <div className="relative mb-5 flex flex-col items-center">
            <div className="absolute bottom-[-9px] h-7 w-24 rounded-full bg-[#2f79c9]/15 blur-[1px]" />

            <span className="absolute -left-6 top-5 h-[3px] w-4 rounded-full bg-[#2f79c9]/25" />
            <span className="absolute -right-6 top-8 h-[4px] w-2 rounded-full bg-[#f07a2a]/35" />
            <span className="absolute left-1/2 top-[-10px] h-[4px] w-2 -translate-x-1/2 rounded-full bg-[#2f79c9]/25" />

            <div className="relative flex h-20 w-16 items-center justify-center rounded-xl bg-gradient-to-b from-[#2f79c9] via-[#5fa0dd] to-[#1f5f98] shadow-lg">
              <div className="absolute -top-[4px] h-4 w-8 rounded-b-md rounded-t-sm bg-[#f07a2a] shadow-sm" />
              <div className="absolute top-[1px] h-[7px] w-[7px] rounded-full bg-white/80" />
              <div className="absolute inset-[5px] rounded-lg border border-white/25" />

              <ClipboardList size={32} strokeWidth={2} className="text-white" />
            </div>
          </div>

          <p className="text-[18px] font-black text-[#1f5f98]">{t.noData}</p>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
