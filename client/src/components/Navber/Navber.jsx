import React, { useState, useRef, useEffect } from "react";
import { Menu, Bell } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { Link } from "react-router";
import { api } from "../../api/axios";

const APP_URL =
  import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "";

const makeUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${APP_URL}${url}`;
};

const Navber = ({ setOpen }) => {
  const { language, changeLanguage } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [logo, setLogo] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await api.get("/api/site-identity");
        const data = res?.data?.data;
        setLogo(data?.logo || "");
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    };

    fetchLogo();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative z-30 flex h-[50px] w-full items-center justify-between bg-[#2f79c9] px-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-white cursor-pointer"
        >
          <Menu size={26} strokeWidth={2.5} />
        </button>

        <Link to="/">
          <img
            src={
              logo
                ? makeUrl(logo)
                : " "
            }
            alt="logo"
            className="h-[42px] object-contain"
          />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="text-[#ff7a21] cursor-pointer">
          <Bell size={26} strokeWidth={2.4} fill="#ff7a21" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => !prev)}
            className="flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full cursor-pointer"
          >
            {language === "Bangla" ? (
              <img
                src="https://flagcdn.com/w40/bd.png"
                alt="Bangla"
                className="h-[32px] w-[32px] rounded-full object-cover"
              />
            ) : (
              <img
                src="https://flagcdn.com/w40/us.png"
                alt="English"
                className="h-[32px] w-[32px] rounded-full object-cover"
              />
            )}
          </button>

          {openDropdown && (
            <div className="absolute right-0 top-[48px] z-40 w-[150px] rounded-md border bg-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  changeLanguage("Bangla");
                  setOpenDropdown(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 cursor-pointer"
              >
                <img
                  src="https://flagcdn.com/w40/bd.png"
                  alt="BD"
                  className="h-4 w-5 object-cover"
                />
                <span className="text-sm font-medium">বাংলা</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  changeLanguage("English");
                  setOpenDropdown(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 cursor-pointer"
              >
                <img
                  src="https://flagcdn.com/w40/us.png"
                  alt="US"
                  className="h-4 w-5 object-cover"
                />
                <span className="text-sm font-medium">English</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navber;
