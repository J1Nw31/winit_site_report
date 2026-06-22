(function () {
  "use strict";

  var form = document.getElementById("report-form");
  var languageSelect = document.getElementById("language-select");
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

  var languageStorageKey = "winit-report-language";
  var translations = {
    "zh-CN": {
      htmlLang: "zh-CN",
      brandSlogan: "智能连接 · 高效响应",
      languageLabel: "语言",
      eyebrow: "维保服务",
      pageTitle: "站点问题报修",
      title: "站点报修",
      siteField: "站点",
      sitePlaceholder: "例如 LS01",
      siteLocked: "二维码已识别",
      descriptionTitle: "添加问题描述",
      descriptionHint: "选填，不填写也可以快速报修",
      quickIssues: "常见问题",
      issueBoxMissing: "箱子不来",
      issueCartNoEntry: "小车不进站",
      issueCartNoDrop: "小车进站不放箱",
      issueOther: "其他",
      problemDescription: "问题描述",
      problemPlaceholder: "请描述设备故障、异常现象或需要协助的内容",
      problemHint: "请尽量描述清楚，便于维保人员快速处理",
      send: "发送报修",
      sending: "正在发送...",
      cooldownSuffix: " 秒后可再次发送",
      replyHint: "下滑客服回复",
      replyHintAria: "下滑查看客服回复",
      chatTitle: "客服回复",
      newReplyBadge: "新回复",
      chatWaiting: "等待站点",
      chatConnecting: "正在连接",
      chatOnline: "已连接",
      chatNoTopic: "暂无客服频道",
      chatOffline: "客服暂不可用",
      chatEmpty: "客服回复会显示在这里。",
      chatNoReply: "当前站点暂无客服回复。",
      newReplyTitle: "有新回复",
      footer: "WINIT 万邑通 · 站点维保呼叫系统",
      invalidSite: "请输入有效站点号，例如 LS01。",
      genericFailure: "发送失败，请稍后重试。",
      success: "报修信息已发送，维保人员已收到通知。",
      networkFailure: "发送失败，请检查网络后重试。",
      noService: "网站尚未配置通知服务。",
      noProblem: "未填写，现场请求维保",
      reportTitle: "站点报修",
      siteLabel: "站点",
      problemLabel: "问题"
    },
    "zh-TW": {
      htmlLang: "zh-Hant",
      brandSlogan: "智能連接 · 高效響應",
      languageLabel: "語言",
      eyebrow: "維保服務",
      pageTitle: "站點問題報修",
      title: "站點報修",
      siteField: "站點",
      sitePlaceholder: "例如 LS01",
      siteLocked: "二維碼已識別",
      descriptionTitle: "添加問題描述",
      descriptionHint: "選填，不填寫也可以快速報修",
      quickIssues: "常見問題",
      issueBoxMissing: "箱子不來",
      issueCartNoEntry: "小車不進站",
      issueCartNoDrop: "小車進站不放箱",
      issueOther: "其他",
      problemDescription: "問題描述",
      problemPlaceholder: "請描述設備故障、異常現象或需要協助的內容",
      problemHint: "請盡量描述清楚，便於維保人員快速處理",
      send: "發送報修",
      sending: "正在發送...",
      cooldownSuffix: " 秒後可再次發送",
      replyHint: "下滑客服回覆",
      replyHintAria: "下滑查看客服回覆",
      chatTitle: "客服回覆",
      newReplyBadge: "新回覆",
      chatWaiting: "等待站點",
      chatConnecting: "正在連接",
      chatOnline: "已連接",
      chatNoTopic: "暫無客服頻道",
      chatOffline: "客服暫不可用",
      chatEmpty: "客服回覆會顯示在這裡。",
      chatNoReply: "當前站點暫無客服回覆。",
      newReplyTitle: "有新回覆",
      footer: "WINIT 萬邑通 · 站點維保呼叫系統",
      invalidSite: "請輸入有效站點號，例如 LS01。",
      genericFailure: "發送失敗，請稍後重試。",
      success: "報修信息已發送，維保人員已收到通知。",
      networkFailure: "發送失敗，請檢查網絡後重試。",
      noService: "網站尚未配置通知服務。",
      noProblem: "未填寫，現場請求維保",
      reportTitle: "站點報修",
      siteLabel: "站點",
      problemLabel: "問題"
    },
    en: {
      htmlLang: "en",
      brandSlogan: "Smart connection · Fast response",
      languageLabel: "Language",
      eyebrow: "Maintenance",
      pageTitle: "Site Issue Report",
      title: "Site Report",
      siteField: "Site",
      sitePlaceholder: "Example: LS01",
      siteLocked: "QR code recognized",
      descriptionTitle: "Add issue details",
      descriptionHint: "Optional. You can send a quick report without details.",
      quickIssues: "Common issues",
      issueBoxMissing: "Box not coming",
      issueCartNoEntry: "Cart not entering station",
      issueCartNoDrop: "Cart enters but does not drop box",
      issueOther: "Other",
      problemDescription: "Issue details",
      problemPlaceholder: "Describe the fault, abnormal behavior, or help needed",
      problemHint: "Please describe clearly so maintenance can respond quickly",
      send: "Send Report",
      sending: "Sending...",
      cooldownSuffix: " seconds before sending again",
      replyHint: "Scroll down for support replies",
      replyHintAria: "Scroll down to view support replies",
      chatTitle: "Support Replies",
      newReplyBadge: "New reply",
      chatWaiting: "Waiting for site",
      chatConnecting: "Connecting",
      chatOnline: "Connected",
      chatNoTopic: "No support channel",
      chatOffline: "Support unavailable",
      chatEmpty: "Support replies will appear here.",
      chatNoReply: "No support replies for this site yet.",
      newReplyTitle: "New reply",
      footer: "WINIT · Site maintenance call system",
      invalidSite: "Enter a valid site code, for example LS01.",
      genericFailure: "Send failed. Please try again later.",
      success: "Report sent. Maintenance has been notified.",
      networkFailure: "Send failed. Please check the network and try again.",
      noService: "Notification service is not configured.",
      noProblem: "No details provided. On-site maintenance requested.",
      reportTitle: "Site Report",
      siteLabel: "Site",
      problemLabel: "Issue"
    }
  };
  var currentLanguage = readSavedLanguage();
  var text = translations[currentLanguage];

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

  applyLanguage();

  if (querySite && sitePattern.test(querySite)) {
    siteInput.value = querySite;
    siteInput.readOnly = true;
    siteLock.style.display = "inline";
    updateDocumentTitle();
  }

  addEvent(problemInput, "input", function () {
    characterCount.innerHTML = problemInput.value.length + " / 500";
  });

  addEvent(descriptionEnabled, "change", toggleProblemSection);
  addEvent(descriptionEnabled, "click", function () {
    window.setTimeout(toggleProblemSection, 0);
  });
  addQuickIssueEvents();
  if (languageSelect) {
    addEvent(languageSelect, "change", function () {
      currentLanguage = translations[languageSelect.value] ? languageSelect.value : "zh-CN";
      text = translations[currentLanguage];
      saveLanguage(currentLanguage);
      applyLanguage();
    });
  }

  addEvent(siteInput, "input", function () {
    siteInput.value = siteInput.value.toUpperCase().replace(/\s+/g, "");
    updateDocumentTitle();
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
        if (this.getAttribute("data-issue") === "other") {
          descriptionEnabled.checked = true;
          toggleProblemSection();
        }
      });
    }
  }

  function readSavedLanguage() {
    var saved = "";
    try {
      saved = window.localStorage.getItem(languageStorageKey) || "";
    } catch (error) {
      saved = "";
    }
    return translations[saved] ? saved : "zh-CN";
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch (error) {
      return;
    }
  }

  function applyLanguage() {
    var textNodes = document.querySelectorAll("[data-i18n]");
    var placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    var ariaLabels = document.querySelectorAll("[data-i18n-aria-label]");
    var index;

    if (languageSelect) {
      languageSelect.value = currentLanguage;
    }
    document.documentElement.lang = text.htmlLang || currentLanguage;

    for (index = 0; index < textNodes.length; index += 1) {
      setElementText(textNodes[index], textNodes[index].getAttribute("data-i18n"));
    }
    for (index = 0; index < placeholders.length; index += 1) {
      setElementAttribute(
        placeholders[index],
        "placeholder",
        placeholders[index].getAttribute("data-i18n-placeholder")
      );
    }
    for (index = 0; index < ariaLabels.length; index += 1) {
      setElementAttribute(
        ariaLabels[index],
        "aria-label",
        ariaLabels[index].getAttribute("data-i18n-aria-label")
      );
    }

    updateQuickIssueValues();
    updateDocumentTitle();
    refreshDynamicLanguageText();
  }

  function setElementText(element, key) {
    if (text[key]) {
      element.innerHTML = text[key];
    }
  }

  function setElementAttribute(element, attribute, key) {
    if (text[key]) {
      element.setAttribute(attribute, text[key]);
    }
  }

  function updateQuickIssueValues() {
    var issueMap = {
      boxMissing: "issueBoxMissing",
      cartNoEntry: "issueCartNoEntry",
      cartNoDrop: "issueCartNoDrop",
      other: "issueOther"
    };
    var index;
    var issueKey;
    for (index = 0; index < quickIssueInputs.length; index += 1) {
      issueKey = issueMap[quickIssueInputs[index].getAttribute("data-issue")];
      if (issueKey && text[issueKey]) {
        quickIssueInputs[index].value = text[issueKey];
      }
    }
  }

  function updateDocumentTitle() {
    var site = siteInput.value.replace(/^\s+|\s+$/g, "").toUpperCase();
    normalTitle = sitePattern.test(site)
      ? site + " - WINIT " + text.title
      : "WINIT " + text.title;
    document.title = normalTitle;
  }

  function refreshDynamicLanguageText() {
    if (sending) {
      buttonText.innerHTML = text.sending;
    } else if (cooldownRemaining > 0) {
      updateCooldownText();
    } else {
      buttonText.innerHTML = text.send;
    }
    if (chatList && !chatList.querySelector(".chat-message")) {
      chatList.innerHTML =
        '<p class="chat-empty">' +
        (activeChatSite ? text.chatNoReply : text.chatEmpty) +
        "</p>";
    }
    if (chatState && !activeChatSite) {
      setChatState(text.chatWaiting);
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
