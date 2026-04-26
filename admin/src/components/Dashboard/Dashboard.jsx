import React, { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserFriends,
  FaGamepad,
  FaWallet,
  FaHourglassHalf,
  FaArrowCircleDown,
  FaArrowCircleUp,
  FaChartPie,
  FaChartBar,
  FaCalendarAlt,
  FaClock,
  FaSyncAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (value) => {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  const [summary, setSummary] = useState({
    cards: {
      allUsers: 0,
      activeUsers: 0,
      allAffiliateUsers: 0,
      allDepositBalances: 0,
      allGames: 0,
      activeGames: 0,
      allWithdrawBalances: 0,
      pendingDepositRequest: 0,
      pendingWithdrawRequest: 0,
    },
    chart: {
      users: { active: 0, inactive: 0 },
      requests: {
        pendingDeposit: 0,
        pendingWithdraw: 0,
        approvedDepositAmount: 0,
        approvedWithdrawAmount: 0,
      },
    },
    latest: {
      users: [],
      deposits: [],
      withdraws: [],
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/dashboard/summary");
      setSummary(res?.data?.data || {});
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = useMemo(() => {
    const c = summary?.cards || {};

    return [
      {
        title: "All Users",
        value: c.allUsers || 0,
        icon: <FaUsers />,
        to: "/all-users",
        accent: "from-[#63a8ee] to-[#2f79c9]",
      },
      {
        title: "Active Users",
        value: c.activeUsers || 0,
        icon: <FaUserCheck />,
        to: "/all-users",
        accent: "from-cyan-300 to-[#2f79c9]",
      },
      {
        title: "All Affiliators",
        value: c.allAffiliateUsers || 0,
        icon: <FaUserFriends />,
        to: "/all-affiliate-users",
        accent: "from-blue-300 to-indigo-500",
      },
      {
        title: "All Deposit Balances",
        value: money(c.allDepositBalances),
        icon: <FaArrowCircleDown />,
        to: "/deposit-request",
        accent: "from-emerald-300 to-[#2f79c9]",
      },
      {
        title: "All Games",
        value: c.allGames || 0,
        icon: <FaGamepad />,
        to: "/add-games",
        accent: "from-[#8fc2f5] to-[#2f79c9]",
      },
      {
        title: "All Withdraw Balances",
        value: money(c.allWithdrawBalances),
        icon: <FaArrowCircleUp />,
        to: "/withdraw-request",
        accent: "from-purple-300 to-[#2f79c9]",
      },
      {
        title: "Pending Deposit",
        value: c.pendingDepositRequest || 0,
        icon: <FaHourglassHalf />,
        to: "/deposit-request",
        accent: "from-yellow-300 to-orange-500",
      },
      {
        title: "Pending Withdraw",
        value: c.pendingWithdrawRequest || 0,
        icon: <FaWallet />,
        to: "/withdraw-request",
        accent: "from-rose-300 to-red-500",
      },
    ];
  }, [summary]);

  const activeUsers = Number(summary?.chart?.users?.active || 0);
  const inactiveUsers = Number(summary?.chart?.users?.inactive || 0);
  const totalUsersForPie = activeUsers + inactiveUsers;

  const activePercent = totalUsersForPie
    ? Math.round((activeUsers / totalUsersForPie) * 100)
    : 0;

  const inactivePercent = totalUsersForPie ? 100 - activePercent : 0;

  const requestBars = useMemo(() => {
    const req = summary?.chart?.requests || {};

    const data = [
      { label: "Pending Deposit", value: Number(req.pendingDeposit || 0) },
      { label: "Pending Withdraw", value: Number(req.pendingWithdraw || 0) },
      {
        label: "Deposit Amount",
        value: Number(req.approvedDepositAmount || 0),
      },
      {
        label: "Withdraw Amount",
        value: Number(req.approvedWithdrawAmount || 0),
      },
    ];

    const max = Math.max(...data.map((item) => item.value), 1);

    return data.map((item) => ({
      ...item,
      height: `${Math.max((item.value / max) * 100, item.value > 0 ? 12 : 4)}%`,
    }));
  }, [summary]);

  const calendarData = useMemo(() => {
    const current = new Date(now);
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);

    return {
      monthLabel: current.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      today: current.getDate(),
      days,
    };
  }, [now]);

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-full text-white">
      <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/25 to-black shadow-2xl overflow-hidden">
        <div className="border-b border-blue-300/20 bg-gradient-to-r from-black/70 via-[#2f79c9]/40 to-black/70 px-4 sm:px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] flex items-center justify-center shadow-lg shadow-blue-700/40">
                <FaChartBar className="text-2xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-blue-100/80 mt-1">
                  Admin panel summary, charts, calendar and recent activity
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchDashboard}
              disabled={loading}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-bold text-white hover:from-[#7bb7f1] hover:to-[#3b88db] transition-all disabled:opacity-60 shadow-lg shadow-blue-700/30"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
            {cards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => navigate(card.to)}
                className="cursor-pointer text-left rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black p-5 shadow-xl hover:border-[#63a8ee]/70 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-blue-100/80 font-medium">
                      {card.title}
                    </p>
                    <h3 className="mt-3 text-2xl md:text-3xl font-extrabold text-white break-words">
                      {card.value}
                    </h3>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-white text-2xl shadow-lg`}
                  >
                    {card.icon}
                  </div>
                </div>

                <div className="mt-5 text-xs text-blue-200/80">
                  Click to open
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black p-5 md:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] flex items-center justify-center shadow-lg shadow-blue-700/30">
                  <FaChartPie className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    User Status Chart
                  </h2>
                  <p className="text-sm text-blue-100/70">
                    Active vs inactive users
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div
                  className="relative w-52 h-52 rounded-full border border-blue-300/20 shadow-inner"
                  style={{
                    background: `conic-gradient(#63a8ee 0% ${activePercent}%, #ef4444 ${activePercent}% 100%)`,
                  }}
                >
                  <div className="absolute inset-[22px] rounded-full bg-black/90 border border-blue-300/20 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">
                      {totalUsersForPie}
                    </span>
                    <span className="text-sm text-blue-100/80">
                      Total Users
                    </span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 font-medium">
                        Active Users
                      </span>
                      <span className="text-white font-bold">
                        {activeUsers}
                      </span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#63a8ee] to-[#2f79c9]"
                        style={{ width: `${activePercent}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-blue-100/70">
                      {activePercent}% of total
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-red-300 font-medium">
                        Inactive Users
                      </span>
                      <span className="text-white font-bold">
                        {inactiveUsers}
                      </span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-400 to-rose-500"
                        style={{ width: `${inactivePercent}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-blue-100/70">
                      {inactivePercent}% of total
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black p-5 md:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] flex items-center justify-center shadow-lg shadow-blue-700/30">
                  <FaChartBar className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Requests & Amount Chart
                  </h2>
                  <p className="text-sm text-blue-100/70">
                    Deposit / withdraw overview
                  </p>
                </div>
              </div>

              <div className="h-[320px] rounded-3xl border border-blue-300/15 bg-black/30 p-4">
                <div className="h-full flex items-end justify-between gap-3">
                  {requestBars.map((bar) => (
                    <div
                      key={bar.label}
                      className="flex-1 h-full flex flex-col items-center justify-end gap-3"
                    >
                      <div className="text-[11px] md:text-xs text-blue-50 font-semibold text-center break-words">
                        {bar.value.toLocaleString("en-US")}
                      </div>

                      <div className="w-full flex items-end justify-center h-[220px]">
                        <div
                          className="w-full max-w-[70px] rounded-t-2xl bg-gradient-to-t from-[#1f3f73] via-[#2f79c9] to-[#8fc2f5] shadow-lg shadow-blue-700/30 transition-all duration-500"
                          style={{ height: bar.height }}
                        />
                      </div>

                      <div className="text-[10px] md:text-xs text-blue-100/80 text-center leading-tight min-h-[30px]">
                        {bar.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black p-5 md:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] flex items-center justify-center shadow-lg shadow-blue-700/30">
                  <FaCalendarAlt className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Real Time Calendar
                  </h2>
                  <p className="text-sm text-blue-100/70">
                    {calendarData.monthLabel}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-3">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs md:text-sm font-semibold text-blue-200 py-2"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarData.days.map((day, index) => {
                  const isToday = day === calendarData.today;

                  return (
                    <div
                      key={index}
                      className={`h-14 sm:h-16 rounded-2xl border flex items-center justify-center text-sm md:text-base font-semibold ${
                        day
                          ? isToday
                            ? "border-[#8fc2f5] bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/30"
                            : "border-blue-300/20 bg-black/40 text-white"
                          : "border-transparent bg-transparent"
                      }`}
                    >
                      {day || ""}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black p-5 md:p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] flex items-center justify-center shadow-lg shadow-blue-700/30">
                    <FaClock className="text-xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Current Time
                    </h2>
                    <p className="text-sm text-blue-100/70">Live date & time</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-blue-300/20 bg-black/40 p-5 text-center">
                  <div className="text-3xl md:text-4xl font-black tracking-wide text-white">
                    {time}
                  </div>
                  <div className="mt-3 text-sm md:text-base text-blue-100/80 leading-relaxed">
                    {date}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black p-5 md:p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-5">
                  Dashboard Summary
                </h2>

                <div className="space-y-3">
                  {[
                    ["Total Users", summary?.cards?.allUsers || 0],
                    ["Affiliate Users", summary?.cards?.allAffiliateUsers || 0],
                    ["Total Games", summary?.cards?.allGames || 0],
                    ["Active Games", summary?.cards?.activeGames || 0],
                    [
                      "Pending Deposits",
                      summary?.cards?.pendingDepositRequest || 0,
                    ],
                    [
                      "Pending Withdraws",
                      summary?.cards?.pendingWithdrawRequest || 0,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-blue-300/20 bg-black/40 px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <span className="text-blue-100">{label}</span>
                      <span className="font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <LatestCard
              title="Latest Users"
              emptyText="No user found"
              items={summary?.latest?.users || []}
              render={(user) => (
                <>
                  <div className="font-semibold text-white">
                    {user?.userId || "N/A"}
                  </div>
                  <div className="text-sm text-blue-100/80 mt-1 break-all">
                    {user?.phone || "No phone"} • {user?.role || "N/A"}
                  </div>
                  <div className="text-xs text-blue-200/70 mt-1">
                    {user?.isActive ? "Active" : "Inactive"} •{" "}
                    {money(user?.balance)}
                  </div>
                </>
              )}
            />

            <LatestCard
              title="Latest Deposit Requests"
              emptyText="No deposit found"
              items={summary?.latest?.deposits || []}
              render={(item) => (
                <>
                  <div className="font-semibold text-white">
                    {item?.user?.userId || "Unknown User"}
                  </div>
                  <div className="text-sm text-blue-100/80 mt-1">
                    Amount: {money(item?.amount)}
                  </div>
                  <div className="text-xs text-blue-200/70 mt-1 uppercase">
                    Status: {item?.status || "N/A"}
                  </div>
                </>
              )}
            />

            <LatestCard
              title="Latest Withdraw Requests"
              emptyText="No withdraw found"
              items={summary?.latest?.withdraws || []}
              render={(item) => (
                <>
                  <div className="font-semibold text-white">
                    {item?.user?.userId || "Unknown User"}
                  </div>
                  <div className="text-sm text-blue-100/80 mt-1">
                    Amount: {money(item?.amount)}
                  </div>
                  <div className="text-xs text-blue-200/70 mt-1 uppercase">
                    Status: {item?.status || "N/A"}
                  </div>
                </>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const LatestCard = ({ title, emptyText, items, render }) => {
  return (
    <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black p-5 md:p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-5">{title}</h2>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-blue-300/15 bg-black/40 p-4 text-blue-100/70 text-sm">
            {emptyText}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-blue-300/15 bg-black/40 p-4 hover:border-[#63a8ee]/50 transition-all"
            >
              {render(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
