#!/usr/bin/env python3
import base64
import json
import mimetypes
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SITE_PATTERN = re.compile(r"^[A-Z]{2,6}\d{2,4}$")
COOLDOWN_SECONDS = 20
RECENT_REQUESTS = {}


def env(name, default=""):
    return os.environ.get(name, default)


def topic_for_site(site):
    prefix = re.match(r"^[A-Z]+", site).group(0)
    if prefix in ("DX", "XX"):
        return env("PUSH_CONVEYOR_TOPIC", "输送线人员报障")
    if prefix == "LS":
        return env("PUSH_LS_TOPIC", env("PUSH_TOPIC", "离线工作站报障"))
    return env("PUSH_TOPIC", "")


def json_response(handler, data, status=200):
    payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)


def clean_old_requests(now):
    expired = [
        key for key, timestamp in RECENT_REQUESTS.items()
        if now - timestamp > 5 * 60
    ]
    for key in expired:
        del RECENT_REQUESTS[key]


class ReportHandler(BaseHTTPRequestHandler):
    server_version = "WinitSiteReport/1.0"

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)
        if path == "/" or path == "":
            path = "/index.html"

        target = (ROOT / path.lstrip("/")).resolve()
        if not str(target).startswith(str(ROOT)) or not target.is_file():
            self.send_error(404)
            return

        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store" if target.name in ("config.js", "index.html") else "public, max-age=300")
        self.send_header("Content-Length", str(target.stat().st_size))
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/api/report":
            json_response(self, {"error": "Not found"}, 404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length)
            data = json.loads(body.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            json_response(self, {"error": "请求格式不正确。"}, 400)
            return

        site = str(data.get("site", "")).strip().upper()
        problem = str(data.get("problem", "")).strip()

        if not SITE_PATTERN.match(site):
            json_response(self, {"error": "站点号格式不正确。"}, 400)
            return
        if len(problem) > 500:
            json_response(self, {"error": "问题描述不能超过 500 个字符。"}, 400)
            return

        client_ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        rate_key = f"{client_ip}:{site}"
        now = time.time()
        last_request = RECENT_REQUESTS.get(rate_key, 0)
        if now - last_request < COOLDOWN_SECONDS:
            json_response(self, {"error": "请求过于频繁，请 20 秒后重试。"}, 429)
            return

        server = env("PUSH_SERVER", "https://hik2.tail6f1a46.ts.net").rstrip("/")
        password = env("PUSH_PASSWORD", "winit777")
        topic = topic_for_site(site)
        if not topic:
            json_response(self, {"error": "服务器尚未配置通知服务。"}, 500)
            return

        issue = problem or "未填写，现场请求维保"
        payload = {
            "password": password,
            "topic": topic,
            "title": site,
            "message_base64": base64.b64encode(issue.encode("utf-8")).decode("ascii"),
        }

        request = urllib.request.Request(
            f"{server}/api/external/report",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                if response.status < 200 or response.status >= 300:
                    json_response(self, {"error": "通知服务暂时不可用，请稍后重试。"}, 502)
                    return
        except (urllib.error.URLError, TimeoutError):
            json_response(self, {"error": "通知服务暂时不可用，请稍后重试。"}, 502)
            return

        RECENT_REQUESTS[rate_key] = now
        clean_old_requests(now)
        json_response(self, {"ok": True})

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)
        if path == "/api/report":
            json_response(self, {"error": "仅支持 POST 请求。"}, 405)
            return
        if path == "/" or path == "":
            path = "/index.html"

        target = (ROOT / path.lstrip("/")).resolve()
        if not str(target).startswith(str(ROOT)) or not target.is_file():
            self.send_error(404)
            return

        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        data = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store" if target.name in ("config.js", "index.html") else "public, max-age=300")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        print("%s - - [%s] %s" % (self.client_address[0], self.log_date_time_string(), fmt % args))


def main():
    host = env("HOST", "0.0.0.0")
    port = int(env("PORT", "80"))
    httpd = ThreadingHTTPServer((host, port), ReportHandler)
    print(f"Serving WINIT site report on http://{host}:{port}")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
