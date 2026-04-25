import React, { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
import { logout } from "../../features/auth/authSlice";

const FieldRow = ({
  label,
  placeholder,
  type = "password",
  show,
  setShow,
  registration,
  error,
  autoComplete = "off",
}) => {
  return (
    <div className="grid grid-cols-[105px_1fr_34px] items-center gap-3 border-b border-[#2f79c9]/10 bg-white px-4 py-4 last:border-b-0 sm:grid-cols-[135px_1fr_40px]">
      <label className="text-[13px] font-extrabold leading-tight text-[#1f5f98] sm:text-[15px]">
        {label}
      </label>

      <div className="min-w-0">
        <input
          type={show ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-[15px] font-semibold text-[#1f2937] placeholder:text-slate-400 outline-none"
          {...registration}
        />

        {error ? (
          <p className="mt-1 text-[11px] font-semibold text-red-500">
            {error.message}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#2f79c9]/10 text-[#2f79c9]"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isBangla } = useLanguage();

  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const t = {
    title: isBangla ? "পাসওয়ার্ড রিসেট" : "Reset Password",
    current: isBangla ? "বর্তমান পাসওয়ার্ড" : "Current Password",
    new: isBangla ? "নতুন পাসওয়ার্ড" : "New Password",
    confirmNew: isBangla ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password",
    currentPlaceholder: isBangla ? "বর্তমান পাসওয়ার্ড" : "Current password",
    newPlaceholder: isBangla ? "নতুন পাসওয়ার্ড" : "New password",
    confirmPlaceholder: isBangla
      ? "নতুন পাসওয়ার্ড আবার লিখুন"
      : "Confirm new password",
    requirements: isBangla ? "পাসওয়ার্ড শর্তাবলী" : "Password Requirements",
    length: isBangla
      ? "পাসওয়ার্ড ৮-২০ অক্ষরের হতে হবে"
      : "Must be 8-20 characters in length",
    uppercase: isBangla
      ? "কমপক্ষে ১টি বড় হাতের অক্ষর থাকতে হবে"
      : "Must contain at least 1 uppercase letter",
    lowercase: isBangla
      ? "কমপক্ষে ১টি ছোট হাতের অক্ষর থাকতে হবে"
      : "Must contain at least 1 lowercase letter",
    number: isBangla
      ? "কমপক্ষে ১টি সংখ্যা থাকতে হবে"
      : "Must contain at least 1 number",
    special: isBangla
      ? "কমপক্ষে ১টি special character থাকতে হবে"
      : "Must contain at least 1 special character",
    confirm: isBangla ? "কনফার্ম" : "Confirm",
    confirming: isBangla ? "কনফার্ম হচ্ছে..." : "Confirming...",
    matched: isBangla ? "পাসওয়ার্ড মিলেছে।" : "Passwords matched.",
    notMatched: isBangla ? "পাসওয়ার্ড মিলেনি।" : "Passwords do not match.",
    success: isBangla
      ? "পাসওয়ার্ড পরিবর্তন হয়েছে। আবার লগইন করুন।"
      : "Password changed successfully. Please login again.",
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    mode: "onChange",
  });

  const currentPassword = watch("currentPassword");
  const newPassword = watch("newPassword");
  const confirmNewPassword = watch("confirmNewPassword");

  const passwordChecks = useMemo(() => {
    const value = newPassword || "";

    return {
      length: value.length >= 8 && value.length <= 20,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
    };
  }, [newPassword]);

  const isPasswordStrong = useMemo(
    () => Object.values(passwordChecks).every(Boolean),
    [passwordChecks],
  );

  const onSubmit = async (data) => {
    if (data.currentPassword === data.newPassword) {
      toast.error("New password must be different from current password.");
      return;
    }

    if (!isPasswordStrong) {
      toast.error("Please follow all password requirements.");
      return;
    }

    if (data.newPassword !== data.confirmNewPassword) {
      toast.error(t.notMatched);
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.put("/api/users/reset-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });

      if (res?.data?.success) {
        reset();
        dispatch(logout());
        toast.success(res?.data?.message || t.success);
        navigate("/login", { replace: true });
      } else {
        toast.error(res?.data?.message || "Failed to change password.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const CheckItem = ({ active, children }) => (
    <li
      className={`font-semibold transition ${
        active ? "text-[#f07a2a]" : "text-slate-600"
      }`}
    >
      {children}
    </li>
  );

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#1f2937]">
      <div className="sticky top-0 z-30 flex h-[66px] items-center justify-center bg-[#2f79c9] px-4 shadow-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>

        <h1 className="text-[22px] font-black text-white sm:text-[25px]">
          {t.title}
        </h1>
      </div>

      <div className="mx-auto w-full max-w-[520px] px-3 pb-6 pt-4 sm:px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="overflow-hidden rounded-[18px] border border-[#2f79c9]/15 bg-white shadow-sm">
            <FieldRow
              label={t.current}
              placeholder={t.currentPlaceholder}
              show={showCurrent}
              setShow={setShowCurrent}
              registration={register("currentPassword", {
                required: "Current password is required",
              })}
              error={errors.currentPassword}
              autoComplete="current-password"
            />

            <FieldRow
              label={t.new}
              placeholder={t.newPlaceholder}
              show={showNew}
              setShow={setShowNew}
              registration={register("newPassword", {
                required: "New password is required",
              })}
              error={errors.newPassword}
              autoComplete="new-password"
            />

            <FieldRow
              label={t.confirmNew}
              placeholder={t.confirmPlaceholder}
              show={showConfirm}
              setShow={setShowConfirm}
              registration={register("confirmNewPassword", {
                required: "Please confirm your new password",
                validate: (value) => value === newPassword || t.notMatched,
              })}
              error={errors.confirmNewPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="rounded-[18px] border border-[#2f79c9]/15 bg-white px-4 py-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f79c9]/10 text-[#2f79c9]">
                <AlertCircle size={19} />
              </div>

              <h2 className="text-[17px] font-black text-[#1f5f98]">
                {t.requirements}
              </h2>
            </div>

            <ol className="list-decimal space-y-1.5 pl-5 text-[14px] leading-6">
              <CheckItem active={passwordChecks.length}>{t.length}</CheckItem>
              <CheckItem active={passwordChecks.uppercase}>
                {t.uppercase}
              </CheckItem>
              <CheckItem active={passwordChecks.lowercase}>
                {t.lowercase}
              </CheckItem>
              <CheckItem active={passwordChecks.number}>{t.number}</CheckItem>
              <CheckItem active={passwordChecks.special}>{t.special}</CheckItem>
            </ol>
          </div>

          {(currentPassword || newPassword || confirmNewPassword) && (
            <div className="rounded-[14px] bg-white px-4 py-3 text-sm font-bold shadow-sm">
              {newPassword &&
              confirmNewPassword &&
              newPassword === confirmNewPassword ? (
                <p className="text-green-600">{t.matched}</p>
              ) : confirmNewPassword ? (
                <p className="text-red-500">{t.notMatched}</p>
              ) : null}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-[56px] w-full cursor-pointer items-center justify-center rounded-[18px] bg-[#f07a2a] text-[20px] font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t.confirming}
              </span>
            ) : (
              t.confirm
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
