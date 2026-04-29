import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaGlobe,
  FaSave,
  FaSyncAlt,
} from "react-icons/fa";
import { ChevronDown, Search, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../api/axios";
import { selectAuth, selectUser } from "../../features/auth/authSelectors";
import { setCredentials } from "../../features/auth/authSlice";

const cardBase =
  "rounded-3xl border border-blue-200/15 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30 overflow-hidden";

const inputBase =
  "w-full h-12 rounded-2xl border border-blue-200/15 bg-black/45 px-4 text-sm text-white placeholder-blue-100/35 outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee] transition";

const labelCls = "mb-2 block text-sm font-semibold text-blue-100/85";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white border border-blue-300/20 shadow-lg shadow-blue-800/20 hover:from-[#7bb7f1] hover:to-[#3b88db] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-black/35 text-blue-100 border border-blue-200/15 hover:bg-black/55 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+880",
  phone: "",
  currency: "BDT",
  password: "",
  confirmPassword: "",
};

const SuperProfile = () => {
  const dispatch = useDispatch();

  const auth = useSelector(selectAuth);
  const token = auth?.token;
  const me = useSelector(selectUser);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [originalProfile, setOriginalProfile] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [countries, setCountries] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const [selectedCountry, setSelectedCountry] = useState({
    name: "Bangladesh",
    code: "+880",
    cca2: "BD",
    flag: "https://flagcdn.com/w40/bd.png",
  });

  const setVal = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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

        const currentCode =
          form.countryCode ||
          me?.countryCode ||
          originalProfile?.countryCode ||
          "+880";

        const matched =
          list.find((item) => item.code === currentCode) ||
          list.find((item) => item.cca2 === "BD");

        if (matched) setSelectedCountry(matched);
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

  const loadProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get("/api/super-affiliate/profile", {
        headers,
      });

      const user = data?.user || data?.data || null;

      if (!user) {
        throw new Error("Profile not found");
      }

      const nextForm = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        countryCode: user.countryCode || "+880",
        phone: user.phone || "",
        currency: user.currency || "BDT",
        password: "",
        confirmPassword: "",
      };

      setOriginalProfile(user);
      setForm(nextForm);

      if (countries.length) {
        const matched =
          countries.find((item) => item.code === nextForm.countryCode) ||
          countries.find((item) => item.cca2 === "BD");

        if (matched) setSelectedCountry(matched);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token, countries.length]);

  const validateForm = () => {
    if (!form.firstName.trim()) return "First name is required";
    if (!form.lastName.trim()) return "Last name is required";

    if (form.email.trim()) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
      if (!ok) return "Enter a valid email address";
    }

    if (!form.countryCode.trim()) return "Country code is required";

    if (!/^\+\d{1,5}$/.test(form.countryCode.trim())) {
      return "Invalid country code";
    }

    if (!form.phone.trim()) return "Phone number is required";

    if (!/^\d{6,15}$/.test(form.phone.trim())) {
      return "Invalid phone number";
    }

    if (!["BDT", "USDT"].includes(String(form.currency || "").toUpperCase())) {
      return "Invalid currency";
    }

    if (form.password.trim()) {
      if (form.password.trim().length < 4) {
        return "Password must be at least 4 characters";
      }

      if (form.password !== form.confirmPassword) {
        return "Confirm password does not match";
      }
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        countryCode: form.countryCode.trim(),
        phone: form.phone.replace(/\D/g, ""),
        currency: String(form.currency || "BDT").toUpperCase(),
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const { data } = await api.put("/api/super-affiliate/profile", payload, {
        headers,
      });

      const updatedUser = data?.user;

      toast.success(data?.message || "Profile updated successfully");

      if (updatedUser && token) {
        dispatch(
          setCredentials({
            user: updatedUser,
            token,
          }),
        );
      }

      setOriginalProfile(updatedUser || originalProfile);

      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!originalProfile) return;

    const nextForm = {
      firstName: originalProfile.firstName || "",
      lastName: originalProfile.lastName || "",
      email: originalProfile.email || "",
      countryCode: originalProfile.countryCode || "+880",
      phone: originalProfile.phone || "",
      currency: originalProfile.currency || "BDT",
      password: "",
      confirmPassword: "",
    };

    setForm(nextForm);

    const matched =
      countries.find((item) => item.code === nextForm.countryCode) ||
      countries.find((item) => item.cca2 === "BD");

    if (matched) setSelectedCountry(matched);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className={cardBase}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/45 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-300/20 bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-800/20">
                  <FaUser className="text-2xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Super Profile
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/75">
                    Update your super affiliate account information
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className={btnSecondary}
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loading}
                  className={btnPrimary}
                >
                  {saving ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-blue-100/70">
              Loading profile...
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-3xl border border-blue-200/10 bg-black/25 p-5 xl:col-span-2">
                  <h2 className="mb-5 text-lg font-bold text-[#a8d1fb]">
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>First Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.firstName}
                          onChange={(e) => setVal("firstName", e.target.value)}
                          placeholder="First name"
                          className={`${inputBase} pl-11`}
                        />
                        <FaUser className="absolute top-1/2 left-4 -translate-y-1/2 text-[#8fc2f5]" />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Last Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.lastName}
                          onChange={(e) => setVal("lastName", e.target.value)}
                          placeholder="Last name"
                          className={`${inputBase} pl-11`}
                        />
                        <FaUser className="absolute top-1/2 left-4 -translate-y-1/2 text-[#8fc2f5]" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelCls}>Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setVal("email", e.target.value)}
                          placeholder="Email address"
                          className={`${inputBase} pl-11`}
                        />
                        <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-[#8fc2f5]" />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Country Code</label>

                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen((prev) => !prev)}
                          className="flex h-12 w-full cursor-pointer items-center justify-between rounded-2xl border border-blue-200/15 bg-black/45 px-4 text-white"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={selectedCountry.flag}
                              alt={selectedCountry.name}
                              className="h-[18px] w-[28px] border border-blue-200/20 object-cover"
                            />
                            <span className="text-sm font-semibold">
                              {selectedCountry.code}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 text-[#8fc2f5]" />
                        </button>

                        {dropdownOpen && (
                          <div className="absolute top-[56px] left-0 z-50 w-full overflow-hidden rounded-2xl border border-blue-200/15 bg-[#07101d] shadow-2xl">
                            <div className="border-b border-blue-200/10 p-3">
                              <div className="flex items-center gap-2 rounded-xl border border-blue-200/10 bg-black/30 px-3">
                                <Search className="h-4 w-4 text-[#8fc2f5]" />
                                <input
                                  type="text"
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  placeholder="Search country..."
                                  className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-blue-100/35"
                                />
                              </div>
                            </div>

                            <div className="max-h-[260px] overflow-y-auto">
                              {filteredCountries.map((item) => (
                                <button
                                  key={`${item.cca2}-${item.code}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(item);
                                    setVal("countryCode", item.code);
                                    setDropdownOpen(false);
                                    setSearch("");
                                  }}
                                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition hover:bg-white/5"
                                >
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={item.flag}
                                      alt={item.name}
                                      className="h-[16px] w-[26px] border border-blue-200/20 object-cover"
                                    />
                                    <span className="text-sm text-white">
                                      {item.name}
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold text-[#8fc2f5]">
                                    {item.code}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Phone Number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            setVal("phone", e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Phone number"
                          className={`${inputBase} pl-11`}
                        />
                        <FaPhoneAlt className="absolute top-1/2 left-4 -translate-y-1/2 text-[#8fc2f5]" />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Currency</label>
                      <div className="relative">
                        <select
                          value={form.currency}
                          onChange={(e) => setVal("currency", e.target.value)}
                          className={`${inputBase} cursor-pointer appearance-none pl-11`}
                        >
                          <option value="BDT">BDT</option>
                          <option value="USDT">USDT</option>
                        </select>
                        <FaGlobe className="absolute top-1/2 left-4 -translate-y-1/2 text-[#8fc2f5]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-blue-200/10 bg-black/25 p-5">
                  <h2 className="mb-5 text-lg font-bold text-[#a8d1fb]">
                    Security
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => setVal("password", e.target.value)}
                          placeholder="Leave blank if unchanged"
                          className={`${inputBase} pr-12 pl-11`}
                        />
                        <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-[#8fc2f5]" />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#8fc2f5]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={(e) =>
                            setVal("confirmPassword", e.target.value)
                          }
                          placeholder="Re-enter password"
                          className={`${inputBase} pr-12 pl-11`}
                        />
                        <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-[#8fc2f5]" />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#8fc2f5]"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-200/10 bg-black/20 p-4">
                      <div className="text-sm font-bold text-white">
                        Account Summary
                      </div>

                      <div className="mt-3 space-y-2 text-sm text-blue-100/75">
                        <div>
                          User ID:{" "}
                          <span className="font-bold text-white">
                            {originalProfile?.userId || me?.userId || "—"}
                          </span>
                        </div>

                        <div>
                          Referral Code:{" "}
                          <span className="font-bold text-white">
                            {originalProfile?.referralCode ||
                              me?.referralCode ||
                              "—"}
                          </span>
                        </div>

                        <div>
                          Balance:{" "}
                          <span className="font-bold text-white">
                            {Number(
                              originalProfile?.balance || me?.balance || 0,
                            )}
                          </span>
                        </div>

                        <div>
                          Role:{" "}
                          <span className="font-bold text-white">
                            {originalProfile?.role ||
                              me?.role ||
                              "super-aff-user"}
                          </span>
                        </div>

                        <div>
                          Affiliate Count:{" "}
                          <span className="font-bold text-white">
                            {Number(
                              originalProfile?.referralCount ||
                                me?.referralCount ||
                                0,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className={`w-full ${btnPrimary}`}
                    >
                      {saving ? (
                        <FaSyncAlt className="animate-spin" />
                      ) : (
                        <FaSave />
                      )}
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperProfile;
