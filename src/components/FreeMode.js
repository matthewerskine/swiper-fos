function now() {
  return Date.now();
}

function elementTransitionEnd(el, callback) {
  function fireCallBack(e) {
    if (e.target !== el) return;
    callback.call(el, e);
    el.removeEventListener("transitionend", fireCallBack);
  }
  if (callback) {
    el.addEventListener("transitionend", fireCallBack);
  }
}

export default function freeMode({ swiper, extendParams, emit, once }) {
  extendParams({
    freeMode: {
      enabled: false,
      momentum: true,
      momentumRatio: 1,
      momentumBounce: true,
      momentumBounceRatio: 1,
      momentumVelocityRatio: 1,
      sticky: false,
      minimumVelocity: 0.02,
      centerOnTap: true,
    },
  });

  function centerSlideInViewport(slideIndex, speed = 300) {
    if (!swiper || !swiper.params.freeMode.centerOnTap) return;

    // Check if we're on mobile - only apply this on mobile
    const isMobileView = window.innerWidth < 768; // Use the same breakpoint as in SwiperDemo
    if (!isMobileView) {
      if (typeof window !== "undefined" && window.log) {
        window.log(`FreeMode: Skipping centering on non-mobile device`);
      }
      return false;
    }

    if (typeof window !== "undefined" && window.log) {
      window.log(
        `FreeMode: Using improved slide centering for slide ${slideIndex}`
      );
    }

    // Find the correct slide using data-index
    let targetSlide = null;
    for (let i = 0; i < swiper.slides.length; i++) {
      const slide = swiper.slides[i];
      if (!slide) continue;

      const slideDataIndex = slide.getAttribute("data-index");
      if (
        slideDataIndex !== null &&
        parseInt(slideDataIndex, 10) === slideIndex
      ) {
        targetSlide = slide;
        if (typeof window !== "undefined" && window.log) {
          window.log(
            `FreeMode: Found target slide at position ${i} with data-index ${slideIndex}`
          );
        }
        break;
      }
    }

    // If we couldn't find a slide with the matching data-index, fall back to index
    if (!targetSlide) {
      targetSlide = swiper.slides[slideIndex];
      if (typeof window !== "undefined" && window.log) {
        window.log(
          `FreeMode: Couldn't find slide with data-index ${slideIndex}, using position index`
        );
      }
    }

    if (!targetSlide) {
      if (typeof window !== "undefined" && window.log) {
        window.log(`FreeMode: Couldn't find slide ${slideIndex}`);
      }
      return false;
    }

    // Target the image inside the slide, not the slide itself
    const slideImage = targetSlide.querySelector(".slide-image");
    if (!slideImage) {
      if (typeof window !== "undefined" && window.log) {
        window.log(`FreeMode: Couldn't find image in slide ${slideIndex}`);
      }
      return false;
    }

    // Get more accurate measurements for the image, not the slide
    const imageRect = slideImage.getBoundingClientRect();

    // Instead of using swiper.el directly, find the swiper-container parent element
    let containerRect;
    const swiperContainer = swiper.el.closest(".swiper-container");
    if (swiperContainer) {
      containerRect = swiperContainer.getBoundingClientRect();
      if (typeof window !== "undefined" && window.log) {
        window.log(
          `FreeMode: Using swiper-container for centering calculations`
        );
      }
    } else {
      // Fallback to swiper.el if swiper-container not found
      containerRect = swiper.el.getBoundingClientRect();
      if (typeof window !== "undefined" && window.log) {
        window.log(
          `FreeMode: Couldn't find swiper-container, using swiper.el instead`
        );
      }
    }

    // Calculate the center position of the viewport
    const viewportCenter = containerRect.left + containerRect.width / 2;

    // Calculate the center position of the image
    const imageCenter = imageRect.left + imageRect.width / 2;

    // Calculate the difference between where the image is and where it should be
    const offset = viewportCenter - imageCenter;

    // Calculate the new translate value by adding the offset to the current translate
    const currentTranslate = swiper.getTranslate();
    let targetTranslate = currentTranslate + offset;

    if (typeof window !== "undefined" && window.log) {
      window.log(
        `FreeMode: Centering calculations (based on image) - 
        Viewport center: ${viewportCenter}, 
        Image center: ${imageCenter}, 
        Offset needed: ${offset}, 
        Current translate: ${currentTranslate}, 
        Target translate: ${targetTranslate}`
      );
    }

    // Apply bounds checking to prevent over-scrolling
    if (targetTranslate > 0) targetTranslate = 0;
    if (targetTranslate < swiper.maxTranslate())
      targetTranslate = swiper.maxTranslate();

    // Pause autoplay if it's running
    if (swiper.autoplay && swiper.autoplay.running) {
      swiper.autoplay.stop();
      if (typeof window !== "undefined" && window.log) {
        window.log(`FreeMode: Pausing autoplay during centering`);
      }
    }

    if (typeof window !== "undefined" && window.log) {
      window.log(
        `FreeMode: Centering image in slide ${slideIndex} with translate: ${targetTranslate}px`
      );
    }

    // Apply the transition with animation
    swiper.setTransition(speed);
    swiper.setTranslate(targetTranslate);

    // Update active slide
    const activeIndex = parseInt(
      targetSlide.getAttribute("data-swiper-slide-index") || "0",
      10
    );
    swiper.activeIndex = activeIndex;

    // Force update of active index and classes
    setTimeout(() => {
      // Make sure we've stopped the autoplay
      if (swiper.autoplay && swiper.autoplay.running) {
        swiper.autoplay.stop();
      }

      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }, 10);

    return true;
  }

  // Store the last tap time and position to detect taps vs swipes
  let lastTapTime = 0;
  let isTap = false;
  let tapTargetSlide = null;
  let tapTargetIsImage = false;

  function onTouchStart() {
    if (swiper.params.cssMode) return;

    // Check if we're on mobile - only track taps on mobile
    const isMobileView = window.innerWidth < 768;
    if (!isMobileView) {
      // Skip tap detection on non-mobile
      return;
    }

    isTap = true;
    tapTargetIsImage = false;
    lastTapTime = now();
    const translate = swiper.getTranslate();
    swiper.setTranslate(translate);
    swiper.setTransition(0);
    swiper.touchEventsData.velocities.length = 0;

    // Get the precise touch coordinates
    const touchX = swiper.touches.currentX;
    const touchY = swiper.touches.currentY;

    if (typeof window !== "undefined" && window.log) {
      window.log(`FreeMode: Touch detected at X:${touchX}, Y:${touchY}`);
    }

    // Detect if this is a tap on a slide or on the background
    if (swiper.params.freeMode.centerOnTap) {
      // Assume this is a background tap initially
      let isBackgroundTap = true;
      tapTargetSlide = null;

      // Create an array to store all possible hits
      const hitCandidates = [];

      // First check if the tap is directly on an image (higher priority)
      for (let i = 0; i < swiper.slides.length; i++) {
        const slide = swiper.slides[i];
        // Skip if no slide
        if (!slide) continue;

        // Get the slide data-index (true index)
        const slideDataIndex = slide.getAttribute("data-index");
        const slideIndex = slideDataIndex ? parseInt(slideDataIndex, 10) : i;

        const slideImage = slide.querySelector(".slide-image");
        if (!slideImage) continue;

        const imageRect = slideImage.getBoundingClientRect();

        // Check if the tap is within this image's bounds
        if (
          touchX >= imageRect.left &&
          touchX <= imageRect.right &&
          touchY >= imageRect.top &&
          touchY <= imageRect.bottom
        ) {
          // Calculate distance from center to determine the most accurately tapped image
          const centerX = imageRect.left + imageRect.width / 2;
          const centerY = imageRect.top + imageRect.height / 2;
          const distanceToCenter = Math.sqrt(
            Math.pow(touchX - centerX, 2) + Math.pow(touchY - centerY, 2)
          );

          hitCandidates.push({
            index: slideIndex,
            slideElement: slide,
            imageElement: slideImage,
            distanceToCenter,
            isImageHit: true,
          });
        }
      }

      // If we found any hits, sort by distance to center and take the closest one
      if (hitCandidates.length > 0) {
        // Sort by distance to center (closest first)
        hitCandidates.sort((a, b) => a.distanceToCenter - b.distanceToCenter);

        // Take the closest hit
        const closestHit = hitCandidates[0];
        tapTargetSlide = closestHit.index;
        tapTargetIsImage = closestHit.isImageHit;
        isBackgroundTap = false;

        if (typeof window !== "undefined" && window.log) {
          window.log(
            `FreeMode: Found ${
              hitCandidates.length
            } possible hits, selected slide ${tapTargetSlide} with distance ${closestHit.distanceToCenter.toFixed(
              2
            )}px`
          );
        }
      } else {
        if (typeof window !== "undefined" && window.log) {
          window.log(
            `FreeMode: No direct image hits found, tap is on background`
          );
        }
      }

      // Store if this is a background tap
      swiper.isBackgroundTap = isBackgroundTap;

      if (typeof window !== "undefined" && window.log) {
        if (isBackgroundTap) {
          window.log(`FreeMode: Detected tap on background (mobile)`);
        } else if (tapTargetIsImage) {
          window.log(
            `FreeMode: Detected tap directly on image in slide ${tapTargetSlide} (mobile)`
          );
        } else {
          window.log(
            `FreeMode: Detected tap on slide container ${tapTargetSlide} (mobile)`
          );
        }
      }
    }

    swiper.freeMode.onTouchEnd({
      currentPos: swiper.rtl ? swiper.translate : -swiper.translate,
    });
  }

  function onTouchMove() {
    if (swiper.params.cssMode) return;

    if (isTap) {
      const moveX = swiper.touches.currentX - swiper.touches.startX;
      const moveY = swiper.touches.currentY - swiper.touches.startY;
      if (Math.abs(moveX) > 10 || Math.abs(moveY) > 10) {
        isTap = false;
        tapTargetSlide = null;
        tapTargetIsImage = false;
        swiper.isBackgroundTap = false;
      }
    }

    const { touchEventsData: data, touches } = swiper;
    // Velocity
    if (data.velocities.length === 0) {
      data.velocities.push({
        position: touches[swiper.isHorizontal() ? "startX" : "startY"],
        time: data.touchStartTime,
      });
    }
    data.velocities.push({
      position: touches[swiper.isHorizontal() ? "currentX" : "currentY"],
      time: now(),
    });
  }

  function onTouchEnd({ currentPos }) {
    if (swiper.params.cssMode) return;

    // Check if we're on mobile - only handle taps on mobile
    const isMobileView = window.innerWidth < 768;
    if (!isMobileView) {
      // Skip tap handling on non-mobile
      isTap = false;
      tapTargetSlide = null;
      tapTargetIsImage = false;
      swiper.isBackgroundTap = false;

      // Process as normal swipe/interaction
      const {
        params,
        wrapperEl,
        rtlTranslate: rtl,
        snapGrid,
        touchEventsData: data,
      } = swiper;

      const touchEndTime = now();
      const timeDiff = touchEndTime - data.touchStartTime;

      // Continue with regular processing...
      return;
    }

    const touchEndTime = now();
    const timeDiff = touchEndTime - lastTapTime;

    // Handle tap behaviors - for short touches with minimal movement
    if (isTap && timeDiff < 300 && swiper.params.freeMode.centerOnTap) {
      // Make sure autoplay is paused
      if (swiper.autoplay && swiper.autoplay.running) {
        swiper.autoplay.stop();
        if (typeof window !== "undefined" && window.log) {
          window.log(`FreeMode: Pausing autoplay on tap`);
        }
      }

      if (swiper.isBackgroundTap) {
        // This was a tap on the background
        if (typeof window !== "undefined" && window.log) {
          window.log(
            `FreeMode: Background tap detected, deactivating current slide`
          );
        }

        // Trigger a custom event that SwiperDemo can listen for
        if (typeof window !== "undefined" && window.dispatchEvent) {
          const event = new CustomEvent("swiperBackgroundTap");
          window.dispatchEvent(event);
        }

        isTap = false;
        swiper.isBackgroundTap = false;
        return;
      } else if (tapTargetSlide !== null) {
        // If the tap was on an image, center that image
        // If not on an image but on a slide, still center but log differently
        if (typeof window !== "undefined" && window.log) {
          if (tapTargetIsImage) {
            window.log(
              `FreeMode: Detected tap on image in slide ${tapTargetSlide} (mobile)`
            );
          } else {
            window.log(
              `FreeMode: Detected tap on slide container ${tapTargetSlide} (mobile)`
            );
          }
        }

        // Center the tapped slide's image
        if (centerSlideInViewport(tapTargetSlide, swiper.params.speed)) {
          // If we've handled the centering, skip the rest of the momentum logic
          isTap = false;
          tapTargetSlide = null;
          tapTargetIsImage = false;
          return;
        }
      }
    }

    // Standard FreeMode behavior for non-tap interactions
    const {
      params,
      wrapperEl,
      rtlTranslate: rtl,
      snapGrid,
      touchEventsData: data,
    } = swiper;

    // Reset tap state
    isTap = false;
    tapTargetSlide = null;
    tapTargetIsImage = false;
    swiper.isBackgroundTap = false;

    // Time diff
    const timeDiff2 = touchEndTime - data.touchStartTime;

    if (currentPos < -swiper.minTranslate()) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    if (currentPos > -swiper.maxTranslate()) {
      if (swiper.slides.length < snapGrid.length) {
        swiper.slideTo(snapGrid.length - 1);
      } else {
        swiper.slideTo(swiper.slides.length - 1);
      }
      return;
    }

    if (params.freeMode.momentum) {
      if (data.velocities.length > 1) {
        const lastMoveEvent = data.velocities.pop();
        const velocityEvent = data.velocities.pop();

        const distance = lastMoveEvent.position - velocityEvent.position;
        const time = lastMoveEvent.time - velocityEvent.time;
        swiper.velocity = distance / time;
        swiper.velocity /= 2;
        if (Math.abs(swiper.velocity) < params.freeMode.minimumVelocity) {
          swiper.velocity = 0;
        }
        // this implies that the user stopped moving a finger then released.
        // There would be no events with distance zero, so the last event is stale.
        if (time > 150 || now() - lastMoveEvent.time > 300) {
          swiper.velocity = 0;
        }
      } else {
        swiper.velocity = 0;
      }
      swiper.velocity *= params.freeMode.momentumVelocityRatio;

      data.velocities.length = 0;
      let momentumDuration = 1000 * params.freeMode.momentumRatio;
      const momentumDistance = swiper.velocity * momentumDuration;

      let newPosition = swiper.translate + momentumDistance;
      if (rtl) newPosition = -newPosition;

      let doBounce = false;
      let afterBouncePosition;
      const bounceAmount =
        Math.abs(swiper.velocity) * 20 * params.freeMode.momentumBounceRatio;
      let needsLoopFix;
      if (newPosition < swiper.maxTranslate()) {
        if (params.freeMode.momentumBounce) {
          if (newPosition + swiper.maxTranslate() < -bounceAmount) {
            newPosition = swiper.maxTranslate() - bounceAmount;
          }
          afterBouncePosition = swiper.maxTranslate();
          doBounce = true;
          data.allowMomentumBounce = true;
        } else {
          newPosition = swiper.maxTranslate();
        }
        if (params.loop && params.centeredSlides) needsLoopFix = true;
      } else if (newPosition > swiper.minTranslate()) {
        if (params.freeMode.momentumBounce) {
          if (newPosition - swiper.minTranslate() > bounceAmount) {
            newPosition = swiper.minTranslate() + bounceAmount;
          }
          afterBouncePosition = swiper.minTranslate();
          doBounce = true;
          data.allowMomentumBounce = true;
        } else {
          newPosition = swiper.minTranslate();
        }
        if (params.loop && params.centeredSlides) needsLoopFix = true;
      } else if (params.freeMode.sticky) {
        let nextSlide;
        for (let j = 0; j < snapGrid.length; j += 1) {
          if (snapGrid[j] > -newPosition) {
            nextSlide = j;
            break;
          }
        }

        if (
          Math.abs(snapGrid[nextSlide] - newPosition) <
            Math.abs(snapGrid[nextSlide - 1] - newPosition) ||
          swiper.swipeDirection === "next"
        ) {
          newPosition = snapGrid[nextSlide];
        } else {
          newPosition = snapGrid[nextSlide - 1];
        }
        newPosition = -newPosition;
      }
      if (needsLoopFix) {
        once("transitionEnd", () => {
          swiper.loopFix();
        });
      }
      // Fix duration
      if (swiper.velocity !== 0) {
        if (rtl) {
          momentumDuration = Math.abs(
            (-newPosition - swiper.translate) / swiper.velocity
          );
        } else {
          momentumDuration = Math.abs(
            (newPosition - swiper.translate) / swiper.velocity
          );
        }
        if (params.freeMode.sticky) {
          // If freeMode.sticky is active and the user ends a swipe with a slow-velocity
          // event, then durations can be 20+ seconds to slide one (or zero!) slides.
          // It's easy to see this when simulating touch with mouse events. To fix this,
          // limit single-slide swipes to the default slide duration. This also has the
          // nice side effect of matching slide speed if the user stopped moving before
          // lifting finger or mouse vs. moving slowly before lifting the finger/mouse.
          // For faster swipes, also apply limits (albeit higher ones).
          const moveDistance = Math.abs(
            (rtl ? -newPosition : newPosition) - swiper.translate
          );
          const currentSlideSize = swiper.slidesSizesGrid[swiper.activeIndex];
          if (moveDistance < currentSlideSize) {
            momentumDuration = params.speed;
          } else if (moveDistance < 2 * currentSlideSize) {
            momentumDuration = params.speed * 1.5;
          } else {
            momentumDuration = params.speed * 2.5;
          }
        }
      } else if (params.freeMode.sticky) {
        swiper.slideToClosest();
        return;
      }

      if (params.freeMode.momentumBounce && doBounce) {
        swiper.updateProgress(afterBouncePosition);
        swiper.setTransition(momentumDuration);
        swiper.setTranslate(newPosition);
        swiper.transitionStart(true, swiper.swipeDirection);
        swiper.animating = true;
        elementTransitionEnd(wrapperEl, () => {
          if (!swiper || swiper.destroyed || !data.allowMomentumBounce) return;
          emit("momentumBounce");
          swiper.setTransition(params.speed);
          setTimeout(() => {
            swiper.setTranslate(afterBouncePosition);
            elementTransitionEnd(wrapperEl, () => {
              if (!swiper || swiper.destroyed) return;
              swiper.transitionEnd();
            });
          }, 0);
        });
      } else if (swiper.velocity) {
        emit("_freeModeNoMomentumRelease");
        swiper.updateProgress(newPosition);
        swiper.setTransition(momentumDuration);
        swiper.setTranslate(newPosition);
        swiper.transitionStart(true, swiper.swipeDirection);
        if (!swiper.animating) {
          swiper.animating = true;
          elementTransitionEnd(wrapperEl, () => {
            if (!swiper || swiper.destroyed) return;
            swiper.transitionEnd();
          });
        }
      } else {
        swiper.updateProgress(newPosition);
      }

      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    } else if (params.freeMode.sticky) {
      swiper.slideToClosest();
      return;
    } else if (params.freeMode) {
      emit("_freeModeNoMomentumRelease");
    }

    if (!params.freeMode.momentum || timeDiff >= params.longSwipesMs) {
      emit("_freeModeStaticRelease");
      swiper.updateProgress();
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
  }

  Object.assign(swiper, {
    freeMode: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  });
}
