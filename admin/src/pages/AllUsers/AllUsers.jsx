import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaEye,
  FaUserCheck,
  FaUserSlash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { api } from "../../api/axios";

const USERS_PER_PAGE = 15;

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const AllUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/users/admin/all-users");

      if (data?.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
        `/api/users/admin/all-users/${user._id}/toggle-status`,
        {
          isActive: !user.isActive,
        },
      );

      if (data?.success) {
        toast.success(data.message);

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

  const handleViewDetails = (user) => {
    navigate(`/all-user-details/${user._id}`);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] text-white">
      <div className="mb-5 md:mb-6">
        <div className="rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black via-[#2f79c9]/25 to-black p-4 md:p-5 shadow-lg shadow-blue-900/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                All Users
              </h1>
              <p className="text-sm md:text-base text-blue-100/80 mt-1">
                Manage all normal users from the admin panel
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[360px]">
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
                <p>
                  <span className="text-[#8fc2f5]">Phone:</span>{" "}
                  {user.countryCode || ""} {user.phone || "N/A"}
                </p>
                <p>
                  <span className="text-[#8fc2f5]">Balance:</span>{" "}
                  {user.balance || 0}
                </p>
                <p>
                  <span className="text-[#8fc2f5]">Refer Code:</span>{" "}
                  {user.referralCode || "N/A"}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleViewDetails(user)}
                  className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black/50 border border-blue-300/20 text-white hover:bg-blue-900/20"
                >
                  <FaEye />
                  View Details
                </button>

                <button
                  type="button"
                  disabled={toggleLoadingId === user._id}
                  onClick={() => handleToggleStatus(user)}
                  className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${
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

      <div className="hidden lg:block rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 overflow-hidden shadow-lg shadow-blue-900/20">
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
                  Refer Code
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-blue-50">
                  Status
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-blue-50 text-center">
                  Actions
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
                    Loading users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
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
                      {user.balance || 0}
                    </td>
                    <td className="px-5 py-4 text-sm text-blue-50">
                      {user.referralCode || "N/A"}
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
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(user)}
                          className="cursor-pointer px-3 py-2 rounded-lg bg-black/50 border border-blue-300/20 text-white hover:bg-blue-900/20 text-sm"
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          disabled={toggleLoadingId === user._id}
                          onClick={() => handleToggleStatus(user)}
                          className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 px-3 py-2 rounded-lg text-sm ${
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

export default AllUsers;
