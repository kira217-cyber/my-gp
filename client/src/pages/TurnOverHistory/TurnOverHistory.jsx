import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaChartLine,
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
  const s = String(status).toLowerCase();

  if (s === "completed") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  return "bg-orange-100 text-orange-700 border border-orange-200";
};

const progressPercent = (progress, required) => {
  const p = Number(progress || 0);
  const r = Number(required || 0);
  if (!r) return 0;
  return Math.min(100, Math.max(0, (p / r) * 100));
};

const TurnOverHistory = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState({
    status: "all",
    sourceType: "all",
    startDate: "",
    endDate: "",
  });

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.sourceType !== "all") {
      params.append("sourceType", filters.sourceType);
    }
    if (filters.startDate) params.append("from", filters.startDate);
    if (filters.endDate) params.append("to", filters.endDate);

    return params.toString();
  }, [page, filters]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["turnover-history", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/history/me/turnovers?${queryParams}`);
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 15000,
    retry: 1,
  });

  const rows = data?.data || [];
  const meta = data?.meta || {};
  const totalPages = meta?.totalPages || 1;

  const handleResetFilters = () => {
    setPage(1);
    setFilters({
      status: "all",
      sourceType: "all",
      startDate: "",
      endDate: "",
    });
    toast.success("Filters cleared");
  };

  return (
    <div className="w-full bg-[#f5f8fc] px-2 pb-5 text-[#1f2937] mt-2">
      <div className="space-y-4">
        <div className="rounded-[8px] border border-[#2f79c9]/15 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2f79c9] text-white shadow-sm">
              <FaChartLine />
            </div>

            <div>
              <h2 className="text-[20px] font-black text-[#1f5f98]">
                Turnover History
              </h2>
              <p className="text-[12px] font-semibold text-slate-500">
                View your deposit and auto-deposit turnover progress
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
                Source Type
              </label>

              <select
                value={filters.sourceType}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    sourceType: e.target.value,
                  }));
                }}
                className="h-[46px] w-full rounded-xl border border-[#2f79c9]/20 bg-[#f5f8fc] px-4 text-[14px] font-semibold text-[#1f2937] outline-none focus:border-[#2f79c9]"
              >
                <option value="all">All Source</option>
                <option value="deposit">Deposit</option>
                <option value="auto-deposit">Auto Deposit</option>
              </select>
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
                <option value="running">Running</option>
                <option value="completed">Completed</option>
              </select>
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
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-[#2f79c9]/10 bg-[#2f79c9] text-left">
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    #
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Date
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Source
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Required
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Progress
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Left
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Credited
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Progress Bar
                  </th>
                  <th className="px-4 py-4 text-[13px] font-black text-white">
                    Completed At
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
                  rows.map((item, index) => {
                    const percent = progressPercent(
                      item.progress,
                      item.required,
                    );
                    const left = Math.max(
                      0,
                      Number(item.required || 0) - Number(item.progress || 0),
                    );

                    return (
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

                        <td className="px-4 py-4 text-[13px] font-black capitalize text-[#1f5f98]">
                          {item.sourceType || "N/A"}
                        </td>

                        <td className="px-4 py-4 text-[13px] font-black text-[#1f5f98]">
                          {money(item.required)}
                        </td>

                        <td className="px-4 py-4 text-[13px] font-bold text-green-600">
                          {money(item.progress)}
                        </td>

                        <td className="px-4 py-4 text-[13px] font-bold text-red-500">
                          {money(left)}
                        </td>

                        <td className="px-4 py-4 text-[13px] font-black text-[#f07a2a]">
                          {money(item.creditedAmount)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="w-[160px]">
                            <div className="mb-1 text-[11px] font-black text-[#1f5f98]">
                              {percent.toFixed(1)}%
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-[#2f79c9]/10">
                              <div
                                className="h-full rounded-full bg-[#f07a2a]"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-[13px] font-bold text-slate-600">
                          {item.completedAt
                            ? formatDate(item.completedAt)
                            : "--"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-black capitalize ${getStatusClass(
                              item.status,
                            )}`}
                          >
                            {item.status || "running"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center">
                      <div className="text-[15px] font-black text-slate-500">
                        No turnover history found
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

export default TurnOverHistory;
