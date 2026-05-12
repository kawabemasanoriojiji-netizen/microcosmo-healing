(function () {
  "use strict";

  // Replace this with your Google Analytics 4 Measurement ID.
  // Example: G-ABCD123456
  var GA_MEASUREMENT_ID = "G-CS7Y04NBCW";
  var ENABLE_LOCAL_PREVIEW = false;

  var isPlaceholder =
    !GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX";
  var isLocalPreview =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.protocol === "file:";
  var doNotTrack =
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1" ||
    navigator.msDoNotTrack === "1";

  if (isPlaceholder || doNotTrack || (isLocalPreview && !ENABLE_LOCAL_PREVIEW)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true
  });

  var gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src =
    "https://www.googletagmanager.com/gtag/js?id=" +
    encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(gtagScript);

  function getLinkKind(url) {
    if (url.hostname === "lin.ee") return "line";
    if (url.hostname.indexOf("instagram.com") !== -1) return "instagram";
    if (url.hostname.indexOf("threads.com") !== -1) return "threads";
    if (url.hostname.indexOf("blogspot.com") !== -1) return "blog";
    return "external";
  }

  function trackExternalLinkClick(event) {
    var link = event.currentTarget;
    var url = new URL(link.href, location.href);
    var linkKind = getLinkKind(url);
    var eventName = linkKind === "line" ? "contact_click" : "external_link_click";

    window.gtag("event", eventName, {
      link_kind: linkKind,
      link_url: url.href,
      link_text: link.textContent.trim() || link.getAttribute("aria-label") || "",
      page_title: document.title,
      transport_type: "beacon"
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var links = document.querySelectorAll('a[href^="http"]');

    links.forEach(function (link) {
      var url = new URL(link.href, location.href);

      if (url.hostname !== location.hostname) {
        link.addEventListener("click", trackExternalLinkClick);
      }
    });
  });
})();
