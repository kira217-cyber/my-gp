import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const API_URL = "https://api.1onebet.com";

const footerData = {
  paymentTitle: {
    bn: "পেমেন্ট পদ্ধতি",
    en: "Payment Methods",
  },
  responsibleTitle: {
    bn: "দায়িত্বশীল গেমিং",
    en: "Responsible Gaming",
  },
  communityTitle: {
    bn: "কমিউনিটি ওয়েবসাইট",
    en: "Community Websites",
  },
  licenseTitle: {
    bn: "গেমিং লাইসেন্স",
    en: "Gaming License",
  },
  appDownloadTitle: {
    bn: "অ্যাপ ডাউনলোড",
    en: "APP Download",
  },
  providerTitle: {
    bn: "গেম প্রোভাইডার",
    en: "Game Providers",
  },
  bottomHeading: {
    bn: "সেরা মানের প্ল্যাটফর্ম",
    en: "The Best Quality Platform",
  },
  bottomCopyright: {
    bn: "©২০২৫ অনলাইন গেমিং প্ল্যাটফর্ম",
    en: "©2025 Online Gaming Platform.",
  },
  appDownloadLink: "https://oracleapkstore.com/",

  paymentImages: [
    "/uploads/footer/1776613112527-87848484.png",
    "/uploads/footer/1776613112528-257603482.png",
    "/uploads/footer/1776613112528-417346148.png",
    "/uploads/footer/1776613112528-809722411.png",
    "/uploads/footer/1776613112528-84572755.png",
    "/uploads/footer/1776613112528-139846322.png",
    "/uploads/footer/1776613112528-387965004.png",
    "/uploads/footer/1776613112528-316034325.png",
  ],

  responsibleImages: [
    "/uploads/footer/1776613112528-190840007.png",
    "/uploads/footer/1776613112528-597596165.png",
    "/uploads/footer/1776613112528-697155249.png",
  ],

  communityImages: ["/uploads/footer/1776613112528-359721001.png"],

  licenseImage: "/uploads/footer/1776613112529-211116653.png",
  appDownloadImage: "/uploads/footer/1776613112529-274831077.png",

  providerImages: [
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/JL-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/PG-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/SPB-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/BNG-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/MG-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/FC-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/JDB-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/SS-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/AMBS-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/PS-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/FP-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/EZG-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/5G-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/BOM-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/RT-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/NE-COLOR.png",
    "https://images.185949949.com/TCG_PROD_IMAGES/RNG_LIST_VENDOR/AE-COLOR.png",
  ],
};

const Footer = () => {
  const { isBangla } = useLanguage();

  const getText = (obj) => (isBangla ? obj?.bn || "" : obj?.en || "");

  const fileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  return (
    <>
      {" "}
      <footer className="bg-white px-2 py-2 text-sm text-[#1f2937]">
        {/* Payment */}
        <div>
          <h2 className="mb-3 text-xl font-black text-[#2f79c9]">
            {getText(footerData.paymentTitle)}
          </h2>

          <div className="grid grid-cols-4 items-center gap-4 rounded-[8px] border border-[#2f79c9]/15 bg-[#f86e3c] p-4">
            {footerData.paymentImages.map((img) => (
              <img
                key={img}
                src={fileUrl(img)}
                className="h-7 w-full object-contain"
                alt=""
              />
            ))}
          </div>
        </div>

        {/* Responsible + Community */}
        {/* <div className="mt-6 grid grid-cols-2 gap-5">
        <div>
          <h2 className="mb-3 text-lg font-black text-[#2f79c9]">
            {getText(footerData.responsibleTitle)}
          </h2>

          <div className="flex flex-wrap gap-3 rounded-[18px] border border-[#2f79c9]/15 bg-[#f86e3c] p-4">
            {footerData.responsibleImages.map((img) => (
              <img
                key={img}
                src={fileUrl(img)}
                className="h-8 object-contain"
                alt=""
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-black text-[#2f79c9]">
            {getText(footerData.communityTitle)}
          </h2>

          <div className="flex flex-wrap gap-3 rounded-[18px] border border-[#2f79c9]/15 bg-[#f86e3c] p-4">
            {footerData.communityImages.map((img) => (
              <img
                key={img}
                src={fileUrl(img)}
                className="h-8 object-contain"
                alt=""
              />
            ))}
          </div>
        </div>
      </div> */}

        <div className="my-6 border-t border-[#2f79c9]/15" />

        {/* License + App */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <h2 className="mb-3 text-lg font-black text-[#2f79c9]">
              {getText(footerData.licenseTitle)}
            </h2>

            <div className="rounded-[8px] border border-[#2f79c9]/15 bg-[#f86e3c] p-4">
              <img
                src={fileUrl(footerData.licenseImage)}
                className="h-10 object-contain"
                alt=""
              />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-black text-[#2f79c9]">
              {getText(footerData.appDownloadTitle)}
            </h2>

            <div className="rounded-[8px] border border-[#2f79c9]/15 bg-[#f86e3c] p-4">
              <a
                href={footerData.appDownloadLink}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={fileUrl(footerData.appDownloadImage)}
                  className="h-10 cursor-pointer object-contain"
                  alt=""
                />
              </a>
            </div>
          </div>
        </div>

        <div className="my-6 border-t border-[#2f79c9]/15" />

        {/* <div className="my-6 border-t border-[#2f79c9]/15" /> */}
      </footer>
      {/* Provider Images Instead Of Text */}
      <div>
        <h2 className="mb-3 ml-2 text-xl font-black text-[#2f79c9]">
          {getText(footerData.providerTitle)}
        </h2>

        <div className="grid grid-cols-3 gap-1 p-2 border bg-[#2f79c9] border-[#2f79c9]/15  sm:grid-cols-4">
          {footerData.providerImages.map((img) => (
            <div key={img} className="flex h-14 items-center justify-center">
              <img
                src={fileUrl(img)}
                className="max-h-14 object-contain"
                alt=""
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Footer;
