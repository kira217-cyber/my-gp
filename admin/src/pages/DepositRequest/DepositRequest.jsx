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
  FaMoneyCheckAlt,
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
  if (status === "approved") {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }
  if (status === "rejected") {
    return "border-red-400/30 bg-red-500/15 text-red-200";
  }
  return "border-yellow-400/30 bg-yellow-500/15 text-yellow-200";
};

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "approve",
  note,
  setNote,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const btnClass =
    confirmVariant === "reject"
      ? "from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
      : "from-[#2f79c9] to-[#5aa1ee] hover:from-[#2569b0] hover:to-[#6eaef1]";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <div className="bg-[#0f172a] p-5">
          <div className="text-xl font-black text-white">{title}</div>
          <div className="mt-1 text-[13px] text-slate-300">{description}</div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-slate-300">
              Admin Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2f79c9]/40"
              placeholder="Write note..."
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-slate-200 transition hover:bg-white/5"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`cursor-pointer rounded-xl bg-gradient-to-r px-4 py-2 font-black text-white shadow-lg ${btnClass}`}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DepositRequest = () => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });

  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("pending");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("approve");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const fetchData = async (page = meta.page) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: meta.limit,
      };

      if (status !== "all") params.status = status;
      if (q) params.q = q;

      const { data } = await api.get("/api/admin/deposit-requests", { params });

      setList(data?.data || []);
      setMeta((m) => ({
        ...m,
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || m.limit,
        total: data?.meta?.total || 0,
      }));
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load deposit requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [status, q]);

  const openConfirm = (type, row) => {
    setSelected(row);
    setConfirmType(type);
    setNote("");
    setConfirmOpen(true);
  };

  const doAction = async () => {
    if (!selected?._id) return;

    try {
      setActionLoading(true);

      if (confirmType === "approve") {
        await api.post(`/api/admin/deposit-requests/${selected._id}/approve`, {
          adminNote: note,
        });
        toast.success("Deposit approved successfully");
      } else {
        await api.post(`/api/admin/deposit-requests/${selected._id}/reject`, {
          adminNote: note,
        });
        toast.success("Deposit rejected successfully");
      }

      setConfirmOpen(false);
      setSelected(null);
      await fetchData(meta.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    setQ(qInput.trim());
  };

  return (
    <div className="w-full text-white">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-2xl">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f79c9] to-[#5aa1ee] text-white shadow-lg">
              <FaMoneyCheckAlt className="text-2xl" />
            </div>

            <div>
              <div className="text-2xl font-black tracking-tight text-white">
                Deposit Requests
              </div>
              <div className="mt-1 text-[13px] text-slate-300">
                Review pending deposits, approve or reject with notes.
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchData(meta.page)}
            className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5"
          >
            <span className="inline-flex items-center gap-2">
              <FaSyncAlt />
              Refresh
            </span>
          </button>
        </div>

        <div className="px-5 pb-5 md:px-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_140px]">
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5aa1ee]" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search by userId, phone or email..."
                className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2f79c9]/40"
              />
            </form>

            <div className="flex items-center gap-2">
              <div className="text-[12px] font-black text-slate-300">
                Status
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-[#2f79c9]/40"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 lg:justify-end">
              <div className="text-[12px] text-slate-300">Total</div>
              <div className="text-[14px] font-black text-white">
                {meta.total || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 pb-4 md:px-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full">
                <thead className="bg-white/5">
                  <tr className="text-left text-[12px] uppercase tracking-wider text-slate-300">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Number</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Turnover</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-slate-300"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : list.length ? (
                    list.map((r) => {
                      const userId = r?.user?.userId || "—";
                      const phone = r?.user?.phone || "";
                      const email = r?.user?.email || "";
                      const method = r?.methodId || "—";
                      const contactNumber =
                        r?.display?.contactNumber || r?.channelId || "—";
                      const amt = Number(r?.amount || 0);
                      const turnover = Number(r?.calc?.targetTurnover || 0);

                      return (
                        <tr
                          key={r._id}
                          className="border-t border-white/10 transition hover:bg-white/5"
                        >
                          <td className="px-5 py-4">
                            <div className="text-[14px] font-black text-white">
                              {userId}
                            </div>
                            <div className="text-[12px] text-slate-300">
                              {phone}
                            </div>
                            {email ? (
                              <div className="text-[12px] text-slate-400">
                                {email}
                              </div>
                            ) : null}
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[13px] font-bold text-slate-100">
                              {method.toUpperCase()}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[13px] font-semibold text-slate-200">
                              {contactNumber}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[14px] font-black text-white">
                              {money(amt)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[14px] font-black text-white">
                              {money(turnover)}
                            </div>
                            <div className="text-[12px] text-slate-400">
                              x{r?.calc?.turnoverMultiplier ?? 1}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-black ${chipClass(
                                r?.status,
                              )}`}
                            >
                              {String(r?.status || "pending").toUpperCase()}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[13px] text-slate-200">
                              {new Date(r?.createdAt).toLocaleString()}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/deposit-request/${r._id}`)
                                }
                                className="cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-slate-100 transition hover:bg-white/5"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <FaEye />
                                  View
                                </span>
                              </button>

                              <button
                                onClick={() => openConfirm("approve", r)}
                                disabled={r?.status !== "pending"}
                                className={`rounded-xl px-3 py-2 font-black text-white shadow-lg ${
                                  r?.status === "pending"
                                    ? "cursor-pointer bg-gradient-to-r from-[#2f79c9] to-[#5aa1ee] hover:from-[#2569b0] hover:to-[#6eaef1]"
                                    : "cursor-not-allowed bg-slate-600/50 text-white/50"
                                }`}
                              >
                                <span className="inline-flex items-center gap-2">
                                  <FaCheckCircle />
                                  Approve
                                </span>
                              </button>

                              <button
                                onClick={() => openConfirm("reject", r)}
                                disabled={r?.status !== "pending"}
                                className={`rounded-xl px-3 py-2 font-black text-white shadow-lg ${
                                  r?.status === "pending"
                                    ? "cursor-pointer bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
                                    : "cursor-not-allowed bg-slate-600/50 text-white/50"
                                }`}
                              >
                                <span className="inline-flex items-center gap-2">
                                  <FaTimesCircle />
                                  Reject
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-slate-300"
                      >
                        No deposit requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 bg-black/20 px-5 py-4 md:flex-row">
              <div className="text-[12px] text-slate-300">
                Page <span className="font-black text-white">{meta.page}</span>{" "}
                of <span className="font-black text-white">{pageCount}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(Math.max(1, meta.page - 1))}
                  disabled={meta.page <= 1 || loading}
                  className={`cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-slate-100 transition ${
                    meta.page <= 1 || loading
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <FaChevronLeft />
                    Prev
                  </span>
                </button>

                <button
                  onClick={() => fetchData(Math.min(pageCount, meta.page + 1))}
                  disabled={meta.page >= pageCount || loading}
                  className={`cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-slate-100 transition ${
                    meta.page >= pageCount || loading
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    Next
                    <FaChevronRight />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={
          confirmType === "approve" ? "Approve Deposit?" : "Reject Deposit?"
        }
        description={
          confirmType === "approve"
            ? "This will add amount to user balance and create turnover."
            : "This will reject the request. No balance will be added."
        }
        confirmText={confirmType === "approve" ? "Yes, Approve" : "Yes, Reject"}
        confirmVariant={confirmType}
        note={note}
        setNote={setNote}
        loading={actionLoading}
        onClose={() => {
          if (actionLoading) return;
          setConfirmOpen(false);
        }}
        onConfirm={doAction}
      />
    </div>
  );
};

export default DepositRequest;
