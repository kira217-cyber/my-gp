import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, ChevronDown, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { userRegister } from "../../features/auth/authAPI";
import { setCredentials } from "../../features/auth/authSlice";
import logo from "../../assets/logo.png";
import axios from "axios";

const OTP_API_KEY =
  "120e4fde880e1bfd2d98732ae5551b1d3f9118d38d3695fd056642059a6d44cc";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isBangla } = useLanguage();
  const [searchParams] = useSearchParams();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [refCode, setRefCode] = useState("");

  const [otpInput, setOtpInput] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRefCode, setShowRefCode] = useState(true);

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
    const queryRef = String(searchParams.get("ref") || "")
      .trim()
      .toUpperCase();

    if (queryRef) setRefCode(queryRef);
  }, [searchParams]);

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

  useEffect(() => {
    if (!otpExpiresAt) {
      setCountdown(0);
      return;
    }

    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000));
      setCountdown(left);

      if (left <= 0) {
        setServerOtp("");
        setOtpExpiresAt(0);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [otpExpiresAt]);

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
    phonePlaceholder: isBangla ? " " : " ",
    passwordPlaceholder: isBangla ? "পিন কোড" : "Pin Code",
    confirmPasswordPlaceholder: isBangla
      ? "পিন কোড নিশ্চিত করুন"
      : "Confirm Pin Code",
    refCodePlaceholder: isBangla
      ? "রেফারেল কোড (ঐচ্ছিক)"
      : "Referral Code (Optional)",
    otpPlaceholder: isBangla ? "OTP কোড লিখুন" : "Enter OTP Code",
    sendOtp: isBangla ? "OTP পাঠান" : "Send OTP",
    resendOtp: isBangla ? "আবার পাঠান" : "Resend OTP",
    registerBtn: isBangla ? "নিবন্ধন" : "Register",
    haveAccount: isBangla
      ? "ইতোমধ্যে একটি একাউন্ট আছে ?"
      : "Already have an account ?",
    searchCountry: isBangla ? "দেশ খুঁজুন..." : "Search country...",
  };

  const fullPhoneNumber = useMemo(() => {
    const code = String(selected.code || "").replace(/\D/g, "");
    const num = String(phone || "").replace(/\D/g, "");
    return `${code}${num}`;
  }, [selected.code, phone]);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast.error(isBangla ? "মোবাইল নম্বর দিন" : "Enter mobile number");
      return;
    }

    try {
      setOtpSending(true);

      // আগের OTP reset
      setServerOtp("");
      setOtpInput("");
      setOtpExpiresAt(0);

      const { data } = await axios.post(
        "https://api.o-sms.com/api/service/send-otp",
        {
          phoneNumber: fullPhoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${OTP_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!data?.success || !data?.otp) {
        throw new Error(data?.message || "OTP send failed");
      }

      setServerOtp(String(data.otp));
      setOtpExpiresAt(Date.now() + 30 * 1000);
      setCountdown(30);

      toast.success(
        isBangla ? "OTP সফলভাবে পাঠানো হয়েছে" : "OTP sent successfully",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "OTP send failed",
      );
    } finally {
      setOtpSending(false);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: userRegister,
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success(data?.message || "Registration successful");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Register failed",
      );
    },
  });

  const handleRegister = () => {
    if (!phone.trim()) {
      toast.error(isBangla ? "মোবাইল নম্বর দিন" : "Enter mobile number");
      return;
    }

    if (!serverOtp || !otpExpiresAt || Date.now() > otpExpiresAt) {
      toast.error(
        isBangla
          ? "OTP মেয়াদ শেষ। আবার OTP পাঠান"
          : "OTP expired. Send OTP again",
      );
      return;
    }

    if (String(otpInput).trim() !== String(serverOtp).trim()) {
      toast.error(isBangla ? "OTP সঠিক নয়" : "Invalid OTP");
      return;
    }

    if (!password.trim()) {
      toast.error(isBangla ? "পিন কোড দিন" : "Enter pin code");
      return;
    }

    if (!confirmPassword.trim()) {
      toast.error(isBangla ? "কনফার্ম পিন কোড দিন" : "Enter confirm pin code");
      return;
    }

    const payload = {
      countryCode: selected.code,
      phone: phone.trim(),
      password,
      confirmPassword,
      refCode: refCode.trim().toUpperCase(),
    };

    mutate(payload);
  };

  return (
    <div className="min-h-full bg-white px-3 pt-22 pb-8">
      <div className="mx-auto w-full max-w-[360px]">
        <div className="flex justify-center">
          <img className="h-20" src={logo} alt="" />
        </div>

        <div className="mt-3 grid grid-cols-2 rounded-[4px] bg-[#2c84ea] p-[3px]">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="h-[34px] rounded-[4px] bg-transparent text-white text-[16px] font-semibold cursor-pointer"
          >
            {text.login}
          </button>

          <button
            type="button"
            className="h-[34px] rounded-[4px] bg-[#225b95] text-white text-[16px] font-semibold cursor-pointer shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
          >
            {text.register}
          </button>
        </div>

        <div className="mt-5">
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex h-[38px] items-center gap-1 rounded-l-[3px] border-b-2 border-[#c7d8eb] bg-white px-2 cursor-pointer"
              >
                <img
                  src={selected.flag}
                  alt={selected.name}
                  className="h-[14px] w-[22px] object-cover border border-[#d5d5d5]"
                />
                <ChevronDown className="h-3.5 w-3.5 text-[#1c5d98]" />
              </button>

              <div className="flex h-[38px] items-center border-b-2 border-[#c7d8eb] bg-white px-2 text-[15px] font-semibold text-[#1d5d99]">
                {selected.code}
              </div>

              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  setServerOtp("");
                  setOtpInput("");
                  setOtpExpiresAt(0);
                }}
                placeholder={text.phonePlaceholder}
                className="h-[38px] min-w-0 flex-1 rounded-r-[3px] border-b-2 border-[#c7d8eb] bg-transparent px-2 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
              />
            </div>

            {dropdownOpen && (
              <div className="absolute left-0 top-[44px] z-30 w-[260px] rounded-md border border-[#d8d8d8] bg-white shadow-lg">
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
                        setServerOtp("");
                        setOtpInput("");
                        setOtpExpiresAt(0);
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
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpSending}
            className="h-[42px] w-full rounded-full bg-[#2c84ea] text-[15px] font-bold text-white cursor-pointer disabled:opacity-70"
          >
            {otpSending
              ? isBangla
                ? "পাঠানো হচ্ছে..."
                : "Sending..."
              : countdown > 0
                ? `${text.resendOtp} (${countdown}s)`
                : serverOtp
                  ? text.resendOtp
                  : text.sendOtp}
          </button>

          <div className="mt-4 flex items-center border-b-2 border-[#c7d8eb]">
            <input
              type="tel"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
              placeholder={text.otpPlaceholder}
              className="h-[38px] w-full bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center border-b-2 border-[#c7d8eb]">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={text.passwordPlaceholder}
              className="h-[38px] w-full bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="ml-2 flex h-8 w-8 items-center justify-center cursor-pointer text-black"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 stroke-[2.2]" />
              ) : (
                <Eye className="h-5 w-5 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center border-b-2 border-[#c7d8eb]">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={text.confirmPasswordPlaceholder}
              className="h-[38px] w-full bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="ml-2 flex h-8 w-8 items-center justify-center cursor-pointer text-black"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 stroke-[2.2]" />
              ) : (
                <Eye className="h-5 w-5 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center border-b-2 border-[#c7d8eb]">
            <input
              type={showRefCode ? "text" : "password"}
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              placeholder={text.refCodePlaceholder}
              className="h-[38px] w-full bg-transparent px-0 text-[18px] text-[#1d5d99] outline-none placeholder:text-[#1d5d99] placeholder:font-semibold"
            />

            <button
              type="button"
              onClick={() => setShowRefCode((prev) => !prev)}
              className="ml-2 flex h-8 w-8 items-center justify-center cursor-pointer text-black"
            >
              {showRefCode ? (
                <EyeOff className="h-5 w-5 stroke-[2.2]" />
              ) : (
                <Eye className="h-5 w-5 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={isPending}
          className="mt-7 h-[52px] w-full rounded-full bg-[#1f5f98] text-[18px] font-bold text-white cursor-pointer disabled:opacity-70"
        >
          {isPending
            ? isBangla
              ? "লোড হচ্ছে..."
              : "Loading..."
            : text.registerBtn}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-[14px] font-semibold text-[#1d5d99]">
          <span>{text.haveAccount}</span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-full bg-[#1f5f98] px-3 py-[3px] text-white cursor-pointer"
          >
            {text.login}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
