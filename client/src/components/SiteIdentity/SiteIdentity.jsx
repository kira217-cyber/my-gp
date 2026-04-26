import { useEffect } from "react";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const APP_URL = import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "";

const makeUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${APP_URL}${url}`;
};

const SiteIdentity = () => {
  const { isBangla } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    const setFavicon = (href) => {
      if (!href) return;

      let link =
        document.querySelector("link[rel='icon']") ||
        document.querySelector("link[rel='shortcut icon']");

      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }

      link.href = href;
    };

    const fetchSiteIdentity = async () => {
      try {
        const res = await api.get("/api/site-identity");
        const data = res?.data?.data;

        if (!isMounted || !data) return;

        const title = isBangla
          ? data?.title?.bn || data?.title?.en
          : data?.title?.en || data?.title?.bn;

        if (title) document.title = title;

        if (data?.favicon) {
          setFavicon(makeUrl(data.favicon));
        }
      } catch (error) {
        console.error("Failed to fetch site identity:", error);
      }
    };

    fetchSiteIdentity();

    return () => {
      isMounted = false;
    };
  }, [isBangla]);

  return null;
};

export default SiteIdentity;