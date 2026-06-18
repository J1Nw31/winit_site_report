(function () {
  "use strict";

  var form = document.getElementById("report-form");
  var siteInput = document.getElementById("site");
  var siteLock = document.getElementById("site-lock");
  var descriptionEnabled = document.getElementById("description-enabled");
  var problemSection = document.getElementById("problem-section");
  var problemInput = document.getElementById("problem");
  var characterCount = document.getElementById("character-count");
  var submitButton = document.getElementById("submit-button");
  var buttonText = document.getElementById("button-text");
  var status = document.getElementById("status");

  var text = {
    title: "\u7ad9\u70b9\u62a5\u4fee",
    invalidSite: "\u8bf7\u8f93\u5165\u6709\u6548\u7ad9\u70b9\u53f7\uff0c\u4f8b\u5982 LS01\u3002",
    genericFailure: "\u53d1\u9001\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
    success: "\u62a5\u4fee\u4fe1\u606f\u5df2\u53d1\u9001\uff0c\u7ef4\u4fdd\u4eba\u5458\u5df2\u6536\u5230\u901a\u77e5\u3002",
    networkFailure: "\u53d1\u9001\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u540e\u91cd\u8bd5\u3002",
    sending: "\u6b63\u5728\u53d1\u9001...",
    send: "\u53d1\u9001\u62a5\u4fee",
    cooldownSuffix: " \u79d2\u540e\u53ef\u518d\u6b21\u53d1\u9001",
    noService: "\u7f51\u7ad9\u5c1a\u672a\u914d\u7f6e\u901a\u77e5\u670d\u52a1\u3002",
    reportTitle: "\u7ad9\u70b9\u62a5\u4fee",
    siteLabel: "\u7ad9\u70b9",
    problemLabel: "\u95ee\u9898",
    noProblem: "\u672a\u586b\u5199\uff0c\u73b0\u573a\u8bf7\u6c42\u7ef4\u4fdd"
  };

  var sitePattern = /^[A-Z]{2,6}\d{2,4}$/;
  var querySite = detectSiteCode();
  var cooldownRemaining = 0;
  var cooldownTimer = null;
  var sending = false;

  if (querySite) {
    querySite = querySite.replace(/^\s+|\s+$/g, "").toUpperCase();
  }

  if (querySite && sitePattern.test(querySite)) {
    siteInput.value = querySite;
    siteInput.readOnly = true;
    siteLock.style.display = "inline";
    document.title = querySite + " - WINIT " + text.title;
  }

  addEvent(problemInput, "input", function () {
    characterCount.innerHTML = problemInput.value.length + " / 500";
  });

  addEvent(descriptionEnabled, "change", toggleProblemSection);
  addEvent(descriptionEnabled, "click", function () {
    window.setTimeout(toggleProblemSection, 0);
  });

  addEvent(siteInput, "input", function () {
    siteInput.value = siteInput.value.toUpperCase().replace(/\s+/g, "");
  });

  addEvent(form, "submit", submitReport);
  addEvent(submitButton, "click", function (event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    submitReport(event);
    return false;
  });

  function toggleProblemSection() {
    if (descriptionEnabled.checked) {
      problemSection.style.display = "block";
      problemSection.removeAttribute("hidden");
      problemInput.focus();
    } else {
      problemSection.style.display = "none";
      problemSection.setAttribute("hidden", "hidden");
      problemInput.value = "";
      characterCount.innerHTML = "0 / 500";
    }
  }

  function submitReport(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    if (sending || cooldownRemaining > 0) {
      return false;
    }

    var site = siteInput.value.replace(/^\s+|\s+$/g, "").toUpperCase();
    var problem = problemInput.value.replace(/^\s+|\s+$/g, "");

    if (!sitePattern.test(site)) {
      showStatus(text.invalidSite, "error");
      siteInput.focus();
      return false;
    }

    setSending(true);
    sendReport(site, problem, function (error) {
      if (error) {
        setSending(false);
        showStatus(error, "error");
        return;
      }

      problemInput.value = "";
      characterCount.innerHTML = "0 / 500";
      showStatus(text.success, "success");
      startCooldown(20);
    });

    return false;
  }

  function sendReport(site, problem, callback) {
    var config = window.REPORT_CONFIG || {};
    var server = String(
      config.pushServer ||
        config.ntfyServer ||
        "https://hik2.tail6f1a46.ts.net"
    )
      .replace(/\/+$/, "");
    var password = String(config.pushPassword || config.ntfyPassword || "");

    var issue = problem || text.noProblem;
    var payload = {
      password: password,
      title: site,
      message_base64: base64EncodeUtf8(issue)
    };

    if (config.mode === "server") {
      sendViaSiteApi(site, problem, callback);
      return;
    }

    publishToPushCenter(server, payload, callback);
  }

  function publishToPushCenter(server, payload, callback) {
    var request = createRequest();
    if (!request) {
      callback(text.networkFailure);
      return;
    }

    request.onreadystatechange = function () {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status >= 200 && request.status < 300) {
        callback(null);
      } else {
        callback(text.genericFailure);
      }
    };
    request.onerror = function () {
      callback(text.networkFailure);
    };

    try {
      request.open("POST", server + "/api/external/report", true);
      request.setRequestHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );
      request.send(JSON.stringify(payload));
    } catch (error) {
      callback(text.networkFailure);
    }
  }

  function sendViaSiteApi(site, problem, callback) {
    var request = createRequest();
    if (!request) {
      callback(text.networkFailure);
      return;
    }

    request.onreadystatechange = function () {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status >= 200 && request.status < 300) {
        callback(null);
      } else {
        callback(text.genericFailure);
      }
    };
    request.onerror = function () {
      callback(text.networkFailure);
    };

    try {
      request.open("POST", "/api/report", true);
      request.setRequestHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );
      request.send(JSON.stringify({ site: site, problem: problem }));
    } catch (error) {
      callback(text.networkFailure);
    }
  }

  function base64EncodeUtf8(value) {
    return window.btoa(unescape(encodeURIComponent(value)));
  }

  function createRequest() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    }
    try {
      return new ActiveXObject("Microsoft.XMLHTTP");
    } catch (error) {
      return null;
    }
  }

  function setSending(value) {
    sending = value;
    submitButton.disabled = value;
    buttonText.innerHTML = value ? text.sending : text.send;
  }

  function showStatus(message, type) {
    status.innerHTML = message;
    status.className = "status " + (type || "");
  }

  function startCooldown(seconds) {
    window.clearInterval(cooldownTimer);
    sending = false;
    cooldownRemaining = seconds;
    submitButton.disabled = true;
    updateCooldownText();

    cooldownTimer = window.setInterval(function () {
      cooldownRemaining -= 1;
      if (cooldownRemaining <= 0) {
        window.clearInterval(cooldownTimer);
        submitButton.disabled = false;
        buttonText.innerHTML = text.send;
        return;
      }
      updateCooldownText();
    }, 1000);
  }

  function updateCooldownText() {
    buttonText.innerHTML =
      cooldownRemaining + text.cooldownSuffix;
  }

  function getQueryParameter(name) {
    var query = window.location.search.substring(1).split("&");
    var index;
    for (index = 0; index < query.length; index += 1) {
      var pair = query[index].split("=");
      if (decodeURIComponent(pair[0] || "") === name) {
        return decodeURIComponent((pair[1] || "").replace(/\+/g, " "));
      }
    }
    return "";
  }

  function detectSiteCode() {
    var site = getQueryParameter("site");
    var match;

    if (site) {
      return site;
    }

    if (window.location.hash) {
      match = window.location.hash.toUpperCase().match(/[A-Z]{2,6}\d{2,4}/);
      if (match) {
        return match[0];
      }
    }

    match = window.location.pathname.toUpperCase().match(
      /\/([A-Z]{2,6}\d{2,4})\/?$/
    );
    return match ? match[1] : "";
  }

  function addEvent(element, eventName, handler) {
    if (element.addEventListener) {
      element.addEventListener(eventName, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + eventName, handler);
    }
  }

  toggleProblemSection();
})();
