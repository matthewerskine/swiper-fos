import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import freeMode from "./FreeMode";
import Autoplay from "./Autoplay";

const SWIPER_SPEED = 5000;

// For debugging
const DEBUG = true;
const log = (message, data) => {
  if (DEBUG) {
    if (data) {
      console.log(`[Swiper] ${message}`, data);
    } else {
      console.log(`[Swiper] ${message}`);
    }
  }
};

const customSlideToLoop = function (
  swiper,
  index = 0,
  speed,
  runCallbacks = true,
  internal
) {
  if (typeof index === "string") {
    const indexAsNumber = parseInt(index, 10);
    index = indexAsNumber;
  }

  if (swiper.destroyed) return swiper;

  log(`customSlideToLoop called with index: ${index}, speed: ${speed}`);

  const originalIndex = index;

  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }

  let targetSlideIndex = -1;
  let targetSlide = null;

  if (!swiper.slides || !swiper.slides.length) {
    log("Error: No slides found in swiper");
    return swiper;
  }

  try {
    log(`Searching for slide with data-index ${originalIndex}`);
    for (let i = 0; i < swiper.slides.length; i++) {
      const slide = swiper.slides[i];
      if (!slide) continue;

      const slideDataIndex = slide.getAttribute("data-index");
      if (
        slideDataIndex !== null &&
        parseInt(slideDataIndex) === originalIndex
      ) {
        targetSlideIndex = i;
        targetSlide = slide;
        log(
          `Found slide with data-index ${originalIndex} at DOM position ${targetSlideIndex}`
        );
        break;
      }
    }
  } catch (err) {
    log(`Error finding slide by data-index: ${err.message}`);
  }

  if (targetSlideIndex === -1 || !targetSlide) {
    log(
      `Couldn't find slide with data-index ${originalIndex}, using original index as fallback`
    );
    targetSlideIndex = index;
    targetSlide = swiper.slides[targetSlideIndex];

    if (!targetSlide) {
      log(
        `Error: Still couldn't find a valid slide at position ${targetSlideIndex}`
      );
      return swiper;
    }
  }

  const isMobileView = window.innerWidth < 768;

  if (isMobileView) {
    const slideImage = targetSlide.querySelector("img.slide-image");
    if (!slideImage) {
      log(
        `Error: No image found in slide ${targetSlideIndex} (data-index: ${originalIndex})`
      );
      return swiper;
    }

    const viewportWidth = swiper.width;
    const slideWidth = slideImage.offsetWidth;

    // const slideRect = targetSlide.getBoundingClientRect();
    const imageRect = slideImage.getBoundingClientRect();
    const containerRect = swiper.el.getBoundingClientRect();

    const currentTranslate = swiper.getTranslate();
    const imageCenter = imageRect.left + imageRect.width / 2;
    const viewportCenter = containerRect.left + containerRect.width / 2;
    const offsetNeeded = viewportCenter - imageCenter;

    const centeredTranslate = currentTranslate + offsetNeeded;

    log(`Precise centering calculation:
      - Viewport width: ${viewportWidth}px
      - Slide image width: ${slideWidth}px
      - Image center position: ${imageCenter}px
      - Viewport center: ${viewportCenter}px
      - Offset needed: ${offsetNeeded}px
      - Current translate: ${currentTranslate}px
      - Centered translate: ${centeredTranslate}px`);

    swiper.setTransition(speed);
    swiper.setTranslate(centeredTranslate);
    swiper.updateActiveIndex(targetSlideIndex);
    swiper.updateSlidesClasses();

    if (runCallbacks) {
      swiper.emit("slideChange");
    }

    return swiper;
  }

  log(`Sliding to index ${targetSlideIndex} with speed ${speed}ms`);

  if (swiper.params.loop) {
    const totalSlides = swiper.slides.length;
    const isNearStart = targetSlideIndex < 2;
    const isNearEnd = targetSlideIndex > totalSlides - 3;

    if (isNearStart || isNearEnd) {
      try {
        swiper.loopFix();
        log("Loop fix applied for edge position");

        for (let i = 0; i < swiper.slides.length; i++) {
          const slide = swiper.slides[i];
          if (!slide) continue;

          const slideDataIndex = slide.getAttribute("data-index");
          if (
            slideDataIndex !== null &&
            parseInt(slideDataIndex) === originalIndex
          ) {
            targetSlideIndex = i;
            log(`After loop fix, new target index: ${targetSlideIndex}`);
            break;
          }
        }
      } catch (e) {
        log(`Loop fix error: ${e.message}`);
      }
    }
  }

  return swiper.slideTo(targetSlideIndex, speed, runCallbacks, internal);
};

// Define slide configurations
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

const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
  const [isMouseOverSlide, setIsMouseOverSlide] = useState(false);
  const dragTimeoutRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const autoplayTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const scaleTransitionDelay = 400;
  const autoplayCheckIntervalRef = useRef(null);

  const slidingSpeed = 400;

  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      log(`Device detected as ${newIsMobile ? "mobile" : "desktop"}`);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Clean up
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    log("Component mounted");

    return () => {
      log("Component unmounting, cleaning up timeouts");
      if (dragTimeoutRef?.current) {
        clearTimeout(dragTimeoutRef?.current);
      }
      if (transitionTimeoutRef?.current) {
        clearTimeout(transitionTimeoutRef?.current);
      }
      if (autoplayTimeoutRef?.current) {
        clearTimeout(autoplayTimeoutRef?.current);
      }
    };
  }, []);

  const handleSwiperInit = (swiper) => {
    log("Swiper initialized");
    swiperRef.current = swiper;

    swiper.slideToLoop = function (index, speed, runCallbacks, internal) {
      return customSlideToLoop(this, index, speed, runCallbacks, internal);
    };

    setIsSwiperInitialized(true);
  };

  const handleContainerMouseEnter = () => {
    log("Mouse entered container");

    if (!isMobile && isSwiperInitialized && swiperRef.current) {
      log("Pausing autoplay (container mouse enter)");
      setIsAutoplayPaused(true);
      if (swiperRef.current.autoplay) {
        swiperRef.current.autoplay.stop(true);
      }

      // Clear any existing resumption timeout
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
        autoplayTimeoutRef.current = null;
      }
    }
  };

  const handleContainerMouseLeave = () => {
    log("Mouse left container", {
      isMobile,
      isSwiperInitialized,
      isDragging,
      isMouseOverSlide,
    });

    // When mouse leaves container, we know it can't be over any slide
    // Forcibly reset the mouseOverSlide state
    setIsMouseOverSlide(false);

    if (!isMobile && isSwiperInitialized && !isDragging) {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }

      log("Scheduling autoplay resume after container leave");
      autoplayTimeoutRef.current = setTimeout(() => {
        // Since we've already left the container, no need to check isMouseOverSlide again
        log("Resuming autoplay (after container leave delay)");
        setIsAutoplayPaused(false);
        if (swiperRef.current && swiperRef.current.autoplay) {
          // Completely reinitialize autoplay to avoid the glitch
          swiperRef.current.autoplay.stop();

          // Force a small delay before restarting to ensure clean state
          setTimeout(() => {
            if (swiperRef.current) {
              // Reset the autoplay with original parameters
              swiperRef.current.params.autoplay = {
                delay: 0,
                disableOnInteraction: false,
                waitForTransition: true,
              };

              // Ensure the speed parameter is preserved
              swiperRef.current.params.speed = SWIPER_SPEED;

              swiperRef.current.autoplay.start();
              log(`Autoplay resumed with speed: ${SWIPER_SPEED}ms`);
            }
          }, 50);
        }
      }, 1000);
    }
  };

  const handleMouseEnter = (index) => {
    if (isDragging || !isSwiperInitialized || isTransitioning || isMobile)
      return;
    log(`Mouse entered slide ${index}`);
    setIsMouseOverSlide(true);
    setActiveSlide(index);

    // Make sure autoplay stays paused when hovering over a slide
    if (swiperRef.current && swiperRef.current.autoplay) {
      setIsAutoplayPaused(true);
      swiperRef.current.autoplay.stop(true);

      // Clear any existing resumption timeout
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
        autoplayTimeoutRef.current = null;
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDragging || !isSwiperInitialized || isTransitioning || isMobile)
      return;
    log("Mouse left slide");
    setIsMouseOverSlide(false);
    setActiveSlide(null);
  };

  useEffect(() => {
    const handleBackgroundTap = () => {
      log(`Background tap detected, deactivating current slide`);
      setActiveSlide(null);

      // Resume autoplay when tapping away from the slider on mobile
      if (isMobile && swiperRef.current && swiperRef.current.autoplay) {
        log(`Resuming autoplay after background tap on mobile`);
        setIsAutoplayPaused(false);

        // Use the same approach as for desktop to avoid the glitch
        swiperRef.current.autoplay.stop();

        setTimeout(() => {
          if (swiperRef.current) {
            // Reset the autoplay with original parameters
            swiperRef.current.params.autoplay = {
              delay: 0,
              disableOnInteraction: false,
              waitForTransition: true,
            };

            // Ensure the speed parameter is preserved
            swiperRef.current.params.speed = SWIPER_SPEED;

            swiperRef.current.autoplay.start();
            log(`Autoplay resumed with speed: ${SWIPER_SPEED}ms`);
          }
        }, 50);
      }
    };

    window.addEventListener("swiperBackgroundTap", handleBackgroundTap);

    return () => {
      window.removeEventListener("swiperBackgroundTap", handleBackgroundTap);
    };
  }, [isMobile]);

  const handleSlideClick = (index) => {
    if (isMobile) {
      log(`Slide ${index} tapped on mobile`);
    } else {
      log(`Slide ${index} clicked on desktop, no action`);
      return;
    }

    if (isTransitioning) {
      log(`Ignoring click during transition`);
      return;
    }

    if (!isMobile) {
      log(`Non-mobile click, not centering slide`);
      return;
    }

    setIsTransitioning(true);
    log(`Setting transitioning state to prevent multiple taps`);

    if (activeSlide === index) {
      log(`Slide ${index} is already active, deactivating it`);
      setActiveSlide(null);
      setIsTransitioning(false);

      // Resume autoplay when deactivating a slide
      if (swiperRef.current && swiperRef.current.autoplay) {
        log(`Resuming autoplay after deactivating slide on mobile`);
        setIsAutoplayPaused(false);

        // Use the same approach as for desktop to avoid the glitch
        swiperRef.current.autoplay.stop();

        setTimeout(() => {
          if (swiperRef.current) {
            // Reset the autoplay with original parameters
            swiperRef.current.params.autoplay = {
              delay: 0,
              disableOnInteraction: false,
              waitForTransition: true,
            };

            // Ensure the speed parameter is preserved
            swiperRef.current.params.speed = SWIPER_SPEED;

            swiperRef.current.autoplay.start();
            log(`Autoplay resumed with speed: ${SWIPER_SPEED}ms`);
          }
        }, 50);
      }

      return;
    }

    // (Only pause Autoplay if the slide is now activated)
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop(true);
      log(`Pausing autoplay (slide tap)`);
    }

    setActiveSlide(index);
    log(`Setting slide ${index} as active to scale the image`);

    const transitionDelay = scaleTransitionDelay;
    log(
      `Waiting ${transitionDelay}ms for scaling transition to complete before centering`
    );

    log(`Scheduling end of transition state`);
    const transitionTimer = setTimeout(() => {
      if (swiperRef.current) {
        log(
          `Scaling transition should be complete, now centering slide ${index}`
        );

        if (
          swiperRef.current &&
          swiperRef.current.autoplay &&
          swiperRef.current.autoplay.running
        ) {
          swiperRef.current.autoplay.stop(true);
          log(`Ensuring autoplay remains paused during centering`);
        }

        try {
          if (!isMobile || !swiperRef.current.params.freeMode.enabled) {
            customSlideToLoop(swiperRef.current, index, slidingSpeed);
          } else if (isMobile && swiperRef.current.params.freeMode.enabled) {
            // For mobile with freeMode enabled, explicitly call centerSlideInViewport
            log(`Using FreeMode's centerSlideInViewport for slide ${index}`);
            swiperRef.current.freeMode.centerSlideInViewport(
              index,
              slidingSpeed
            );
          }
        } catch (err) {
          log(`Error during slideToLoop: ${err.message}`);
        }

        setTimeout(() => {
          if (
            swiperRef.current &&
            swiperRef.current.autoplay &&
            swiperRef.current.autoplay.running
          ) {
            swiperRef.current.autoplay.stop(true);
            log(`Final check to ensure autoplay remains paused`);
          }

          log(`Ending transition state, allowing new interactions`);
          setIsTransitioning(false);
        }, slidingSpeed + 50);
      } else {
        log(`Swiper instance no longer available, ending transition state`);
        setIsTransitioning(false);
      }
    }, transitionDelay);

    return () => {
      clearTimeout(transitionTimer);
    };
  };

  const handleDragStart = () => {
    log("Drag started");
    setIsDragging(true);
    setActiveSlide(null);

    if (swiperRef.current && swiperRef.current.autoplay) {
      log("Pausing autoplay (drag start)");
      swiperRef.current.autoplay.stop(true);
      setIsAutoplayPaused(true);
    }
  };

  const handleDragEnd = () => {
    log("Drag ended");
    setIsDragging(false);

    if (activeSlide !== null && swiperRef.current) {
      log(`Drag ended with active slide ${activeSlide}, snapping to center`);

      try {
        customSlideToLoop(swiperRef.current, activeSlide, slidingSpeed);
      } catch (err) {
        log(`Error during slideToLoop after drag: ${err.message}`);
      }
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, slidingSpeed + 100);
  };

  const touchStartCoords = (e) => {
    window.checkForDrag = e.touches?.[0]?.clientX;
  };

  const touchEndCoords = (e) => {
    const touchEnd = e.changedTouches?.[0]?.clientX;
    if (
      touchEnd < window.checkForDrag + 10 &&
      touchEnd > window.checkForDrag - 10
    ) {
      const index = e.currentTarget?.dataset?.index;
      handleSlideClick(index);
    }
  };

  const generateSlides = () => {
    const slides = [];
    const visibleSlidesCount = 100;

    const preloadSlideImages = () => {
      const imageSources = [];
      for (let index = 0; index < visibleSlidesCount; index++) {
        const position = (index % 7) + 1;
        const imageUrl = `https://picsum.photos/id/${20 + position}/500/800`;
        imageSources.push(imageUrl);
      }

      Promise.all(
        imageSources.map((src) => preloadImage(src).catch(() => null))
      )
        .then(() => log("All slide images preloaded"))
        .catch((err) => log("Error preloading some images", err));
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(preloadSlideImages);
      } else {
        setTimeout(preloadSlideImages, 200);
      }
    }

    for (let index = 0; index < visibleSlidesCount; index++) {
      const position = (index % 7) + 1;
      const config = SLIDE_CONFIGS[position];
      if (config._hide) continue;

      const isActive = activeSlide === index;
      const slideClasses = `slide ${isActive ? "slide-active" : ""} ${
        activeSlide !== null && !isActive ? "slide-inactive" : ""
      } ${isDragging ? "is-dragging" : ""} ${
        isTransitioning ? "is-transitioning" : ""
      }`;

      // Calculate normalized posX for CSS variables
      let normalizedPosX = "0px";
      if (config.posX) {
        // If it's a simple pixel value like "10px"
        if (config.posX.endsWith("px")) {
          normalizedPosX = config.posX;
        }
        // For percentage or calc values, we use a multiplier for consistent spacing
        else if (config.posX.includes("%") || config.posX.includes("calc")) {
          // Extract any numeric value from the start of the string or use 0
          const match = config.posX.match(/[-]?\d+/);
          const numericValue = match ? parseInt(match[0]) : 0;
          // Normalize to a pixel offset based on the numeric value
          normalizedPosX = `${numericValue}px`;
        }
      }

      // Calculate spacing adjustment without affecting original scale
      // This preserves the original scale for visual appearance
      // but provides a multiplier for spacing calculations only
      const spacingAdjustment = isMobile ? 0.8 : 1;

      const dataAttributes = {
        "data-index": index,
        "data-active": isActive ? "true" : "false",
        "data-position": position,
        ...(activeSlide !== null &&
          !isActive && {
            "data-relative-position": index < activeSlide ? "before" : "after",
          }),
      };

      slides.push(
        <SwiperSlide
          tag="span"
          key={index}
          className={slideClasses}
          {...dataAttributes}
          style={{
            // backgroundColor: config.backgroundColor,
            zIndex: isActive ? 10 : config.zIndex,
            // Add CSS variables to control dynamic spacing
            "--slide-scale": config.scale,
            "--slide-spacing-factor": spacingAdjustment,
            "--slide-pos-x": normalizedPosX,
            "--slide-hover-scale": config.hoverScale,
            "--slide-is-mobile": isMobile ? "1" : "0",
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
          <div
            className="slide-inner"
            onClick={(e) => {
              e.stopPropagation();
              handleSlideClick(index);
            }}
          >
            <img
              className="slide-image"
              src={`https://picsum.photos/id/${20 + position}/500/800`}
              alt={`Slide ${position}`}
              loading="eager"
              fetchpriority="high"
              onClick={(e) => {
                e.stopPropagation();
                handleSlideClick(index);
              }}
              onLoad={() =>
                log(`Image loaded for slide ${index} (position ${position})`)
              }
            />
          </div>
        </SwiperSlide>
      );
    }
    return slides;
  };

  const slides = generateSlides();
  log(`Generated ${slides.length} slides`);

  // Add effect to continuously ensure autoplay is paused when mouse is over container
  useEffect(() => {
    if (
      !isMobile &&
      (isMouseOverSlide || containerRef.current?.matches(":hover"))
    ) {
      // Set up an interval to continuously ensure autoplay is paused
      autoplayCheckIntervalRef.current = setInterval(() => {
        if (swiperRef.current && swiperRef.current.autoplay) {
          log("Ensuring autoplay remains paused");
          setIsAutoplayPaused(true);
          swiperRef.current.autoplay.stop(true);
        }
      }, 300); // Check every 300ms
    } else if (autoplayCheckIntervalRef.current) {
      clearInterval(autoplayCheckIntervalRef.current);
      autoplayCheckIntervalRef.current = null;
    }

    return () => {
      if (autoplayCheckIntervalRef.current) {
        clearInterval(autoplayCheckIntervalRef.current);
        autoplayCheckIntervalRef.current = null;
      }
    };
  }, [isMobile, isMouseOverSlide, isSwiperInitialized]);

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
        spaceBetween={-80}
        slidesPerView="auto"
        centeredSlides={!!isMobile}
        modules={[Autoplay, freeMode]}
        autoplay={{ delay: 0 }}
        loop={true}
        speed={SWIPER_SPEED}
        freeMode={{
          log,
          enabled: true,
          centerOnTap: true,
        }}
        onTouchStart={touchStartCoords}
        onTouchEnd={touchEndCoords}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        draggable={true}
      >
        {slides}
      </Swiper>
    </div>
  );
};

export default SwiperDemo;
