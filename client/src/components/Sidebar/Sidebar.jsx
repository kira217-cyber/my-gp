import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router";
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
  LogOut,
} from "lucide-react";
import { FaHandshake, FaPlayCircle } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const AFFILIATE_URL = "http://localhost:5174/";

const Sidebar = ({ open, setOpen }) => {
  const { isBangla, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  const [openGames, setOpenGames] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [gameCategories, setGameCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/game-categories");
        setGameCategories(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch game categories:", error);
        setGameCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const closeAndNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const openAffiliate = () => {
    setOpen(false);
    window.open(AFFILIATE_URL, "_blank", "noopener,noreferrer");
  };

  const categoryChildren = useMemo(() => {
    return gameCategories.map((cat) => ({
      key: cat._id,
      label: isBangla
        ? cat?.categoryName?.bn || cat?.categoryTitle?.bn || "ক্যাটাগরি"
        : cat?.categoryName?.en || cat?.categoryTitle?.en || "Category",
      to: `/games/${cat._id}`,
    }));
  }, [gameCategories, isBangla]);

  const items = useMemo(
    () => [
      // {
      //   key: "offers",
      //   label: isBangla ? "অফার" : "Offers",
      //   icon: Gift,
      //   to: "/offers",
      // },
      // {
      //   key: "withdraw",
      //   label: isBangla ? "উত্তোলন" : "Withdraw",
      //   icon: CreditCard,
      //   to: "/withdraw",
      // },
      {
        key: "invite",
        label: isBangla ? "বন্ধুদের আমন্ত্রণ জানান" : "Invite Friends",
        icon: Users,
        to: "/invite-friends",
      },
      {
        key: "rewards",
        label: isBangla ? "পুরস্কার কেন্দ্র" : "Reward Center",
        icon: Trophy,
        to: "/rewards",
      },
      {
        key: "games",
        label: isBangla ? "খেলার কেন্দ্র" : "Game Center",
        icon: Gamepad2,
        hasDropdown: true,
        isOpen: openGames,
        onClick: () => setOpenGames((prev) => !prev),
        children: categoryChildren,
      },
      {
        key: "account",
        label: isBangla ? "অ্যাকাউন্ট" : "Account",
        icon: User,
        hasDropdown: true,
        isOpen: openAccount,
        onClick: () => setOpenAccount((prev) => !prev),
        children: [
          {
            key: "profile",
            label: isBangla ? "প্রোফাইল" : "Profile",
            to: "/profile",
          },
          {
            key: "security",
            label: isBangla ? "নিরাপত্তা" : "Security",
            to: "/security",
          },
          {
            key: "history",
            label: isBangla ? "হিস্টোরি" : "History",
            to: "/history",
          },
        ],
      },
      {
        key: "affiliate",
        label: isBangla ? "পার্টনার" : "Affiliate",
        icon: FaHandshake,
        onClick: openAffiliate,
      },
      {
        key: "download",
        label: isBangla ? "অ্যাপ ডাউনলোড করুন" : "Download App",
        icon: Download,
        to: "/download",
      },
      // {
      //   key: "support",
      //   label: isBangla ? "গ্রাহক পরিসেবা" : "Customer Service",
      //   icon: Headphones,
      //   to: "/support",
      // },
      {
        key: "help",
        label: isBangla ? "সাহায্য কেন্দ্র" : "Help Center",
        icon: HandHelping,
        to: "/help",
      },
      {
        key: "tutorial",
        label: isBangla ? "টিউটোরিয়াল" : "Tutorial",
        icon: FaPlayCircle,
        to: "/tutorial",
      },
    ],
    [isBangla, openGames, openAccount, categoryChildren],
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setOpen(false);
    navigate("/start", { replace: true });
  };

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

            const content = (
              <>
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
              </>
            );

            return (
              <div key={item.key}>
                {item.hasDropdown || item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex w-full items-center justify-between rounded-[8px] bg-[#1f5f98] px-4 py-3 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-[#1b5487] cursor-pointer"
                  >
                    {content}
                  </button>
                ) : (
                  <NavLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-between rounded-[8px] bg-[#1f5f98] px-4 py-3 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-[#1b5487] cursor-pointer"
                  >
                    {content}
                  </NavLink>
                )}

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
                        {item.children?.length ? (
                          item.children.map((child) => (
                            <NavLink
                              key={child.key}
                              to={child.to}
                              onClick={() => setOpen(false)}
                              className="block w-full rounded-[6px] bg-[#174a79] px-4 py-2 text-left text-[14px] font-medium text-white/95 transition hover:bg-[#143f67] cursor-pointer"
                            >
                              {child.label}
                            </NavLink>
                          ))
                        ) : (
                          <div className="block w-full rounded-[6px] bg-[#174a79] px-4 py-2 text-left text-[14px] font-medium text-white/70">
                            {isBangla ? "কোনো ক্যাটাগরি নেই" : "No category"}
                          </div>
                        )}
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

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[8px] bg-[#1f5f98] px-4 py-3 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-[#1b5487] cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={2.2} />
            <span className="text-[15px] font-semibold leading-none">
              {isBangla ? "লগ আউট" : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
