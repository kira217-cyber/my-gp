import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  FaHome,
  FaBell,
  FaSignOutAlt,
  FaSearch,
  FaUsers,
  FaUserCircle,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaPaintBrush,
  FaCog,
  FaImage,
  FaBullhorn,
  FaGamepad,
  FaLayerGroup,
  FaServer,
  FaStream,
  FaHistory,
  FaCogs,
  FaGift,
  FaCoins,
} from "react-icons/fa";
import {
  FaDiagramProject,
  FaCodePullRequest,
  FaTextSlash,
} from "react-icons/fa6";
import {
  PiBridgeBold,
  PiHandWithdrawBold,
  PiHandDepositBold,
} from "react-icons/pi";
import { HiMiniCubeTransparent } from "react-icons/hi2";
import { RiFootprintFill } from "react-icons/ri";
import { IoAppsSharp, IoDocumentText } from "react-icons/io5";
import { GrAnnounce, GrUserAdmin } from "react-icons/gr";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [affiliateOpen, setAffiliateOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const [adminRole, setAdminRole] = useState("sub");
  const [permissions, setPermissions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) setOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");

      if (storedAdmin) {
        const parsedAdmin = JSON.parse(storedAdmin);
        const role = parsedAdmin?.role === "mother" ? "mother" : "sub";
        const perms = Array.isArray(parsedAdmin?.permissions)
          ? parsedAdmin.permissions
          : [];

        setAdminRole(role);
        setPermissions(perms);
      } else {
        setAdminRole("sub");
        setPermissions([]);
      }
    } catch (error) {
      setAdminRole("sub");
      setPermissions([]);
    }
  }, []);

  const isMother = adminRole === "mother";

  const canAccess = (key) => {
    if (isMother) return true;
    return permissions.includes(key);
  };

  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        to: "/",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        key: "__mother__",
        to: "/create-admin",
        icon: <GrUserAdmin />,
        text: "Create Admin",
      },
      // {
      //   key: "add-promotion",
      //   to: "/add-promotion",
      //   icon: <FaDiagramProject />,
      //   text: "Add Promotion",
      // },
    ],
    [],
  );

  const gamesItems = useMemo(
    () => [
      {
        key: "add-game-categories",
        to: "/add-game-categories",
        icon: <FaLayerGroup />,
        text: "Add Game Categories",
      },
      {
        key: "add-providers",
        to: "/add-providers",
        icon: <FaServer />,
        text: "Add Providers",
      },
      {
        key: "add-games",
        to: "/add-games",
        icon: <FaGamepad />,
        text: "Add Games",
      },
      {
        key: "add-sports",
        to: "/add-sports",
        icon: <FaStream />,
        text: "Add Sports",
      },
      {
        key: "bet-history",
        to: "/bet-history",
        icon: <HiMiniCubeTransparent />,
        text: "Bet History",
      },
    ],
    [],
  );

  const usersItems = useMemo(
    () => [
      {
        key: "all-users",
        to: "/all-users",
        icon: <FaUsers />,
        text: "All Users",
      },
      {
        key: "all-affiliate-users",
        to: "/all-affiliate-users",
        icon: <FaUsers />,
        text: "All Master Affiliator",
      },
      {
        key: "all-super-affiliate-users",
        to: "/all-super-affiliate-users",
        icon: <FaUsers />,
        text: "All Super Affiliator",
      },
      {
        key: "bulk-adjustment",
        to: "/bulk-adjustment",
        icon: <PiBridgeBold />,
        text: "Master Bulk Adjustment",
      },
       {
        key: "super-bulk-adjustment",
        to: "/super-bulk-adjustment",
        icon: <PiBridgeBold />,
        text: "Super Bulk Adjustment",
      },
      {
        key: "user-refer-redeem",
        to: "/user-refer-redeem",
        icon: <FaCoins />,
        text: "User Refer & Redeem",
      },
      {
        key: "add-register-bonus",
        to: "/add-register-bonus",
        icon: <FaCoins />,
        text: "Add Register & Bonus",
      },
    ],
    [],
  );

  const depositItems = useMemo(
    () => [
      {
        key: "add-deposit-method",
        to: "/add-deposit-method",
        icon: <PiHandDepositBold />,
        text: "Add Deposit Method",
      },
      {
        key: "add-deposit-field",
        to: "/add-deposit-field",
        icon: <FaLayerGroup />,
        text: "Add Deposit Field",
      },
      {
        key: "add-deposit-bonus-turnover",
        to: "/add-deposit-bonus-turnover",
        icon: <FaGift />,
        text: "Add Deposit Bonus & Turnover",
      },
      {
        key: "deposit-request",
        to: "/deposit-request",
        icon: <FaCodePullRequest />,
        text: "Deposit Request",
      },
      // {
      //   key: "auto-deposit-settings",
      //   to: "/auto-deposit-settings",
      //   icon: <FaCogs />,
      //   text: "Auto Deposit Settings",
      // },
      // {
      //   key: "auto-deposit-history",
      //   to: "/auto-deposit-history",
      //   icon: <FaHistory />,
      //   text: "Auto Deposit History",
      // },
      {
        key: "auto-personal-deposit-settings",
        to: "/auto-personal-deposit-settings",
        icon: <FaCogs />,
        text: "Auto Deposit Settings",
      },
      {
        key: "auto-personal-deposit-history",
        to: "/auto-personal-deposit-history",
        icon: <FaHistory />,
        text: "Auto Deposit History",
      },
    ],
    [],
  );

  const withdrawItems = useMemo(
    () => [
      {
        key: "add-withdraw",
        to: "/add-withdraw",
        icon: <PiHandWithdrawBold />,
        text: "Add Withdraw",
      },
      {
        key: "withdraw-request",
        to: "/withdraw-request",
        icon: <FaCodePullRequest />,
        text: "Withdraw Request",
      },
      {
        key: "aff-add-withdraw",
        to: "/aff-add-withdraw",
        icon: <PiHandWithdrawBold />,
        text: "Aff Add Withdraw",
      },
      {
        key: "aff-withdraw-request",
        to: "/aff-withdraw-request",
        icon: <FaCodePullRequest />,
        text: "Aff Withdraw Request",
      },
    ],
    [],
  );

  const clientItems = useMemo(
    () => [
      {
        key: "site-identity-controller",
        to: "/site-identity-controller",
        icon: <FaCog />,
        text: "Site Identity Controller",
      },
      {
        key: "slider-controller",
        to: "/slider-controller",
        icon: <FaImage />,
        text: "Slider Controller",
      },
      {
        key: "add-social-link",
        to: "/add-social-link",
        icon: <FaImage />,
        text: "Add Social Link",
      },
      {
        key: "add-notice",
        to: "/add-notice",
        icon: <IoDocumentText />,
        text: "Add Notice",
      },
    ],
    [],
  );

  const affiliateItems = useMemo(
    () => [
      {
        key: "aff-site-identity-controller",
        to: "/aff-site-identity-controller",
        icon: <FaCog />,
        text: "Aff Site Identity Controller",
      },
      {
        key: "add-aff-notice",
        to: "/add-aff-notice",
        icon: <FaTextSlash />,
        text: "Affiliate Notice Controller",
      },
      {
        key: "aff-slider-controller",
        to: "/aff-slider-controller",
        icon: <FaPaintBrush />,
        text: "Affiliate Slider Controller",
      },
      {
        key: "add-aff-social-link",
        to: "/add-aff-social-link",
        icon: <FaImage />,
        text: "Add Affiliate Social Link",
      },
    ],
    [],
  );

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.key === "__mother__") return isMother;
      return canAccess(item.key);
    });
  }, [menuItems, isMother, permissions]);

  const visibleGamesItems = useMemo(
    () => gamesItems.filter((item) => canAccess(item.key)),
    [gamesItems, permissions, isMother],
  );

  const visibleUsersItems = useMemo(
    () => usersItems.filter((item) => canAccess(item.key)),
    [usersItems, permissions, isMother],
  );

  const visibleDepositItems = useMemo(
    () => depositItems.filter((item) => canAccess(item.key)),
    [depositItems, permissions, isMother],
  );

  const visibleWithdrawItems = useMemo(
    () => withdrawItems.filter((item) => canAccess(item.key)),
    [withdrawItems, permissions, isMother],
  );

  const visibleClientItems = useMemo(
    () => clientItems.filter((item) => canAccess(item.key)),
    [clientItems, permissions, isMother],
  );

  const visibleAffiliateItems = useMemo(
    () => affiliateItems.filter((item) => canAccess(item.key)),
    [affiliateItems, permissions, isMother],
  );

  const showGames = visibleGamesItems.length > 0;
  const showUsers = visibleUsersItems.length > 0;
  const showDeposit = visibleDepositItems.length > 0;
  const showWithdraw = visibleWithdrawItems.length > 0;
  const showClient = visibleClientItems.length > 0;
  const showAffiliate = visibleAffiliateItems.length > 0;

  useEffect(() => {
    if (!showGames) setGamesOpen(false);
    if (!showUsers) setUsersOpen(false);
    if (!showDeposit) setDepositOpen(false);
    if (!showWithdraw) setWithdrawOpen(false);
    if (!showClient) setClientOpen(false);
    if (!showAffiliate) setAffiliateOpen(false);
  }, [
    showGames,
    showUsers,
    showDeposit,
    showWithdraw,
    showClient,
    showAffiliate,
  ]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#f8fbff] text-white">
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1f3f73] via-[#2f79c9] to-[#63a8ee] px-4 py-3 flex items-center justify-between shadow-lg shadow-blue-900/30 border-b border-blue-200/20">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/15 transition-colors"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <div className="flex items-center gap-5">
          <button className="relative p-1.5">
            <FaBell className="text-xl text-white hover:text-blue-100 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-300/70"></span>
          </button>

          <NavLink to="/profile">
            <FaUserCircle className="text-2xl text-white hover:text-blue-100 transition-colors cursor-pointer" />
          </NavLink>
        </div>
      </div>

      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 24, stiffness: 190 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-black via-[#2f79c9] to-black border-r border-blue-300/20 shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-blue-200/15 bg-gradient-to-r from-black/70 via-[#2f79c9]/40 to-black/70 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <span className="text-white font-black text-3xl tracking-wider">
                    A
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    ADMIN
                  </h2>
                  <p className="text-sm text-blue-100/90 font-medium">
                    {adminRole === "mother" ? "Mother Panel" : "Sub Panel"}
                  </p>
                </div>
              </div>
            </div>

            {!isDesktop && (
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-white/10 text-white transition-colors"
              >
                <FaTimes size={22} />
              </button>
            )}

            <nav className="flex-1 px-3 py-6 overflow-y-auto [scrollbar-width:none]">
              {visibleMenuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-medium transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/40"
                        : "text-white hover:bg-blue-900/25 hover:text-blue-50"
                    }`
                  }
                >
                  <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </NavLink>
              ))}

              {showGames && (
                <DropdownSection
                  title="Games"
                  icon={<FaGamepad />}
                  open={gamesOpen}
                  setOpen={setGamesOpen}
                  items={visibleGamesItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {showUsers && (
                <DropdownSection
                  title="Users"
                  icon={<FaUsers />}
                  open={usersOpen}
                  setOpen={setUsersOpen}
                  items={visibleUsersItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {showDeposit && (
                <DropdownSection
                  title="Deposit"
                  icon={<PiHandDepositBold />}
                  open={depositOpen}
                  setOpen={setDepositOpen}
                  items={visibleDepositItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {showWithdraw && (
                <DropdownSection
                  title="Withdraw"
                  icon={<PiHandWithdrawBold />}
                  open={withdrawOpen}
                  setOpen={setWithdrawOpen}
                  items={visibleWithdrawItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {showClient && (
                <DropdownSection
                  title="Client Site Controller"
                  icon={<GrAnnounce />}
                  open={clientOpen}
                  setOpen={setClientOpen}
                  items={visibleClientItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {showAffiliate && (
                <DropdownSection
                  title="Aff Site Controller"
                  icon={<IoAppsSharp />}
                  open={affiliateOpen}
                  setOpen={setAffiliateOpen}
                  items={visibleAffiliateItems}
                  onClose={() => setOpen(false)}
                />
              )}
            </nav>

            <div className="p-5 border-t border-blue-200/15 mt-auto shrink-0">
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db] rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-blue-700/40 border border-blue-300/20"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-6 border-b border-blue-200/15 bg-gradient-to-r from-black/70 via-[#2f79c9]/25 to-black/70 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fc2f5] text-lg" />
                <input
                  type="text"
                  placeholder="Search games, users, stats..."
                  className="w-full pl-12 pr-5 py-3 bg-black/40 border border-blue-300/20 rounded-xl text-white placeholder-blue-100/50 focus:outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2.5 hover:bg-white/10 rounded-xl transition-colors">
                <FaBell className="text-xl text-[#8fc2f5]" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-300/60"></span>
              </button>

              <NavLink
                to="/profile"
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <FaUserCircle className="text-3xl text-[#8fc2f5]" />
              </NavLink>
            </div>
          </div>

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

const DropdownSection = ({ title, icon, open, setOpen, items, onClose }) => {
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-white hover:bg-blue-900/25 hover:text-blue-50 transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        {open ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
      </button>

      {open && (
        <div className="mt-2 pl-14 space-y-1">
          {items.map((sub) => (
            <NavLink
              key={sub.to}
              to={sub.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white font-semibold shadow-md shadow-blue-700/30"
                    : "text-blue-50 hover:text-white hover:bg-blue-900/20"
                }`
              }
            >
              <span className="text-xl opacity-90">{sub.icon}</span>
              <span>{sub.text}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
