(function () {
  "use strict";

  var form = document.getElementById("report-form");
  var siteInput = document.getElementById("site");
  var siteLock = document.getElementById("site-lock");
  var descriptionEnabled = document.getElementById("description-enabled");
  var problemSection = document.getElementById("problem-section");
  var problemInput = document.getElementById("problem");
  var characterCount = document.getElementById("character-count");
  var quickIssueInputs = document.getElementsByName("quickIssue");
  var submitButton = document.getElementById("submit-button");
  var buttonText = document.getElementById("button-text");
  var status = document.getElementById("status");
  var replyHint = document.getElementById("reply-hint");
  var chatPanel = document.querySelector(".chat-panel");
  var chatState = document.getElementById("chat-state");
  var chatNewBadge = document.getElementById("chat-new-badge");
  var chatList = document.getElementById("chat-list");

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
    noProblem: "\u672a\u586b\u5199\uff0c\u73b0\u573a\u8bf7\u6c42\u7ef4\u4fdd",
    chatWaiting: "\u7b49\u5f85\u7ad9\u70b9",
    chatConnecting: "\u6b63\u5728\u8fde\u63a5",
    chatOnline: "\u5df2\u8fde\u63a5",
    chatNoTopic: "\u6682\u65e0\u5ba2\u670d\u9891\u9053",
    chatOffline: "\u5ba2\u670d\u6682\u4e0d\u53ef\u7528",
    chatEmpty: "\u5ba2\u670d\u56de\u590d\u4f1a\u663e\u793a\u5728\u8fd9\u91cc\u3002",
    chatNoReply: "\u5f53\u524d\u7ad9\u70b9\u6682\u65e0\u5ba2\u670d\u56de\u590d\u3002",
    newReplyTitle: "\u6709\u65b0\u56de\u590d"
  };

  var sitePattern = /^[A-Z]{2,6}\d{2,4}$/;
  var querySite = detectSiteCode();
  var cooldownRemaining = 0;
  var cooldownTimer = null;
  var sending = false;
  var chatMessageTtlMs = 60 * 60 * 1000;
  var chatCleanupTimer = null;
  var chatSource = null;
  var chatToken = "";
  var activeChatSite = "";
  var activeChatTopic = "";
  var normalTitle = document.title;

  if (querySite) {
    querySite = querySite.replace(/^\s+|\s+$/g, "").toUpperCase();
  }

  if (querySite && sitePattern.test(querySite)) {
    siteInput.value = querySite;
    siteInput.readOnly = true;
    siteLock.style.display = "inline";
    document.title = querySite + " - WINIT " + text.title;
    normalTitle = document.title;
  }

  addEvent(problemInput, "input", function () {
    characterCount.innerHTML = problemInput.value.length + " / 500";
  });

  addEvent(descriptionEnabled, "change", toggleProblemSection);
  addEvent(descriptionEnabled, "click", function () {
    window.setTimeout(toggleProblemSection, 0);
  });
  addQuickIssueEvents();

  addEvent(siteInput, "input", function () {
    siteInput.value = siteInput.value.toUpperCase().replace(/\s+/g, "");
    scheduleChatRefresh();
  });

  addEvent(form, "submit", submitReport);
  if (replyHint) {
    addEvent(replyHint, "click", scrollToChat);
  }
  if (chatPanel) {
    addEvent(chatPanel, "click", clearReplyNotice);
    addEvent(chatPanel, "touchstart", clearReplyNotice);
  }
  addEvent(window, "focus", clearReplyNotice);
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
      clearQuickIssue();
      characterCount.innerHTML = "0 / 500";
    }
  }

  function addQuickIssueEvents() {
    var index;
    for (index = 0; index < quickIssueInputs.length; index += 1) {
      addEvent(quickIssueInputs[index], "change", function () {
        if (this.value === "\u5176\u4ed6") {
          descriptionEnabled.checked = true;
          toggleProblemSection();
        }
      });
    }
  }

  function buildProblemMessage() {
    var quickIssue = getSelectedQuickIssue();
    var detail = problemInput.value.replace(/^\s+|\s+$/g, "");

    if (quickIssue && detail) {
      return quickIssue + "\uff1a" + detail;
    }
    return quickIssue || detail;
  }

  function getSelectedQuickIssue() {
    var index;
    for (index = 0; index < quickIssueInputs.length; index += 1) {
      if (quickIssueInputs[index].checked) {
        return quickIssueInputs[index].value;
      }
    }
    return "";
  }

  function clearQuickIssue() {
    var index;
    for (index = 0; index < quickIssueInputs.length; index += 1) {
      quickIssueInputs[index].checked = false;
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
    var problem = buildProblemMessage();

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

      descriptionEnabled.checked = false;
      toggleProblemSection();
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
    var topic = getTopicForSite(site, config.pushTopicByPrefix, config.pushTopic);

    var issue = problem || text.noProblem;
    var payload = {
      password: password,
      topic: topic,
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

  function scheduleChatRefresh() {
    window.clearTimeout(scheduleChatRefresh.timer);
    scheduleChatRefresh.timer = window.setTimeout(initChat, 350);
  }

  function initChat() {
    var config = window.REPORT_CONFIG || {};
    var site = siteInput.value.replace(/^\s+|\s+$/g, "").toUpperCase();
    var topic;

    if (!sitePattern.test(site)) {
      resetChat(text.chatWaiting);
      return;
    }

    topic = getTopicForSite(site, config.receiveTopicByPrefix, config.receiveTopic);
    if (!topic) {
      resetChat(text.chatNoTopic);
      return;
    }

    if (site === activeChatSite && topic === activeChatTopic && chatSource) {
      return;
    }

    activeChatSite = site;
    activeChatTopic = topic;
    setChatState(text.chatConnecting);
    renderChatMessages([]);
    startChatCleanupTimer();
    loadChatHistory(site, topic);
    subscribeToChat(site, topic);
  }

  function loadChatHistory(site, topic) {
    ensureChatToken(function (error, token) {
      var config = window.REPORT_CONFIG || {};
      var server = getServer(config);
      var request;

      if (error) {
        setChatState(text.chatOffline);
        return;
      }

      request = createRequest();
      if (!request) {
        setChatState(text.chatOffline);
        return;
      }

      request.onreadystatechange = function () {
        var data;
        if (request.readyState !== 4 || site !== activeChatSite || topic !== activeChatTopic) {
          return;
        }
        if (request.status >= 200 && request.status < 300) {
          try {
            data = JSON.parse(request.responseText || "{}");
            renderChatMessages(filterSiteMessages(data.history || [], site));
            setChatState(text.chatOnline);
          } catch (parseError) {
            setChatState(text.chatOffline);
          }
        } else {
          setChatState(text.chatOffline);
        }
      };
      request.onerror = function () {
        setChatState(text.chatOffline);
      };

      try {
        request.open(
          "GET",
          server + "/history/" + encodeURIComponent(topic) + "?limit=100",
          true
        );
        request.setRequestHeader("Authorization", "Bearer " + token);
        request.send();
      } catch (requestError) {
        setChatState(text.chatOffline);
      }
    });
  }

  function subscribeToChat(site, topic) {
    var server = getServer(window.REPORT_CONFIG || {});

    closeChatSource();
    if (!window.EventSource) {
      return;
    }

    try {
      chatSource = new EventSource(server + "/subscribe/" + encodeURIComponent(topic));
      chatSource.addEventListener("open", function () {
        if (site === activeChatSite && topic === activeChatTopic) {
          setChatState(text.chatOnline);
        }
      });
      chatSource.addEventListener("message", function (event) {
        var message;
        if (site !== activeChatSite || topic !== activeChatTopic) {
          return;
        }
        try {
          message = JSON.parse(event.data);
        } catch (parseError) {
          return;
        }
        if (isSiteMessage(message, site) && isFreshChatMessage(message)) {
          prependChatMessage(message);
          markNewReply();
          setChatState(text.chatOnline);
        }
      });
      chatSource.addEventListener("error", function () {
        if (site === activeChatSite && topic === activeChatTopic) {
          setChatState(text.chatConnecting);
        }
      });
    } catch (error) {
      setChatState(text.chatOffline);
    }
  }

  function ensureChatToken(callback) {
    var config = window.REPORT_CONFIG || {};
    var password = String(config.pushPassword || config.ntfyPassword || "");
    var request;

    if (chatToken) {
      callback(null, chatToken);
      return;
    }
    if (!password) {
      callback(text.noService);
      return;
    }

    request = createRequest();
    if (!request) {
      callback(text.networkFailure);
      return;
    }

    request.onreadystatechange = function () {
      var data;
      if (request.readyState !== 4) {
        return;
      }
      if (request.status >= 200 && request.status < 300) {
        try {
          data = JSON.parse(request.responseText || "{}");
          chatToken = data.token || "";
          callback(chatToken ? null : text.genericFailure, chatToken);
        } catch (error) {
          callback(text.genericFailure);
        }
      } else {
        callback(text.genericFailure);
      }
    };
    request.onerror = function () {
      callback(text.networkFailure);
    };

    try {
      request.open("POST", getServer(config) + "/api/auth/login", true);
      request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      request.send(JSON.stringify({ password: password }));
    } catch (error) {
      callback(text.networkFailure);
    }
  }

  function filterSiteMessages(messages, site) {
    var filtered = [];
    var index;
    for (index = 0; index < messages.length; index += 1) {
      if (isSiteMessage(messages[index], site) && isFreshChatMessage(messages[index])) {
        filtered.push(messages[index]);
      }
    }
    return filtered;
  }

  function isSiteMessage(message, site) {
    var title = String(message && message.title ? message.title : "")
      .replace(/^\s+|\s+$/g, "")
      .toUpperCase();
    return title === site;
  }

  function isFreshChatMessage(message) {
    var timestamp = message && message.timestamp ? new Date(message.timestamp).getTime() : Date.now();
    if (isNaN(timestamp)) {
      return true;
    }
    return Date.now() - timestamp < chatMessageTtlMs;
  }

  function renderChatMessages(messages) {
    var index;
    if (!chatList) {
      return;
    }
    chatList.innerHTML = "";
    if (!messages.length) {
      chatList.innerHTML = '<p class="chat-empty">' + text.chatNoReply + "</p>";
      return;
    }
    for (index = messages.length - 1; index >= 0; index -= 1) {
      chatList.appendChild(createChatMessage(messages[index]));
    }
  }

  function prependChatMessage(message) {
    var empty = chatList.querySelector(".chat-empty");
    if (empty) {
      chatList.innerHTML = "";
    }
    if (message.id && chatList.querySelector('[data-id="' + cssEscape(message.id) + '"]')) {
      return;
    }
    chatList.insertBefore(createChatMessage(message), chatList.firstChild);
  }

  function createChatMessage(message) {
    var article = document.createElement("article");
    var meta = "#" + (message.topic || activeChatTopic) + " · " + formatTime(message.timestamp);
    article.className = "chat-message";
    if (message.id) {
      article.setAttribute("data-id", message.id);
    }
    article.setAttribute("data-timestamp", message.timestamp || new Date().toISOString());
    article.innerHTML =
      '<div class="chat-message-body">' +
      escapeHtml(message.message || "") +
      "</div>" +
      '<div class="chat-message-meta">' +
      escapeHtml(meta) +
      "</div>";
    return article;
  }

  function resetChat(stateText) {
    activeChatSite = "";
    activeChatTopic = "";
    closeChatSource();
    stopChatCleanupTimer();
    clearReplyNotice();
    setChatState(stateText);
    if (chatList) {
      chatList.innerHTML = '<p class="chat-empty">' + text.chatEmpty + "</p>";
    }
  }

  function closeChatSource() {
    if (chatSource) {
      chatSource.close();
      chatSource = null;
    }
  }

  function startChatCleanupTimer() {
    stopChatCleanupTimer();
    chatCleanupTimer = window.setInterval(cleanupExpiredChatMessages, 60 * 1000);
  }

  function stopChatCleanupTimer() {
    if (chatCleanupTimer) {
      window.clearInterval(chatCleanupTimer);
      chatCleanupTimer = null;
    }
  }

  function cleanupExpiredChatMessages() {
    var messages;
    var index;
    var removed = false;

    if (!chatList) {
      return;
    }

    messages = chatList.querySelectorAll(".chat-message");
    for (index = 0; index < messages.length; index += 1) {
      if (!isFreshChatMessage({ timestamp: messages[index].getAttribute("data-timestamp") })) {
        messages[index].parentNode.removeChild(messages[index]);
        removed = true;
      }
    }

    if (removed && !chatList.querySelector(".chat-message")) {
      chatList.innerHTML = '<p class="chat-empty">' + text.chatNoReply + "</p>";
      clearReplyNotice();
    }
  }

  function setChatState(value) {
    if (chatState) {
      chatState.innerHTML = value;
    }
  }

  function markNewReply() {
    if (replyHint) {
      replyHint.classList.add("has-new-reply");
    }
    if (chatPanel) {
      chatPanel.classList.add("has-new-reply");
    }
    if (chatNewBadge) {
      chatNewBadge.hidden = false;
    }
    document.title = text.newReplyTitle + " - " + normalTitle;
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([180, 80, 180]);
    }
  }

  function clearReplyNotice() {
    if (replyHint) {
      replyHint.classList.remove("has-new-reply");
    }
    if (chatPanel) {
      chatPanel.classList.remove("has-new-reply");
    }
    if (chatNewBadge) {
      chatNewBadge.hidden = true;
    }
    document.title = normalTitle;
  }

  function scrollToChat() {
    if (!chatPanel) {
      return;
    }
    if (chatPanel.scrollIntoView) {
      chatPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = "chat-title";
    }
    clearReplyNotice();
  }

  function getServer(config) {
    return String(
      config.pushServer ||
        config.ntfyServer ||
        "https://hik2.tail6f1a46.ts.net"
    ).replace(/\/+$/, "");
  }

  function getTopicForSite(site, topicByPrefix, fallback) {
    var prefix = (site.match(/^[A-Z]+/) || [""])[0];
    var topics = topicByPrefix || {};
    return String(topics[prefix] || fallback || "");
  }

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function cssEscape(value) {
    if (window.CSS && window.CSS.escape) {
      return window.CSS.escape(value);
    }
    return String(value).replace(/"/g, '\\"');
  }

  function formatTime(timestamp) {
    var date = timestamp ? new Date(timestamp) : new Date();
    if (window.Intl && window.Intl.DateTimeFormat) {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    }
    return date.toLocaleString();
  }

  addEvent(window, "beforeunload", function () {
    closeChatSource();
    stopChatCleanupTimer();
  });
  toggleProblemSection();
  initChat();
})();
