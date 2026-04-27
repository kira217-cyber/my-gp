import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Tab = () => {
  const { language } = useLanguage();

  const tabs = [
    // {
    //   name: {
    //     en: "Auto Deposit",
    //     bn: "অটো ডিপোজিট",
    //   },
    //   path: "/auto-deposit",
    // },
    {
      name: {
        en: "Auto Deposit",
        bn: "অটো ডিপোজিট",
      },
      path: "/auto-personal-deposit",
    },
    {
      name: {
        en: "Manual Deposit",
        bn: "ম্যানুয়াল ডিপোজিট",
      },
      path: "/deposit",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 bg-gray-200 p-2 shadow-md border border-[#2f79c9]/20">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex-1 cursor-pointer rounded-lg px-4 py-2 text-center text-[14px] font-extrabold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#2f79c9] to-[#63a8ee] text-white shadow-md"
                  : "bg-transparent text-slate-700 hover:bg-[#2f79c9]/10 hover:text-[#2f79c9]"
              }`
            }
          >
            {language === "Bangla" ? tab.name.bn : tab.name.en}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Tab;