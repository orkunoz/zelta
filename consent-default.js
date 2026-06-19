(function () {
  var storageKey = "zelta-cookie-consent";
  var maxAge = 1000 * 60 * 60 * 24 * 183;
  var analyticsGranted = false;

  try {
    var saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (saved && saved.savedAt && Date.now() - new Date(saved.savedAt).getTime() < maxAge) {
      analyticsGranted = saved.analytics === true;
    }
  } catch (error) {
    analyticsGranted = false;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    analytics_storage: analyticsGranted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });
}());
