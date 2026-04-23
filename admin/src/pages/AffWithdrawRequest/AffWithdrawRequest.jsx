import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaWallet,
  FaClock,
  FaListAlt,
} from "react-icons/fa";
import { PiHandWithdrawBold } from "react-icons/pi";
import { api } from "../../api/axios";

const money = (n, currency = "BDT") => {
  const sym = String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";
  const num = Number(n || 0);
  if (Number.isNaN(num)) return `${sym} 0.00`;
  return `${sym} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  if (status === "approved") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  }
  if (status === "rejected") {
    return "bg-red-500/15 text-red-200 border-red-400/30";
  }
  return "bg-amber-500/15 text-amber-200 border-amber-400/30";
};

const cardBase =
  "rounded-3xl border border-blue-200/15 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30 overflow-hidden";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

const btnPrimary =
  `${btnBase} bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white border border-blue-300/20 shadow-lg shadow-blue-800/20 hover:from-[#7bb7f1] hover:to-[#3b88db]`;

const btnSecondary =
  `${btnBase} bg-black/35 text-blue-100 border border-blue-200/15 hover:bg-black/55`;

const btnApprove =
  `${btnBase} bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/20`;

const btnReject =
  `${btnBase} bg-red-500/15 text-red-200 border border-red-400/30 hover:bg-red-500/20`;

const StatCard = ({ icon, title, value, sub }) => (
  <div className="rounded-2xl border border-blue-200/12 bg-black/25 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm text-blue-100/60">{title}</div>
        <div className="mt-1 text-xl font-extrabold text-white">{value}</div>
        {sub ? <div className="mt-1 text-xs text-blue-100/45">{sub}</div> : null}
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2f79c9]/20 border border-blue-300/10 text-[#8fc2f5] shrink-0">
        {icon}
      </div>
    </div>
  </div>
);

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText,
  confirmClass,
  loading,
  note,
  setNote,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative w-full max-w-[540px] rounded-3xl border border-blue-200/15 bg-gradient-to-b from-black via-[#1d4175] to-black shadow-2xl shadow-blue-900/40">
        <div className="border-b border-blue-200/10 p-5">
          <div className="text-lg font-extrabold text-white">{title}</div>
          <div className="mt-1 text-sm text-blue-100/70 leading-6">
            {description}
          </div>
        </div>

        <div className="p-5">
          <div className="text-sm font-bold text-blue-100/80">
            Admin Note (optional)
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a note for affiliate..."
            className="mt-3 w-full min-h-[110px] rounded-2xl bg-black/50 border border-blue-200/15 text-white placeholder-blue-100/35 p-4 outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee]"
          />
        </div>

        <div className="p-5 pt-0 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={btnSecondary}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`${confirmClass} ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const AffWithdrawRequest = () => {
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

  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    for (const row of list) {
      if (row?.status === "approved") approved += 1;
      else if (row?.status === "rejected") rejected += 1;
      else pending += 1;
    }

    return { pending, approved, rejected };
  }, [list]);

  const fetchData = async (page = meta.page, nextQ = q, nextStatus = status) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: meta.limit,
      };

      if (nextQ) params.q = nextQ;
      if (nextStatus !== "all") params.status = nextStatus;

      const { data } = await api.get("/api/admin/aff-withdraw-requests", {
        params,
      });

      const items = data?.data || [];
      const total = data?.meta?.total ?? items.length;

      setList(items);
      setMeta((prev) => ({
        ...prev,
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || prev.limit,
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
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const next = qInput.trim();
    setQ(next);
    fetchData(1, next, status);
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
      await api.patch(`/api/admin/aff-withdraw-requests/${selected._id}/approve`, {
        adminNote: note,
      });
      toast.success("Withdraw approved successfully");
      setApproveOpen(false);
      setSelected(null);
      setNote("");
      fetchData(meta.page);
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
      await api.patch(`/api/admin/aff-withdraw-requests/${selected._id}/reject`, {
        adminNote: note,
      });
      toast.success("Withdraw rejected successfully");
      setRejectOpen(false);
      setSelected(null);
      setNote("");
      fetchData(meta.page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Reject failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className={cardBase}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/45 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] border border-blue-300/20 shadow-lg shadow-blue-800/20">
                  <PiHandWithdrawBold className="text-white text-3xl" />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Affiliate Withdraw Requests
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/75">
                    Approve or reject affiliate withdrawal requests from admin panel
                  </p>
                </div>
              </div>

              <button onClick={() => fetchData(meta.page)} className={btnSecondary}>
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<FaListAlt />}
                title="Total Requests"
                value={meta.total || 0}
                sub="All matched requests"
              />
              <StatCard
                icon={<FaClock />}
                title="Pending"
                value={stats.pending}
                sub="Current page summary"
              />
              <StatCard
                icon={<FaCheckCircle />}
                title="Approved"
                value={stats.approved}
                sub="Current page summary"
              />
              <StatCard
                icon={<FaTimesCircle />}
                title="Rejected"
                value={stats.rejected}
                sub="Current page summary"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px_170px] gap-4">
              <form onSubmit={onSearch} className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fc2f5]" />
                <input
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  placeholder="Search by userId / phone / email / method..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-black/45 border border-blue-200/15 text-white placeholder-blue-100/35 outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee]"
                />
              </form>

              <select
                value={status}
                onChange={(e) => {
                  const next = e.target.value;
                  setStatus(next);
                  fetchData(1, q, next);
                }}
                className="cursor-pointer w-full py-3 px-4 rounded-2xl bg-black/45 border border-blue-200/15 text-white outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <div className="flex items-center justify-between rounded-2xl border border-blue-200/12 bg-black/25 px-4 py-3">
                <span className="text-sm text-blue-100/60">Page</span>
                <span className="text-sm font-extrabold text-white">
                  {meta.page} / {pageCount}
                </span>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-blue-200/10">
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-[1100px] w-full">
                  <thead className="bg-black/45">
                    <tr className="text-left">
                      <th className="px-5 py-4 text-sm font-bold text-[#a8d1fb]">
                        Affiliate
                      </th>
                      <th className="px-5 py-4 text-sm font-bold text-[#a8d1fb]">
                        Method
                      </th>
                      <th className="px-5 py-4 text-sm font-bold text-[#a8d1fb]">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-sm font-bold text-[#a8d1fb]">
                        Status
                      </th>
                      <th className="px-5 py-4 text-sm font-bold text-[#a8d1fb]">
                        Date
                      </th>
                      <th className="px-5 py-4 text-sm font-bold text-[#a8d1fb] text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-black/20">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-blue-100/60">
                          Loading...
                        </td>
                      </tr>
                    ) : list.length ? (
                      list.map((r) => {
                        const statusText = String(r?.status || "pending");
                        const createdAt = r?.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : "—";

                        const name = r?.user?.fullName || "No Name";
                        const userId = r?.user?.userId || "—";
                        const phone = r?.user?.phone || "—";
                        const currency = r?.user?.currency || "BDT";

                        return (
                          <tr
                            key={r._id}
                            className="border-t border-blue-200/10 hover:bg-[#2f79c9]/8 transition"
                          >
                            <td className="px-5 py-4">
                              <div className="text-sm font-extrabold text-white">{name}</div>
                              <div className="mt-1 text-xs text-blue-100/55">{userId}</div>
                              <div className="text-xs text-blue-100/45">{phone}</div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="text-sm font-bold text-white">
                                {String(r?.methodId || "—").toUpperCase()}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/10 bg-black/25 px-3 py-1.5 text-sm font-bold text-white">
                                <FaWallet className="text-[#8fc2f5]" />
                                {money(r?.amount || 0, currency)}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${chipClass(
                                  statusText,
                                )}`}
                              >
                                {statusText.toUpperCase()}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-xs text-blue-100/60">
                              {createdAt}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    navigate(`/aff-withdraw-request-details/${r._id}`)
                                  }
                                  className={btnSecondary}
                                >
                                  <FaEye />
                                  Details
                                </button>

                                <button
                                  onClick={() => openApprove(r)}
                                  disabled={statusText !== "pending"}
                                  className={
                                    statusText === "pending"
                                      ? btnApprove
                                      : `${btnApprove} opacity-50 cursor-not-allowed`
                                  }
                                >
                                  <FaCheckCircle />
                                  Approve
                                </button>

                                <button
                                  onClick={() => openReject(r)}
                                  disabled={statusText !== "pending"}
                                  className={
                                    statusText === "pending"
                                      ? btnReject
                                      : `${btnReject} opacity-50 cursor-not-allowed`
                                  }
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
                        <td colSpan={6} className="px-5 py-12 text-center text-blue-100/55">
                          No affiliate withdraw requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden p-4 space-y-4 bg-black/15">
                {loading ? (
                  <div className="py-10 text-center text-blue-100/60">Loading...</div>
                ) : list.length ? (
                  list.map((r) => {
                    const statusText = String(r?.status || "pending");
                    const createdAt = r?.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "—";

                    const name = r?.user?.fullName || "No Name";
                    const userId = r?.user?.userId || "—";
                    const phone = r?.user?.phone || "—";
                    const currency = r?.user?.currency || "BDT";

                    return (
                      <div
                        key={r._id}
                        className="rounded-3xl border border-blue-200/10 bg-gradient-to-br from-black/45 to-[#2f79c9]/10 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold text-white">{name}</div>
                            <div className="mt-1 text-xs text-blue-100/55">{userId}</div>
                            <div className="text-xs text-blue-100/45">{phone}</div>
                          </div>

                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chipClass(
                              statusText,
                            )}`}
                          >
                            {statusText.toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                            <div className="text-[11px] text-blue-100/45">Method</div>
                            <div className="mt-1 text-sm font-bold text-white">
                              {String(r?.methodId || "—").toUpperCase()}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-3">
                            <div className="text-[11px] text-blue-100/45">Amount</div>
                            <div className="mt-1 text-sm font-bold text-white">
                              {money(r?.amount || 0, currency)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-blue-100/50">{createdAt}</div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              navigate(`/aff-withdraw-request-details/${r._id}`)
                            }
                            className={btnSecondary}
                          >
                            <FaEye />
                            Details
                          </button>

                          <button
                            onClick={() => openApprove(r)}
                            disabled={statusText !== "pending"}
                            className={
                              statusText === "pending"
                                ? btnApprove
                                : `${btnApprove} opacity-50 cursor-not-allowed`
                            }
                          >
                            <FaCheckCircle />
                            Approve
                          </button>

                          <button
                            onClick={() => openReject(r)}
                            disabled={statusText !== "pending"}
                            className={
                              statusText === "pending"
                                ? btnReject
                                : `${btnReject} opacity-50 cursor-not-allowed`
                            }
                          >
                            <FaTimesCircle />
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-blue-100/55">
                    No affiliate withdraw requests found.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-blue-100/65">
                Page <span className="font-extrabold text-white">{meta.page}</span> of{" "}
                <span className="font-extrabold text-white">{pageCount}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchData(Math.max(1, meta.page - 1))}
                  disabled={meta.page <= 1 || loading}
                  className={btnSecondary}
                >
                  Prev
                </button>

                <button
                  onClick={() => fetchData(Math.min(pageCount, meta.page + 1))}
                  disabled={meta.page >= pageCount || loading}
                  className={btnSecondary}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={approveOpen}
        title="Approve Affiliate Withdraw Request"
        description={`You are going to approve this request. Amount: ${money(
          selected?.amount || 0,
          selected?.user?.currency || "BDT",
        )}`}
        confirmText="Approve"
        confirmClass={btnApprove}
        loading={acting}
        note={note}
        setNote={setNote}
        onClose={() => {
          if (acting) return;
          setApproveOpen(false);
          setSelected(null);
          setNote("");
        }}
        onConfirm={approveNow}
      />

      <ConfirmModal
        open={rejectOpen}
        title="Reject Affiliate Withdraw Request"
        description="Rejecting will refund the affiliate user's balance."
        confirmText="Reject"
        confirmClass={btnReject}
        loading={acting}
        note={note}
        setNote={setNote}
        onClose={() => {
          if (acting) return;
          setRejectOpen(false);
          setSelected(null);
          setNote("");
        }}
        onConfirm={rejectNow}
      />
    </div>
  );
};

export default AffWithdrawRequest;