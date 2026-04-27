import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const CreateAdmin = () => {
  const token = localStorage.getItem("token");

  const allPerms = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard ( / )" },
      { key: "profile", label: "Profile ( /profile )" },

      { key: "all-users", label: "All Users ( /all-users )" },
      {
        key: "all-user-details",
        label: "User Details ( /all-user-details/:id )",
      },
      {
        key: "all-affiliate-users",
        label: "All Affiliate Users ( /all-affiliate-users )",
      },
      {
        key: "affiliate-user-details",
        label: "Affiliate User Details ( /affiliate-user-details/:id )",
      },

      { key: "bulk-adjustment", label: "Bulk Adjustment ( /bulk-adjustment )" },

      {
        key: "add-game-categories",
        label: "Add Game Categories ( /add-game-categories )",
      },
      { key: "add-providers", label: "Add Providers ( /add-providers )" },
      { key: "add-games", label: "Add Games ( /add-games )" },
      { key: "add-sports", label: "Add Sports ( /add-sports )" },
      { key: "bet-history", label: "Bet History ( /bet-history )" },

      {
        key: "add-deposit-method",
        label: "Add Deposit Method ( /add-deposit-method )",
      },
      {
        key: "add-deposit-field",
        label: "Add Deposit Field ( /add-deposit-field )",
      },
      {
        key: "add-deposit-bonus-turnover",
        label: "Add Deposit Bonus & Turnover ( /add-deposit-bonus-turnover )",
      },
      {
        key: "deposit-request",
        label: "Deposit Request ( /deposit-request )",
      },
      {
        key: "deposit-request-details",
        label: "Deposit Request Details ( /deposit-request/:id )",
      },
      // {
      //   key: "auto-deposit-settings",
      //   label: "Auto Deposit Settings ( /auto-deposit-settings )",
      // },
      // {
      //   key: "auto-deposit-history",
      //   label: "Auto Deposit History ( /auto-deposit-history )",
      // },

      {
        key: "auto-personal-deposit-history",
        label: "Auto Deposit History ( /auto-personal-deposit-history )",
      },
      {
        key: "auto-personal-deposit-settings",
        label: "Auto Deposit Settings ( /auto-personal-deposit-settings )",
      },

      { key: "add-withdraw", label: "Add Withdraw ( /add-withdraw )" },
      {
        key: "withdraw-request",
        label: "Withdraw Request ( /withdraw-request )",
      },
      {
        key: "withdraw-request-detials",
        label: "Withdraw Request Details ( /withdraw-request/:id )",
      },

      {
        key: "aff-add-withdraw",
        label: "Affiliate Add Withdraw ( /aff-add-withdraw )",
      },
      {
        key: "aff-withdraw-request",
        label: "Affiliate Withdraw Request ( /aff-withdraw-request )",
      },
      {
        key: "aff-withdraw-request-detials",
        label:
          "Affiliate Withdraw Request Details ( /aff-withdraw-request-details/:id )",
      },

      {
        key: "slider-controller",
        label: "Slider Controller ( /slider-controller )",
      },
      {
        key: "aff-slider-controller",
        label: "Affiliate Slider Controller ( /aff-slider-controller )",
      },
      {
        key: "site-identity-controller",
        label: "Site Identity Controller ( /site-identity-controller )",
      },
      {
        key: "aff-site-identity-controller",
        label:
          "Affiliate Site Identity Controller ( /aff-site-identity-controller )",
      },
      {
        key: "add-social-link",
        label: "Add Social Link ( /add-social-link )",
      },
      {
        key: "add-aff-social-link",
        label: "Add Affiliate Social Link ( /add-aff-social-link )",
      },
      {
        key: "add-aff-notice",
        label: "Add Affiliate Notice ( /add-aff-notice )",
      },
    ],
    [],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("sub");
  const [permissions, setPermissions] = useState([]);

  const [admins, setAdmins] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("sub");
  const [editPermissions, setEditPermissions] = useState([]);
  const [editNewPassword, setEditNewPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );

  const togglePerm = (key) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const toggleEditPerm = (key) => {
    setEditPermissions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const loadAdmins = async () => {
    if (!token) return;

    try {
      setLoadingList(true);
      const { data } = await api.get("/api/admin/admins", authHeaders);
      setAdmins(data?.admins || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load admins");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const resetCreate = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setRole("sub");
    setPermissions([]);
  };

  const submitCreate = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Admin token not found. Please login.");
      return;
    }

    try {
      await api.post(
        "/api/admin/create-admin",
        {
          email,
          password,
          role,
          permissions: role === "mother" ? [] : permissions,
        },
        authHeaders,
      );

      toast.success("Admin created successfully");
      resetCreate();
      loadAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Server error");
    }
  };

  const startEdit = (admin) => {
    setEditingId(admin._id);
    setEditEmail(admin.email || "");
    setEditRole(admin.role || "sub");
    setEditPermissions(
      Array.isArray(admin.permissions) ? admin.permissions : [],
    );
    setEditNewPassword("");
    setShowEditPassword(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditEmail("");
    setEditRole("sub");
    setEditPermissions([]);
    setEditNewPassword("");
    setShowEditPassword(false);
  };

  const submitEdit = async (id) => {
    if (!token) {
      toast.error("Admin token not found. Please login.");
      return;
    }

    try {
      const payload = {
        role: editRole,
        permissions: editRole === "mother" ? [] : editPermissions,
      };

      if (editEmail.trim() !== "") {
        payload.email = editEmail.trim().toLowerCase();
      }

      if (editNewPassword.trim().length > 0) {
        payload.newPassword = editNewPassword.trim();
      }

      await api.put(`/api/admin/admins/${id}`, payload, authHeaders);

      toast.success("Admin updated successfully");
      cancelEdit();
      loadAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Server error");
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId || !token) {
      setDeleteConfirmId(null);
      return;
    }

    try {
      await api.delete(`/api/admin/admins/${deleteConfirmId}`, authHeaders);
      toast.success("Admin deleted successfully");

      if (editingId === deleteConfirmId) {
        cancelEdit();
      }

      loadAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Server error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2f79c9]/15 to-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] bg-clip-text text-transparent">
          Manage Admin Accounts
        </h2>

        <div className="bg-gradient-to-b from-black/80 via-[#2f79c9]/15 to-black/80 backdrop-blur-md border border-blue-300/20 rounded-2xl p-5 sm:p-7 lg:p-9 shadow-2xl shadow-blue-900/30 mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-[#8fc2f5] mb-6">
            Create New Admin
          </h3>

          <form onSubmit={submitCreate} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Email
                </label>
                <input
                  className="w-full bg-black/50 border border-blue-300/20 rounded-xl px-4 py-3 text-white placeholder-blue-100/40 focus:outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-black/50 border border-blue-300/20 rounded-xl px-4 py-3 text-white placeholder-blue-100/40 focus:outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30 transition-all pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] text-[#8fc2f5] hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">
                Role
              </label>
              <select
                className="w-full bg-black/50 border border-blue-300/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30 transition-all cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="sub" className="bg-[#0b1220]">
                  Sub Admin
                </option>
                <option value="mother" className="bg-[#0b1220]">
                  Mother Admin
                </option>
              </select>
            </div>

            {role !== "mother" && (
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-3">
                  Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto [scrollbar-width:none] pr-1">
                  {allPerms.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-3 bg-black/40 border border-blue-300/20 rounded-xl px-4 py-3 hover:bg-[#2f79c9]/15 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm.key)}
                        onChange={() => togglePerm(perm.key)}
                        className="h-5 w-5 accent-[#2f79c9] cursor-pointer"
                      />
                      <span className="text-sm text-blue-50">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="cursor-pointer w-full md:w-auto px-8 py-3.5 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7ab6f2] hover:to-[#3c88db] text-white shadow-lg shadow-blue-700/40 border border-blue-300/20 transition-all duration-300"
            >
              Create Admin
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-b from-black/80 via-[#2f79c9]/15 to-black/80 backdrop-blur-md border border-blue-300/20 rounded-2xl p-5 sm:p-7 lg:p-9 shadow-2xl shadow-blue-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#8fc2f5]">
              All Admin Accounts
            </h3>

            <button
              onClick={loadAdmins}
              className="cursor-pointer px-6 py-2.5 rounded-xl bg-black/50 border border-blue-300/20 hover:bg-[#2f79c9]/15 hover:border-[#63a8ee]/50 text-blue-100 hover:text-white transition-all duration-300"
            >
              Refresh List
            </button>
          </div>

          {loadingList ? (
            <div className="text-center py-10 text-blue-100/70">
              Loading admins...
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-10 text-blue-100/70">
              No admin accounts found
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => {
                const isEditing = editingId === admin._id;

                return (
                  <div
                    key={admin._id}
                    className="bg-black/40 border border-blue-300/20 rounded-xl p-5 hover:border-[#63a8ee]/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-lg text-white">
                          {admin.email}
                        </p>

                        <p className="text-sm mt-1">
                          Role:{" "}
                          <span className="font-semibold text-[#8fc2f5]">
                            {admin.role === "mother"
                              ? "Mother Admin"
                              : "Sub Admin"}
                          </span>
                        </p>

                        {admin.role !== "mother" && (
                          <p className="text-sm text-blue-100/80 mt-1 break-words">
                            Permissions:{" "}
                            {Array.isArray(admin.permissions) &&
                            admin.permissions.length > 0
                              ? admin.permissions.join(", ")
                              : "None"}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => startEdit(admin)}
                              className="cursor-pointer px-5 py-2.5 rounded-lg bg-[#2f79c9] hover:bg-[#3b88db] text-white font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(admin._id)}
                              className="cursor-pointer px-5 py-2.5 rounded-lg bg-red-700/80 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => submitEdit(admin._id)}
                              className="cursor-pointer px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7ab6f2] hover:to-[#3c88db] text-white font-medium transition-colors"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="cursor-pointer px-5 py-2.5 rounded-lg bg-black/50 border border-blue-300/20 hover:bg-[#2f79c9]/15 text-blue-100 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 pt-6 border-t border-blue-300/15 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-blue-100 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            className="w-full bg-black/50 border border-blue-300/20 rounded-xl px-4 py-3 text-white placeholder-blue-100/40 focus:outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30 transition-all"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Update email"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-100 mb-2">
                            Role
                          </label>
                          <select
                            className="w-full bg-black/50 border border-blue-300/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30 transition-all cursor-pointer"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            <option value="sub" className="bg-[#0b1220]">
                              Sub Admin
                            </option>
                            <option value="mother" className="bg-[#0b1220]">
                              Mother Admin
                            </option>
                          </select>
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-medium text-blue-100 mb-2">
                            New Password
                          </label>
                          <input
                            type={showEditPassword ? "text" : "password"}
                            className="w-full bg-black/50 border border-blue-300/20 rounded-xl px-4 py-3 text-white placeholder-blue-100/40 focus:outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30 transition-all pr-11"
                            value={editNewPassword}
                            onChange={(e) => setEditNewPassword(e.target.value)}
                            placeholder="Leave empty to keep current"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowEditPassword(!showEditPassword)
                            }
                            className="absolute right-4 top-[42px] text-[#8fc2f5] hover:text-white transition-colors cursor-pointer"
                          >
                            {showEditPassword ? (
                              <FaEyeSlash size={20} />
                            ) : (
                              <FaEye size={20} />
                            )}
                          </button>
                        </div>

                        {editRole !== "mother" && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-blue-100 mb-3">
                              Permissions
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto [scrollbar-width:none] pr-1">
                              {allPerms.map((perm) => (
                                <label
                                  key={perm.key}
                                  className="flex items-center gap-3 bg-black/40 border border-blue-300/20 rounded-xl px-4 py-3 hover:bg-[#2f79c9]/15 transition-colors cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editPermissions.includes(perm.key)}
                                    onChange={() => toggleEditPerm(perm.key)}
                                    className="h-5 w-5 accent-[#2f79c9] cursor-pointer"
                                  />
                                  <span className="text-sm text-blue-50">
                                    {perm.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-black via-[#2f79c9]/20 to-black border border-blue-300/20 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-blue-900/50">
              <h3 className="text-xl font-bold text-[#8fc2f5] mb-4">
                Confirm Delete
              </h3>
              <p className="text-blue-50/90 mb-6">
                Are you sure you want to delete this admin account?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="cursor-pointer flex-1 py-3 rounded-xl bg-black/50 border border-blue-300/20 hover:bg-[#2f79c9]/15 text-blue-100 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="cursor-pointer flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAdmin;
