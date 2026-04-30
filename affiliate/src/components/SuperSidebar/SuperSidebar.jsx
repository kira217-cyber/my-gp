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
import { FaCodePullRequest } from "react-icons/fa6";
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
import { IoMdAddCircle } from "react-icons/io";
import { api } from "../../api/axios";

const SuperSidebar = () => {
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

      const { data } = await api.get("/api/super-affiliate/me/balance", {
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
        to: "/super-dashboard",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        to: "/super-dashboard/my-users",
        icon: <FaUsers />,
        text: "My Affiliates",
      },
      {
        to: "/super-dashboard/aff-add-withdraw",
        icon: <IoMdAddCircle />,
        text: "Add Withdraw",
      },
      {
        to: "/super-dashboard/aff-withdraw-request",
        icon: <FaCodePullRequest />,
        text: "M Withdraw Request",
      },
      {
        to: "/super-dashboard/withdraw",
        icon: <RiMoneyDollarCircleFill />,
        text: "Withdraw",
      },
      {
        to: "/super-dashboard/withdraw-history",
        icon: <FaBullhorn />,
        text: "Withdraw History",
      },
      {
        to: "/super-dashboard/commission-status",
        icon: <FaChartBar />,
        text: "Commission Status",
      },
    ],
    [],
  );

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#f8fbff] text-white">
      <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-blue-200/20 bg-gradient-to-r from-[#1f3f73] via-[#2f79c9] to-[#63a8ee] px-4 py-3 shadow-lg shadow-blue-900/30 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-white/15"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
          <FaWallet className="text-sm text-white" />
          <span className="text-[12px] font-extrabold whitespace-nowrap text-white">
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
              className={`text-xs text-white ${
                balanceLoading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        <Link to="/super-dashboard/profile" className="cursor-pointer">
          <FaUserCircle className="text-2xl text-white transition-colors hover:text-blue-100" />
        </Link>
      </div>

      {open && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed top-0 left-0 z-50 flex h-full w-72 flex-col overflow-hidden border-r border-blue-300/20 bg-gradient-to-b from-black via-[#2f79c9] to-black shadow-2xl md:static"
        >
          <div className="flex h-full flex-col">
            <div className="shrink-0 border-b border-blue-200/15 bg-gradient-to-r from-black/70 via-[#2f79c9]/40 to-black/70 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-500/40">
                  <span className="text-3xl font-black tracking-wider text-white">
                    S
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    SUPER
                  </h2>
                  <p className="text-sm font-medium text-blue-100/90">
                    AFFILIATE Panel
                  </p>
                </div>
              </div>
            </div>

            <div className="shrink-0 px-4 pt-4">
              <div className="rounded-2xl border border-blue-300/20 bg-gradient-to-r from-black/70 via-[#2f79c9]/20 to-black/70 p-4 shadow-lg shadow-blue-900/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-blue-100/70">
                      Commission Balance
                    </div>
                    <div className="mt-1 truncate text-[20px] font-extrabold text-white">
                      {formatMoney(liveBalance, liveCurrency)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fetchBalance}
                    disabled={balanceLoading || !token}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-blue-300/20 bg-[#2f79c9]/20 transition hover:bg-[#2f79c9]/35 disabled:opacity-50"
                    title="Refresh balance"
                  >
                    <FaSyncAlt
                      className={`text-blue-100 ${
                        balanceLoading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {open && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 cursor-pointer rounded-xl p-2.5 text-white transition-colors hover:bg-white/10 hover:text-blue-100 md:hidden"
              >
                <FaTimes size={24} />
              </button>
            )}

            <nav className="flex-1 overflow-y-auto px-3 py-6 [scrollbar-width:none]">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `group mb-1.5 flex cursor-pointer items-center gap-4 rounded-xl px-5 py-3.5 text-base font-medium transition-all duration-200 ${
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
                            : "text-white opacity-90 group-hover:scale-110"
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

            <div className="mt-auto shrink-0 border-t border-blue-200/15 p-5">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-blue-300/20 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-700/40 transition-all duration-300 hover:from-[#7bb7f1] hover:to-[#3b88db]"
              >
                <FaSignOutAlt className="text-white" />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-40 hidden items-center justify-between border-b border-blue-200/15 bg-gradient-to-r from-black/70 via-[#2f79c9]/25 to-black/70 px-6 py-4 shadow-sm backdrop-blur-md md:flex lg:px-10">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
                Super Dashboard
              </h1>
              <p className="mt-1 text-sm text-blue-100/75">
                Welcome to your super affiliate control panel
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 rounded-2xl border border-blue-300/20 bg-black/35 px-4 py-3 shadow-lg shadow-blue-900/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/20 bg-[#2f79c9]/20">
                  <FaWallet className="text-lg text-blue-100" />
                </div>

                <div>
                  <div className="text-[11px] font-bold tracking-wide text-blue-100/70 uppercase">
                    Commission Balance
                  </div>
                  <div className="mt-1 text-[18px] leading-none font-extrabold text-white">
                    {formatMoney(liveBalance, liveCurrency)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchBalance}
                  disabled={balanceLoading || !token}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-blue-300/20 bg-[#2f79c9]/20 transition hover:bg-[#2f79c9]/35 disabled:opacity-50"
                  title="Refresh balance"
                >
                  <FaSyncAlt
                    className={`text-blue-100 ${
                      balanceLoading ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>

              <Link
                to="/super-dashboard/profile"
                className="cursor-pointer rounded-full p-1 transition-colors hover:bg-white/10"
              >
                <FaUserCircle className="text-3xl text-blue-100 transition-colors hover:text-white" />
              </Link>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-black via-[#2f79c9]/70 to-black [scrollbar-width:none]">
            <div className="h-full">
              <div className="mt-16 p-4 text-white md:mt-0 lg:p-6">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SuperSidebar;
