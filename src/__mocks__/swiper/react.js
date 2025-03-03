import React, { useState, useEffect } from "react";

// Mock a context to share state between components
const SwiperContext = React.createContext({
  activeSlide: null,
  setActiveSlide: () => {},
  isDragging: false,
  setIsDragging: () => {},
  isTransitioning: false,
  setIsTransitioning: () => {},
});

// Mock Swiper component
export const Swiper = React.forwardRef(function MockSwiper(props, ref) {
  const [activeSlide, setActiveSlide] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const containerRef = React.useRef(null);

  // Update the ref to point to our container
  React.useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(containerRef.current);
      } else {
        ref.current = {
          slideTo: (index, speed, runCallbacks) => {
            console.log(
              `[Mock Swiper] slideTo called with index: ${index}, speed: ${speed}, runCallbacks: ${runCallbacks}`
            );
            setActiveSlide(index);
          },
          slideToLoop: (index, speed, runCallbacks) => {
            console.log(
              `[Mock Swiper] slideToLoop called with index: ${index}, speed: ${speed}, runCallbacks: ${runCallbacks}`
            );
            setActiveSlide(index);
          },
          updateSize: () => console.log("[Mock Swiper] updateSize called"),
          updateSlides: () => console.log("[Mock Swiper] updateSlides called"),
          updateProgress: () =>
            console.log("[Mock Swiper] updateProgress called"),
          translateBy: () => console.log("[Mock Swiper] translateBy called"),
          autoplay: {
            start: () => {
              console.log("[Mock Swiper] autoplay.start called");
              setIsAutoplayPaused(false);
              if (containerRef.current) {
                containerRef.current.classList.remove("autoplay-paused");
              }
            },
            stop: () => {
              console.log("[Mock Swiper] autoplay.stop called");
              setIsAutoplayPaused(true);
              if (containerRef.current) {
                containerRef.current.classList.add("autoplay-paused");
              }
            },
          },
        };
      }
    }
  }, [ref]);

  // Call onSwiper with mock methods
  useEffect(() => {
    if (props.onSwiper) {
      props.onSwiper({
        slideTo: (index, speed, runCallbacks) => {
          console.log(
            `[Mock Swiper] slideTo called with index: ${index}, speed: ${speed}, runCallbacks: ${runCallbacks}`
          );
          setActiveSlide(index);
        },
        slideToLoop: (index, speed, runCallbacks) => {
          console.log(
            `[Mock Swiper] slideToLoop called with index: ${index}, speed: ${speed}, runCallbacks: ${runCallbacks}`
          );
          setActiveSlide(index);
        },
        updateSize: () => console.log("[Mock Swiper] updateSize called"),
        updateSlides: () => console.log("[Mock Swiper] updateSlides called"),
        updateProgress: () =>
          console.log("[Mock Swiper] updateProgress called"),
        translateBy: () => console.log("[Mock Swiper] translateBy called"),
        autoplay: {
          start: () => {
            console.log("[Mock Swiper] autoplay.start called");
            setIsAutoplayPaused(false);
            if (containerRef.current) {
              containerRef.current.classList.remove("autoplay-paused");
            }
          },
          stop: () => {
            console.log("[Mock Swiper] autoplay.stop called");
            setIsAutoplayPaused(true);
            if (containerRef.current) {
              containerRef.current.classList.add("autoplay-paused");
            }
          },
        },
      });
    }
  }, [props.onSwiper]);

  // Handle drag events
  const handleDragStart = () => {
    setIsDragging(true);
    setActiveSlide(null); // Reset active slide during drag
    if (containerRef.current) {
      containerRef.current.classList.add("is-dragging");
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.classList.remove("is-dragging");
    }
  };

  // Filter out Swiper-specific props that React doesn't recognize
  const validProps = { ...props };
  [
    "onSwiper",
    "spaceBetween",
    "slidesPerView",
    "centeredSlides",
    "loop",
    "freeMode",
  ].forEach((prop) => {
    delete validProps[prop];
  });

  // Convert 'autoplay' to 'autoPlay' for React
  if (validProps.autoplay) {
    validProps.autoPlay = validProps.autoplay;
    delete validProps.autoplay;
  }

  // Handle mouse enter/leave for the container to pause/resume autoplay
  const handleMouseEnter = () => {
    setIsAutoplayPaused(true);
    if (containerRef.current) {
      containerRef.current.classList.add("autoplay-paused");
    }
  };

  const handleMouseLeave = () => {
    // In a real component, there might be a delay before resuming
    setTimeout(() => {
      setIsAutoplayPaused(false);
      if (containerRef.current) {
        containerRef.current.classList.remove("autoplay-paused");
      }
    }, 1000);
  };

  return (
    <SwiperContext.Provider
      value={{
        activeSlide,
        setActiveSlide,
        isDragging,
        setIsDragging,
        isTransitioning,
        setIsTransitioning,
      }}
    >
      <div
        data-testid="swiper"
        ref={(el) => {
          containerRef.current = el;
          // Forward ref is handled in the useEffect
        }}
        className={
          isAutoplayPaused
            ? "swiper-container autoplay-paused"
            : "swiper-container"
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        {...validProps}
      >
        <div className={`swiper ${isDragging ? "is-dragging" : ""}`}>
          {props.children}
        </div>
      </div>
    </SwiperContext.Provider>
  );
});

// Mock SwiperSlide component
export const SwiperSlide = React.forwardRef(function MockSwiperSlide(
  props,
  ref
) {
  // Generate a random slide id for each slide to mimic real behavior
  const [slideId] = useState(`slide-${Math.floor(Math.random() * 10000)}`);
  const slideRef = React.useRef(null);
  const {
    activeSlide,
    setActiveSlide,
    isDragging,
    isTransitioning,
    setIsTransitioning,
  } = React.useContext(SwiperContext);

  // Find our index among siblings to identify this slide
  const [slideIndex, setSlideIndex] = useState(null);

  useEffect(() => {
    // Find this slide's index in parent
    if (slideRef.current && slideRef.current.parentElement) {
      const siblings = Array.from(slideRef.current.parentElement.children);
      const index = siblings.indexOf(slideRef.current);
      setSlideIndex(index);
    }
  }, []);

  React.useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(slideRef.current);
      } else {
        ref.current = slideRef.current;
      }
    }
  }, [ref]);

  // Handle click for mobile tapping
  const handleClick = () => {
    if (isDragging) return;

    if (slideIndex === activeSlide) {
      // If already active, deactivate on second tap
      setActiveSlide(null);
    } else {
      // Set as active on first tap
      setActiveSlide(slideIndex);
      // Set transitioning state
      setIsTransitioning(true);
      // Clear transitioning state after animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }
  };

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    if (!isDragging && !isTransitioning) {
      setActiveSlide(slideIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging && !isTransitioning) {
      setActiveSlide(null);
    }
  };

  // Determine classes based on state
  const isActive = activeSlide === slideIndex;
  const classes = [
    "slide",
    isActive ? "slide-active" : "",
    isDragging ? "is-dragging" : "",
    isTransitioning ? "is-transitioning" : "",
    props.className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      data-testid="swiper-slide"
      ref={slideRef}
      id={slideId}
      className={classes}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {props.children}
    </div>
  );
});

// Default export
export default {
  Swiper,
  SwiperSlide,
};
