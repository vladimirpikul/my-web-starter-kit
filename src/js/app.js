import jQuery from 'jquery';
import touchSupportCheck from './modules/touch-support-check';
import header from './modules/header';

jQuery.noConflict();

// When DOM is ready
(($) => {
  const $body = $('body');
  $(() => {
    touchSupportCheck($, $body);
    header($, $body);
  });
})(jQuery);
