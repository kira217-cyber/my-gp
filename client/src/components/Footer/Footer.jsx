import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const API_URL = "https://api.1onebet.com";

const footerData = {
  paymentTitle: { bn: "পেমেন্ট পদ্ধতি", en: "Payment Methods" },
  licenseTitle: { bn: "গেমিং লাইসেন্স", en: "Gaming License" },
  appDownloadTitle: { bn: "অ্যাপ ডাউনলোড", en: "APP Download" },
  providerTitle: { bn: "গেম প্রোভাইডার", en: "Game Providers" },

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
    "https://i.ibb.co.com/20z9Snpd/www.png",
    "https://i.ibb.co.com/N2Y2RPsN/Logo-Flat-1.webp",
    "https://i.ibb.co.com/3yd27xzp/Ezugi-Review-Logo-300x118-jpg-removebg-preview.png"
  ],
};

const Footer = () => {
  const { isBangla } = useLanguage();

  const getText = (obj) => (isBangla ? obj?.bn : obj?.en);

  const fileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  return (
    <>
      {/* Main Footer */}
      <footer className="bg-gradient-to-br from-black via-[#2f79c9]/70 to-black px-2 py-3 text-sm text-white">
        {/* Payment */}
        <div>
          <h2 className="mb-3 text-lg font-black text-white">
            {getText(footerData.paymentTitle)}
          </h2>

          <div className="grid grid-cols-4 gap-3 rounded-[10px] border border-white/20 bg-[#2f79c9] p-3">
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

        <div className="my-5 border-t border-white/20" />

        {/* License + App */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="mb-2 text-sm font-extrabold text-white">
              {getText(footerData.licenseTitle)}
            </h2>

            <div className="flex justify-center rounded-[10px] border border-white/20 bg-[#2f79c9] p-3">
              <img
                src={fileUrl(footerData.licenseImage)}
                className="h-10 object-contain"
                alt=""
              />
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-extrabold text-white">
              {getText(footerData.appDownloadTitle)}
            </h2>

            <div className="flex justify-center rounded-[10px] border border-white/20 bg-[#2f79c9] p-3">
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
      </footer>

      {/* Providers */}
      <div className="bg-gradient-to-br from-black via-[#2f79c9]/70 to-black pb-3">
        <h2 className="mb-2 px-2 text-lg font-black text-white">
          {getText(footerData.providerTitle)}
        </h2>

        <div className="grid grid-cols-3 gap-1 px-2 sm:grid-cols-4">
          {footerData.providerImages.map((img) => (
            <div
              key={img}
              className="flex h-14 items-center justify-center rounded-md bg-[#2f79c9]"
            >
              <img
                src={fileUrl(img)}
                className="max-h-12 object-contain"
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
