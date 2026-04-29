import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router";
import {
  FaArrowLeft,
  FaSave,
  FaSyncAlt,
  FaEye,
  FaEyeSlash,
  FaUserCheck,
  FaUserSlash,
  FaInfoCircle,
  FaWallet,
  FaLock,
  FaIdCard,
} from "react-icons/fa";
import { api } from "../../api/axios";

const SuperAffiliateUserDetials = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    countryCode: "",
    phone: "",
    firstName: "",
    lastName: "",
    password: "",
    isActive: false,
    currency: "BDT",
    balance: 0,
    commissionBalance: 0,
    gameLossCommission: 0,
    depositCommission: 0,
    referCommission: 0,
    gameWinCommission: 0,
    gameLossCommissionBalance: 0,
    depositCommissionBalance: 0,
    referCommissionBalance: 0,
    gameWinCommissionBalance: 0,

    role: "",
    referralCode: "",
    createdAt: "",
    updatedAt: "",
    referralCount: 0,
  });

  const fetchSuperAffUserDetails = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get(
        `/api/super-affiliate/admin/super-affiliate-users/${id}`,
      );

      if (data?.success) {
        const user = data.user;

        setFormData({
          userId: user?.userId || "",
          email: user?.email || "",
          countryCode: user?.countryCode || "",
          phone: user?.phone || "",
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          password: "",
          isActive: !!user?.isActive,
          currency: user?.currency || "BDT",
          balance: Number(user?.balance || 0),
          commissionBalance: Number(user?.commissionBalance || 0),
          gameLossCommission: Number(user?.gameLossCommission || 0),
          depositCommission: Number(user?.depositCommission || 0),
          referCommission: Number(user?.referCommission || 0),
          gameWinCommission: Number(user?.gameWinCommission || 0),
          gameLossCommissionBalance: Number(
            user?.gameLossCommissionBalance || 0,
          ),
          depositCommissionBalance: Number(user?.depositCommissionBalance || 0),
          referCommissionBalance: Number(user?.referCommissionBalance || 0),
          gameWinCommissionBalance: Number(user?.gameWinCommissionBalance || 0),

          role: user?.role || "",
          referralCode: user?.referralCode || "",
          createdAt: user?.createdAt || "",
          updatedAt: user?.updatedAt || "",
          referralCount: Number(user?.referralCount || 0),
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load super affiliate user details",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuperAffUserDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      if (!formData.userId || !formData.phone || !formData.countryCode) {
        return toast.error("User ID, country code and phone are required");
      }

      if (formData.password && formData.password.length < 4) {
        return toast.error("Password must be at least 4 characters");
      }

      setSaving(true);

      const payload = {
        userId: formData.userId.trim(),
        email: formData.email.trim(),
        countryCode: formData.countryCode.trim(),
        phone: formData.phone.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        isActive: !!formData.isActive,
        currency: formData.currency,
        balance: Number(formData.balance) || 0,
        commissionBalance: Number(formData.commissionBalance) || 0,
        gameLossCommission: Number(formData.gameLossCommission) || 0,
        depositCommission: Number(formData.depositCommission) || 0,
        referCommission: Number(formData.referCommission) || 0,
        gameWinCommission: Number(formData.gameWinCommission) || 0,
        gameLossCommissionBalance:
          Number(formData.gameLossCommissionBalance) || 0,
        depositCommissionBalance:
          Number(formData.depositCommissionBalance) || 0,
        referCommissionBalance: Number(formData.referCommissionBalance) || 0,
        gameWinCommissionBalance:
          Number(formData.gameWinCommissionBalance) || 0,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const { data } = await api.patch(
        `/api/super-affiliate/admin/super-affiliate-users/${id}`,
        payload,
      );

      if (data?.success) {
        toast.success(
          data.message || "Super affiliate user updated successfully",
        );
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));
        fetchSuperAffUserDetails(true);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update super affiliate user",
      );
    } finally {
      setSaving(false);
    }
  };

  const cardClass =
    "rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/95 via-[#2f79c9]/15 to-black/95 shadow-lg shadow-blue-900/20";
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-black/60 border border-blue-300/20 text-white placeholder-blue-100/40 focus:outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee]";
  const readOnlyClass =
    "w-full px-4 py-3 rounded-xl bg-black/40 border border-blue-300/10 text-blue-50";

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-120px)] text-white">
        <div className={`${cardClass} p-6 text-center`}>
          Loading super affiliate user details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] text-white">
      <div className={`${cardClass} mb-6 p-4 md:p-6`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Super Affiliate User Details
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              View and manage super affiliate user information
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/50 px-4 py-3 text-white hover:bg-blue-900/20"
            >
              <FaArrowLeft />
              Back
            </button>

            <button
              type="button"
              onClick={() => fetchSuperAffUserDetails(true)}
              disabled={refreshing}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/50 px-4 py-3 text-white hover:bg-blue-900/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-semibold text-white shadow-lg shadow-blue-700/30 hover:from-[#7ab6f2] hover:to-[#3c88db] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSave />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className={`${cardClass} mb-6 p-4 md:p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-bold ${
              formData.isActive
                ? "border-green-500/40 bg-green-500/20 text-green-300"
                : "border-red-500/40 bg-red-500/20 text-red-300"
            }`}
          >
            {formData.isActive ? "Active" : "Inactive"}
          </span>

          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                isActive: !prev.isActive,
              }))
            }
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 font-medium ${
              formData.isActive
                ? "border border-red-500/40 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                : "border border-green-500/40 bg-green-500/20 text-green-300 hover:bg-green-500/30"
            }`}
          >
            {formData.isActive ? <FaUserSlash /> : <FaUserCheck />}
            {formData.isActive ? "Set Inactive" : "Set Active"}
          </button>
        </div>
      </div>

      <div className={`${cardClass} mb-6 p-4 md:p-6`}>
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#8fc2f5] md:text-xl">
          <FaInfoCircle />
          Editable Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="User ID">
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Country Code">
            <input
              type="text"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Phone">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="First Name">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Last Name">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Currency">
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="BDT">BDT</option>
              <option value="USDT">USDT</option>
            </select>
          </Field>

          <Field label="New Password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#8fc2f5] hover:text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </Field>

          <Field label="Balance">
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Commission Balance">
            <input
              type="number"
              name="commissionBalance"
              value={formData.commissionBalance}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className={`${cardClass} mb-6 p-4 md:p-6`}>
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#8fc2f5] md:text-xl">
          <FaWallet />
          Commission Settings
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Game Loss Commission">
            <input
              type="number"
              name="gameLossCommission"
              value={formData.gameLossCommission}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Deposit Commission">
            <input
              type="number"
              name="depositCommission"
              value={formData.depositCommission}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Refer Commission">
            <input
              type="number"
              name="referCommission"
              value={formData.referCommission}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Game Win Commission">
            <input
              type="number"
              name="gameWinCommission"
              value={formData.gameWinCommission}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Game Loss Commission Balance">
            <input
              type="number"
              name="gameLossCommissionBalance"
              value={formData.gameLossCommissionBalance}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Deposit Commission Balance">
            <input
              type="number"
              name="depositCommissionBalance"
              value={formData.depositCommissionBalance}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Refer Commission Balance">
            <input
              type="number"
              name="referCommissionBalance"
              value={formData.referCommissionBalance}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Game Win Commission Balance">
            <input
              type="number"
              name="gameWinCommissionBalance"
              value={formData.gameWinCommissionBalance}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className={`${cardClass} p-4 md:p-6`}>
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#8fc2f5] md:text-xl">
          <FaIdCard />
          Read Only Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Role">
            <input
              type="text"
              readOnly
              value={formData.role || "super-aff-user"}
              className={readOnlyClass}
            />
          </Field>

          <Field label="Referral Code">
            <input
              type="text"
              readOnly
              value={formData.referralCode || "—"}
              className={readOnlyClass}
            />
          </Field>

          <Field label="Affiliate Referral Count">
            <input
              type="text"
              readOnly
              value={formData.referralCount}
              className={readOnlyClass}
            />
          </Field>

          <Field label="Created At">
            <input
              type="text"
              readOnly
              value={
                formData.createdAt
                  ? new Date(formData.createdAt).toLocaleString()
                  : "—"
              }
              className={readOnlyClass}
            />
          </Field>

          <Field label="Updated At">
            <input
              type="text"
              readOnly
              value={
                formData.updatedAt
                  ? new Date(formData.updatedAt).toLocaleString()
                  : "—"
              }
              className={readOnlyClass}
            />
          </Field>
        </div>

        {formData.password.trim().length > 0 && (
          <div className="mt-5 rounded-xl border border-blue-300/20 bg-[#2f79c9]/10 p-4 text-sm text-blue-100">
            <div className="flex items-start gap-2">
              <FaLock className="mt-0.5" />
              <p>
                A new password has been entered. Click{" "}
                <strong>Save Changes</strong> to update it.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => {
  return (
    <div className="rounded-xl border border-blue-300/20 bg-black/35 p-4">
      <label className="mb-2 block text-sm font-medium text-blue-100">
        {label}
      </label>
      {children}
    </div>
  );
};

export default SuperAffiliateUserDetials;
