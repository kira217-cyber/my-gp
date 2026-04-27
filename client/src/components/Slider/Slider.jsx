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

const fallbackSlides = [
  "https://babu88.gold/static/image/homepage/refer_banner.jpg",
];

const Slider = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["client-sliders"],
    queryFn: async () => {
      const res = await api.get("/api/sliders");
      return res?.data?.data || [];
    },
    staleTime: 60_000,
    retry: 1,
  });

  const slides = useMemo(() => {
    const serverSlides = Array.isArray(data)
      ? data.map((item) => imgUrl(item.image)).filter(Boolean)
      : [];

    return serverSlides.length ? serverSlides : fallbackSlides;
  }, [data]);

  if (isLoading && !slides.length) {
    return (
      <div className="w-full py-1 px-1">
        <div className="h-[120px] sm:h-[140px] bg-black/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full px-1 mt-2">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-black/20 overflow-hidden">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            slidesPerView={1}
            loop={slides.length > 1}
            speed={600}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            pagination={{ clickable: true }}
          >
            {slides.map((src, idx) => (
              <SwiperSlide key={`${src}-${idx}`}>
                <div className="w-full h-[120px] sm:h-[140px]">
                  <img
                    src={src}
                    alt={`slide-${idx + 1}`}
                    className="w-full h-full object-cover"
                    draggable="false"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Slider;

