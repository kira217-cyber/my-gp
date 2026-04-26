import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaTelegramPlane,
} from "react-icons/fa";
import { api } from "../../api/axios";
const APP_URL =
  import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "";

const makeUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${APP_URL}${url}`;
};

const Footer = () => {
  const { isBangla } = useLanguage();
  const [logo, setLogo] = useState("");

  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  const t = useMemo(
    () => ({
      leftTitle: isBangla
        ? "আমাদের প্ল্যাটফর্মে নিরাপদ ও দ্রুত সার্ভিস উপভোগ করুন।"
        : "Enjoy safe and fast service on our platform.",
      leftBody: isBangla
        ? "আমরা ব্যবহারকারীদের জন্য সহজ, নিরাপদ এবং দ্রুত অনলাইন সার্ভিস প্রদান করি। আমাদের লক্ষ্য হলো সেরা অভিজ্ঞতা, দ্রুত সাপোর্ট এবং বিশ্বস্ত প্ল্যাটফর্ম নিশ্চিত করা।"
        : "We provide simple, secure, and fast online service for our users. Our goal is to ensure the best experience, quick support, and a trusted platform.",
      rightTitle: isBangla ? "অফিসিয়াল পার্টনার" : "Official Partners",
      responsibleTitle: isBangla ? "দায়িত্বশীল গেমিং" : "Responsible Gaming",
      paymentTitle: isBangla ? "পেমেন্ট পদ্ধতি" : "Payment Methods",
      followTitle: isBangla ? "আমাদের অনুসরণ করুন" : "Follow Us",
      copyright: isBangla
        ? "Copyright © 2026. All rights reserved"
        : "Copyright © 2026. All rights reserved",
    }),
    [isBangla],
  );

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await api.get("/api/aff-site-identity");
        setLogo(res?.data?.data?.logo || "");
      } catch (error) {
        console.error("Failed to fetch affiliate logo:", error);
      }
    };

    fetchLogo();
  }, []);

  const logoUrl = logo ? makeUrl(logo) : " ";

  const partners = [
    {
      name: "Partner 1",
      imageUrl: "https://api.rb777.live/uploads/1775056861628-917123671.png",
    },
    {
      name: "Partner 2",
      imageUrl: "https://api.rb777.live/uploads/1775056989880-159144449.png",
    },
    {
      name: "Partner 3",
      imageUrl: "https://api.rb777.live/uploads/1775056940025-915802435.png",
    },
  ];

  const responsible = [
    {
      name: "18+",
      imageUrl: "https://beit365.bet/assets/images/age-limit.png",
    },
    {
      name: "Safe",
      imageUrl: "https://beit365.bet/assets/images/gamcare.png",
    },
  ];

  const paymentMethods = [
    {
      name: "bKash",
      imageUrl: "https://beit365.bet/assets/images/pay22.png?v=%271.01%27",
    },
    {
      name: "Nagad",
      imageUrl: "https://beit365.bet/assets/images/pay34.png?v=%271.01%27",
    },
    {
      name: "Rocket",
      imageUrl: "https://beit365.bet/assets/images/pay33.png?v=%271.01%27",
    },
    {
      name: "Upay",
      imageUrl: "https://beit365.bet/assets/images/pay45.png?v=%271.01%27",
    },
  ];

  const socialLinks = {
    facebook: "#",
    twitter: "#",
    youtube: "#",
    instagram: "#",
    telegram: "#",
  };

  const SocialIcon = ({ href, label, children }) => (
    <a
      href={href || "#"}
      target={href && href !== "#" ? "_blank" : undefined}
      rel={href && href !== "#" ? "noreferrer" : undefined}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-transparent hover:text-white"
      style={{
        "--hover-bg": PRIMARY,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = PRIMARY;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)";
      }}
    >
      {children}
    </a>
  );

  return (
    <footer className="w-full bg-[#07111f] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-20 md:pb-10 sm:px-6">
        <div className="mb-10 border-t border-dashed border-white/15" />

        <div className="grid grid-cols-1 gap-10 lg:flex lg:justify-between">
          <div>
            <img
              src={logoUrl}
              alt="Logo"
              className="mb-6 h-14 w-56 object-contain"
            />

            <h3
              className="text-lg font-bold leading-snug"
              style={{ color: SECONDARY }}
            >
              {t.leftTitle}
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-[15px]">
              {t.leftBody}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold" style={{ color: SECONDARY }}>
              {t.rightTitle}
            </h3>

            <div className="mt-5 flex flex-wrap items-center gap-5">
              {partners.map((p, idx) => (
                <div key={p.name + idx} className="text-center">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="mx-auto h-10 w-auto rounded bg-white/5 object-contain opacity-80 transition hover:opacity-100"
                    loading="lazy"
                  />
                  <p className="mt-2 text-xs text-slate-400">{p.name}</p>
                </div>
              ))}
            </div>

            <h3
              className="mt-10 text-lg font-bold"
              style={{ color: SECONDARY }}
            >
              {t.responsibleTitle}
            </h3>

            <div className="mt-4 flex flex-wrap items-center gap-5">
              {responsible.map((r, idx) => (
                <img
                  key={r.name + idx}
                  src={r.imageUrl}
                  alt={r.name}
                  className="h-9 w-auto rounded bg-white/5 object-contain opacity-80 transition hover:opacity-100"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="my-10 border-t border-dashed border-white/15" />

        <div className="grid grid-cols-1 items-start gap-10 lg:flex lg:justify-between">
          <div>
            <h4 className="text-lg font-bold" style={{ color: SECONDARY }}>
              {t.paymentTitle}
            </h4>

            <div className="mt-5 flex flex-wrap items-center gap-5">
              {paymentMethods.map((m, idx) => (
                <img
                  key={m.name + idx}
                  src={m.imageUrl}
                  alt={m.name}
                  className="h-7 w-auto rounded bg-white/5 object-contain opacity-80 transition hover:opacity-100"
                  loading="lazy"
                />
              ))}
            </div>

            <p className="mt-10 text-sm text-slate-400">{t.copyright}</p>
          </div>

          <div className="lg:text-center">
            <h4 className="text-lg font-bold" style={{ color: SECONDARY }}>
              {t.followTitle}
            </h4>

            <div className="mt-5 flex flex-wrap items-center gap-4 lg:justify-center">
              <SocialIcon href={socialLinks.facebook} label="Facebook">
                <FaFacebookF />
              </SocialIcon>

              <SocialIcon href={socialLinks.twitter} label="Twitter">
                <FaTwitter />
              </SocialIcon>

              <SocialIcon href={socialLinks.youtube} label="YouTube">
                <FaYoutube />
              </SocialIcon>

              <SocialIcon href={socialLinks.instagram} label="Instagram">
                <FaInstagram />
              </SocialIcon>

              <SocialIcon href={socialLinks.telegram} label="Telegram">
                <FaTelegramPlane />
              </SocialIcon>
            </div>
          </div>
        </div>
      </div>

      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`,
        }}
      />
    </footer>
  );
};

export default Footer;
