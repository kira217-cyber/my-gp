import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
const APP_URL =
  import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "";

const makeUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${APP_URL}${url}`;
};

const Navber = () => {
  const { language, changeLanguage, isBangla } = useLanguage();
  const [logo, setLogo] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);

  const langRef = useRef(null);
  const mobileLangRef = useRef(null);

  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  useEffect(() => {
  const fetchLogo = async () => {
    try {
      const res = await api.get("/api/aff-site-identity");
      setLogo(res?.data?.data?.logo || "");
    } catch (error) {
      console.error("Failed to fetch affiliate logo:", error);
    }
  };

  fetchLogo();
}, []);

  const logoUrl = logo ? makeUrl(logo) : " ";

  const t = useMemo(
    () => ({
      btn: {
        login: isBangla ? "লগইন করুন" : "Login",
        join: isBangla ? "প্রথমেই যোগদান করুন" : "Join Now",
      },
      langLabel: isBangla ? "বাংলা" : "English",
    }),
    [isBangla],
  );

  const languages = useMemo(
    () => [
      {
        key: "Bangla",
        label: "বাংলা",
        flag: "https://flagcdn.com/w40/bd.png",
      },
      {
        key: "English",
        label: "English",
        flag: "https://flagcdn.com/w40/us.png",
      },
    ],
    [],
  );

  const activeLang = languages.find((l) => l.key === language) || languages[0];

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }

      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target)) {
        setMobileLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setLangOpen(false);
        setMobileLangOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cssVars = {
    "--primary": PRIMARY,
    "--secondary": SECONDARY,
    "--nav-bg": "#07111f",
    "--nav-bg-2": "#0b1728",
    "--nav-border": "rgba(255,255,255,0.12)",
    "--nav-text": "#ffffff",
    "--nav-muted": "#cbd5e1",
  };

  return (
    <>
      <nav
        style={cssVars}
        className="fixed left-0 top-0 z-50 w-full bg-[color:var(--nav-bg)] shadow-lg shadow-black/20"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-12 w-48 object-contain"
              />
            </Link>

            <div className="hidden items-center gap-4 lg:flex">
              <Link
                to="/login"
                className="rounded-md px-5 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:opacity-90"
                style={{ backgroundColor: PRIMARY }}
              >
                {t.btn.login}
              </Link>

              <Link
                to="/register"
                className="rounded-md px-5 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:opacity-90"
                style={{ backgroundColor: SECONDARY }}
              >
                {t.btn.join}
              </Link>

              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen((p) => !p)}
                  className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] hover:opacity-90"
                  style={{ backgroundColor: PRIMARY }}
                  type="button"
                >
                  <img
                    src={activeLang.flag}
                    alt={activeLang.label}
                    className="h-5 w-5 rounded-sm object-cover"
                  />
                  <span>{t.langLabel}</span>
                  <ChevronDown
                    size={18}
                    className={`transition ${langOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-white/10 bg-[#0b1728] shadow-lg shadow-black/30"
                    >
                      {languages.map((lng) => (
                        <button
                          key={lng.key}
                          onClick={() => {
                            changeLanguage(lng.key);
                            setLangOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-sm text-white transition hover:bg-white/10 ${
                            language === lng.key ? "font-bold" : "font-medium"
                          }`}
                          type="button"
                        >
                          <img
                            src={lng.flag}
                            alt={lng.label}
                            className="h-5 w-5 rounded-sm object-cover"
                          />
                          {lng.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              className="text-white lg:hidden"
              aria-label="Open menu"
              type="button"
            >
              <FaBars size={22} />
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-[color:var(--nav-border)]" />
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setMobileOpen(false);
                setMobileLangOpen(false);
              }}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
              style={cssVars}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-[#07111f] shadow-2xl shadow-black/40 lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <Link
                  to="/"
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileLangOpen(false);
                  }}
                >
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-11 w-44 object-contain"
                  />
                </Link>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileLangOpen(false);
                  }}
                  className="text-white"
                  type="button"
                  aria-label="Close menu"
                >
                  <FaTimes size={22} />
                </button>
              </div>

              <div className="space-y-3 p-4">
                <div className="space-y-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-md px-5 py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    {t.btn.login}
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-md px-5 py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: SECONDARY }}
                  >
                    {t.btn.join}
                  </Link>
                </div>

                <div
                  className="border-t border-white/10 pt-4"
                  ref={mobileLangRef}
                >
                  <button
                    onClick={() => setMobileLangOpen((p) => !p)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: PRIMARY }}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={activeLang.flag}
                        alt={activeLang.label}
                        className="h-5 w-5 rounded-sm object-cover"
                      />
                      <span>{t.langLabel}</span>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`transition ${
                        mobileLangOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {mobileLangOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-2 w-full overflow-hidden rounded-md border border-white/10 bg-[#0b1728] shadow-lg shadow-black/30"
                      >
                        {languages.map((lng) => (
                          <button
                            key={lng.key}
                            onClick={() => {
                              changeLanguage(lng.key);
                              setMobileLangOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-sm text-white transition hover:bg-white/10 ${
                              language === lng.key ? "font-bold" : "font-medium"
                            }`}
                            type="button"
                          >
                            <img
                              src={lng.flag}
                              alt={lng.label}
                              className="h-5 w-5 rounded-sm object-cover"
                            />
                            {lng.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
};

export default Navber;
