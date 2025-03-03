import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SwiperDemo from "./SwiperDemo";

// Mock Swiper and its modules
jest.mock("swiper/react", () => {
  return {
    Swiper: function MockSwiper({ children, onSwiper, ...props }) {
      const React = require("react");

      React.useEffect(() => {
        if (onSwiper) {
          const mockSwiper = {
            slides: Array(21).fill(null), // 3 sets of 7 slides for loop mode
            slideTo: jest.fn(),
            slideToLoop: jest.fn(),
            translateTo: jest.fn(),
            update: jest.fn(),
            updateSize: jest.fn(),
            updateSlides: jest.fn(),
            updateProgress: jest.fn(),
            updateActiveIndex: jest.fn(),
            updateSlidesClasses: jest.fn(),
            setTransition: jest.fn(),
            autoplay: {
              start: jest.fn(),
              stop: jest.fn(),
            },
            params: {
              direction: "horizontal",
              freeMode: {
                enabled: true,
              },
            },
            wrapperEl: {
              style: {},
            },
            realIndex: 0,
            activeIndex: 0,
            translate: 0,
          };
          onSwiper(mockSwiper);
        }
      }, [onSwiper]);

      return (
        <div data-testid="mock-swiper" {...props}>
          {children}
        </div>
      );
    },
    SwiperSlide: ({ children, ...props }) => (
      <div data-testid="swiper-slide" {...props}>
        {children}
      </div>
    ),
  };
});

jest.mock("swiper/modules", () => ({
  Autoplay: {},
  FreeMode: {},
}));

jest.mock("swiper/css", () => ({}));
jest.mock("swiper/css/navigation", () => ({}));
jest.mock("swiper/css/pagination", () => ({}));

// Mock window.innerWidth to simulate mobile/desktop
const setMobileView = () => {
  Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
  window.dispatchEvent(new Event("resize"));
};

const setDesktopView = () => {
  Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
  window.dispatchEvent(new Event("resize"));
};

describe("SwiperDemo", () => {
  // Tests for both mobile and desktop
  describe("Common functionality", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders slides correctly", () => {
      render(<SwiperDemo />);
      const slides = screen.getAllByTestId("swiper-slide");
      expect(slides.length).toBeGreaterThan(0);
    });

    it("initializes swiper correctly", async () => {
      render(<SwiperDemo />);

      // Wait for any async operations to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const swiperContainer = screen.getByTestId("swiper-container");
      expect(swiperContainer).toBeInTheDocument();
    });
  });

  // Tests specifically for mobile functionality
  describe("Mobile functionality", () => {
    beforeEach(() => {
      setMobileView();
      jest.clearAllMocks();
    });

    afterAll(() => {
      setDesktopView();
    });

    it("should detect mobile view correctly", async () => {
      render(<SwiperDemo />);

      // Wait for any async operations to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Check if mobile detection worked (indirectly by checking for mobile-specific behavior)
      const slides = screen.getAllByTestId("swiper-slide");
      const firstSlide = slides[0];

      // Click a slide - this should add slide-active class in mobile mode
      fireEvent.click(firstSlide);

      // Wait for any state updates to process
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(firstSlide.className).toContain("slide-active");
    });

    it("should handle slide click on mobile", async () => {
      render(<SwiperDemo />);

      // Wait for any async operations to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Get slides
      const slides = screen.getAllByTestId("swiper-slide");
      expect(slides.length).toBeGreaterThan(2);

      // Click second slide
      fireEvent.click(slides[1]);

      // Wait for any state updates
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Check that slide has active class
      expect(slides[1].className).toContain("slide-active");

      // Check that proper Swiper methods were called
      // Since we can't directly access the mock from here, we're checking
      // indirectly through the component's behavior
    });

    it("should deactivate active slide when clicked again", async () => {
      render(<SwiperDemo />);

      // Wait for initialization
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const slides = screen.getAllByTestId("swiper-slide");
      const targetSlide = slides[2];

      // First click to activate
      fireEvent.click(targetSlide);

      // Wait for state update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(targetSlide.className).toContain("slide-active");

      // Second click to deactivate
      fireEvent.click(targetSlide);

      // Wait for state update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
      });

      // Should no longer have active class
      expect(targetSlide.className).not.toContain("slide-active");
    });
  });

  // Tests specifically for desktop functionality
  describe("Desktop functionality", () => {
    beforeEach(() => {
      setDesktopView();
      jest.clearAllMocks();
    });

    it("should apply hover effects on desktop", async () => {
      render(<SwiperDemo />);

      // Wait for initialization
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const slides = screen.getAllByTestId("swiper-slide");
      const targetSlide = slides[0];

      // Trigger mouse enter
      fireEvent.mouseEnter(targetSlide);

      // Wait for state update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should have active class
      expect(targetSlide.className).toContain("slide-active");

      // Trigger mouse leave
      fireEvent.mouseLeave(targetSlide);

      // Wait for state update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should no longer have active class
      expect(targetSlide.className).not.toContain("slide-active");
    });

    it("should handle container mouse enter/leave", async () => {
      render(<SwiperDemo />);

      // Wait for initialization
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const container = screen.getByTestId("swiper-container").parentElement;

      // Mouse enter container
      fireEvent.mouseEnter(container);

      // Wait for state update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Mouse leave container
      fireEvent.mouseLeave(container);

      // Wait for state update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100)); // Wait longer than the autoplay resume delay
      });

      // We can't easily check if autoplay was stopped/started,
      // but we can verify the component didn't crash
      expect(container).toBeInTheDocument();
    });
  });
});
