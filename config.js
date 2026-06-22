window.REPORT_CONFIG = {
  mode: "server",
  raspberryPiBaseUrl: "https://hik2.tail6f1a46.ts.net/web-site-report",
  siteApiPath: "/web-site-report/api/report",
  legacyRedirectHosts: ["j1nw31.github.io"],
  pushServer: "https://hik2.tail6f1a46.ts.net",
  pushTopic: "离线工作站报障",
  pushTopicByPrefix: {
    LS: "离线工作站报障",
    DX: "输送线人员报障",
    XX: "输送线人员报障"
  },
  receiveTopicByPrefix: {
    LS: "回传离线工作站",
    DX: "回传输送线人员",
    XX: "回传输送线人员"
  },
  pushPassword: "winit777"
};
