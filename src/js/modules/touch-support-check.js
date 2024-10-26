const touchSupportCheck = ($, $body) => {
  let supportsTouch;
  const TOUCH_DEVICE_CLASS = 'touch-device';
  // let tabletView;
  // const TABLET_VIEW_WIDTH = 1200;
  // const TABLET_VIEW_CLASS = 'tablet-view';

  function touchDeviceCheck() {
    supportsTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
      || (navigator.msMaxTouchPoints > 0);
    if (supportsTouch) $body.addClass(TOUCH_DEVICE_CLASS);
    else $body.removeClass(TOUCH_DEVICE_CLASS);
  }

  // function breakpointCheck() {
  //     tabletView = window.innerWidth < TABLET_VIEW_WIDTH;
  //     if (tabletView) $body.addClass(TABLET_VIEW_CLASS);
  //     else $body.removeClass(TABLET_VIEW_CLASS);
  //   }

  touchDeviceCheck();
  // breakpointCheck();

  $(window).on('resize orientationchange', () => {
    touchDeviceCheck();
    // breakpointCheck();
  });
};

export default touchSupportCheck;
