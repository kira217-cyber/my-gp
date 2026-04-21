import React, { useMemo, useState } from "react";
import {
  Gift,
  CreditCard,
  Users,
  Trophy,
  Gamepad2,
  User,
  Download,
  Headphones,
  HandHelping,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const Sidebar = ({ open, setOpen }) => {
  const { isBangla, language, changeLanguage } = useLanguage();

  const [openGames, setOpenGames] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);

  const items = useMemo(
    () => [
      {
        key: "offers",
        label: isBangla ? "অফার" : "Offers",
        icon: Gift,
      },
      {
        key: "withdraw",
        label: isBangla ? "উত্তোলন" : "Withdraw",
        icon: CreditCard,
      },
      {
        key: "invite",
        label: isBangla ? "বন্ধুদের আমন্ত্রণ জানান" : "Invite Friends",
        icon: Users,
      },
      {
        key: "rewards",
        label: isBangla ? "পুরস্কার কেন্দ্র" : "Reward Center",
        icon: Trophy,
      },
      {
        key: "games",
        label: isBangla ? "খেলার কেন্দ্র" : "Game Center",
        icon: Gamepad2,
        hasDropdown: true,
        isOpen: openGames,
        onClick: () => setOpenGames((prev) => !prev),
        children: [
          isBangla ? "ক্যাসিনো" : "Casino",
          isBangla ? "স্পোর্টস" : "Sports",
          isBangla ? "স্লট" : "Slots",
        ],
      },
      {
        key: "account",
        label: isBangla ? "অ্যাকাউন্ট" : "Account",
        icon: User,
        hasDropdown: true,
        isOpen: openAccount,
        onClick: () => setOpenAccount((prev) => !prev),
        children: [
          isBangla ? "প্রোফাইল" : "Profile",
          isBangla ? "নিরাপত্তা" : "Security",
          isBangla ? "হিস্টোরি" : "History",
        ],
      },
      {
        key: "download",
        label: isBangla ? "অ্যাপ ডাউনলোড করুন" : "Download App",
        icon: Download,
      },
      {
        key: "support",
        label: isBangla ? "গ্রাহক পরিসেবা" : "Customer Service",
        icon: Headphones,
      },
      {
        key: "help",
        label: isBangla ? "সাহায্য কেন্দ্র" : "Help Center",
        icon: HandHelping,
      },
    ],
    [isBangla, openGames, openAccount],
  );

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 z-40 bg-black/40 transition-all duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`absolute left-0 top-0 z-50 h-full w-[86%] max-w-[290px] transform bg-[#2f79c9] px-4 pb-6 pt-4 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top */}
        <div className="mb-5 flex items-center justify-center">
          <img
            src="https://i.ibb.co.com/Xxf8k1SR/image-removebg-preview-5.png"
            alt="logo"
            className="h-[48px] object-contain"
          />
        </div>

        {/* Menu List */}
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={item.onClick ? item.onClick : undefined}
                  className="flex w-full items-center justify-between rounded-[8px] bg-[#1f5f98] px-4 py-3 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-[#1b5487] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={2.2} />
                    <span className="text-[15px] font-semibold leading-none">
                      {item.label}
                    </span>
                  </div>

                  {item.hasDropdown ? (
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                        item.isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  ) : null}
                </button>

                {/* Smooth Dropdown */}
                {item.hasDropdown && (
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      item.isOpen
                        ? "grid-rows-[1fr] opacity-100 mt-2"
                        : "grid-rows-[0fr] opacity-0 mt-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={`space-y-2 pl-4 transition-all duration-300 ${
                          item.isOpen
                            ? "translate-y-0"
                            : "-translate-y-2 pointer-events-none"
                        }`}
                      >
                        {item.children?.map((child) => (
                          <button
                            key={child}
                            type="button"
                            className="block w-full rounded-[6px] bg-[#174a79] px-4 py-2 text-left text-[14px] font-medium text-white/95 transition hover:bg-[#143f67] cursor-pointer"
                          >
                            {child}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Language */}
          <div className="rounded-[8px] bg-[#1f5f98] px-4 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-3 flex items-center gap-3">
              <Globe className="h-5 w-5 shrink-0" strokeWidth={2.2} />
              <span className="text-[15px] font-semibold leading-none">
                {isBangla ? "ভাষা" : "Language"}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => changeLanguage("Bangla")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition cursor-pointer ${
                  language === "Bangla"
                    ? "bg-white text-[#1f5f98]"
                    : "bg-[#174a79] text-white hover:bg-[#143f67]"
                }`}
              >
                <img
                  src="https://flagcdn.com/w40/bd.png"
                  alt="BD"
                  className="h-4 w-5 object-cover"
                />
                <span>বাংলা</span>
              </button>

              <button
                type="button"
                onClick={() => changeLanguage("English")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition cursor-pointer ${
                  language === "English"
                    ? "bg-white text-[#1f5f98]"
                    : "bg-[#174a79] text-white hover:bg-[#143f67]"
                }`}
              >
                <img
                  src="https://flagcdn.com/w40/us.png"
                  alt="US"
                  className="h-4 w-5 object-cover"
                />
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
