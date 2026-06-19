(function () {
  var storageKey = "zelta-cookie-consent";
  var maxAge = 1000 * 60 * 60 * 24 * 183;
  var version = 1;

  var messages = {
    en: {
      eyebrow: "Privacy choices",
      title: "Cookie preferences",
      body: "We use analytics cookies to understand how visitors use this website and improve our services.",
      accept: "Accept",
      reject: "Reject non-essential",
      preferences: "Preferences",
      modalTitle: "Manage cookie preferences",
      modalBody: "Essential cookies are always active because the website needs them to work. Analytics is optional and helps us improve the site.",
      analyticsTitle: "Analytics cookies",
      analyticsCopy: "Allow Google Analytics through Google Tag Manager to measure visits and page performance.",
      save: "Save preferences",
      settings: "Cookie settings"
    },
    pl: {
      eyebrow: "Wybór prywatności",
      title: "Ustawienia cookies",
      body: "Używamy cookies analitycznych, aby rozumieć sposób korzystania ze strony i ulepszać nasze usługi.",
      accept: "Akceptuj",
      reject: "Odrzuć niezbędne",
      preferences: "Preferencje",
      modalTitle: "Zarządzaj ustawieniami cookies",
      modalBody: "Niezbędne cookies są zawsze aktywne, ponieważ strona potrzebuje ich do działania. Analityka jest opcjonalna i pomaga nam ulepszać stronę.",
      analyticsTitle: "Cookies analityczne",
      analyticsCopy: "Zezwól Google Analytics przez Google Tag Manager na pomiar wizyt i działania strony.",
      save: "Zapisz preferencje",
      settings: "Ustawienia cookies"
    },
    tr: {
      eyebrow: "Gizlilik tercihleri",
      title: "Cookie ayarları",
      body: "Ziyaretçilerin siteyi nasıl kullandığını anlamak ve hizmetlerimizi geliştirmek için analitik cookie kullanıyoruz.",
      accept: "Kabul et",
      reject: "Zorunlu olmayanları reddet",
      preferences: "Tercihler",
      modalTitle: "Cookie tercihlerini yönet",
      modalBody: "Zorunlu cookie'ler web sitesinin çalışması için her zaman aktiftir. Analitik isteğe bağlıdır ve siteyi geliştirmemize yardımcı olur.",
      analyticsTitle: "Analitik cookie'ler",
      analyticsCopy: "Google Tag Manager üzerinden Google Analytics'in ziyaretleri ve sayfa performansını ölçmesine izin ver.",
      save: "Tercihleri kaydet",
      settings: "Cookie ayarları"
    }
  };

  var banner;
  var modal;
  var analyticsCheckbox;

  function getLanguage() {
    var savedLanguage = "";
    try {
      savedLanguage = localStorage.getItem("zelta-language") || localStorage.getItem("barber-language") || localStorage.getItem("restaurant-language") || "";
    } catch (error) {
      savedLanguage = "";
    }

    var htmlLanguage = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
    var language = (savedLanguage || htmlLanguage || "en").slice(0, 2).toLowerCase();
    return messages[language] ? language : "en";
  }

  function text() {
    return messages[getLanguage()];
  }

  function getSavedConsent() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!saved || !saved.savedAt || Date.now() - new Date(saved.savedAt).getTime() >= maxAge) {
        return null;
      }

      return saved;
    } catch (error) {
      return null;
    }
  }

  function saveConsent(analytics) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        version: version,
        analytics: analytics === true,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      return;
    }
  }

  function pushConsentUpdate(analytics) {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }

    window.gtag("consent", "update", {
      analytics_storage: analytics ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function deleteCookie(name, domain) {
    document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax" + (domain ? "; domain=" + domain : "");
  }

  function deleteAnalyticsCookies() {
    var hostname = window.location.hostname;
    var domains = ["", hostname];
    if (hostname && hostname.indexOf(".") !== -1) {
      domains.push("." + hostname);
    }

    document.cookie.split(";").forEach(function (cookie) {
      var name = cookie.split("=")[0].trim();
      if (name === "_ga" || name.indexOf("_ga_") === 0 || name === "_gid" || name === "_gat") {
        domains.forEach(function (domain) {
          deleteCookie(name, domain);
        });
      }
    });
  }

  function hideBanner() {
    if (banner) {
      banner.hidden = true;
    }
  }

  function closeModal() {
    if (modal) {
      modal.hidden = true;
    }
  }

  function acceptAnalytics() {
    saveConsent(true);
    pushConsentUpdate(true);
    hideBanner();
    closeModal();
  }

  function rejectAnalytics() {
    saveConsent(false);
    pushConsentUpdate(false);
    deleteAnalyticsCookies();
    hideBanner();
    closeModal();
  }

  function savePreferences() {
    if (analyticsCheckbox && analyticsCheckbox.checked) {
      acceptAnalytics();
      return;
    }

    rejectAnalytics();
  }

  function setButton(button, copy, modifier) {
    button.type = "button";
    button.className = "cookie-button" + (modifier ? " " + modifier : "");
    button.textContent = copy;
    return button;
  }

  function updateFooterLinks() {
    document.querySelectorAll("[data-cookie-settings]").forEach(function (button) {
      button.textContent = text().settings;
    });
  }

  function updateBannerText() {
    if (!banner || !modal) {
      return;
    }

    var copy = text();
    banner.querySelector("[data-cookie-eyebrow]").textContent = copy.eyebrow;
    banner.querySelector("[data-cookie-title]").textContent = copy.title;
    banner.querySelector("[data-cookie-body]").textContent = copy.body;
    banner.querySelector("[data-cookie-accept]").textContent = copy.accept;
    banner.querySelector("[data-cookie-reject]").textContent = copy.reject;
    modal.querySelector("[data-cookie-modal-eyebrow]").textContent = copy.eyebrow;
    modal.querySelector("[data-cookie-modal-title]").textContent = copy.modalTitle;
    modal.querySelector("[data-cookie-modal-body]").textContent = copy.modalBody;
    modal.querySelector("[data-cookie-analytics-title]").textContent = copy.analyticsTitle;
    modal.querySelector("[data-cookie-analytics-copy]").textContent = copy.analyticsCopy;
    modal.querySelector("[data-cookie-save]").textContent = copy.save;
    modal.querySelector("[data-cookie-modal-reject]").textContent = copy.reject;
    updateFooterLinks();
  }

  function openPreferences() {
    var saved = getSavedConsent();
    if (analyticsCheckbox) {
      analyticsCheckbox.checked = saved ? saved.analytics === true : false;
    }

    updateBannerText();
    modal.hidden = false;
    analyticsCheckbox.focus();
  }

  function buildBanner() {
    var copy = text();
    banner = document.createElement("section");
    banner.className = "cookie-consent";
    banner.setAttribute("aria-label", copy.title);
    banner.hidden = true;

    var content = document.createElement("div");
    var eyebrow = document.createElement("p");
    eyebrow.className = "cookie-consent__eyebrow";
    eyebrow.setAttribute("data-cookie-eyebrow", "");
    var title = document.createElement("h2");
    title.setAttribute("data-cookie-title", "");
    var body = document.createElement("p");
    body.setAttribute("data-cookie-body", "");
    content.append(eyebrow, title, body);

    var actions = document.createElement("div");
    actions.className = "cookie-consent__actions";

    var acceptButton = setButton(document.createElement("button"), copy.accept, "cookie-button--primary");
    acceptButton.setAttribute("data-cookie-accept", "");
    acceptButton.addEventListener("click", acceptAnalytics);

    var rejectButton = setButton(document.createElement("button"), copy.reject, "cookie-button--ghost");
    rejectButton.setAttribute("data-cookie-reject", "");
    rejectButton.addEventListener("click", rejectAnalytics);

    actions.append(acceptButton, rejectButton);
    banner.append(content, actions);
    document.body.appendChild(banner);
  }

  function buildModal() {
    var copy = text();
    modal = document.createElement("div");
    modal.className = "cookie-modal-backdrop";
    modal.hidden = true;

    var dialog = document.createElement("section");
    dialog.className = "cookie-modal";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "cookie-modal-title");

    var eyebrow = document.createElement("p");
    eyebrow.className = "cookie-modal__eyebrow";
    eyebrow.setAttribute("data-cookie-modal-eyebrow", "");

    var title = document.createElement("h2");
    title.id = "cookie-modal-title";
    title.setAttribute("data-cookie-modal-title", "");

    var body = document.createElement("p");
    body.setAttribute("data-cookie-modal-body", "");

    var label = document.createElement("label");
    label.className = "cookie-toggle";

    analyticsCheckbox = document.createElement("input");
    analyticsCheckbox.type = "checkbox";

    var labelText = document.createElement("span");
    var labelTitle = document.createElement("strong");
    labelTitle.setAttribute("data-cookie-analytics-title", "");
    var labelCopy = document.createElement("span");
    labelCopy.setAttribute("data-cookie-analytics-copy", "");
    labelText.append(labelTitle, labelCopy);
    label.append(analyticsCheckbox, labelText);

    var actions = document.createElement("div");
    actions.className = "cookie-modal__actions";

    var saveButton = setButton(document.createElement("button"), copy.save, "cookie-button--primary");
    saveButton.setAttribute("data-cookie-save", "");
    saveButton.addEventListener("click", savePreferences);

    var rejectButton = setButton(document.createElement("button"), copy.reject, "cookie-button--ghost");
    rejectButton.setAttribute("data-cookie-modal-reject", "");
    rejectButton.addEventListener("click", rejectAnalytics);

    actions.append(saveButton, rejectButton);
    dialog.append(eyebrow, title, body, label, actions);
    modal.appendChild(dialog);
    document.body.appendChild(modal);
  }

  function bindSettingsLinks() {
    document.querySelectorAll("[data-cookie-settings]").forEach(function (button) {
      button.addEventListener("click", openPreferences);
    });
  }

  function bindLanguageRefresh() {
    document.querySelectorAll(".lang-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        window.setTimeout(updateBannerText, 0);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildBanner();
    buildModal();
    updateBannerText();
    bindSettingsLinks();
    bindLanguageRefresh();

    if (!getSavedConsent()) {
      banner.hidden = false;
    }
  });
}());
