import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slideConfigs = [
  { posX: 0, posY: 0, backgroundColor: "#ffcccb" },
  { posX: 0, posY: 0, backgroundColor: "#c1e1c1" },
  { posX: 0, posY: 0, backgroundColor: "#b0e0e6" },
  { posX: 0, posY: 0, backgroundColor: "#ffecb3" },
  { posX: 0, posY: 0, backgroundColor: "#e6e6fa" },
  { posX: 0, posY: 0, backgroundColor: "#f0e68c" },
  { posX: 0, posY: 0, backgroundColor: "#dda0dd" },
];

const SwiperDemo = () => {
  const [activeSlide, setActiveSlide] = React.useState(null);
  /** @type {React.RefObject<import('swiper').Swiper>} */
  const swiperRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Stops autoplay while the user is hovering over the slide
  const handleMouseEnter = (index) => {
    if (isDragging) return;
    console.log("slide - mouse enter", { index, swiperRef });
    setActiveSlide(index);
    swiperRef.current.autoplay.stop();
  };

  // Resumes autoplay after leaving with a delay
  const handleMouseLeave = () => {
    if (isDragging) return;
    console.log("slide - mouse leave", { swiperRef });
    setActiveSlide(null);
    setTimeout(() => {
      swiperRef.current.autoplay.start();
    }, 1000);
  };

  const slides = slideConfigs.map((slideConfig, index) => {
    const styles = {
      backgroundColor: slideConfig.backgroundColor,
      // transform: `translate(var(--fos-position-x), var(--fos-position-y))`,
    };

    return (
      <SwiperSlide
        key={index}
        className={`slide ${activeSlide === index ? "slide-active" : ""}`}
        style={styles}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
      >
        <div>
          Slide {index + 1}
          <img
            className="slide-image"
            src="https://picsum.photos/200/300"
            alt="random"
          />
        </div>
      </SwiperSlide>
    );
  });

  return (
    <div className="swiper-container">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={20}
        modules={[Autoplay, FreeMode]}
        autoplay={{ delay: 100 }}
        breakpoints={{
          1024: {
            slidesPerView: 4,
          },
          768: {
            slidesPerView: 3,
          },
          640: {
            slidesPerView: 2,
          },
        }}
        loop={true}
        speed={8000}
        freeMode={{ enabled: true }}
        onTouchStart={() => {
          console.log("touch start");
          setIsDragging(true);
        }}
        onTouchEnd={() => {
          console.log("touch end");
          setIsDragging(false);
        }}
      >
        {slides}
      </Swiper>
    </div>
  );
};

export default SwiperDemo;
