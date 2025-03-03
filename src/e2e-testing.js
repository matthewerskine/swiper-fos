/**
 * E2E Testing Helpers for Swiper Component
 *
 * This script can be executed in the browser console to visually validate
 * the Swiper component behavior. It runs a series of automated tests
 * while you observe the behavior.
 *
 * To use:
 * 1. Open your app in the browser
 * 2. Open browser developer tools (F12)
 * 3. Copy and paste this entire script into the console
 * 4. Call runE2ETests() to begin testing
 */

// Set debug mode to true for detailed logging
window.swiperDebug = true;

/**
 * Main function to run all E2E tests
 */
async function runE2ETests() {
  console.log(
    "%c=== SWIPER E2E TESTING ===",
    "color: blue; font-size: 16px; font-weight: bold"
  );
  console.log("Observing the component visually while automated tests run...");

  await testAutoplayResume();
  await testHoverEffects();
  await testMobileTap();
  await testDragBehavior();

  console.log(
    "%c=== E2E TESTS COMPLETED ===",
    "color: green; font-size: 16px; font-weight: bold"
  );
  console.log(
    "All automated tests completed. Verify visual behavior matched expectations."
  );
}

/**
 * Test that autoplay resumes after interactions
 */
async function testAutoplayResume() {
  console.log(
    "%c🧪 Testing Autoplay Resume",
    "color: purple; font-weight: bold"
  );

  // Get the container
  const container = document.querySelector(".swiper-container");
  if (!container) {
    console.error("Container not found");
    return;
  }

  // Pause autoplay by entering container
  console.log("Pausing autoplay (mouse enter)...");
  triggerEvent(container, "mouseenter");

  // Wait 2 seconds
  await wait(2000);

  // Resume autoplay by leaving container
  console.log("Resuming autoplay (mouse leave)...");
  triggerEvent(container, "mouseleave");

  // Wait for expected autoplay resume
  await wait(2000);

  console.log(
    "✅ Autoplay Resume test completed - verify visually autoplay resumed"
  );
}

/**
 * Test hover effects on desktop
 */
async function testHoverEffects() {
  console.log("%c🧪 Testing Hover Effects", "color: purple; font-weight: bold");

  // Get all slides
  const slides = document.querySelectorAll(".swiper-slide");
  if (!slides.length) {
    console.error("No slides found");
    return;
  }

  // Hover each slide
  for (let i = 0; i < Math.min(slides.length, 3); i++) {
    console.log(`Hovering slide ${i}...`);
    triggerEvent(slides[i], "mouseenter");
    await wait(1000);

    const isActive = slides[i].classList.contains("slide-active");
    console.log(`Slide ${i} active state: ${isActive ? "✅" : "❌"}`);

    // Leave the slide
    triggerEvent(slides[i], "mouseleave");
    await wait(500);
  }

  console.log(
    "✅ Hover Effects test completed - verify visually slides scaled up and pushed others"
  );
}

/**
 * Test mobile tap behavior
 */
async function testMobileTap() {
  console.log(
    "%c🧪 Testing Mobile Tap Behavior",
    "color: purple; font-weight: bold"
  );

  // Simulate mobile viewport if on desktop
  const originalWidth = window.innerWidth;
  const wasMobile = window.innerWidth < 768;

  if (!wasMobile) {
    console.log("Simulating mobile viewport...");
    simulateMobileViewport();
    await wait(1000); // Allow time for responsive changes to apply
  }

  // Get all slides
  const slides = document.querySelectorAll(".swiper-slide");
  if (!slides.length) {
    console.error("No slides found");
    return;
  }

  // Tap each slide
  for (let i = 0; i < Math.min(slides.length, 3); i++) {
    console.log(`Tapping slide ${i}...`);
    triggerEvent(slides[i], "click");
    await wait(1500);

    const isActive = slides[i].classList.contains("slide-active");
    console.log(`Slide ${i} active state: ${isActive ? "✅" : "❌"}`);
  }

  // Tap the active slide again to deactivate
  const activeSlide = document.querySelector(".slide-active");
  if (activeSlide) {
    console.log("Tapping active slide to deactivate...");
    triggerEvent(activeSlide, "click");
    await wait(1000);

    const stillActive = activeSlide.classList.contains("slide-active");
    console.log(`Active slide deactivated: ${!stillActive ? "✅" : "❌"}`);
  }

  // Restore original viewport if changed
  if (!wasMobile) {
    console.log("Restoring desktop viewport...");
    restoreViewport(originalWidth);
    await wait(1000);
  }

  console.log(
    "✅ Mobile Tap test completed - verify visually tapped slides centered and scaled"
  );
}

/**
 * Test drag behavior
 */
async function testDragBehavior() {
  console.log("%c🧪 Testing Drag Behavior", "color: purple; font-weight: bold");

  // Get the swiper element
  const swiper = document.querySelector(".swiper");
  if (!swiper) {
    console.error("Swiper not found");
    return;
  }

  // First activate a slide
  const slides = document.querySelectorAll(".swiper-slide");
  if (slides.length) {
    console.log("Activating a slide first...");
    triggerEvent(slides[0], "mouseenter");
    await wait(1000);
  }

  // Simulate drag start
  console.log("Starting drag...");
  triggerEvent(swiper, "touchstart", {
    touches: [{ clientX: 500, clientY: 300 }],
  });
  await wait(100);

  // Move a bit
  console.log("Dragging...");
  triggerEvent(swiper, "touchmove", {
    touches: [{ clientX: 400, clientY: 300 }],
  });
  await wait(500);

  // End drag
  console.log("Ending drag...");
  triggerEvent(swiper, "touchend");
  await wait(1000);

  console.log(
    "✅ Drag Behavior test completed - verify active slide was reset during drag"
  );
}

/**
 * Helper to trigger DOM events
 */
function triggerEvent(element, eventName, eventParams = {}) {
  let event;

  // Handle touch events specially
  if (eventName.startsWith("touch")) {
    event = new TouchEvent(eventName, {
      bubbles: true,
      cancelable: true,
      view: window,
      ...eventParams,
    });
  } else {
    event = new Event(eventName, {
      bubbles: true,
      cancelable: true,
      ...eventParams,
    });
  }

  element.dispatchEvent(event);
}

/**
 * Helper to simulate a mobile viewport
 */
function simulateMobileViewport() {
  // Save original dimensions
  window._originalWidth = window.innerWidth;
  window._originalHeight = window.innerHeight;

  // Simulate mobile
  Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
  Object.defineProperty(window, "innerHeight", { value: 667, writable: true });

  // Trigger resize event
  window.dispatchEvent(new Event("resize"));
}

/**
 * Helper to restore the original viewport
 */
function restoreViewport(width) {
  // Restore original dimensions
  Object.defineProperty(window, "innerWidth", { value: width, writable: true });
  Object.defineProperty(window, "innerHeight", {
    value: window._originalHeight,
    writable: true,
  });

  // Trigger resize event
  window.dispatchEvent(new Event("resize"));
}

/**
 * Helper to wait for a specified time
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Export the main function to the global scope
window.runE2ETests = runE2ETests;
