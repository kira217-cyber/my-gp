import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaWallet,
} from "react-icons/fa";
import { api } from "../../api/axios";

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  if (status === "approved")
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (status === "rejected")
    return "bg-red-500/15 text-red-200 border-red-400/30";
  return "bg-yellow-500/15 text-yellow-200 border-yellow-400/30";
};

const typeText = (type = "") => {
  const v = String(type || "").toLowerCase();
  if (v === "personal") return "Personal";
  if (v === "agent") return "Agent";
  if (v === "merchant") return "Merchant";
  return "—";
};

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText,
  confirmVariant = "approve",
  loading,
  note,
  setNote,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const btnClass =
    confirmVariant === "reject"
      ? "from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
      : "from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db]";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-blue-300/20 shadow-2xl">
        <div className="bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-5">
          <div className="text-xl font-black text-white">{title}</div>
          <div className="mt-1 text-[13px] text-blue-100/80">{description}</div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-blue-100/80">
              Admin Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a note for user..."
              className="mt-2 min-h-[90px] w-full rounded-xl border border-blue-300/20 bg-black/60 p-3 text-white placeholder-blue-100/40 outline-none focus:ring-2 focus:ring-[#2f79c9]/30"
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-blue-300/20 px-4 py-2 text-blue-100 transition hover:bg-blue-900/25"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`cursor-pointer rounded-xl bg-gradient-to-r px-4 py-2 font-black text-white shadow-lg ${btnClass} ${
                loading ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WithdrawRequest = () => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const fetchData = async (
    page = meta.page,
    searchQ = q,
    nextStatus = status,
  ) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: meta.limit,
      };

      if (searchQ) params.q = searchQ;
      if (nextStatus !== "all") params.status = nextStatus;

      const { data } = await api.get("/api/admin/withdraw-requests", {
        params,
      });

      const items = data?.data || [];
      const total = data?.meta?.total ?? items.length;

      setList(items);
      setMeta((m) => ({
        ...m,
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || m.limit,
        total,
      }));
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load withdraw requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, q, status);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const next = qInput.trim();
    setQ(next);
    fetchData(1, next, status);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    fetchData(1, q, value);
  };

  const openApprove = (row) => {
    setSelected(row);
    setNote("");
    setApproveOpen(true);
  };

  const openReject = (row) => {
    setSelected(row);
    setNote("");
    setRejectOpen(true);
  };

  const approveNow = async () => {
    if (!selected?._id) return;

    try {
      setActing(true);
      await api.patch(`/api/admin/withdraw-requests/${selected._id}/approve`, {
        adminNote: note,
      });

      toast.success("Withdraw approved");
      setApproveOpen(false);
      setSelected(null);
      fetchData(meta.page, q, status);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Approve failed");
    } finally {
      setActing(false);
    }
  };

  const rejectNow = async () => {
    if (!selected?._id) return;

    try {
      setActing(true);
      await api.patch(`/api/admin/withdraw-requests/${selected._id}/reject`, {
        adminNote: note,
      });

      toast.success("Withdraw rejected");
      setRejectOpen(false);
      setSelected(null);
      fetchData(meta.page, q, status);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Reject failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="w-full text-white">
      <div className="overflow-hidden rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-2xl shadow-blue-900/20">
        <div className="flex flex-col gap-4 border-b border-blue-300/20 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/40">
              <FaWallet className="text-2xl" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                Withdraw Requests
              </div>
              <div className="mt-1 text-[13px] text-blue-100/80">
                Approve or reject withdrawal requests
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchData(meta.page, q, status)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/40 px-4 py-2 text-[13px] font-extrabold text-blue-100 transition hover:bg-blue-900/25"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="p-5 md:p-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_180px]">
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-100/60" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search: userId / phone / email..."
                className="w-full rounded-xl border border-blue-300/20 bg-black/50 py-3 pl-11 pr-4 text-white placeholder-blue-100/40 outline-none focus:ring-2 focus:ring-[#2f79c9]/30"
              />
            </form>

            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-blue-100/80">
                Status
              </div>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-blue-300/20 bg-black/50 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-[#2f79c9]/30"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3">
              <div className="text-[12px] text-blue-100/60">Total</div>
              <div className="text-[14px] font-extrabold text-white">
                {meta.total || 0}
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-blue-300/20">
            <div className="overflow-x-auto">
              <table className="min-w-[1250px] w-full">
                <thead className="bg-black/70">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-[12px] font-extrabold text-blue-100/80">
                      User
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-blue-100/80">
                      Method
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-blue-100/80">
                      Wallet
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-blue-100/80">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-blue-100/80">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-blue-100/80">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-blue-100/80">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-black/40">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-[13px] text-blue-100/70"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : list.length ? (
                    list.map((r) => {
                      const statusText = String(r?.status || "pending");
                      const createdAt = r?.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : "—";

                      const userId = r?.user?.userId || "—";
                      const phone = r?.user?.phone || "";
                      const email = r?.user?.email || "";

                      const methodName =
                        r?.walletSnapshot?.methodName?.en ||
                        r?.walletSnapshot?.methodName?.bn ||
                        r?.methodId ||
                        "—";

                      const walletType = typeText(
                        r?.walletSnapshot?.walletType || r?.wallet?.walletType,
                      );

                      const walletNumber =
                        r?.walletSnapshot?.walletNumber ||
                        r?.wallet?.walletNumber ||
                        "—";

                      const walletLabel =
                        r?.walletSnapshot?.label || r?.wallet?.label || "";

                      return (
                        <tr
                          key={r._id}
                          className="border-t border-blue-300/15 transition hover:bg-blue-900/10"
                        >
                          <td className="px-4 py-4">
                            <div className="text-[13px] font-extrabold text-white">
                              {userId}
                            </div>
                            <div className="text-[12px] text-blue-100/60">
                              {phone || "—"}
                            </div>
                            {email ? (
                              <div className="text-[12px] text-blue-100/50">
                                {email}
                              </div>
                            ) : null}
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-[13px] font-extrabold text-white">
                              {methodName}
                            </div>
                            <div className="text-[12px] text-blue-100/60">
                              {String(r?.methodId || "—").toUpperCase()}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-[13px] font-extrabold text-white">
                              {walletNumber}
                            </div>
                            <div className="text-[12px] text-blue-100/60">
                              {walletType}
                            </div>
                            {walletLabel ? (
                              <div className="text-[12px] text-blue-100/50">
                                {walletLabel}
                              </div>
                            ) : null}
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-[13px] font-extrabold text-white">
                              {money(r?.amount || 0)}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold ${chipClass(
                                statusText,
                              )}`}
                            >
                              {statusText.toUpperCase()}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-[12px] text-blue-100/70">
                            {createdAt}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/withdraw-request/${r._id}`)
                                }
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/40 px-3 py-2 text-[12px] font-extrabold text-blue-100 transition hover:bg-blue-900/25"
                              >
                                <FaEye />
                                Details
                              </button>

                              <button
                                onClick={() => openApprove(r)}
                                disabled={statusText !== "pending"}
                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-extrabold transition ${
                                  statusText === "pending"
                                    ? "cursor-pointer border border-emerald-400/30 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/25"
                                    : "cursor-not-allowed opacity-50 border border-emerald-400/20 bg-emerald-500/10 text-emerald-200/70"
                                }`}
                              >
                                <FaCheckCircle />
                                Approve
                              </button>

                              <button
                                onClick={() => openReject(r)}
                                disabled={statusText !== "pending"}
                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-extrabold transition ${
                                  statusText === "pending"
                                    ? "cursor-pointer border border-red-400/30 bg-red-500/20 text-red-200 hover:bg-red-500/25"
                                    : "cursor-not-allowed opacity-50 border border-red-400/20 bg-red-500/10 text-red-200/70"
                                }`}
                              >
                                <FaTimesCircle />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-[13px] text-blue-100/70"
                      >
                        No withdraw requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] text-blue-100/70">
              Page{" "}
              <span className="font-extrabold text-white">{meta.page}</span> of{" "}
              <span className="font-extrabold text-white">{pageCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(Math.max(1, meta.page - 1), q, status)}
                disabled={meta.page <= 1 || loading}
                className={`inline-flex items-center gap-2 rounded-xl border border-blue-300/20 px-4 py-2 text-[13px] font-extrabold transition ${
                  meta.page <= 1 || loading
                    ? "cursor-not-allowed opacity-50 text-blue-100/60"
                    : "cursor-pointer text-blue-100 hover:bg-blue-900/25"
                }`}
              >
                <FaChevronLeft />
                Prev
              </button>

              <button
                onClick={() =>
                  fetchData(Math.min(pageCount, meta.page + 1), q, status)
                }
                disabled={meta.page >= pageCount || loading}
                className={`inline-flex items-center gap-2 rounded-xl border border-blue-300/20 px-4 py-2 text-[13px] font-extrabold transition ${
                  meta.page >= pageCount || loading
                    ? "cursor-not-allowed opacity-50 text-blue-100/60"
                    : "cursor-pointer text-blue-100 hover:bg-blue-900/25"
                }`}
              >
                Next
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={approveOpen}
        title="Approve Withdraw Request"
        description={`You are going to approve this request. Amount: ${money(
          selected?.amount || 0,
        )}`}
        confirmText="Approve"
        confirmVariant="approve"
        loading={acting}
        note={note}
        setNote={setNote}
        onClose={() => {
          if (acting) return;
          setApproveOpen(false);
          setSelected(null);
        }}
        onConfirm={approveNow}
      />

      <ConfirmModal
        open={rejectOpen}
        title="Reject Withdraw Request"
        description="Rejecting will refund the user's balance."
        confirmText="Reject"
        confirmVariant="reject"
        loading={acting}
        note={note}
        setNote={setNote}
        onClose={() => {
          if (acting) return;
          setRejectOpen(false);
          setSelected(null);
        }}
        onConfirm={rejectNow}
      />
    </div>
  );
};

export default WithdrawRequest;
