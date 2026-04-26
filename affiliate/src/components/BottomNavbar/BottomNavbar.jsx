import React, { useMemo } from "react";
import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const BottomNavbar = () => {
  const { isBangla } = useLanguage();

  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  const t = useMemo(() => {
    return {
      login: isBangla ? "লগইন" : "Login",
      register: isBangla ? "রেজিস্টার" : "Register",
    };
  }, [isBangla]);

  const baseBtn =
    "flex-1 text-center font-extrabold transition duration-200 cursor-pointer";

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
      <div className="w-full border-t border-white/10 bg-[#0b1728] backdrop-blur-md">
        <div className="flex gap-3 px-3 py-2">
          {/* LOGIN */}
          <NavLink
            to="/login"
            className={({ isActive }) => `${baseBtn} rounded-xl py-3 text-sm`}
            style={({ isActive }) => ({
              background: isActive
                ? `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`
                : "rgba(255,255,255,0.08)",
              color: "#fff",
              boxShadow: isActive ? "0 0 12px rgba(47,121,201,0.6)" : "none",
            })}
          >
            {t.login}
          </NavLink>

          {/* REGISTER */}
          <NavLink
            to="/register"
            className={({ isActive }) => `${baseBtn} rounded-xl py-3 text-sm`}
            style={({ isActive }) => ({
              background: isActive
                ? `linear-gradient(135deg, ${SECONDARY}, ${PRIMARY})`
                : SECONDARY,
              color: "#fff",
              boxShadow: isActive ? "0 0 12px rgba(240,122,42,0.6)" : "none",
            })}
          >
            {t.register}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;