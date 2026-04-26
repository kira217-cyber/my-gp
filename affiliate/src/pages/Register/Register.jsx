import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, ChevronDown, Search, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { affiliateRegister } from "../../features/auth/authAPI";

const generateVerificationCode = () =>
  String(Math.floor(1000 + Math.random() * 9000));

const Register = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState(
    generateVerificationCode(),
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [countries, setCountries] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  const logoUrl = "https://i.ibb.co.com/Xxf8k1SR/image-removebg-preview-5.png";

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
                `https://flagcdn.com/w40/${String(
                  c?.cca2 || "",
                ).toLowerCase()}.png`,
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

  const { mutate, isPending } = useMutation({
    mutationFn: affiliateRegister,
    onSuccess: (data) => {
      toast.success(
        data?.message ||
          "Registration successful. Please wait for admin approval.",
      );
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Register failed",
      );
      setGeneratedCode(generateVerificationCode());
      setVerificationCode("");
    },
  });

  const handleRegister = () => {
    if (!firstName.trim()) return toast.error("First name is required");
    if (!lastName.trim()) return toast.error("Last name is required");
    if (!phone.trim()) return toast.error("Phone number is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!password.trim()) return toast.error("Password is required");
    if (!confirmPassword.trim())
      return toast.error("Confirm password is required");
    if (!verificationCode.trim())
      return toast.error("Verification code is required");

    if (verificationCode !== generatedCode) {
      toast.error("Verification code does not match");
      return;
    }

    mutate({
      firstName,
      lastName,
      countryCode: selected.code,
      phone,
      email,
      password,
      confirmPassword,
      verificationCode,
    });
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 text-[15px] font-semibold text-white outline-none transition placeholder:text-slate-400 focus:border-[#2f79c9] focus:bg-white/[0.09] focus:ring-2 focus:ring-[#2f79c9]/20";

  return (
    <div className="min-h-screen bg-[#07111f] px-3 pt-20 pb-10 text-white">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="rounded-3xl border border-white/10 bg-[#0b1728] p-5 shadow-2xl shadow-black/40 sm:p-6">
          <div className="flex justify-center">
            <img
              src={logoUrl}
              alt="logo"
              className="w-[210px] object-contain"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.05] p-1">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="h-11 cursor-pointer rounded-xl text-[15px] font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Login
            </button>

            <button
              type="button"
              className="h-11 cursor-pointer rounded-xl text-[15px] font-bold text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
              }}
            >
              Register
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className={inputClass}
            />

            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className={inputClass}
            />
          </div>

          <div className="mt-4">
            <div className="relative" ref={dropdownRef}>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex h-12 min-w-[92px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 transition hover:bg-white/[0.09]"
                >
                  <img
                    src={selected.flag}
                    alt={selected.name}
                    className="h-[16px] w-[24px] rounded-sm border border-white/20 object-cover"
                  />
                  <ChevronDown className="h-4 w-4 text-white" />
                </button>

                <div className="flex h-12 min-w-[82px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-3 text-[15px] font-bold text-white">
                  {selected.code}
                </div>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Mobile Number"
                  className={inputClass}
                />
              </div>

              {dropdownOpen && (
                <div className="absolute left-0 top-[58px] z-30 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#101f35] shadow-2xl shadow-black/40">
                  <div className="border-b border-white/10 p-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3">
                      <Search className="h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search country..."
                        className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
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
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left transition hover:bg-white/10"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={item.flag}
                            alt={item.name}
                            className="h-[15px] w-[24px] rounded-sm border border-white/20 object-cover"
                          />
                          <span className="text-sm text-slate-200">
                            {item.name}
                          </span>
                        </div>

                        <span
                          className="text-sm font-bold"
                          style={{ color: SECONDARY }}
                        >
                          {item.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`${inputClass} mt-4`}
          />

          <div className="mt-4 flex items-center rounded-xl border border-white/10 bg-white/[0.06] pr-2 transition focus-within:border-[#2f79c9] focus-within:bg-white/[0.09] focus-within:ring-2 focus-within:ring-[#2f79c9]/20">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 w-full bg-transparent px-4 text-[15px] font-semibold text-white outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="flex h-9 cursor-pointer w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center rounded-xl border border-white/10 bg-white/[0.06] pr-2 transition focus-within:border-[#2f79c9] focus-within:bg-white/[0.09] focus-within:ring-2 focus-within:ring-[#2f79c9]/20">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="h-12 w-full bg-transparent px-4 text-[15px] font-semibold text-white outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="flex h-9 cursor-pointer w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 transition focus-within:border-[#2f79c9] focus-within:bg-white/[0.09] focus-within:ring-2 focus-within:ring-[#2f79c9]/20">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Verification Code"
              className="h-12 w-full bg-transparent text-[15px] font-semibold text-white outline-none placeholder:text-slate-400"
            />

            <div
              className="min-w-[76px] rounded-lg px-3 py-1.5 text-center text-sm font-extrabold text-white shadow"
              style={{ backgroundColor: SECONDARY }}
            >
              {generatedCode}
            </div>

            <button
              type="button"
              onClick={() => {
                setGeneratedCode(generateVerificationCode());
                setVerificationCode("");
              }}
              className="flex h-9 cursor-pointer w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRegister}
            disabled={isPending}
            className="mt-7 h-13 cursor-pointer w-full rounded-full text-[17px] font-extrabold text-white shadow-lg transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
            }}
          >
            {isPending ? "Loading..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
