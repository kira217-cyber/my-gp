import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { logout } from "../../features/auth/authSlice";
import { useLanguage } from "../../Context/LanguageProvider";

const InputField = ({ label, icon, placeholder, error, registration }) => {
  return (
    <div className="space-y-2">
      <label className="block text-[14px] font-extrabold text-[#1f5f98]">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-[#2f79c9]/15 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#2f79c9]/60">
        <span className="shrink-0 text-[#f07a2a]">{icon}</span>

        <input
          {...registration}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] font-semibold text-[#1f2937] placeholder:text-slate-400 outline-none"
        />
      </div>

      {error ? (
        <p className="text-[12px] font-semibold text-red-500">
          {error.message}
        </p>
      ) : null}
    </div>
  );
};

const PersonalInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isBangla } = useLanguage();

  const authUser = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState(null);
  

  const t = {
    title: isBangla ? "ব্যক্তিগত তথ্য" : "Personal Info",
    updateTitle: isBangla ? "তথ্য আপডেট করুন" : "Update Personal Information",
    updateNote: isBangla
      ? "তথ্য আপডেট করার পরে আপনাকে আবার লগইন করতে হবে।"
      : "After updating your info, you will be logged out and need to login again.",
    userId: isBangla ? "ইউজার আইডি" : "User ID",
    email: isBangla ? "ইমেইল" : "Email",
    phone: isBangla ? "ফোন" : "Phone",
    firstName: isBangla ? "ফার্স্ট নেম" : "First Name",
    lastName: isBangla ? "লাস্ট নেম" : "Last Name",
    referralCode: isBangla ? "রেফারেল কোড" : "Referral Code",
    referralNote: isBangla
      ? "আপনার রেফারেল কোড কপি করে শেয়ার করতে পারবেন।"
      : "You can copy and share your referral code.",
    copy: isBangla ? "কপি" : "Copy",
    copied: isBangla ? "কপি হয়েছে" : "Copied",
    update: isBangla ? "আপডেট করুন" : "Update Info",
    updating: isBangla ? "আপডেট হচ্ছে..." : "Updating...",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      userId: "",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(isBangla ? "আগে লগইন করুন" : "Please login first.");
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate, isBangla]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      try {
        setLoadingProfile(true);

        const res = await api.get("/api/users/me");
        const user = res?.data?.user || res?.data?.data;

        if (!res?.data?.success || !user) {
          toast.error(res?.data?.message || "Failed to load user info.");
          return;
        }

        setProfile(user);

        reset({
          userId: user.userId || "",
          email: user.email || "",
          phone: user.phone || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
        });
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load user info.",
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, reset]);

  const referralCode = profile?.referralCode || authUser?.referralCode || "";
  const referralLink = `${import.meta.env.VITE_CLIENT_URL}/register?ref=${referralCode || ""}`;

  const handleCopyReferralCode = async () => {
    if (!referralCode) {
      toast.error("Referral code not found.");
      return;
    }

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Referral code copied.");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Failed to copy referral code.");
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      userId: data.userId.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    };

    if (!payload.userId || !payload.phone) {
      toast.error("User ID and phone are required.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.put("/api/users/update-profile", payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "Profile updated successfully.");
        dispatch(logout());
        navigate("/login", { replace: true });
      } else {
        toast.error(res?.data?.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fc]">
        <div className="flex items-center gap-3 font-bold text-[#2f79c9]">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc]">
      <div className="sticky top-0 z-30 flex h-[66px] items-center justify-center bg-[#2f79c9] px-4 shadow-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>

        <h1 className="text-[22px] font-black text-white">{t.title}</h1>
      </div>

      <div className="mx-auto w-full max-w-[560px] px-3 pb-8 pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-[22px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
            <h2 className="text-[18px] font-black text-[#1f5f98]">
              {t.updateTitle}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {t.updateNote}
            </p>

            <div className="mt-5 space-y-4">
              <InputField
                label={t.userId}
                icon={<User size={18} />}
                placeholder="Enter your user ID"
                registration={register("userId", {
                  required: "User ID is required",
                  minLength: {
                    value: 4,
                    message: "User ID must be at least 4 characters",
                  },
                  maxLength: {
                    value: 15,
                    message: "User ID must be at most 15 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9]+$/,
                    message: "User ID can contain only letters and numbers",
                  },
                })}
                error={errors.userId}
              />

              <InputField
                label={t.email}
                icon={<Mail size={18} />}
                placeholder="Enter your email"
                registration={register("email", {
                  validate: (value) => {
                    if (!value) return true;
                    return (
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                      "Enter a valid email address"
                    );
                  },
                })}
                error={errors.email}
              />

              <InputField
                label={t.phone}
                icon={<Phone size={18} />}
                placeholder="Enter your phone number"
                registration={register("phone", {
                  required: "Phone number is required",
                  minLength: {
                    value: 6,
                    message: "Phone number is too short",
                  },
                })}
                error={errors.phone}
              />

              <InputField
                label={t.firstName}
                icon={<BadgeCheck size={18} />}
                placeholder="Enter your first name"
                registration={register("firstName")}
                error={errors.firstName}
              />

              <InputField
                label={t.lastName}
                icon={<BadgeCheck size={18} />}
                placeholder="Enter your last name"
                registration={register("lastName")}
                error={errors.lastName}
              />
            </div>
          </div>

          <div className="rounded-[22px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
            <h3 className="text-[17px] font-black text-[#1f5f98]">
              {t.referralCode}
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {t.referralNote}
            </p>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#2f79c9]/15 bg-[#f5f8fc] px-4 py-3">
              <p className="min-w-0 flex-1 break-all text-[12px] font-bold leading-tight text-[#f07a2a] sm:text-[13px]">
                {referralCode ? referralLink : "N/A"}
              </p>

              <button
                type="button"
                onClick={handleCopyReferralCode}
                className="inline-flex h-10 min-w-[88px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#f07a2a] px-3 text-sm font-black text-white"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t.copied : t.copy}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isDirty}
            className="flex h-[56px] w-full cursor-pointer items-center justify-center rounded-[18px] bg-[#f07a2a] text-[20px] font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t.updating}
              </span>
            ) : (
              t.update
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
