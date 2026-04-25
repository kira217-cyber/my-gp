import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaBolt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (value) => {
  const num = Number(value || 0);
  return `${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TK`;
};

const formatDate = (date) => {
  if (!date) return "--";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "--";

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status = "") => {
  const s = String(status).toUpperCase();

  if (s === "PAID") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (s === "FAILED") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  return "bg-orange-100 text-orange-700 border border-orange-200";
};

const AutoDepositHistory = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
    search: "",
  });

  const [searchInput, setSearchInput] = useState("");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.startDate) params.append("from", filters.startDate);
    if (filters.endDate) params.append("to", filters.endDate);
    if (filters.search.trim()) params.append("search", filters.search.trim());

    return params.toString();
  }, [page, filters]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["auto-deposit-history", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/history/me/auto-deposits?${queryParams}`);
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 15000,
    retry: 1,
  });

  const rows = data?.data || [];
  const meta = data?.meta || {};
  const totalPages = meta?.totalPages || 1;

  const handleApplyFilters = () => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      search: searchInput,
    }));
  };

  const handleResetFilters = () => {
    setPage(1);
    setSearchInput("");
    setFilters({
      status: "all",
      startDate: "",
      endDate: "",
      search: "",
    });
    toast.success("Filters cleared");
  };

  const openFootprint = (url) => {
    if (!url) {
      toast.error("Footprint URL not found");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full bg-[#f5f8fc] px-2 pb-5 text-[#1f2937] mt-2">
      <div className="space-y-4">
        <div className="rounded-[8px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2f79c9] text-white shadow-sm">
              <FaBolt />
            </div>

            <div>
              <h2 className="text-[20px] font-black text-[#1f5f98]">
                Auto Deposit History
              </h2>
              <p className="text-[12px] font-semibold text-slate-500">
                View your auto deposit records
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3">
            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-[#1f5f98]">
                <FaCalendarAlt className="text-[#f07a2a]" />
                Start Date
              </label>

              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }));
                }}
                className="h-[46px] w-full rounded-xl border border-[#2f79c9]/20 bg-[#f5f8fc] px-4 text-[14px] font-semibold text-[#1f2937] outline-none focus:border-[#2f79c9]"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-[#1f5f98]">
                <FaCalendarAlt className="text-[#f07a2a]" />
                End Date
              </label>

              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }));
                }}
                className="h-[46px] w-full rounded-xl border border-[#2f79c9]/20 bg-[#f5f8fc] px-4 text-[14px] font-semibold text-[#1f2937] outline-none focus:border-[#2f79c9]"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-[#1f5f98]">
                <FaFilter className="text-[#f07a2a]" />
                Status
              </label>

              <select
                value={filters.status}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }));
                }}
                className="h-[46px] w-full rounded-xl border border-[#2f79c9]/20 bg-[#f5f8fc] px-4 text-[14px] font-semibold text-[#1f2937] outline-none focus:border-[#2f79c9]"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-[#1f5f98]">
                <FaSearch className="text-[#f07a2a]" />
                Search
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyFilters();
                    }}
                    placeholder="Invoice / Transaction / Bank"
                    className="h-[46px] w-full rounded-xl border border-[#2f79c9]/20 bg-[#f5f8fc] pl-10 pr-4 text-[14px] font-semibold text-[#1f2937] outline-none placeholder:text-slate-400 focus:border-[#2f79c9]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="h-[46px] cursor-pointer rounded-xl bg-[#2f79c9] px-4 text-sm font-black text-white shadow-sm hover:bg-[#1f5f98]"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-[#2f79c9]/20 bg-white px-4 text-[13px] font-black text-[#2f79c9]"
            >
              <FaSyncAlt />
              Reset
            </button>

            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-xl bg-[#f07a2a] px-4 text-[13px] font-black text-white"
            >
              <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-[#2f79c9]/15 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-[#2f79c9]/10 bg-[#2f79c9] text-left">
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    #
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Date
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Invoice
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Amount
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Bonus
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Credited
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Bank
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Transaction
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Footprint
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={10} className="px-4 py-4">
                        <div className="h-12 animate-pulse rounded-xl bg-[#2f79c9]/10" />
                      </td>
                    </tr>
                  ))
                ) : rows.length ? (
                  rows.map((item, index) => (
                    <tr
                      key={item._id}
                      className="border-b border-[#2f79c9]/10 transition hover:bg-[#2f79c9]/5"
                    >
                      <td className="px-4 py-4 text-[13px] font-bold">
                        {(page - 1) * limit + index + 1}
                      </td>

                      <td className="px-4 py-4 text-[13px] font-bold">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="max-w-[170px] px-4 py-4 text-[12px] font-black text-[#1f5f98]">
                        <span className="line-clamp-2 break-all">
                          {item.invoiceNumber || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-[13px] font-black text-[#1f5f98]">
                        {money(item.amount)}
                      </td>

                      <td className="px-4 py-4 text-[13px] font-bold text-green-600">
                        {money(item?.calc?.bonusAmount || 0)}
                      </td>

                      <td className="px-4 py-4 text-[13px] font-black text-[#f07a2a]">
                        {money(item?.calc?.creditedAmount || item.amount || 0)}
                      </td>

                      <td className="px-4 py-4 text-[13px] font-bold uppercase">
                        {item.bank || "N/A"}
                      </td>

                      <td className="max-w-[180px] px-4 py-4 text-[12px] font-bold text-slate-600">
                        <span className="line-clamp-2 break-all">
                          {item.transactionId || item.sessionCode || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {item.footprint ? (
                          <button
                            type="button"
                            onClick={() => openFootprint(item.footprint)}
                            title="Open Footprint"
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-[#2f79c9] text-white transition hover:bg-[#1f5f98]"
                          >
                            <FaExternalLinkAlt size={14} />
                          </button>
                        ) : (
                          <span className="text-[12px] font-bold text-slate-400">
                            N/A
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[12px] font-black capitalize ${getStatusClass(
                            item.status,
                          )}`}
                        >
                          {String(item.status || "PENDING").toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center">
                      <div className="text-[15px] font-black text-slate-500">
                        No auto deposit history found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 rounded-[8px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm sm:flex-row">
          <div className="text-[13px] font-bold text-slate-500">
            Total:{" "}
            <span className="font-black text-[#1f5f98]">
              {meta?.total || 0}
            </span>{" "}
            items
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#2f79c9] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft />
            </button>

            <div className="rounded-xl border border-[#2f79c9]/20 bg-[#f5f8fc] px-4 py-2 text-[13px] font-black text-[#1f5f98]">
              Page {page} / {totalPages}
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#2f79c9] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDepositHistory;
