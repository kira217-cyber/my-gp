import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Slider = () => {
  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  const slides = useMemo(
    () => [
      "https://i.ibb.co.com/6cH71jbY/online-sport-bet-3d-banner-600nw-2635613707.webp",
      "https://i.ibb.co.com/6cH71jbY/online-sport-bet-3d-banner-600nw-2635613707.webp",
      "https://i.ibb.co.com/6cH71jbY/online-sport-bet-3d-banner-600nw-2635613707.webp",
    ],
    [],
  );

  return (
    <div className="w-full bg-[#07111f]">
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 md:py-6">
        <div
          className="relative overflow-hidden rounded-lg border bg-white/5 shadow-lg shadow-black/20"
          style={{
            borderColor: PRIMARY,
          }}
        >
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            slidesPerView={1}
            loop={true}
            speed={600}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            pagination={{ clickable: true }}
            navigation={true}
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
