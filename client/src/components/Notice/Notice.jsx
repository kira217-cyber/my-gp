import React, { useEffect, useState, useMemo } from "react";
import { FaBullhorn } from "react-icons/fa";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const Notice = () => {
  const { isBangla } = useLanguage();
  const [notices, setNotices] = useState([]);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get("/api/notices");
      setNotices(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const noticeTexts = useMemo(() => {
    return notices
      .filter((n) => n?.isActive)
      .map((n) => ({
        text: isBangla ? n?.text?.bn : n?.text?.en,
        link: n?.linkUrl || "",
      }))
      .filter((n) => n.text);
  }, [notices, isBangla]);

  const handleClick = (link) => {
    if (!link) return;
    const url = link.startsWith("http")
      ? link
      : `${window.location.origin}${link}`;
    window.open(url, "_blank");
  };

  if (!noticeTexts.length) return null;

  return (
    <div className="w-full bg-[#07111f] mt-2">
      <div className="mx-auto max-w-7xl px-3">
        <div className="overflow-hidden rounded-xl border border-[#2f79c9]/30">
          {/* ✅ ONE LINE HEADER + MARQUEE */}
          <div className="flex items-center gap-4 px-3 py-2 bg-gradient-to-r from-[#2f79c9] to-[#1d4f91] text-white">
            {/* icon + title */}
            <div className="flex items-center gap-2 shrink-0">
              <FaBullhorn />
              <span className="text-sm font-bold whitespace-nowrap">
                {isBangla ? "নোটিশ" : "Notice"}
              </span>
            </div>

            {/* marquee area */}
            <div className="overflow-hidden flex-1">
              <div className="marquee">
                {[...noticeTexts, ...noticeTexts].map((n, i) => (
                  <span
                    key={i}
                    onClick={() => handleClick(n.link)}
                    className="item"
                  >
                    🔹 {n.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .marquee {
            display: inline-flex;
            white-space: nowrap;
            gap: 50px;
            animation: scroll 25s linear infinite;
          }

          .item {
            flex-shrink: 0; /* 🔥 MUST */
            font-size: 14px;
            cursor: pointer;
            transition: 0.3s;
          }

          .item:hover {
            color: #63a8ee;
          }

          @keyframes scroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }

          .marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </div>
  );
};

export default Notice;
