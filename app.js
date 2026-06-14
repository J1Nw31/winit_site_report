(() => {
  "use strict";

  const form = document.querySelector("#report-form");
  const siteInput = document.querySelector("#site");
  const siteLock = document.querySelector("#site-lock");
  const problemInput = document.querySelector("#problem");
  const characterCount = document.querySelector("#character-count");
  const submitButton = document.querySelector("#submit-button");
  const buttonText = document.querySelector("#button-text");
  const status = document.querySelector("#status");

  const text = {
    title: "\u7ad9\u70b9\u62a5\u4fee",
    invalidSite: "\u8bf7\u8f93\u5165\u6709\u6548\u7ad9\u70b9\u53f7\uff0c\u4f8b\u5982 LS01\u3002",
    shortProblem: "\u8bf7\u81f3\u5c11\u8f93\u5165 3 \u4e2a\u5b57\u7684\u95ee\u9898\u63cf\u8ff0\u3002",
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
    timeLabel: "\u65f6\u95f4"
  };

  const sitePattern = /^[A-Z]{2,6}\d{2,4}$/;
  const querySite = new URLSearchParams(window.location.search)
    .get("site")
    ?.trim()
    .toUpperCase();

  let cooldownRemaining = 0;
  let cooldownTimer = null;

  if (querySite && sitePattern.test(querySite)) {
    siteInput.value = querySite;
    siteInput.readOnly = true;
    siteLock.hidden = false;
    document.title = `${querySite} - WINIT ${text.title}`;
  }

  problemInput.addEventListener("input", () => {
    characterCount.textContent = `${problemInput.value.length} / 500`;
  });

  siteInput.addEventListener("input", () => {
    siteInput.value = siteInput.value.toUpperCase().replace(/\s+/g, "");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (cooldownRemaining > 0) return;

    const site = siteInput.value.trim().toUpperCase();
    const problem = problemInput.value.trim();

    if (!sitePattern.test(site)) {
      showStatus(text.invalidSite, "error");
      siteInput.focus();
      return;
    }

    if (problem.length < 3) {
      showStatus(text.shortProblem, "error");
      problemInput.focus();
      return;
    }

    setSending(true);

    try {
      const response = await sendReport(site, problem);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || text.genericFailure);
      }

      problemInput.value = "";
      characterCount.textContent = "0 / 500";
      showStatus(text.success, "success");
      startCooldown(20);
    } catch (error) {
      setSending(false);
      showStatus(error.message || text.networkFailure, "error");
    }
  });

  function setSending(sending) {
    submitButton.disabled = sending;
    buttonText.textContent = sending ? text.sending : text.send;
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type || ""}`;
  }

  function startCooldown(seconds) {
    window.clearInterval(cooldownTimer);
    cooldownRemaining = seconds;
    submitButton.disabled = true;
    updateCooldownText();

    cooldownTimer = window.setInterval(() => {
      cooldownRemaining -= 1;
      if (cooldownRemaining <= 0) {
        window.clearInterval(cooldownTimer);
        submitButton.disabled = false;
        buttonText.textContent = text.send;
        return;
      }
      updateCooldownText();
    }, 1000);
  }

  function updateCooldownText() {
    buttonText.textContent = `${cooldownRemaining}${text.cooldownSuffix}`;
  }

  async function sendReport(site, problem) {
    const config = window.REPORT_CONFIG || {};
    if (config.mode !== "direct") {
      return fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, problem })
      });
    }

    const server = String(config.ntfyServer || "https://ntfy.sh")
      .replace(/\/+$/, "");
    const topic = String(config.ntfyTopic || "").trim();
    if (!topic) throw new Error(text.noService);

    const sydneyTime = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Australia/Sydney",
      dateStyle: "medium",
      timeStyle: "medium"
    }).format(new Date());

    return fetch(`${server}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        topic,
        title: `${text.reportTitle} - ${site}`,
        message:
          `${text.siteLabel}\uff1a${site}\n` +
          `${text.problemLabel}\uff1a${problem}\n` +
          `${text.timeLabel}\uff1a${sydneyTime}`,
        priority: 5,
        tags: ["rotating_light", "wrench"]
      })
    });
  }
})();
