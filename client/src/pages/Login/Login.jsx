import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, ChevronDown, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Login = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [remember, setRemember] = useState(false);

  const [countries, setCountries] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const [selected, setSelected] = useState({
    name: "Bangladesh",
    code: "+880",
    cca2: "BD",
    flag: "https://flagcdn.com/w40/bd.png",
  });

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags",
        );
        const data = await res.json();

        const list = (Array.isArray(data) ? data : [])
          .map((c) => {
            const root = c?.idd?.root || "";
            const suffix = c?.idd?.suffixes?.[0] || "";
            const code = `${root}${suffix}`.trim();

            return {
              name: c?.name?.common || "",
              code,
              cca2: c?.cca2 || "",
              flag:
                c?.flags?.png ||
                `https://flagcdn.com/w40/${String(c?.cca2 || "").toLowerCase()}.png`,
            };
          })
          .filter((item) => item.name && item.code && item.cca2)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(list);

        const bd = list.find((item) => item.cca2 === "BD");
        if (bd) setSelected(bd);
      } catch (error) {
        console.error("Country fetch failed:", error);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;

    return countries.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.cca2.toLowerCase().includes(q),
    );
  }, [countries, search]);

  const text = {
    login: isBangla ? "লগইন" : "Login",
    register: isBangla ? "নিবন্ধন" : "Register",
    phonePlaceholder: isBangla ? "মোবাইল নম্বর" : "Mobile Number",
    pinPlaceholder: isBangla ? "লগইন পিন কোড" : "Login PIN Code",
    remember: isBangla ? "মনে রাখুন" : "Remember me",
    forgot: isBangla ? "পাসওয়ার্ড ভুলে গেছেন ?" : "Forgot password ?",
    loginBtn: isBangla ? "লগ ইন" : "Log In",
    noAccount: isBangla
      ? "এখনও কোন একাউন্ট নেই ?"
      : "Don’t have any account yet ?",
    searchCountry: isBangla ? "দেশ খুঁজুন..." : "Search country...",
  };

  const handleLogin = () => {
    console.log({
      countryCode: selected.code,
      phone,
      pin,
      remember,
    });
  };

  return (
    <div className="min-h-full bg-[#efefef] px-3 pt-28 pb-8">
      <div className="mx-auto w-full max-w-[360px]">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="https://i.ibb.co.com/ds4ckFjg/image-removebg-preview-3.png"
            alt="MyGP"
            className="w-[205px] object-contain"
          />
        </div>

        {/* Tabs */}
        <div className="mt-3 grid grid-cols-2 rounded-[4px] bg-[#2c84ea] p-[3px]">
          <button
            type="button"
            className="h-[34px] rounded-[4px] bg-[#225b95] text-white text-[16px] font-semibold cursor-pointer shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
          >
            {text.login}
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="h-[34px] rounded-[4px] bg-transparent text-white text-[16px] font-semibold cursor-pointer"
          >
            {text.register}
          </button>
        </div>

        {/* Country + phone */}
        <div className="mt-5">
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-0">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex h-[32px] items-center gap-1 rounded-l-[3px] border border-[#c9c9c9] bg-white px-2 cursor-pointer"
              >
                <img
                  src={selected.flag}
                  alt={selected.name}
                  className="h-[14px] w-[22px] object-cover border border-[#d5d5d5]"
                />
                <ChevronDown className="h-3.5 w-3.5 text-[#1c5d98]" />
              </button>

              <div className="flex h-[32px] items-center rounded-r-[3px] border border-l-0 border-[#c9c9c9] bg-white px-2 text-[15px] font-semibold text-[#1d5d99]">
                {selected.code}
              </div>
            </div>

            {dropdownOpen && (
              <div className="absolute left-0 top-[38px] z-30 w-[260px] rounded-md border border-[#d8d8d8] bg-white shadow-lg">
                <div className="border-b border-[#ececec] p-2">
                  <div className="flex items-center gap-2 rounded-md border border-[#d7dce2] px-2">
                    <Search className="h-4 w-4 text-[#6a7a8d]" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={text.searchCountry}
                      className="h-9 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="max-h-[240px] overflow-y-auto">
                  {filteredCountries.map((item) => (
                    <button
                      key={`${item.cca2}-${item.code}`}
                      type="button"
                      onClick={() => {
                        setSelected(item);
                        setDropdownOpen(false);
                        setSearch("");
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#f5f8fc] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={item.flag}
                          alt={item.name}
                          className="h-[14px] w-[22px] object-cover border border-[#d5d5d5]"
                        />
                        <span className="text-sm text-[#1b365d]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#1d5d99]">
                        {item.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder={text.phonePlaceholder}
            className="mt-2 h-[38px] w-full border-b-2 border-[#c7d8eb] bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-transparent"
          />
        </div>

        {/* PIN */}
        <div className="mt-7">
          <div className="flex items-center border-b-2 border-[#c7d8eb]">
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={text.pinPlaceholder}
              className="h-[38px] w-full bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
            />

            <button
              type="button"
              onClick={() => setShowPin((prev) => !prev)}
              className="ml-2 flex h-8 w-8 items-center justify-center cursor-pointer text-black"
            >
              {showPin ? (
                <EyeOff className="h-5 w-5 stroke-[2.2]" />
              ) : (
                <Eye className="h-5 w-5 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="mt-4 flex items-center justify-between border-b-2 border-[#c7d8eb] pb-3">
          <label className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1d5d99] cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-[18px] w-[18px] cursor-pointer accent-[#1d5d99]"
            />
            <span>{text.remember}</span>
          </label>

          <button
            type="button"
            className="text-[14px] font-semibold text-[#1d5d99] cursor-pointer"
          >
            {text.forgot}
          </button>
        </div>

        {/* Login Button */}
        <button
          type="button"
          onClick={handleLogin}
          className="mt-5 h-[52px] w-full rounded-full bg-[#1f5f98] text-[18px] font-bold text-white cursor-pointer"
        >
          {text.loginBtn}
        </button>

        {/* Bottom Register */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[14px] font-semibold text-[#1d5d99]">
          <span>{text.noAccount}</span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="rounded-full bg-[#1f5f98] px-3 py-[3px] text-white cursor-pointer"
          >
            {text.register}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
