import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaEye,
  FaUserCheck,
  FaUserSlash,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { useNavigate } from "react-router";

const USERS_PER_PAGE = 15;

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const AllSuperAffiliates = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [activatingUser, setActivatingUser] = useState(null);
  const [commissionLoading, setCommissionLoading] = useState(false);

  const [commissionData, setCommissionData] = useState({
    gameLossCommission: "",
    depositCommission: "",
    referCommission: "",
    gameWinCommission: "",
  });

  const fetchSuperAffiliates = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        "/api/super-affiliate/admin/super-affiliate-users",
      );

      if (data?.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load super affiliate users",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAffiliates();
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

  const handleViewDetails = (user) => {
    navigate(`/super-affiliate-user-details/${user._id}`);
  };

  const handleOpenActivateModal = (user) => {
    setActivatingUser(user);
    setCommissionData({
      gameLossCommission: user?.gameLossCommission ?? "",
      depositCommission: user?.depositCommission ?? "",
      referCommission: user?.referCommission ?? "",
      gameWinCommission: user?.gameWinCommission ?? "",
    });
    setActivateModalOpen(true);
  };

  const handleCommissionChange = (e) => {
    setCommissionData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleActivateUser = async () => {
    try {
      if (!activatingUser?._id) {
        return toast.error("No super affiliate user selected");
      }

      setCommissionLoading(true);

      const payload = {
        isActive: true,
        gameLossCommission: Number(commissionData.gameLossCommission) || 0,
        depositCommission: Number(commissionData.depositCommission) || 0,
        referCommission: Number(commissionData.referCommission) || 0,
        gameWinCommission: Number(commissionData.gameWinCommission) || 0,
      };

      const { data } = await api.patch(
        `/api/super-affiliate/admin/super-affiliate-users/${activatingUser._id}/toggle-active`,
        payload,
      );

      if (data?.success) {
        toast.success(
          data.message || "Super affiliate user activated successfully",
        );
        setActivateModalOpen(false);
        setActivatingUser(null);
        fetchSuperAffiliates();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to activate super affiliate user",
      );
    } finally {
      setCommissionLoading(false);
    }
  };

  const handleDeactivateUser = async (user) => {
    try {
      const { data } = await api.patch(
        `/api/super-affiliate/admin/super-affiliate-users/${user._id}/toggle-active`,
        { isActive: false },
      );

      if (data?.success) {
        toast.success(
          data.message || "Super affiliate user deactivated successfully",
        );
        fetchSuperAffiliates();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to deactivate super affiliate user",
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] text-white">
      <div className="mb-5 md:mb-6">
        <div className="rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black via-[#2f79c9]/25 to-black p-4 shadow-lg shadow-blue-900/20 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                All Super Affiliate Users
              </h1>
              <p className="mt-1 text-sm text-blue-100/80 md:text-base">
                Manage super affiliates, activate accounts, set commissions, and
                monitor account status.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[360px]">
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
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 p-4 shadow-lg shadow-blue-900/20 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#8fc2f5]" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by User ID, Phone, Email or Referral Code"
              className="w-full rounded-xl border border-blue-300/20 bg-black/60 py-3 pr-4 pl-11 text-white placeholder-blue-100/40 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
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
            Loading super affiliate users...
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="rounded-2xl border border-blue-300/20 bg-black/60 p-6 text-center text-blue-100">
            No super affiliate users found
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
                    {user.email || "No email"}
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
                <p>
                  <span className="text-[#8fc2f5]">Phone:</span>{" "}
                  {user.countryCode || ""} {user.phone || "N/A"}
                </p>
                <p>
                  <span className="text-[#8fc2f5]">Balance:</span>{" "}
                  {user.balance || 0}
                </p>
                <p>
                  <span className="text-[#8fc2f5]">Referral Code:</span>{" "}
                  {user.referralCode || "N/A"}
                </p>
                <p>
                  <span className="text-[#8fc2f5]">Referral Count:</span>{" "}
                  {user.referralCount || 0}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleViewDetails(user)}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-300/20 bg-black/50 px-4 py-2.5 text-white hover:bg-blue-900/20"
                >
                  <FaEye />
                  View Details
                </button>

                {user.isActive ? (
                  <button
                    type="button"
                    onClick={() => handleDeactivateUser(user)}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-2.5 text-red-300 hover:bg-red-500/30"
                  >
                    <FaUserSlash />
                    Deactivate
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenActivateModal(user)}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-500/40 bg-green-500/20 px-4 py-2.5 text-green-300 hover:bg-green-500/30"
                  >
                    <FaUserCheck />
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 shadow-lg shadow-blue-900/20 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#2f79c9]/35 to-[#63a8ee]/20 text-left">
                <th className="px-5 py-4 text-sm font-semibold text-blue-50">
                  User ID
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
                  Referral Code
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-blue-50">
                  Referrals
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
                    colSpan="8"
                    className="px-5 py-10 text-center text-blue-100"
                  >
                    Loading super affiliate users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-10 text-center text-blue-100"
                  >
                    No super affiliate users found
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
                    <td className="px-5 py-4 text-sm font-medium text-white">
                      {user.userId}
                    </td>

                    <td className="px-5 py-4 text-sm text-blue-50">
                      {user.countryCode || ""} {user.phone || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-sm text-blue-50">
                      {user.email || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-sm text-blue-50">
                      {user.balance || 0}
                    </td>

                    <td className="px-5 py-4 text-sm text-blue-50">
                      {user.referralCode || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-sm text-blue-50">
                      {user.referralCount || 0}
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

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(user)}
                          className="cursor-pointer rounded-lg border border-blue-300/20 bg-black/50 px-3 py-2 text-sm text-white hover:bg-blue-900/20"
                        >
                          View Details
                        </button>

                        {user.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivateUser(user)}
                            className="cursor-pointer rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/30"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenActivateModal(user)}
                            className="cursor-pointer rounded-lg border border-green-500/40 bg-green-500/20 px-3 py-2 text-sm text-green-300 hover:bg-green-500/30"
                          >
                            Activate
                          </button>
                        )}
                      </div>
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
            users
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

      {activateModalOpen && activatingUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30">
            <div className="flex items-center justify-between border-b border-blue-300/20 bg-gradient-to-r from-[#2f79c9]/30 to-[#63a8ee]/20 px-5 py-4">
              <h2 className="text-lg font-semibold text-white md:text-xl">
                Activate Super Affiliate User
              </h2>

              <button
                type="button"
                onClick={() => setActivateModalOpen(false)}
                className="cursor-pointer rounded-lg p-2 text-white hover:bg-blue-900/20"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 md:p-6">
              <div className="mb-5 rounded-xl border border-blue-300/20 bg-black/40 p-4">
                <p className="text-sm text-blue-100/70">Selected User</p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {activatingUser.userId}
                </h3>
                <p className="mt-1 text-sm text-blue-50">
                  {activatingUser.countryCode || ""} {activatingUser.phone}
                  {activatingUser.email ? ` • ${activatingUser.email}` : ""}
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
                onClick={() => setActivateModalOpen(false)}
                className="cursor-pointer rounded-xl border border-blue-300/20 bg-black/50 px-5 py-3 text-white hover:bg-blue-900/20"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleActivateUser}
                disabled={commissionLoading}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-semibold text-white shadow-lg shadow-blue-700/30 hover:from-[#7ab6f2] hover:to-[#3c88db] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {commissionLoading
                  ? "Activating..."
                  : "Activate Super Affiliate"}
              </button>
            </div>
          </div>
        </div>
      )}
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

export default AllSuperAffiliates;
