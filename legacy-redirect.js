(function () {
  "use strict";

  var config = window.REPORT_CONFIG || {};
  var targetBase = String(config.raspberryPiBaseUrl || "").replace(/\/+$/, "");
  var legacyHosts = config.legacyRedirectHosts || [];
  var currentHost = window.location.hostname;
  var shouldRedirect = false;
  var index;

  for (index = 0; index < legacyHosts.length; index += 1) {
    if (currentHost === legacyHosts[index]) {
      shouldRedirect = true;
      break;
    }
  }

  if (!shouldRedirect || !targetBase) {
    return;
  }

  window.location.replace(targetBase + "/" + window.location.search + window.location.hash);
})();
