// gestures.js

const LensCraftGestures = (() => {
  const SWIPE_THRESHOLD_PX = 50; 
  const VERTICAL_TOLERANCE_PX = 75; 

  /**
 
   *
   * @param {HTMLElement} el
   * @param {{onSwipeLeft?: Function, onSwipeRight?: Function, onSwipeDown?: Function}} handlers
   * @returns {() => void} 
   */
  function attachSwipe(el, handlers = {}) {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    function onTouchStart(e) {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    }

    function onTouchEnd(e) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const elapsed = Date.now() - startTime;

      if (elapsed > 600) return;

      const isMostlyVertical = Math.abs(deltaY) > Math.abs(deltaX);

      if (isMostlyVertical) {
        if (deltaY > SWIPE_THRESHOLD_PX && handlers.onSwipeDown) {
          handlers.onSwipeDown();
        }
        return;
      }

      if (Math.abs(deltaY) > VERTICAL_TOLERANCE_PX) return; 

      if (deltaX <= -SWIPE_THRESHOLD_PX && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      } else if (deltaX >= SWIPE_THRESHOLD_PX && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return function cleanup() {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }

  /**
* @param {HTMLElement} el
   * @param {(scale: number) => void} onPinch
   * @returns {() => void} cleanup function
   */
  function attachPinchZoom(el, onPinch) {
    let initialDistance = null;

    function getDistance(touches) {
      const [a, b] = touches;
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.hypot(dx, dy);
    }

    function onTouchStart(e) {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
      }
    }

    function onTouchMove(e) {
      if (e.touches.length === 2 && initialDistance) {
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance;
        onPinch(scale);
      }
    }

    function onTouchEnd(e) {
      if (e.touches.length < 2) {
        initialDistance = null;
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return function cleanup() {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }

  return { attachSwipe, attachPinchZoom };
})();
