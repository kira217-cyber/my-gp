import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import {
  FaHome,
  FaUsers,
  FaBullhorn,
  FaSignOutAlt,
  FaUserCircle,
  FaTimes,
  FaSyncAlt,
  FaWallet,
  FaChartBar,
} from "react-icons/fa";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../../features/auth/authSlice";
import {
  selectAuth,
  selectUser,
  selectToken,
} from "../../features/auth/authSelectors";
import { api } from "../../api/axios";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [liveBalance, setLiveBalance] = useState(0);
  const [liveCurrency, setLiveCurrency] = useState("BDT");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const tokenFromSelector = useSelector(selectToken);
  const token = tokenFromSelector || auth?.token || "";

  useEffect(() => {
    const handleResize = () => {
      const nowDesktop = window.innerWidth >= 768;
      setIsDesktop(nowDesktop);
      if (nowDesktop) setOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setLiveBalance(Number(user?.commissionBalance || 0));
    setLiveCurrency(user?.currency || "BDT");
  }, [user?.commissionBalance, user?.currency]);

  const formatMoney = useCallback((amount, currency = "BDT") => {
    const num = Number(amount || 0);
    const symbol =
      String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";

    return `${symbol} ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!token) return;

    try {
      setBalanceLoading(true);

      const { data } = await api.get("/api/affiliate/me/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load balance");
      }

      setLiveBalance(Number(data?.balance || 0));
      setLiveCurrency(data?.currency || "BDT");
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to refresh balance",
      );
    } finally {
      setBalanceLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBalance();
    }
  }, [token, fetchBalance]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
    });
    navigate("/");
  };

  const menuItems = useMemo(
    () => [
      {
        to: "/dashboard",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        to: "/dashboard/my-users",
        icon: <FaUsers />,
        text: "My Users",
      },
      {
        to: "/dashboard/withdraw",
        icon: <RiMoneyDollarCircleFill />,
        text: "Withdraw",
      },
      {
        to: "/dashboard/withdraw-history",
        icon: <FaBullhorn />,
        text: "Withdraw History",
      },
      {
        to: "/dashboard/commission-status",
        icon: <FaChartBar />,
        text: "Commission Status",
      },
    ],
    [],
  );

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#f8fbff] text-white">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1f3f73] via-[#2f79c9] to-[#63a8ee] px-4 py-3 flex items-center justify-between shadow-lg shadow-blue-900/30 border-b border-blue-200/20">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-black/20 border border-white/10 px-3 py-2">
          <FaWallet className="text-white text-sm" />
          <span className="text-[12px] font-extrabold text-white whitespace-nowrap">
            {formatMoney(liveBalance, liveCurrency)}
          </span>
          <button
            type="button"
            onClick={fetchBalance}
            disabled={balanceLoading || !token}
            className="cursor-pointer disabled:opacity-50"
            title="Refresh balance"
          >
            <FaSyncAlt
              className={`text-white text-xs ${balanceLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/dashboard/profile" className="cursor-pointer">
            <FaUserCircle className="text-2xl text-white hover:text-blue-100 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-black via-[#2f79c9] to-black border-r border-blue-300/20 shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="p-6 border-b border-blue-200/15 bg-gradient-to-r from-black/70 via-[#2f79c9]/40 to-black/70 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <span className="text-white font-black text-3xl tracking-wider">
                    M
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    MASTER
                  </h2>
                  <p className="text-sm text-blue-100/90 font-medium">
                    AFFILIATE Panel
                  </p>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="px-4 pt-4 shrink-0">
              <div className="rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black/70 via-[#2f79c9]/20 to-black/70 p-4 shadow-lg shadow-blue-900/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] text-blue-100/70 font-bold">
                      Commission Balance
                    </div>
                    <div className="mt-1 text-[20px] font-extrabold text-white truncate">
                      {formatMoney(liveBalance, liveCurrency)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fetchBalance}
                    disabled={balanceLoading || !token}
                    className="cursor-pointer h-10 w-10 rounded-xl border border-blue-300/20 bg-[#2f79c9]/20 hover:bg-[#2f79c9]/35 flex items-center justify-center transition disabled:opacity-50"
                    title="Refresh balance"
                  >
                    <FaSyncAlt
                      className={`text-blue-100 ${balanceLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Close */}
            {open && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-white/10 text-white hover:text-blue-100 md:hidden transition-colors cursor-pointer"
              >
                <FaTimes size={24} />
              </button>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto [scrollbar-width:none]">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-medium transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/40"
                        : "text-white hover:bg-blue-900/25 hover:text-blue-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`text-2xl transition-transform duration-200 ${
                          isActive
                            ? "scale-110 text-white"
                            : "opacity-90 group-hover:scale-110 text-white"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.text}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-5 border-t border-blue-200/15 mt-auto shrink-0">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db] rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-blue-700/40 border border-blue-300/20"
              >
                <FaSignOutAlt className="text-white" />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Topbar */}
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-4 border-b border-blue-200/15 bg-gradient-to-r from-black/70 via-[#2f79c9]/25 to-black/70 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-blue-100/75 mt-1">
                Welcome to your affiliate control panel
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 rounded-2xl border border-blue-300/20 bg-black/35 px-4 py-3 shadow-lg shadow-blue-900/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f79c9]/20 border border-blue-300/20">
                  <FaWallet className="text-blue-100 text-lg" />
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wide text-blue-100/70 font-bold">
                    Commission Balance
                  </div>
                  <div className="text-[18px] font-extrabold text-white leading-none mt-1">
                    {formatMoney(liveBalance, liveCurrency)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchBalance}
                  disabled={balanceLoading || !token}
                  className="cursor-pointer h-10 w-10 rounded-xl border border-blue-300/20 bg-[#2f79c9]/20 hover:bg-[#2f79c9]/35 flex items-center justify-center transition disabled:opacity-50"
                  title="Refresh balance"
                >
                  <FaSyncAlt
                    className={`text-blue-100 ${balanceLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              <Link
                to="/dashboard/profile"
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <FaUserCircle className="text-3xl text-blue-100 hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto [scrollbar-width:none] bg-gradient-to-br from-black via-[#2f79c9]/70 to-black">
            <div className="h-full">
              <div className="mt-16 md:mt-0 p-4 lg:p-6 text-white">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
