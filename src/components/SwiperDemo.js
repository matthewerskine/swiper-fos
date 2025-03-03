import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Define slide configurations with positioning, scaling, and z-index values
const SLIDE_CONFIGS = {
  1: {
    posX: "0px",
    posY: "calc(0% + 20px)",
    scale: 0.8,
    hoverScale: 1.0,
    zIndex: 3,
    _hide: false,
    backgroundColor: "#ffcccb",
  },
  2: {
    posX: "0px",
    posY: "calc(-10%)",
    scale: 0.6,
    hoverScale: 1.0,
    zIndex: 2,
    _hide: false,
    backgroundColor: "#c1e1c1",
  },
  3: {
    posX: "calc(-15%)",
    posY: "calc(25%)",
    scale: 0.5,
    hoverScale: 1.0,
    zIndex: 1,
    _hide: false,
    backgroundColor: "#b0e0e6",
  },
  4: {
    posX: "calc(20%)",
    posY: "calc(0%)",
    scale: 0.6,
    hoverScale: 1.0,
    zIndex: 3,
    _hide: false,
    backgroundColor: "#ffecb3",
  },
  5: {
    posX: "calc(-10%)",
    posY: "calc(25%)",
    scale: 0.5,
    hoverScale: 1.0,
    zIndex: 2,
    _hide: false,
    backgroundColor: "#e6e6fa",
  },
  6: {
    posX: "calc(-10%)",
    posY: "calc(0%)",
    scale: 0.6,
    hoverScale: 1.0,
    zIndex: 1,
    _hide: false,
    backgroundColor: "#f0e68c",
  },
  7: {
    posX: "10px",
    posY: "calc(20%)",
    scale: 0.5,
    hoverScale: 1.0,
    zIndex: 4,
    _hide: false,
    backgroundColor: "#dda0dd",
  },
};

const SwiperDemo = () => {
  const [activeSlide, setActiveSlide] = useState(null);
  /** @type {React.RefObject<import('swiper').Swiper>} */
  const swiperRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSwiperInitialized, setIsSwiperInitialized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [isMouseOverContainer, setIsMouseOverContainer] = useState(false);
  const dragTimeoutRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const autoplayTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const slidesRef = useRef([]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, []);

  // Handle Swiper initialization
  const handleSwiperInit = (swiper) => {
    swiperRef.current = swiper;
    setIsSwiperInitialized(true);
  };

  // Pause autoplay when mouse enters the container
  const handleContainerMouseEnter = () => {
    setIsMouseOverContainer(true);

    if (!isMobile && isSwiperInitialized && swiperRef.current) {
      setIsAutoplayPaused(true);
      if (swiperRef.current.autoplay) {
        swiperRef.current.autoplay.stop();
      }
    }
  };

  // Resume autoplay when mouse leaves the container
  const handleContainerMouseLeave = () => {
    setIsMouseOverContainer(false);

    if (!isMobile && isSwiperInitialized && !isDragging) {
      // Clear any existing timeout
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }

      // Set a delay before restarting autoplay
      autoplayTimeoutRef.current = setTimeout(() => {
        setIsAutoplayPaused(false);
        if (swiperRef.current && swiperRef.current.autoplay) {
          swiperRef.current.autoplay.start();
        }
      }, 1000);
    }
  };

  // Stops autoplay and applies hover effects
  const handleMouseEnter = (index) => {
    if (isDragging || !isSwiperInitialized || isTransitioning || isMobile)
      return;

    setActiveSlide(index);
  };

  // Resumes autoplay after leaving with a delay
  const handleMouseLeave = () => {
    if (isDragging || !isSwiperInitialized || isTransitioning || isMobile)
      return;

    setActiveSlide(null);
  };

  // Handle slide click for mobile
  const handleSlideClick = (index) => {
    if (isMobile && !isDragging && !isTransitioning) {
      if (activeSlide === index) {
        // If tapping the already-active slide, deactivate it
        setActiveSlide(null);

        // Resume autoplay after a delay
        if (swiperRef.current && isSwiperInitialized) {
          setTimeout(() => {
            if (swiperRef.current && swiperRef.current.autoplay) {
              swiperRef.current.autoplay.start();
              setIsAutoplayPaused(false);
            }
          }, 1000);
        }
      } else {
        // Set transitioning state to prevent multiple taps during animation
        setIsTransitioning(true);

        // Stop autoplay when a slide is tapped
        if (swiperRef.current && isSwiperInitialized) {
          if (swiperRef.current.autoplay) {
            swiperRef.current.autoplay.stop();
            setIsAutoplayPaused(true);
          }

          // Center the tapped slide
          swiperRef.current.slideTo(index);
        }

        // Set the tapped slide as active to trigger the CSS effects
        setActiveSlide(index);

        // Clear any existing transition timeout
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }

        // Allow interactions again after animation completes
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 400); // Slightly longer than the CSS transition
      }
    }
  };

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
    setActiveSlide(null);

    // Pause autoplay during dragging
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();
      setIsAutoplayPaused(true);
    }

    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
  };

  // Handle drag end with a delay before re-enabling hover effects
  const handleDragEnd = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    // Add a delay before re-enabling hover effects
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);

      // Resume autoplay if mouse is not over container
      if (
        !isMouseOverContainer &&
        swiperRef.current &&
        swiperRef.current.autoplay
      ) {
        swiperRef.current.autoplay.start();
        setIsAutoplayPaused(false);
      }
    }, 500);
  };

  // Get total number of active slides
  const getTotalSlides = () => {
    return Object.values(SLIDE_CONFIGS).filter((config) => !config._hide)
      .length;
  };

  // Function to generate slides with the positioning logic
  const generateSlides = () => {
    const slides = [];
    const visibleSlidesCount = 20; // Generate enough slides for looping

    // Creating slides dynamically
    for (let index = 0; index < visibleSlidesCount; index++) {
      const position = (index % 7) + 1; // Cycle through the 7 slide configs
      const config = SLIDE_CONFIGS[position];

      // Skip this slide if _hide is true
      if (config._hide) {
        continue;
      }

      // Active states
      const isActive = activeSlide === index;

      // The main slide has a class that will be targeted by CSS for custom styling
      const slideClasses = `slide ${isActive ? "slide-active" : ""} ${
        activeSlide !== null && !isActive ? "slide-inactive" : ""
      } ${isDragging ? "is-dragging" : ""} ${
        isTransitioning ? "is-transitioning" : ""
      }`;

      // Apply the data attributes to help with CSS selection
      const dataAttributes = {
        "data-index": index,
        "data-active": isActive ? "true" : "false",
        "data-position": position,
        // If there's an active slide and this isn't it, determine if this is before or after
        ...(activeSlide !== null &&
          !isActive && {
            "data-relative-position": index < activeSlide ? "before" : "after",
          }),
      };

      slides.push(
        <SwiperSlide
          key={index}
          className={slideClasses}
          {...dataAttributes}
          style={{
            backgroundColor: config.backgroundColor,
            zIndex: isActive ? 10 : config.zIndex,
          }}
          onMouseEnter={() => !isMobile && handleMouseEnter(index)}
          onMouseLeave={() => !isMobile && handleMouseLeave()}
          onClick={() => handleSlideClick(index)}
          ref={(el) => {
            if (slidesRef.current.length <= index) {
              slidesRef.current[index] = el;
            }
          }}
        >
          <div className="slide-inner">
            <img
              className="slide-image"
              src={`https://picsum.photos/id/${20 + position}/500/800`}
              alt={`Slide ${position}`}
            />
          </div>
        </SwiperSlide>
      );
    }

    return slides;
  };

  const slides = generateSlides();

  return (
    <div
      ref={containerRef}
      className={`swiper-container ${
        activeSlide !== null ? "has-active-slide" : ""
      } ${isDragging ? "is-dragging" : ""} ${
        isTransitioning ? "is-transitioning" : ""
      } ${isAutoplayPaused ? "autoplay-paused" : ""}`}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <Swiper
        onSwiper={handleSwiperInit}
        spaceBetween={-20}
        slidesPerView="auto"
        centeredSlides={false}
        modules={[Autoplay, FreeMode]}
        autoplay={{
          delay: 0, // Set to 0 for continuous scrolling
          // disableOnInteraction: false, // Don't disable on interaction
          // pauseOnMouseEnter: false, // We'll handle this manually
          // stopOnLastSlide: false, // Don't stop on last slide
          // waitForTransition: false, // Don't wait for transition
          // reverseDirection: false, // Don't reverse direction
        }}
        loop={true}
        // speed={5000} // Slower speed for smoother continuous scrolling
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.25,
        }}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {slides}
      </Swiper>
    </div>
  );
};

export default SwiperDemo;
