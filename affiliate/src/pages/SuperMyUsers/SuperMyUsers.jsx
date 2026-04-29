import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaPhoneAlt,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaWallet,
  FaTimes,
  FaCoins,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const USERS_PER_PAGE = 15;

const filterOptions = [
  { label: "All Master Users", value: "all" },
  { label: "Active Master Users", value: "active" },
  { label: "Inactive Master Users", value: "inactive" },
];

const money = (n, currency = "BDT") => {
  const symbol = currency === "USDT" ? "$" : "৳";
  const num = Number(n || 0);

  if (!Number.isFinite(num)) return `${symbol} 0.00`;

  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const SuperMyUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [commissionLoading, setCommissionLoading] = useState(false);

  const [commissionData, setCommissionData] = useState({
    gameLossCommission: "",
    depositCommission: "",
    referCommission: "",
    gameWinCommission: "",
  });

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMyUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/super-affiliate/my-users");

      if (data?.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load master users",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let updatedUsers = [...users];

    if (statusFilter === "active") {
      updatedUsers = updatedUsers.filter((user) => user.isActive);
    } else if (statusFilter === "inactive") {
      updatedUsers = updatedUsers.filter((user) => !user.isActive);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();

      updatedUsers = updatedUsers.filter((user) => {
        const userId = user?.userId?.toLowerCase() || "";
        const phone = `${user?.countryCode || ""}${user?.phone || ""}`
          .toLowerCase()
          .trim();
        const email = user?.email?.toLowerCase() || "";
        const referralCode = user?.referralCode?.toLowerCase() || "";

        return (
          userId.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          referralCode.includes(q)
        );
      });
    }

    return updatedUsers;
  }, [users, searchText, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openCommissionModal = (user) => {
    setSelectedUser(user);
    setCommissionData({
      gameLossCommission: user?.gameLossCommission ?? "",
      depositCommission: user?.depositCommission ?? "",
      referCommission: user?.referCommission ?? "",
      gameWinCommission: user?.gameWinCommission ?? "",
    });
    setModalOpen(true);
  };

  const closeCommissionModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setCommissionData({
      gameLossCommission: "",
      depositCommission: "",
      referCommission: "",
      gameWinCommission: "",
    });
  };

  const handleCommissionChange = (e) => {
    setCommissionData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveStatusAndCommission = async (nextStatus) => {
    try {
      if (!selectedUser?._id) {
        return toast.error("No master user selected");
      }

      setCommissionLoading(true);

      const payload = {
        isActive: !!nextStatus,
        gameLossCommission: Number(commissionData.gameLossCommission) || 0,
        depositCommission: Number(commissionData.depositCommission) || 0,
        referCommission: Number(commissionData.referCommission) || 0,
        gameWinCommission: Number(commissionData.gameWinCommission) || 0,
      };

      const { data } = await api.patch(
        `/api/super-affiliate/my-users/${selectedUser._id}/toggle-status`,
        payload,
      );

      if (data?.success) {
        toast.success(data.message || "Master user updated successfully");
        closeCommissionModal();
        fetchMyUsers(true);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update master user",
      );
    } finally {
      setCommissionLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] text-white">
      <div className="mb-5 md:mb-6">
        <div className="rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black via-[#2f79c9]/25 to-black p-4 shadow-lg shadow-blue-900/20 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                My Master Users
              </h1>
              <p className="mt-1 text-sm text-blue-100/80 md:text-base">
                Manage affiliate users under your super affiliate account.
              </p>
            </div>

            <div className="flex w-full flex-wrap gap-3 lg:w-auto">
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[380px]">
                <div className="rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3">
                  <p className="text-xs text-blue-100/70">Total</p>
                  <p className="text-lg font-semibold">{users.length}</p>
                </div>

                <div className="rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3">
                  <p className="text-xs text-blue-100/70">Active</p>
                  <p className="text-lg font-semibold">
                    {users.filter((u) => u.isActive).length}
                  </p>
                </div>

                <div className="rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3">
                  <p className="text-xs text-blue-100/70">Inactive</p>
                  <p className="text-lg font-semibold">
                    {users.filter((u) => !u.isActive).length}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchMyUsers(true)}
                disabled={refreshing}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-semibold text-white shadow-lg shadow-blue-700/30 hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 p-4 shadow-lg shadow-blue-900/20 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#8fc2f5]" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by User ID, Phone, Email or Referral Code"
              className="w-full rounded-xl border border-blue-300/20 bg-black/60 py-3 pr-4 pl-11 text-white placeholder-blue-100/40 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  statusFilter === option.value
                    ? "border-blue-300/20 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/30"
                    : "border-blue-300/20 bg-black/50 text-white hover:bg-blue-900/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="block space-y-4 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-blue-300/20 bg-black/60 p-6 text-center text-blue-100">
            Loading master users...
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="rounded-2xl border border-blue-300/20 bg-black/60 p-6 text-center text-blue-100">
            No master users found
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 p-4 shadow-lg shadow-blue-900/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {user.userId}
                  </h3>
                  <p className="mt-1 text-sm text-blue-100/80">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : "Master User"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isActive
                      ? "border border-green-500/40 bg-green-500/20 text-green-300"
                      : "border border-red-500/40 bg-red-500/20 text-red-300"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-blue-50">
                <div className="flex items-center gap-2">
                  <FaPhoneAlt className="text-[#8fc2f5]" />
                  <span>
                    {user.countryCode || ""} {user.phone || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-[#8fc2f5]" />
                  <span>{user.email || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FaWallet className="text-[#8fc2f5]" />
                  <span>
                    {money(user.balance || 0, user.currency || "BDT")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <MiniStat label="Loss" value={user.gameLossCommission} />
                  <MiniStat label="Deposit" value={user.depositCommission} />
                  <MiniStat label="Refer" value={user.referCommission} />
                  <MiniStat label="Win" value={user.gameWinCommission} />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => openCommissionModal(user)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-300/20 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-2.5 font-semibold text-white transition-all hover:from-[#7bb7f1] hover:to-[#3b88db]"
                >
                  {user.isActive ? <FaUserSlash /> : <FaUserCheck />}
                  Manage Status & Commission
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 shadow-lg shadow-blue-900/20 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#2f79c9]/35 to-[#63a8ee]/20 text-left">
                <th className="px-5 py-4 text-sm font-semibold text-blue-50">
                  Master User
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-blue-50">
                  Phone
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-blue-50">
                  Email
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-blue-50">
                  Balance
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-blue-50">
                  Commissions
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-blue-50">
                  Status
                </th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-blue-50">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-blue-100"
                  >
                    Loading master users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-blue-100"
                  >
                    No master users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`border-t border-blue-300/10 transition-colors hover:bg-blue-900/10 ${
                      index % 2 === 0 ? "bg-black/20" : "bg-transparent"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-white">
                        {user.userId}
                      </div>
                      <div className="mt-1 text-xs text-blue-100/70">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                          : "Master User"}
                      </div>
                      <div className="mt-1 text-xs text-[#8fc2f5]">
                        {user.referralCode || "No referral code"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-blue-50">
                      {user.countryCode || ""} {user.phone || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-sm text-blue-50">
                      {user.email || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-sm text-blue-50">
                      {money(user.balance || 0, user.currency || "BDT")}
                    </td>

                    <td className="px-5 py-4">
                      <div className="grid grid-cols-2 gap-1 text-xs text-blue-50">
                        <span>
                          Loss: {Number(user.gameLossCommission || 0)}
                        </span>
                        <span>Win: {Number(user.gameWinCommission || 0)}</span>
                        <span>
                          Deposit: {Number(user.depositCommission || 0)}
                        </span>
                        <span>Refer: {Number(user.referCommission || 0)}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isActive
                            ? "border border-green-500/40 bg-green-500/20 text-green-300"
                            : "border border-red-500/40 bg-red-500/20 text-red-300"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => openCommissionModal(user)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-300/20 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-2 text-sm font-semibold text-white hover:from-[#7bb7f1] hover:to-[#3b88db]"
                      >
                        <FaCoins />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black via-[#2f79c9]/20 to-black p-4 shadow-lg shadow-blue-900/20">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center text-sm text-blue-100/80 md:text-left">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredUsers.length === 0
                ? 0
                : (currentPage - 1) * USERS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-white">
              {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {filteredUsers.length}
            </span>{" "}
            master users
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/50 px-4 py-2 text-white hover:bg-blue-900/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaChevronLeft />
              Prev
            </button>

            <div className="rounded-xl border border-blue-300/20 bg-[#2f79c9]/25 px-4 py-2 text-sm font-medium text-blue-50">
              Page {currentPage} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/50 px-4 py-2 text-white hover:bg-blue-900/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && selectedUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30">
            <div className="flex items-center justify-between border-b border-blue-300/20 bg-gradient-to-r from-[#2f79c9]/30 to-[#63a8ee]/20 px-5 py-4">
              <h2 className="text-lg font-semibold text-white md:text-xl">
                Manage Master User
              </h2>

              <button
                type="button"
                onClick={closeCommissionModal}
                className="cursor-pointer rounded-lg p-2 text-white hover:bg-blue-900/20"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 md:p-6">
              <div className="mb-5 rounded-xl border border-blue-300/20 bg-black/40 p-4">
                <p className="text-sm text-blue-100/70">Selected Master User</p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {selectedUser.userId}
                </h3>
                <p className="mt-1 text-sm text-blue-50">
                  {selectedUser.countryCode || ""} {selectedUser.phone}
                  {selectedUser.email ? ` • ${selectedUser.email}` : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CommissionInput
                  label="Game Loss Commission"
                  name="gameLossCommission"
                  value={commissionData.gameLossCommission}
                  onChange={handleCommissionChange}
                />

                <CommissionInput
                  label="Deposit Commission"
                  name="depositCommission"
                  value={commissionData.depositCommission}
                  onChange={handleCommissionChange}
                />

                <CommissionInput
                  label="Refer Commission"
                  name="referCommission"
                  value={commissionData.referCommission}
                  onChange={handleCommissionChange}
                />

                <CommissionInput
                  label="Game Win Commission"
                  name="gameWinCommission"
                  value={commissionData.gameWinCommission}
                  onChange={handleCommissionChange}
                />
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3 px-5 pb-5 md:px-6 md:pb-6 sm:flex-row">
              <button
                type="button"
                onClick={closeCommissionModal}
                disabled={commissionLoading}
                className="cursor-pointer rounded-xl border border-blue-300/20 bg-black/50 px-5 py-3 text-white hover:bg-blue-900/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveStatusAndCommission(false)}
                disabled={commissionLoading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/20 px-5 py-3 font-semibold text-red-300 hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaUserSlash />
                {commissionLoading ? "Updating..." : "Deactivate"}
              </button>

              <button
                type="button"
                onClick={() => handleSaveStatusAndCommission(true)}
                disabled={commissionLoading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-500/40 bg-green-500/20 px-5 py-3 font-semibold text-green-300 hover:bg-green-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaUserCheck />
                {commissionLoading ? "Updating..." : "Activate & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MiniStat = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-blue-300/15 bg-black/30 px-2 py-1">
      <span className="text-blue-100/65">{label}:</span>{" "}
      <span className="font-bold text-white">{Number(value || 0)}</span>
    </div>
  );
};

const CommissionInput = ({ label, name, value, onChange }) => {
  return (
    <div>
      <label className="mb-2 block text-sm text-blue-100">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-blue-300/20 bg-black/60 px-4 py-3 text-white placeholder-blue-100/40 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30 focus:outline-none"
        placeholder={`Enter ${label}`}
      />
    </div>
  );
};

export default SuperMyUsers;
