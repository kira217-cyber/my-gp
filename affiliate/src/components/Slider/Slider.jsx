import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const API_URL = import.meta.env.VITE_API_URL || "";

const imgUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
};

const Slider = () => {
  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  const { data, isLoading } = useQuery({
    queryKey: ["aff-client-sliders"],
    queryFn: async () => {
      const res = await api.get("/api/aff-sliders");
      return res?.data?.data || [];
    },
    staleTime: 60_000,
    retry: 1,
  });

  const slides = useMemo(() => {
    const serverSlides = Array.isArray(data)
      ? data.map((item) => imgUrl(item.image)).filter(Boolean)
      : [];

    return serverSlides.length
      ? serverSlides
      : ["https://babu88.gold/static/image/homepage/refer_banner.jpg"];
  }, [data]);

  if (isLoading && !slides.length) {
    return (
      <div className="w-full bg-[#07111f]">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 md:py-6">
          <div className="h-[130px] w-full animate-pulse rounded-lg bg-white/10 sm:h-[260px] md:h-[340px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#07111f]">
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 md:py-6">
        <div
          className="relative overflow-hidden rounded-lg border bg-white/5 shadow-lg shadow-black/20"
          style={{ borderColor: PRIMARY }}
        >
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            slidesPerView={1}
            loop={slides.length > 1}
            speed={600}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            pagination={{ clickable: true }}
            navigation={slides.length > 1}
            className="customSlider"
          >
            {slides.map((src, idx) => (
              <SwiperSlide key={src + idx}>
                <div className="h-[130px] w-full sm:h-[260px] md:h-[340px]">
                  <img
                    src={src}
                    alt={`slide-${idx + 1}`}
                    className="h-full w-full object-cover"
                    draggable="false"
                    loading="lazy"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style>{`
        .customSlider .swiper-pagination {
          bottom: 10px !important;
        }

        .customSlider .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          background: #ffffff;
          opacity: 0.55;
        }

        .customSlider .swiper-pagination-bullet-active {
          width: 18px;
          border-radius: 999px;
          background: ${SECONDARY};
          opacity: 1;
        }

        .customSlider .swiper-button-next,
        .customSlider .swiper-button-prev {
          color: #ffffff;
          width: 28px;
          height: 28px;
        }

        .customSlider .swiper-button-next:after,
        .customSlider .swiper-button-prev:after {
          font-size: 14px;
          font-weight: 800;
        }

        @media (max-width: 360px) {
          .customSlider .swiper-button-next,
          .customSlider .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Slider;
