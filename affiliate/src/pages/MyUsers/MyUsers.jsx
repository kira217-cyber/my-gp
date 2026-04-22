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
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const USERS_PER_PAGE = 15;

const filterOptions = [
  { label: "All Users", value: "all" },
  { label: "Active Users", value: "active" },
  { label: "Inactive Users", value: "inactive" },
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

const MyUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMyUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get("/api/affiliate/my-users");

      if (data?.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load referred users",
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

        return userId.includes(q) || phone.includes(q) || email.includes(q);
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

  const handleToggleStatus = async (user) => {
    try {
      setToggleLoadingId(user._id);

      const { data } = await api.patch(
        `/api/affiliate/my-users/${user._id}/toggle-status`,
        {
          isActive: !user.isActive,
        },
      );

      if (data?.success) {
        toast.success(data.message || "User status updated");

        setUsers((prev) =>
          prev.map((item) =>
            item._id === user._id
              ? { ...item, isActive: !item.isActive }
              : item,
          ),
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update user status",
      );
    } finally {
      setToggleLoadingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] text-white">
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <div className="rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black via-[#2f79c9]/25 to-black p-4 md:p-5 shadow-lg shadow-blue-900/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                My Users
              </h1>
              <p className="text-sm md:text-base text-blue-100/80 mt-1">
                Manage all users referred by you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:min-w-[380px]">
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
                className="cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3 rounded-xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db] text-white font-semibold shadow-lg shadow-blue-700/30 flex items-center justify-center gap-2"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 p-4 md:p-5 shadow-lg shadow-blue-900/20 mb-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fc2f5] text-base" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by User ID, Phone or Email"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/60 border border-blue-300/20 text-white placeholder-blue-100/40 focus:outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`cursor-pointer px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  statusFilter === option.value
                    ? "bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white border-blue-300/20 shadow-lg shadow-blue-700/30"
                    : "bg-black/50 text-white border-blue-300/20 hover:bg-blue-900/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-blue-300/20 bg-black/60 p-6 text-center text-blue-100">
            Loading users...
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="rounded-2xl border border-blue-300/20 bg-black/60 p-6 text-center text-blue-100">
            No users found
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
                  <p className="text-sm text-blue-100/80 mt-1">
                    {user.email || "No email"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.isActive
                      ? "bg-green-500/20 text-green-300 border border-green-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
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
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(user)}
                  disabled={toggleLoadingId === user._id}
                  className={`w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                    user.isActive
                      ? "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                      : "bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30"
                  }`}
                >
                  {user.isActive ? <FaUserSlash /> : <FaUserCheck />}
                  {toggleLoadingId === user._id
                    ? "Updating..."
                    : user.isActive
                      ? "Deactivate"
                      : "Activate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 overflow-hidden shadow-lg shadow-blue-900/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
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
                  Status
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-blue-50 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-blue-100"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-blue-100"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`border-t border-blue-300/10 hover:bg-blue-900/10 transition-colors ${
                      index % 2 === 0 ? "bg-black/20" : "bg-transparent"
                    }`}
                  >
                    <td className="px-5 py-4 text-sm text-white font-medium">
                      {user.userId}
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-500/20 text-green-300 border border-green-500/40"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user)}
                        disabled={toggleLoadingId === user._id}
                        className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 px-4 py-2 rounded-lg text-sm transition-all ${
                          user.isActive
                            ? "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                            : "bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30"
                        }`}
                      >
                        {toggleLoadingId === user._id
                          ? "Updating..."
                          : user.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-5 rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black via-[#2f79c9]/20 to-black p-4 shadow-lg shadow-blue-900/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-blue-100/80 text-center md:text-left">
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

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 rounded-xl bg-black/50 border border-blue-300/20 text-white hover:bg-blue-900/20 flex items-center gap-2"
            >
              <FaChevronLeft />
              Prev
            </button>

            <div className="px-4 py-2 rounded-xl bg-[#2f79c9]/25 border border-blue-300/20 text-blue-50 text-sm font-medium">
              Page {currentPage} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 rounded-xl bg-black/50 border border-blue-300/20 text-white hover:bg-blue-900/20 flex items-center gap-2"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyUsers;
