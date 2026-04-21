import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Start = () => {
  const navigate = useNavigate();
  const { isBangla, language, changeLanguage } = useLanguage();

  useEffect(() => {
    localStorage.setItem("hasVisitedStart", "true");
  }, []);

  const text = {
    signIn: isBangla ? "সাইন ইন" : "Sign In",
    register: isBangla ? "রেজিস্টার" : "Register",
    proceed: isBangla
      ? "এগিয়ে গেলে আপনি আমাদের"
      : "By proceeding you agree to our",
    terms: isBangla ? "শর্তাবলী" : "Terms & Conditions",
    and: isBangla ? "এবং" : "and",
    privacy: isBangla ? "গোপনীয়তা নীতি" : "Privacy Policy",
  };

  return (
    <div className="min-h-full bg-[#f5f5f5] flex flex-col items-center justify-between px-6 pt-8 pb-8">
      <div className="w-full flex flex-col items-center">
        {/* Top Logo */}
        <img
          src="https://i.ibb.co.com/ds4ckFjg/image-removebg-preview-3.png"
          alt="MyGP Logo"
          className="w-[220px] max-w-full object-contain mt-3"
        />

        {/* Middle Illustration */}
        <img
          src="https://i.ibb.co.com/60zWNQmV/image-removebg-preview-4.png"
          alt="Start Illustration"
          className="w-[400px] max-w-full object-contain mt-12"
        />

        {/* Language Switch */}
        <div className="mt-6 w-full max-w-[300px] rounded-full bg-[#e9e9e9] p-1 flex items-center shadow-sm">
          <button
            type="button"
            onClick={() => changeLanguage("English")}
            className={`w-1/2 h-12 cursor-pointer rounded-full text-sm font-semibold transition-all duration-200 ${
              language === "English"
                ? "bg-white text-[#222] shadow"
                : "bg-transparent text-[#222]"
            }`}
          >
            ENGLISH
          </button>

          <button
            type="button"
            onClick={() => changeLanguage("Bangla")}
            className={`w-1/2 h-12 cursor-pointer rounded-full text-sm font-semibold transition-all duration-200 ${
              language === "Bangla"
                ? "bg-white text-[#222] shadow"
                : "bg-transparent text-[#222]"
            }`}
          >
            বাংলা
          </button>
        </div>

        {/* Sign In */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-6 w-full max-w-[300px] h-[52px] cursor-pointer rounded-md bg-[#0b84e3] text-white text-[24px] shadow-md hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white">
            <img
              src="https://i.ibb.co.com/ZR7gQxN9/Grameenphone-Logo-GP-Logo-svg.png"
              alt="icon"
              className="w-4 h-4 object-contain"
            />
          </span>
          <span className="text-[24px] leading-none">{text.signIn}</span>
        </button>

        {/* Register */}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="mt-4 w-full cursor-pointer max-w-[220px] h-[46px] rounded-full bg-black text-white text-[22px] font-medium shadow-md hover:opacity-95 active:scale-[0.99] transition"
        >
          {text.register}
        </button>
      </div>

      {/* Bottom Terms */}
      <p className="mt-4 text-center text-[14px] leading-6 text-[#7d7d7d] max-w-[320px]">
        {text.proceed}{" "}
        <span
          onClick={() => navigate("/terms")}
          className="text-[#0b84e3] cursor-pointer"
        >
          {text.terms}
        </span>{" "}
        {text.and}{" "}
        <span
          onClick={() => navigate("/privacy")}
          className="text-[#0b84e3] cursor-pointer"
        >
          {text.privacy}
        </span>
      </p>
    </div>
  );
};

export default Start;
