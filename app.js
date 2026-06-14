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
    document.title = `${querySite} - WINIT 站点报修`;
  }

  problemInput.addEventListener("input", () => {
    characterCount.textContent = `${problemInput.value.length} / 500`;
  });

  siteInput.addEventListener("input", () => {
    siteInput.value = siteInput.value.toUpperCase().replace(/\s+/g, "");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (cooldownRemaining > 0) {
      return;
    }

    const site = siteInput.value.trim().toUpperCase();
    const problem = problemInput.value.trim();

    if (!sitePattern.test(site)) {
      showStatus("请输入有效站点号，例如 LS01。", "error");
      siteInput.focus();
      return;
    }

    if (problem.length < 3) {
      showStatus("请至少输入 3 个字的问题描述。", "error");
      problemInput.focus();
      return;
    }

    setSending(true);

    try {
      const response = await sendReport(site, problem);

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "发送失败，请稍后重试。");
      }

      problemInput.value = "";
      characterCount.textContent = "0 / 500";
      showStatus("报修信息已发送，维保人员已收到通知。", "success");
      startCooldown(20);
    } catch (error) {
      setSending(false);
      showStatus(error.message || "发送失败，请检查网络后重试。", "error");
    }
  });

  function setSending(sending) {
    submitButton.disabled = sending;
    buttonText.textContent = sending ? "正在发送..." : "发送报修";
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
        buttonText.textContent = "发送报修";
        return;
      }
      updateCooldownText();
    }, 1000);
  }

  function updateCooldownText() {
    buttonText.textContent = `${cooldownRemaining} 秒后可再次发送`;
  }

  async function sendReport(site, problem) {
    const config = window.REPORT_CONFIG || {};
    if (config.mode !== "direct") {
      return fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ site, problem })
      });
    }

    const server = String(config.ntfyServer || "https://ntfy.sh")
      .replace(/\/+$/, "");
    const topic = String(config.ntfyTopic || "").trim();
    if (!topic) {
      throw new Error("网站尚未配置通知服务。");
    }

    const sydneyTime = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Australia/Sydney",
      dateStyle: "medium",
      timeStyle: "medium"
    }).format(new Date());

    return fetch(`${server}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        topic,
        title: `站点报修 - ${site}`,
        message: `站点：${site}\n问题：${problem}\n时间：${sydneyTime}`,
        priority: 5,
        tags: ["rotating_light", "wrench"]
      })
    });
  }
})();
