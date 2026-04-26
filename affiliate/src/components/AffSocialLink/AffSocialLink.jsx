import React, { useEffect, useState } from "react";
import { api } from "../../api/axios";

const APP_URL =
  import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "";

const makeUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${APP_URL}${url}`;
};

const AffSocialLink = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchAffSocialLinks = async () => {
      try {
        const res = await api.get("/api/aff-social-link");

        const data = res?.data?.data;
        const links = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];

        setItems(links);
      } catch (error) {
        console.error("Failed to fetch affiliate social links:", error);
        setItems([]);
      }
    };

    fetchAffSocialLinks();
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed right-4 bottom-20 z-[999] flex flex-col gap-3 md:right-18 md:bottom-22">
      {items.map((item) => {
        const iconSrc = makeUrl(item?.iconUrl || "");

        if (!item?.url || !iconSrc) return null;

        return (
          <a
            key={item._id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Affiliate Social Link"
            className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full md:h-16 md:w-16"
          >
            <img
              src={iconSrc}
              alt="affiliate-social-icon"
              className="h-12 w-12 object-contain transition duration-300 group-hover:scale-110 md:h-16 md:w-16"
            />
            <span className="sr-only">Affiliate Social Link</span>
          </a>
        );
      })}
    </div>
  );
};

export default AffSocialLink;
