import React from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { FaArrowLeft, FaHome } from "react-icons/fa";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-[#2f79c9]/20 to-black flex items-center justify-center px-4">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 h-72 w-72 rounded-full bg-[#2f79c9]/20 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -50, 20, 0],
            y: [0, 30, -20, 0],
            scale: [1, 0.92, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#63a8ee]/20 blur-3xl"
        />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black/70 via-[#2f79c9]/80 to-black/70 p-8 md:p-12 text-center shadow-2xl shadow-blue-900/30 backdrop-blur-xl"
      >
        {/* Floating Icon Circle */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-xl shadow-blue-600/40"
        >
          <span className="text-4xl font-black text-white">404</span>
        </motion.div>

        {/* Big Text */}
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.08em" }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-wider"
        >
          OOPS!
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-4 text-2xl md:text-3xl font-bold text-[#8fc2f5]"
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mx-auto mt-4 max-w-xl text-sm md:text-base leading-7 text-blue-100/80"
        >
          The page you are looking for does not exist, may have been removed, or
          the link might be broken.
        </motion.p>

        {/* Decorative Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "120px" }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mx-auto mt-6 h-1 rounded-full bg-gradient-to-r from-[#63a8ee] to-[#2f79c9]"
        />

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate("/")}
            className="inline-flex cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-6 py-3 text-white font-semibold shadow-lg shadow-blue-700/40 transition-all duration-300 hover:scale-[1.03] hover:from-[#7ab6f2] hover:to-[#3c88db]"
          >
            <FaHome />
            Go To Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-blue-300/20 bg-white/10 px-6 py-3 text-blue-50 font-medium transition-all duration-300 hover:bg-white/15 hover:scale-[1.02]"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
