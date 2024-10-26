const header = ($, $body) => {
  const $header = $body.find('header.header');
  if (!$header.length) return;

  const TOUCH_DEVICE_CLASS = 'touch-device';
  let SUPPORTS_TOUCH = $body.hasClass(TOUCH_DEVICE_CLASS);
  const ACTIVE_CLASS = 'active';
  const $submenuBtn = $header.find('.submenu-btn');
  const $toggleMenuBtn = $header.find('.toggle-menu-btn');

  // Check for touch-device
  function touchDeviceCheck() { SUPPORTS_TOUCH = $body.hasClass(TOUCH_DEVICE_CLASS); }

  // Function for header reset
  function headerReset() {
    $header.removeClass(ACTIVE_CLASS);
    $submenuBtn.removeClass(ACTIVE_CLASS);
    $toggleMenuBtn.removeClass(ACTIVE_CLASS);
  }

  // Toggle burger menu
  $toggleMenuBtn.on('click', (e) => {
    e.preventDefault();
    $header.toggleClass(ACTIVE_CLASS);
    $toggleMenuBtn.removeClass(ACTIVE_CLASS);
  });

  // Toggling submenu on touch devices
  $submenuBtn.on('click', function toggle(e) {
    e.preventDefault();
    if (!SUPPORTS_TOUCH) return;
    $submenuBtn.not($(this)).removeClass(ACTIVE_CLASS);
    $(this).toggleClass(ACTIVE_CLASS);
  });

  // Close submenu on outer click, close btn or ESC (for touch devices with desktop menu view)
  $(document).on('click', (e) => {
    if (!$(e.target).closest($header).length || $(e.target).closest($toggleMenuBtn).length) {
      headerReset();
    }
  });
  $(document).on('keydown', (e) => {
    if (e.which === 27) {
      headerReset();
    }
  });

  // Check on resize or orientationchange screen width & touch device
  $(window).on('resize orientationchange', () => {
    touchDeviceCheck();
  });

  // Reset header states on orientationchange
  $(window).on('load, orientationchange', () => {
    headerReset();
  });
};

export default header;
