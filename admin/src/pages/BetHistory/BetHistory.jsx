import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaSyncAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaGamepad,
} from "react-icons/fa";
import { api } from "../../api/axios";

const fmtMoney = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "0.00";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fmtDateTime = (d) => {
  if (!d) return "-";

  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";

  return dt.toLocaleString();
};

const statusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (["won", "settled"].includes(s)) {
    return "border border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }

  if (["lost", "error", "void"].includes(s)) {
    return "border border-red-400/30 bg-red-500/15 text-red-200";
  }

  if (["refunded", "cancelled"].includes(s)) {
    return "border border-yellow-400/30 bg-yellow-500/15 text-yellow-200";
  }

  return "border border-blue-300/20 bg-black/35 text-blue-100";
};

const typeClass = (type) => {
  const t = String(type || "").toUpperCase();

  if (t === "BET") {
    return "border border-blue-300/30 bg-blue-500/15 text-blue-100";
  }

  if (["SETTLE", "BONUS", "PROMO"].includes(t)) {
    return "border border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }

  if (["REFUND", "CANCEL", "CANCELBET"].includes(t)) {
    return "border border-yellow-400/30 bg-yellow-500/15 text-yellow-200";
  }

  return "border border-blue-300/20 bg-black/35 text-blue-100";
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-blue-300/10 py-2 last:border-b-0">
    <div className="text-[12px] font-bold text-blue-100/55">{label}</div>
    <div className="break-all text-right text-[12px] font-semibold text-white/90">
      {value || "-"}
    </div>
  </div>
);

const BetHistory = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [status, setStatus] = useState("");
  const [betType, setBetType] = useState("");
  const [provider, setProvider] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit,
      status: status || undefined,
      bet_type: betType || undefined,
      provider_code: provider || undefined,
      game_code: gameCode || undefined,
      search: search || undefined,
      userSearch: userSearch || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [
      page,
      limit,
      status,
      betType,
      provider,
      gameCode,
      search,
      userSearch,
      from,
      to,
    ],
  );

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-bet-history", params],
    queryFn: async () => {
      const res = await api.get("/api/history/admin/bet-history", { params });
      return res.data;
    },
    staleTime: 10_000,
    retry: 1,
  });

  const rows = data?.data || [];
  const meta = data?.meta || {};
  const totalPages = meta?.totalPages || data?.totalPages || 1;
  const total = meta?.total || data?.total || 0;

  const clearFilters = () => {
    setPage(1);
    setStatus("");
    setBetType("");
    setProvider("");
    setGameCode("");
    setSearch("");
    setUserSearch("");
    setFrom("");
    setTo("");
  };

  return (
    <div className="min-h-[calc(100vh-120px)] text-white">

      <div className="mb-5 rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black via-[#2f79c9]/25 to-black p-4 shadow-lg shadow-blue-900/20 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-300/20 bg-[#2f79c9]/25 text-[#8fc2f5]">
                <FaGamepad className="text-xl" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  Bet History
                </h1>
                <p className="mt-1 text-sm text-blue-100/80">
                  Monitor all user game bets, settlements, transactions and
                  balances.
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[420px]">
            <div className="rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3">
              <p className="text-xs text-blue-100/70">Showing</p>
              <p className="text-lg font-semibold">{rows.length}</p>
            </div>

            <div className="rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3">
              <p className="text-xs text-blue-100/70">Total</p>
              <p className="text-lg font-semibold">{total}</p>
            </div>

            <div className="rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3">
              <p className="text-xs text-blue-100/70">Page</p>
              <p className="text-lg font-semibold">
                {page}/{totalPages}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 p-4 shadow-lg shadow-blue-900/20 md:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-blue-100">
          <FaFilter className="text-[#8fc2f5]" />
          Filters
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fc2f5]" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Txn, round, verification..."
              className="h-11 w-full rounded-xl border border-blue-300/20 bg-black/60 pl-11 pr-4 text-sm text-white placeholder-blue-100/40 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
            />
          </div>

          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fc2f5]" />
            <input
              value={userSearch}
              onChange={(e) => {
                setPage(1);
                setUserSearch(e.target.value);
              }}
              placeholder="User ID, phone, email..."
              className="h-11 w-full rounded-xl border border-blue-300/20 bg-black/60 pl-11 pr-4 text-sm text-white placeholder-blue-100/40 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="h-11 rounded-xl border border-blue-300/20 bg-black/60 px-3 text-sm text-white outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
          >
            <option value="">All Status</option>
            <option value="bet">bet</option>
            <option value="settled">settled</option>
            <option value="won">won</option>
            <option value="lost">lost</option>
            <option value="cancelled">cancelled</option>
            <option value="refunded">refunded</option>
            <option value="error">error</option>
            <option value="void">void</option>
          </select>

          <select
            value={betType}
            onChange={(e) => {
              setPage(1);
              setBetType(e.target.value);
            }}
            className="h-11 rounded-xl border border-blue-300/20 bg-black/60 px-3 text-sm text-white outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
          >
            <option value="">All Bet Types</option>
            <option value="BET">BET</option>
            <option value="SETTLE">SETTLE</option>
            <option value="CANCEL">CANCEL</option>
            <option value="REFUND">REFUND</option>
            <option value="BONUS">BONUS</option>
            <option value="PROMO">PROMO</option>
            <option value="CANCELBET">CANCELBET</option>
          </select>

          <input
            value={provider}
            onChange={(e) => {
              setPage(1);
              setProvider(e.target.value.toUpperCase());
            }}
            placeholder="Provider code"
            className="h-11 rounded-xl border border-blue-300/20 bg-black/60 px-4 text-sm text-white placeholder-blue-100/40 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
          />

          <input
            value={gameCode}
            onChange={(e) => {
              setPage(1);
              setGameCode(e.target.value);
            }}
            placeholder="Game code"
            className="h-11 rounded-xl border border-blue-300/20 bg-black/60 px-4 text-sm text-white placeholder-blue-100/40 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
          />

          <input
            type="date"
            value={from}
            onChange={(e) => {
              setPage(1);
              setFrom(e.target.value);
            }}
            className="h-11 rounded-xl border border-blue-300/20 bg-black/60 px-4 text-sm text-white outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
          />

          <input
            type="date"
            value={to}
            onChange={(e) => {
              setPage(1);
              setTo(e.target.value);
            }}
            className="h-11 rounded-xl border border-blue-300/20 bg-black/60 px-4 text-sm text-white outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer rounded-xl border border-blue-300/20 bg-black/50 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-900/20"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-300/20 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 shadow-lg shadow-blue-900/20 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#2f79c9]/35 to-[#63a8ee]/20 text-left">
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Time
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  User
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Provider
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Game
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Type
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Status
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Amount
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Win
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Balance After
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Txn ID
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Verification
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-blue-50">
                  Round
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan="12"
                    className="px-5 py-10 text-center text-blue-100"
                  >
                    Loading bet history...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan="12"
                    className="px-5 py-10 text-center text-red-300"
                  >
                    Failed to load bet history.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan="12"
                    className="px-5 py-10 text-center text-blue-100"
                  >
                    No bet history found.
                  </td>
                </tr>
              ) : (
                rows.map((x, idx) => (
                  <tr
                    key={
                      x._id ||
                      x.verification_key ||
                      x.transaction_id ||
                      `${x.createdAt}-${idx}`
                    }
                    className={`border-t border-blue-300/10 text-sm transition hover:bg-blue-900/10 ${
                      idx % 2 === 0 ? "bg-black/20" : "bg-transparent"
                    }`}
                  >
                    <td className="px-4 py-3 text-blue-50">
                      {fmtDateTime(x.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-white">
                        {x.userId || x.user?.userId || "-"}
                      </div>
                      <div className="mt-1 text-xs text-blue-100/65">
                        {x.user?.phone
                          ? `${x.user?.countryCode || ""} ${x.user.phone}`
                          : x.user?.email || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-white">
                      {x.provider_code || "-"}
                    </td>

                    <td className="px-4 py-3 text-blue-50">
                      {x.game_code || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-[3px] text-[12px] font-bold ${typeClass(
                          x.bet_type,
                        )}`}
                      >
                        {x.bet_type || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-[3px] text-[12px] font-bold ${statusClass(
                          x.status,
                        )}`}
                      >
                        {x.status || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-bold text-white">
                      {fmtMoney(x.amount)}
                    </td>

                    <td className="px-4 py-3 text-blue-50">
                      {fmtMoney(x.win_amount)}
                    </td>

                    <td className="px-4 py-3 text-blue-50">
                      {fmtMoney(x.balance_after)}
                    </td>

                    <td className="max-w-[160px] break-all px-4 py-3 text-xs text-blue-100/75">
                      {x.transaction_id || "-"}
                    </td>

                    <td className="max-w-[170px] break-all px-4 py-3 text-xs text-blue-100/75">
                      {x.verification_key || "-"}
                    </td>

                    <td className="max-w-[160px] break-all px-4 py-3 text-xs text-blue-100/75">
                      {x.round_id || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {isLoading ? (
          <div className="rounded-2xl border border-blue-300/20 bg-black/60 p-6 text-center text-blue-100">
            Loading bet history...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center text-red-200">
            Failed to load bet history.
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-blue-300/20 bg-black/60 p-6 text-center text-blue-100">
            No bet history found.
          </div>
        ) : (
          rows.map((x, idx) => (
            <div
              key={
                x._id ||
                x.verification_key ||
                x.transaction_id ||
                `${x.createdAt}-${idx}`
              }
              className="overflow-hidden rounded-2xl border border-blue-300/20 bg-gradient-to-b from-black/90 via-[#2f79c9]/15 to-black/90 shadow-lg shadow-blue-900/20"
            >
              <div className="border-b border-blue-300/10 bg-black/35 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[12px] font-bold text-blue-100/60">
                    {fmtDateTime(x.createdAt)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-[3px] text-[11px] font-bold ${typeClass(
                        x.bet_type,
                      )}`}
                    >
                      {x.bet_type || "-"}
                    </span>

                    <span
                      className={`rounded-md px-2 py-[3px] text-[11px] font-bold ${statusClass(
                        x.status,
                      )}`}
                    >
                      {x.status || "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[14px] font-extrabold text-white">
                  {x.provider_code || "-"} • {x.game_code || "-"}
                </div>

                <div className="mt-1 text-xs text-blue-100/70">
                  User: {x.userId || x.user?.userId || "-"}
                </div>
              </div>

              <div className="p-4">
                <InfoRow label="Amount" value={fmtMoney(x.amount)} />
                <InfoRow label="Win" value={fmtMoney(x.win_amount)} />
                <InfoRow
                  label="Balance After"
                  value={fmtMoney(x.balance_after)}
                />
                <InfoRow label="Transaction ID" value={x.transaction_id} />
                <InfoRow label="Verification Key" value={x.verification_key} />
                <InfoRow label="Round ID" value={x.round_id} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black via-[#2f79c9]/20 to-black p-4 shadow-lg shadow-blue-900/20">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center text-sm text-blue-100/80 md:text-left">
            Showing{" "}
            <span className="font-semibold text-white">
              {rows.length === 0 ? 0 : (page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-white">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-semibold text-white">{total}</span> records
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/50 px-4 py-2 text-white hover:bg-blue-900/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaChevronLeft />
              Prev
            </button>

            <div className="rounded-xl border border-blue-300/20 bg-[#2f79c9]/25 px-4 py-2 text-sm font-medium text-blue-50">
              Page {page} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page >= totalPages}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-black/50 px-4 py-2 text-white hover:bg-blue-900/20 disabled:cursor-not-allowed disabled:opacity-50"
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

export default BetHistory;
