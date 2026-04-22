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

  return (
    <div className="min-h-screen bg-[#efefef] px-3 pt-20 pb-8">
      <div className="mx-auto w-full max-w-[360px]">
        <div className="flex justify-center">
          <img
            src="https://i.ibb.co.com/Xxf8k1SR/image-removebg-preview-5.png"
            alt="logo"
            className="w-[205px] object-contain"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 rounded-[4px] bg-[#2c84ea] p-[3px]">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="h-[34px] rounded-[4px] bg-transparent text-white text-[16px] font-semibold cursor-pointer"
          >
            Login
          </button>

          <button
            type="button"
            className="h-[34px] rounded-[4px] bg-[#225b95] text-white text-[16px] font-semibold cursor-pointer shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
          >
            Register
          </button>
        </div>

        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          className="mt-5 h-[38px] w-full border-b-2 border-[#c7d8eb] bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
        />

        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          className="mt-5 h-[38px] w-full border-b-2 border-[#c7d8eb] bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
        />

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
                      placeholder="Search country..."
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
            placeholder="Mobile Number"
            className="mt-2 h-[38px] w-full border-b-2 border-[#c7d8eb] bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
          />
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mt-5 h-[38px] w-full border-b-2 border-[#c7d8eb] bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
        />

        <div className="mt-5 flex items-center border-b-2 border-[#c7d8eb]">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-[38px] w-full bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="ml-2 flex h-8 w-8 items-center justify-center cursor-pointer text-black"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mt-5 flex items-center border-b-2 border-[#c7d8eb]">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="h-[38px] w-full bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="ml-2 flex h-8 w-8 items-center justify-center cursor-pointer text-black"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 border-b-2 border-[#c7d8eb]">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, ""))
            }
            placeholder="Verification Code"
            className="h-[38px] w-full bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
          />
          <div className="min-w-[70px] text-center rounded bg-[#1f5f98] px-2 py-1 text-white font-bold text-sm">
            {generatedCode}
          </div>
          <button
            type="button"
            onClick={() => {
              setGeneratedCode(generateVerificationCode());
              setVerificationCode("");
            }}
            className="cursor-pointer text-[#1f5f98]"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={isPending}
          className="mt-7 h-[52px] w-full rounded-full bg-[#1f5f98] text-[18px] font-bold text-white cursor-pointer disabled:opacity-70"
        >
          {isPending ? "Loading..." : "Register"}
        </button>
      </div>
    </div>
  );
};

export default Register;
