# Visual Testing Guide for Swiper Component

This guide provides manual testing steps to verify the Swiper component's visual behavior across different devices and interactions.

## Test Requirements

### Desktop (>768px)

1. **Continuous Autoplay**
   - [ ] Without interaction, slides should continuously scroll horizontally
   - [ ] Autoplay should loop infinitely without stopping
   - [ ] Movement should be smooth and consistent

2. **Container Mouse Enter/Leave**
   - [ ] When mouse enters the swiper container, autoplay should pause
   - [ ] A small indicator dot should appear in the top-right corner
   - [ ] When mouse leaves the container, autoplay should resume after ~1 second

3. **Slide Hover Effects**
   - [ ] Hovering over a slide should scale it up to 1.0 scale
   - [ ] The hovered slide should cast a shadow and have higher opacity
   - [ ] Adjacent slides should be pushed away horizontally (~60px)
   - [ ] There should be a clear gap between the hovered slide and adjacent slides

4. **Slide Overlap**
   - [ ] At rest (no hover), slides 1, 2, and 3 should slightly overlap each other
   - [ ] This overlap should be visible at all desktop breakpoints (768px, 1024px, 1440px)

5. **Dragging Behavior**
   - [ ] Dragging should temporarily disable all hover effects
   - [ ] After releasing drag, the component should return to normal behavior
   - [ ] Autoplay should resume after drag ends (if mouse not over container)

### Mobile (<768px)

1. **Tap Behavior**
   - [ ] Tapping a slide should center it in the viewport
   - [ ] The tapped slide should scale up to 1.0
   - [ ] Adjacent slides should be pushed away
   - [ ] The tapped slide should cast a shadow and appear elevated
   - [ ] Autoplay should pause when a slide is tapped

2. **Tap Toggle**
   - [ ] Tapping an already-active slide should deactivate it
   - [ ] Autoplay should resume after the active slide is deactivated
   - [ ] Transitions should be smooth without jumps

3. **Swipe/Drag**
   - [ ] Swiping horizontally should work smoothly
   - [ ] Active slide state should be cleared during dragging
   - [ ] Autoplay should resume after dragging ends
   - [ ] No visual glitches should occur during the transition

## Responsive Breakpoints

Test at each of these breakpoints to verify responsive behavior:

- Mobile: 428px
- Tablet: 768px
- Desktop: 1024px
- Large Desktop: 1440px

## Visual Verification Steps

To thoroughly test the component:

1. Open the application and observe the autoplay behavior for at least 20 seconds
2. Hover over different slides and verify the hover effects
3. Move the mouse in and out of the container to verify autoplay pausing/resuming
4. Try dragging the slides and verify behavior before, during, and after
5. Switch to mobile view (or use a real mobile device) and test tap behavior
6. Verify that the active slide is properly centered on mobile
7. Test at all responsive breakpoints to ensure layout adapts properly

## Debug Mode

The component includes a debug mode that logs key events to the console:

1. Open browser developer tools and view the console
2. Look for `[Swiper]` prefixed log messages
3. Interact with the component and observe the logs to verify expected behavior

## Common Issues to Watch For

- Autoplay not resuming after interactions
- Slides not centering properly on mobile tap
- Visual glitches during transitions
- Incorrect scaling of active slides
- Missing push-away effect for adjacent slides
- Overlap issues at different breakpoints 