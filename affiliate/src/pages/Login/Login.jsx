import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { demoLogin } from "../../features/auth/authSlice";
import { FaUserShield } from "react-icons/fa";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    dispatch(demoLogin());
    navigate("/withdraw");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm bg-black/30 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 text-center"
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">Demo Access</h2>
        <p className="text-sm text-gray-300 mb-6">
          কোনো রেজিস্ট্রেশন ছাড়াই ডেমো এক্সপেরিয়েন্স নিন
        </p>

        {/* Demo Login Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-3
          bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400
          text-black font-semibold py-3 rounded-xl
          shadow-lg shadow-orange-500/30
          hover:shadow-orange-400/50 transition-all duration-300"
        >
          <FaUserShield className="text-lg" />
          Demo Login
        </motion.button>

        {/* Info */}
        <div className="mt-4 text-xs text-gray-400">
          Demo User: <span className="text-gray-200">demo@example.com</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
