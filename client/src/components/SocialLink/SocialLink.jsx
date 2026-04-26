import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { api } from "../../api/axios";

const APP_URL =
  import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "";

const makeUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${APP_URL}${url}`;
};

const SocialLink = () => {
  const location = useLocation(); // ✅ current route
  const [items, setItems] = useState([]);

  // ✅ Only show on homepage
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) return; // ❌ other page হলে fetch-ও করবে না

    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await api.get("/api/social-link");

        const data = res?.data?.data;
        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];

        if (mounted) setItems(list);
      } catch (error) {
        console.error("Failed to fetch social links:", error);
        if (mounted) setItems([]);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [isHome]);

  // ❌ not home → hide
  if (!isHome || !items.length) return null;

  return (
    <div className="absolute right-3 bottom-32 z-[999] flex flex-col gap-3">
      {items.map((item) => {
        const icon = makeUrl(item?.iconUrl || "");

        if (!item?.url || !icon) return null;

        return (
          <a
            key={item._id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full"
          >
            <img
              src={icon}
              alt="social-icon"
              className="h-12 w-12 object-contain transition duration-300 group-hover:scale-110"
            />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLink;
