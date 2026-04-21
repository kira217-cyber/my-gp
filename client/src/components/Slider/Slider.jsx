import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Slider = () => {
  // ✅ Replace with your real 4 images (same design images)
  const slides = [
    "https://i.ibb.co.com/6cH71jbY/online-sport-bet-3d-banner-600nw-2635613707.webp",
    "https://i.ibb.co.com/6R5c5S4H/sports-betting-purple-banner-smartphone-champion-cups-falling-gold-coins-sport-balls-button-24633419.webp",
    "https://i.ibb.co.com/zHh2TpVY/istockphoto-1410370133-612x612.jpg",
    "https://i.ibb.co.com/sDyZRZq/sports-betting-banner-smartphone-soccer-600nw-2664078705.webp",
  ];

  return (
    <div className="w-full py-1 px-1">
      <div className="max-w-7xl mx-auto">
        {/* Outer frame like screenshot */}
        <div className="relative bg-black/20 overflow-hidden">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            slidesPerView={1}
            loop={true}
            speed={600}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            pagination={{
              clickable: true,
            }}
          >
            {slides.map((src, idx) => (
              <SwiperSlide key={idx}>
                {/* Responsive banner height like screenshot */}
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
