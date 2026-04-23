import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  FaSyncAlt,
  FaEye,
  FaListAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import { api } from "../../api/axios";
import {
  selectAuth,
  selectUser,
} from "../../features/auth/authSelectors";

const symbolByCurrency = (c) =>
  String(c || "BDT").toUpperCase() === "USDT" ? "$" : "৳";

const formatMoney = (n, sym = "৳") => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return `${sym} 0.00`;
  return `${sym} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chip = (status) => {
  const s = String(status || "pending");
  if (s === "approved") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  }
  if (s === "rejected") {
    return "bg-red-500/15 text-red-200 border-red-400/30";
  }
  return "bg-amber-500/15 text-amber-200 border-amber-400/30";
};

const cardBase =
  "rounded-3xl border border-blue-200/15 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30 overflow-hidden";

const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold bg-black/35 text-blue-100 border border-blue-200/15 hover:bg-black/55 transition disabled:opacity-60 disabled:cursor-not-allowed";

const StatCard = ({ icon, title, value, sub }) => (
  <div className="rounded-2xl border border-blue-200/12 bg-black/25 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm text-blue-100/60">{title}</div>
        <div className="mt-1 text-xl font-extrabold text-white">{value}</div>
        {sub ? <div className="mt-1 text-xs text-blue-100/45">{sub}</div> : null}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2f79c9]/20 border border-blue-300/10 text-[#8fc2f5]">
        {icon}
      </div>
    </div>
  </div>
);

const WithdrawHistory = () => {
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const token = auth?.token;
  const user = useSelector(selectUser);

  const currency = user?.currency || "BDT";
  const sym = useMemo(() => symbolByCurrency(currency), [currency]);

  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    items.forEach((item) => {
      const s = String(item?.status || "pending");
      if (s === "approved") approved += 1;
      else if (s === "rejected") rejected += 1;
      else pending += 1;
    });

    return { pending, approved, rejected };
  }, [items]);

  const fetchData = async (page = 1) => {
    if (!token) {
      setItems([]);
      setMeta((m) => ({ ...m, page: 1, total: 0 }));
      return;
    }

    try {
      setLoading(true);

      const params = { page, limit: meta.limit };
      if (status !== "all") params.status = status;

      const { data } = await api.get("/api/aff-withdraw-requests/my", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const rows = data?.data || [];
      const total = data?.meta?.total ?? rows.length;

      setItems(Array.isArray(rows) ? rows : []);
      setMeta((m) => ({
        ...m,
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || m.limit,
        total,
      }));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load withdraw history");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <div className={cardBase}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/45 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Withdraw History
                </div>
                <div className="mt-1 text-sm text-blue-100/75">
                  Your previous withdraw requests
                </div>
              </div>

              <button
                onClick={() => fetchData(meta.page)}
                disabled={loading}
                className={btnSecondary}
              >
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

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-extrabold text-blue-100/80">
                  Status
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="cursor-pointer w-full py-3 px-4 rounded-2xl bg-black/45 border border-blue-200/15 text-white outline-none focus:ring-2 focus:ring-[#63a8ee]/30 focus:border-[#63a8ee]"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-black/25 border border-blue-200/10 px-4 py-3">
                <div className="text-sm text-blue-100/60">Total</div>
                <div className="text-sm font-extrabold text-white">
                  {meta.total || 0}
                </div>
              </div>
            </div>

            <div className="mt-6 hidden md:block rounded-3xl border border-blue-200/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full">
                  <thead className="bg-black/45">
                    <tr className="text-left">
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
                      <th className="px-5 py-4 text-sm font-bold text-[#a8d1fb]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-black/20">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-blue-100/60">
                          Loading...
                        </td>
                      </tr>
                    ) : items.length ? (
                      items.map((r) => {
                        const st = String(r?.status || "pending");
                        const dt = r?.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : "—";

                        return (
                          <tr
                            key={r._id}
                            className="border-t border-blue-200/10 hover:bg-[#2f79c9]/8 transition"
                          >
                            <td className="px-5 py-4">
                              <div className="text-sm font-extrabold text-white">
                                {String(r?.methodId || "—").toUpperCase()}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="text-sm font-extrabold text-white">
                                {formatMoney(r?.amount || 0, sym)}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${chip(
                                  st,
                                )}`}
                              >
                                {st.toUpperCase()}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-xs text-blue-100/60">
                              {dt}
                            </td>

                            <td className="px-5 py-4">
                              <button
                                onClick={() =>
                                  navigate(`/dashboard/withdraw-history/${r._id}`)
                                }
                                className={btnSecondary}
                              >
                                <FaEye />
                                Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-blue-100/55">
                          No withdraw history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 md:hidden space-y-4">
              {loading ? (
                <div className="p-5 rounded-3xl border border-blue-200/10 bg-black/25 text-sm text-blue-100/60 text-center">
                  Loading...
                </div>
              ) : items.length ? (
                items.map((r) => {
                  const st = String(r?.status || "pending");
                  const dt = r?.createdAt
                    ? new Date(r.createdAt).toLocaleString()
                    : "—";

                  return (
                    <div
                      key={r._id}
                      className="rounded-3xl border border-blue-200/10 bg-gradient-to-br from-black/45 to-[#2f79c9]/10 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-extrabold text-white">
                            {String(r?.methodId || "—").toUpperCase()}
                          </div>
                          <div className="mt-1 text-xs text-blue-100/60">{dt}</div>
                        </div>

                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chip(
                            st,
                          )}`}
                        >
                          {st.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-3 text-lg font-extrabold text-white">
                        {formatMoney(r?.amount || 0, sym)}
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/dashboard/withdraw-history/${r._id}`)
                        }
                        className={`mt-4 ${btnSecondary}`}
                      >
                        <FaEye />
                        Details
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-5 rounded-3xl border border-blue-200/10 bg-black/25 text-sm text-blue-100/55 text-center">
                  No withdraw history found.
                </div>
              )}
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

            {!token && (
              <div className="mt-4 text-sm text-blue-100/65">
                You are not logged in. Please login to view withdraw history.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawHistory;