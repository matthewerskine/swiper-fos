import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import freeMode from "./FreeMode";
import Autoplay from "./Autoplay";

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

  // Store original values
  const originalIndex = index;

  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }

  // Find the target slide with the matching data-index
  let targetSlideIndex = -1;
  let targetSlide = null;

  // Make sure we have slides to work with
  if (!swiper.slides || !swiper.slides.length) {
    log("Error: No slides found in swiper");
    return swiper;
  }

  // Search for the slide with the matching data-index attribute
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

  // If we couldn't find it by data-index, use the original index as fallback
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

  // Check if we're on mobile to adjust centering
  const isMobileView = window.innerWidth < 768; // Assuming 768px is the mobile breakpoint

  if (isMobileView) {
    // On mobile, center based on the image, not the slide
    // Find the image within the slide
    const slideImage = targetSlide.querySelector("img.slide-image");
    if (!slideImage) {
      log(
        `Error: No image found in slide ${targetSlideIndex} (data-index: ${originalIndex})`
      );
      return swiper;
    }

    // Get measurements
    const viewportWidth = swiper.width;
    const slideWidth = slideImage.offsetWidth;

    // Get more accurate offset calculations
    const slideRect = targetSlide.getBoundingClientRect();
    const imageRect = slideImage.getBoundingClientRect();
    const containerRect = swiper.el.getBoundingClientRect();

    // Calculate the offset relative to the current translation
    const currentTranslate = swiper.getTranslate();
    const imageCenter = imageRect.left + imageRect.width / 2;
    const viewportCenter = containerRect.left + containerRect.width / 2;
    const offsetNeeded = viewportCenter - imageCenter;

    // Calculate the translation needed to center this specific image
    const centeredTranslate = currentTranslate + offsetNeeded;

    log(`Precise centering calculation:
      - Viewport width: ${viewportWidth}px
      - Slide image width: ${slideWidth}px
      - Image center position: ${imageCenter}px
      - Viewport center: ${viewportCenter}px
      - Offset needed: ${offsetNeeded}px
      - Current translate: ${currentTranslate}px
      - Centered translate: ${centeredTranslate}px`);

    // Directly set the translation to center the slide image
    swiper.setTransition(speed);
    swiper.setTranslate(centeredTranslate);
    swiper.updateActiveIndex(targetSlideIndex);
    swiper.updateSlidesClasses();

    if (runCallbacks) {
      swiper.emit("slideChange");
    }

    return swiper;
  }

  // For non-mobile or fallback, continue with normal slide operation
  log(`Sliding to index ${targetSlideIndex} with speed ${speed}ms`);

  // Ensure correct looping for edge slides
  if (swiper.params.loop) {
    const totalSlides = swiper.slides.length;
    const isNearStart = targetSlideIndex < 2;
    const isNearEnd = targetSlideIndex > totalSlides - 3;

    // Simple loopFix for edge cases
    if (isNearStart || isNearEnd) {
      try {
        // When near the edge, do a simple loop fix
        swiper.loopFix();
        log("Loop fix applied for edge position");

        // Re-find our slide after the loop fix
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

  // Execute the slide operation in a single, clean motion
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

// Add helper function to preload images
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
  const [isMouseOverContainer, setIsMouseOverContainer] = useState(false);
  const [isMouseOverSlide, setIsMouseOverSlide] = useState(false);
  const dragTimeoutRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const autoplayTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const [touchStartPosition, setTouchStartPosition] = useState(null);

  // Timing constants for transitions
  const scaleTransitionDelay = 400; // ms - match the CSS transition duration for scaling
  const slidingSpeed = 400; // ms - match the CSS transition time for sliding

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      log(`Device detected as ${newIsMobile ? "mobile" : "desktop"}`);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      log("Component unmounted, resize listener removed");
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    log("Component mounted");

    return () => {
      log("Component unmounting, cleaning up timeouts");
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
    log("Swiper initialized");
    swiperRef.current = swiper;

    // Add our custom slideToLoop method directly to the swiper instance
    swiper.slideToLoop = function (index, speed, runCallbacks, internal) {
      return customSlideToLoop(this, index, speed, runCallbacks, internal);
    };

    setIsSwiperInitialized(true);
  };

  // Pause autoplay when mouse enters the container
  const handleContainerMouseEnter = () => {
    log("Mouse entered container");
    setIsMouseOverContainer(true);

    if (!isMobile && isSwiperInitialized && swiperRef.current) {
      log("Pausing autoplay (container mouse enter)");
      setIsAutoplayPaused(true);
      if (swiperRef.current.autoplay) {
        // Use the enhanced stop method to immediately stop autoplay
        swiperRef.current.autoplay.stop(true);
      }
    }
  };

  // Resume autoplay when mouse leaves the container
  const handleContainerMouseLeave = () => {
    log("Mouse left container");
    setIsMouseOverContainer(false);

    if (!isMobile && isSwiperInitialized && !isDragging && !isMouseOverSlide) {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }

      log("Scheduling autoplay resume after container leave");
      autoplayTimeoutRef.current = setTimeout(() => {
        if (!isMouseOverSlide) {
          log("Resuming autoplay (after container leave delay)");
          setIsAutoplayPaused(false);
          if (swiperRef.current && swiperRef.current.autoplay) {
            // Start autoplay which will now clear transition listeners
            swiperRef.current.autoplay.start();
          }
        } else {
          log("Not resuming autoplay - mouse is still over a slide");
        }
      }, 1000);
    }
  };

  // Stops autoplay and applies hover effects
  const handleMouseEnter = (index) => {
    if (isDragging || !isSwiperInitialized || isTransitioning || isMobile)
      return;
    log(`Mouse entered slide ${index}`);
    setIsMouseOverSlide(true);
    setActiveSlide(index);
  };

  // Resumes autoplay after leaving with a delay
  const handleMouseLeave = () => {
    if (isDragging || !isSwiperInitialized || isTransitioning || isMobile)
      return;
    log("Mouse left slide");
    setIsMouseOverSlide(false);
    setActiveSlide(null);
  };

  // Add a useEffect to listen for background taps
  useEffect(() => {
    const handleBackgroundTap = () => {
      log(`Background tap detected, deactivating current slide`);
      setActiveSlide(null);
    };

    // Add event listener for background taps
    window.addEventListener("swiperBackgroundTap", handleBackgroundTap);

    // Clean up
    return () => {
      window.removeEventListener("swiperBackgroundTap", handleBackgroundTap);
    };
  }, []);

  // Handle slide click for mobile
  const handleSlideClick = (index) => {
    if (isMobile) {
      log(`Slide ${index} tapped on mobile`);
    } else {
      log(`Slide ${index} clicked on desktop, no action`);
      return;
    }

    // If we're already in a transition, ignore this click
    if (isTransitioning) {
      log(`Ignoring click during transition`);
      return;
    }

    // For non-mobile, we don't want the tap-to-center behavior
    if (!isMobile) {
      log(`Non-mobile click, not centering slide`);
      return;
    }

    // Set transitioning state to prevent multiple clicks
    setIsTransitioning(true);
    log(`Setting transitioning state to prevent multiple taps`);

    // Pause autoplay when user interacts with slides
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop(true); // Force immediate stop
      log(`Pausing autoplay (slide tap)`);
    }

    // If the slide is already active, deactivate it (toggle behavior)
    if (activeSlide === index) {
      log(`Slide ${index} is already active, deactivating it`);
      setActiveSlide(null);
      setIsTransitioning(false);
      return;
    }

    // Set active slide to the clicked one
    setActiveSlide(index);
    log(`Setting slide ${index} as active to scale the image`);

    // A simpler approach: wait for CSS transition to finish, then do the slide
    const transitionDelay = scaleTransitionDelay;
    log(
      `Waiting ${transitionDelay}ms for scaling transition to complete before centering`
    );

    // Schedule the end of the transition state
    log(`Scheduling end of transition state`);
    const transitionTimer = setTimeout(() => {
      if (swiperRef.current) {
        log(
          `Scaling transition should be complete, now centering slide ${index}`
        );

        // Make sure autoplay is still paused during transitions
        if (
          swiperRef.current &&
          swiperRef.current.autoplay &&
          swiperRef.current.autoplay.running
        ) {
          swiperRef.current.autoplay.stop(true); // Force immediate stop
          log(`Ensuring autoplay remains paused during centering`);
        }

        // Use our custom slideToLoop function for better positioning
        try {
          // On mobile, FreeMode's centerOnTap will handle the centering,
          // so we only need to use customSlideToLoop for non-mobile or
          // if FreeMode is disabled
          if (!isMobile || !swiperRef.current.params.freeMode.enabled) {
            customSlideToLoop(swiperRef.current, index, slidingSpeed);
          }
        } catch (err) {
          log(`Error during slideToLoop: ${err.message}`);
        }

        // Allow interactions after sliding completes
        setTimeout(() => {
          // Make sure autoplay is still paused
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
        }, slidingSpeed + 50); // Add a small buffer after the sliding is done
      } else {
        log(`Swiper instance no longer available, ending transition state`);
        setIsTransitioning(false);
      }
    }, transitionDelay);

    return () => {
      clearTimeout(transitionTimer);
    };
  };

  // Handle drag start
  const handleDragStart = () => {
    log("Drag started");
    setIsDragging(true);
    setActiveSlide(null);
    setTouchStartPosition(null); // Reset touch start position

    // Pause autoplay during drag
    if (swiperRef.current && swiperRef.current.autoplay) {
      log("Pausing autoplay (drag start)");
      swiperRef.current.autoplay.stop(true); // Force immediate stop
      setIsAutoplayPaused(true);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    log("Drag ended");
    setIsDragging(false);

    // If we were dragging the active slide, snap to center it
    if (activeSlide !== null && swiperRef.current) {
      log(`Drag ended with active slide ${activeSlide}, snapping to center`);

      // Use our custom slideToLoop function for better positioning
      try {
        customSlideToLoop(swiperRef.current, activeSlide, slidingSpeed);
      } catch (err) {
        log(`Error during slideToLoop after drag: ${err.message}`);
      }
    }

    // Schedule the end of any potential transitioning state
    setTimeout(() => {
      setIsTransitioning(false);
    }, slidingSpeed + 100);
  };

  // CheckForDrag (more accurate for detecting tap vs drag)
  const touchStartCoords = (e) => {
    window.checkForDrag = e.touches?.[0]?.clientX;
  };

  // If a tap is detected, run a tap handler
  const touchEndCoords = (e) => {
    const touchEnd = e.changedTouches?.[0]?.clientX;
    if (
      touchEnd < window.checkForDrag + 10 &&
      touchEnd > window.checkForDrag - 10
    ) {
      // It's a click (minimal movement)
      const index = e.currentTarget?.dataset?.index;
      handleSlideClick(index);
    }
  };

  // Function to generate slides
  const generateSlides = () => {
    const slides = [];
    const visibleSlidesCount = 20;

    // Preload images for all slides to prevent loading gaps during fast scrolling
    const preloadSlideImages = () => {
      // Create array of image sources to preload
      const imageSources = [];
      for (let index = 0; index < visibleSlidesCount; index++) {
        const position = (index % 7) + 1;
        const imageUrl = `https://picsum.photos/id/${20 + position}/500/800`;
        imageSources.push(imageUrl);
      }

      // Preload all images in parallel
      Promise.all(
        imageSources.map((src) => preloadImage(src).catch(() => null))
      )
        .then(() => log("All slide images preloaded"))
        .catch((err) => log("Error preloading some images", err));
    };

    // Start preloading images as soon as possible
    if (typeof window !== "undefined") {
      // Use requestIdleCallback if available (or setTimeout as fallback)
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
        spaceBetween={isMobile ? -30 : -80}
        slidesPerView="auto"
        centeredSlides={!!isMobile}
        modules={[Autoplay, freeMode]}
        autoplay={{ delay: 0 }}
        loop={true}
        speed={isMobile ? 1000 : 5000}
        freeMode={{
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
