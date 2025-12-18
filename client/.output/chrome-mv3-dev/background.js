var background = function() {
  "use strict";
  var _a, _b;
  function defineBackground(arg) {
    if (arg == null || typeof arg === "function") return { main: arg };
    return arg;
  }
  const browser$1 = ((_b = (_a = globalThis.browser) == null ? void 0 : _a.runtime) == null ? void 0 : _b.id) ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  function listenUpdatedWellfound(tabId, changeInfo, tab) {
    var _a2;
    if (changeInfo.status === "complete" && ((_a2 = tab.url) == null ? void 0 : _a2.includes("wellfound.com/jobs"))) {
      console.log("tab detected(onUpdated):", tab.url, tabId);
      chrome.tabs.sendMessage(tabId, { message: "PageUpdatedWellFound" }, async (response) => {
        console.log("Message sent to content script", response);
      });
    }
  }
  background;
  function googleLogin(message, sender, sendResponse) {
    if (message.type === "GOOGLE_LOGIN") {
      try {
        const redirectUri = chrome.identity.getRedirectURL();
        const CLIENT_ID = "113439342527-kliuhrfour83snj76k0fsuch50gu5rta.apps.googleusercontent.com";
        const state = Math.random().toString(36).substring(2);
        const nonce = Math.random().toString(36).substring(2);
        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authUrl.searchParams.append("client_id", CLIENT_ID);
        authUrl.searchParams.append("response_type", "token id_token");
        authUrl.searchParams.append("redirect_uri", redirectUri);
        authUrl.searchParams.append("scope", "openid email profile");
        authUrl.searchParams.append("state", state);
        authUrl.searchParams.append("nonce", nonce);
        authUrl.searchParams.append("prompt", "consent");
        chrome.identity.launchWebAuthFlow(
          {
            url: authUrl.toString(),
            interactive: true
          },
          (redirectUrl) => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError });
              return;
            }
            if (!redirectUrl) {
              sendResponse({ error: "No redirect URL" });
              return;
            }
            const url = new URL(redirectUrl);
            const params = new URLSearchParams(url.hash.substring(1));
            const accessToken = params.get("access_token");
            if (!accessToken) {
              sendResponse({ error: "No access token" });
              return;
            }
            fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
              headers: {
                "Authorization": `Bearer ${accessToken}`
              }
            }).then(async (response) => {
              let user = await response.json();
              chrome.storage.local.set({ user });
              sendResponse({ message: "Login Successful" });
              return true;
            }).catch((error) => {
              sendResponse({ error: error.message });
            });
          }
        );
      } catch (error) {
        console.error("Auth error:", error);
        return;
      }
      return true;
    }
  }
  background;
  const definition = defineBackground(async () => {
    console.log("Hello from background!", { id: browser.runtime.id });
    chrome.runtime.onInstalled.addListener(() => {
      console.log("Extension Installed!");
    });
    chrome.tabs.onUpdated.addListener(listenUpdatedWellfound);
    chrome.tabs.onRemoved.addListener((tabId) => {
      console.log(`Tab ${tabId} was closed.`);
    });
    chrome.runtime.onMessage.addListener(googleLogin);
  });
  background;
  function initPlugins() {
  }
  var _MatchPattern = class {
    constructor(matchPattern) {
      if (matchPattern === "<all_urls>") {
        this.isAllUrls = true;
        this.protocolMatches = [..._MatchPattern.PROTOCOLS];
        this.hostnameMatch = "*";
        this.pathnameMatch = "*";
      } else {
        const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
        if (groups == null)
          throw new InvalidMatchPattern(matchPattern, "Incorrect format");
        const [_, protocol, hostname, pathname] = groups;
        validateProtocol(matchPattern, protocol);
        validateHostname(matchPattern, hostname);
        this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
        this.hostnameMatch = hostname;
        this.pathnameMatch = pathname;
      }
    }
    includes(url) {
      if (this.isAllUrls)
        return true;
      const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
      return !!this.protocolMatches.find((protocol) => {
        if (protocol === "http")
          return this.isHttpMatch(u);
        if (protocol === "https")
          return this.isHttpsMatch(u);
        if (protocol === "file")
          return this.isFileMatch(u);
        if (protocol === "ftp")
          return this.isFtpMatch(u);
        if (protocol === "urn")
          return this.isUrnMatch(u);
      });
    }
    isHttpMatch(url) {
      return url.protocol === "http:" && this.isHostPathMatch(url);
    }
    isHttpsMatch(url) {
      return url.protocol === "https:" && this.isHostPathMatch(url);
    }
    isHostPathMatch(url) {
      if (!this.hostnameMatch || !this.pathnameMatch)
        return false;
      const hostnameMatchRegexs = [
        this.convertPatternToRegex(this.hostnameMatch),
        this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))
      ];
      const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
      return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
    }
    isFileMatch(url) {
      throw Error("Not implemented: file:// pattern matching. Open a PR to add support");
    }
    isFtpMatch(url) {
      throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
    }
    isUrnMatch(url) {
      throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
    }
    convertPatternToRegex(pattern) {
      const escaped = this.escapeForRegex(pattern);
      const starsReplaced = escaped.replace(/\\\*/g, ".*");
      return RegExp(`^${starsReplaced}$`);
    }
    escapeForRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  };
  var MatchPattern = _MatchPattern;
  MatchPattern.PROTOCOLS = ["http", "https", "file", "ftp", "urn"];
  var InvalidMatchPattern = class extends Error {
    constructor(matchPattern, reason) {
      super(`Invalid match pattern "${matchPattern}": ${reason}`);
    }
  };
  function validateProtocol(matchPattern, protocol) {
    if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*")
      throw new InvalidMatchPattern(
        matchPattern,
        `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`
      );
  }
  function validateHostname(matchPattern, hostname) {
    if (hostname.includes(":"))
      throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
    if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*."))
      throw new InvalidMatchPattern(
        matchPattern,
        `If using a wildcard (*), it must go at the start of the hostname`
      );
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  let ws;
  function getDevServerWebSocket() {
    if (ws == null) {
      const serverUrl = "http://localhost:3000";
      logger.debug("Connecting to dev server @", serverUrl);
      ws = new WebSocket(serverUrl, "vite-hmr");
      ws.addWxtEventListener = ws.addEventListener.bind(ws);
      ws.sendCustom = (event, payload) => ws == null ? void 0 : ws.send(JSON.stringify({ type: "custom", event, payload }));
      ws.addEventListener("open", () => {
        logger.debug("Connected to dev server");
      });
      ws.addEventListener("close", () => {
        logger.debug("Disconnected from dev server");
      });
      ws.addEventListener("error", (event) => {
        logger.error("Failed to connect to dev server", event);
      });
      ws.addEventListener("message", (e) => {
        try {
          const message = JSON.parse(e.data);
          if (message.type === "custom") {
            ws == null ? void 0 : ws.dispatchEvent(
              new CustomEvent(message.event, { detail: message.data })
            );
          }
        } catch (err) {
          logger.error("Failed to handle message", err);
        }
      });
    }
    return ws;
  }
  function keepServiceWorkerAlive() {
    setInterval(async () => {
      await browser.runtime.getPlatformInfo();
    }, 5e3);
  }
  function reloadContentScript(payload) {
    const manifest = browser.runtime.getManifest();
    if (manifest.manifest_version == 2) {
      void reloadContentScriptMv2();
    } else {
      void reloadContentScriptMv3(payload);
    }
  }
  async function reloadContentScriptMv3({
    registration,
    contentScript
  }) {
    if (registration === "runtime") {
      await reloadRuntimeContentScriptMv3(contentScript);
    } else {
      await reloadManifestContentScriptMv3(contentScript);
    }
  }
  async function reloadManifestContentScriptMv3(contentScript) {
    const id = `wxt:${contentScript.js[0]}`;
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const existing = registered.find((cs) => cs.id === id);
    if (existing) {
      logger.debug("Updating content script", existing);
      await browser.scripting.updateContentScripts([{ ...contentScript, id }]);
    } else {
      logger.debug("Registering new content script...");
      await browser.scripting.registerContentScripts([{ ...contentScript, id }]);
    }
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadRuntimeContentScriptMv3(contentScript) {
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const matches = registered.filter((cs) => {
      var _a2, _b2;
      const hasJs = (_a2 = contentScript.js) == null ? void 0 : _a2.find((js) => {
        var _a3;
        return (_a3 = cs.js) == null ? void 0 : _a3.includes(js);
      });
      const hasCss = (_b2 = contentScript.css) == null ? void 0 : _b2.find((css) => {
        var _a3;
        return (_a3 = cs.css) == null ? void 0 : _a3.includes(css);
      });
      return hasJs || hasCss;
    });
    if (matches.length === 0) {
      logger.log(
        "Content script is not registered yet, nothing to reload",
        contentScript
      );
      return;
    }
    await browser.scripting.updateContentScripts(matches);
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadTabsForContentScript(contentScript) {
    const allTabs = await browser.tabs.query({});
    const matchPatterns = contentScript.matches.map(
      (match) => new MatchPattern(match)
    );
    const matchingTabs = allTabs.filter((tab) => {
      const url = tab.url;
      if (!url) return false;
      return !!matchPatterns.find((pattern) => pattern.includes(url));
    });
    await Promise.all(
      matchingTabs.map(async (tab) => {
        try {
          await browser.tabs.reload(tab.id);
        } catch (err) {
          logger.warn("Failed to reload tab:", err);
        }
      })
    );
  }
  async function reloadContentScriptMv2(_payload) {
    throw Error("TODO: reloadContentScriptMv2");
  }
  {
    try {
      const ws2 = getDevServerWebSocket();
      ws2.addWxtEventListener("wxt:reload-extension", () => {
        browser.runtime.reload();
      });
      ws2.addWxtEventListener("wxt:reload-content-script", (event) => {
        reloadContentScript(event.detail);
      });
      if (true) {
        ws2.addEventListener(
          "open",
          () => ws2.sendCustom("wxt:background-initialized")
        );
        keepServiceWorkerAlive();
      }
    } catch (err) {
      logger.error("Failed to setup web socket connection with dev server", err);
    }
    browser.commands.onCommand.addListener((command) => {
      if (command === "wxt:reload-extension") {
        browser.runtime.reload();
      }
    });
  }
  let result;
  try {
    initPlugins();
    result = definition.main();
    if (result instanceof Promise) {
      console.warn(
        "The background's main() function return a promise, but it must be synchronous"
      );
    }
  } catch (err) {
    logger.error("The background crashed on startup!");
    throw err;
  }
  const result$1 = result;
  return result$1;
}();
background;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1iYWNrZ3JvdW5kLm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Ad3h0LWRldi9icm93c2VyL3NyYy9pbmRleC5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvYnJvd3Nlci5tanMiLCIuLi8uLi9zcmMvdXRpbHMvYmFja2dyb3VuZExpc3RlbmVycy50cyIsIi4uLy4uL3NyYy9zZXJ2aWNlcy9hdXRoZW50aWNhdGlvbi50cyIsIi4uLy4uL3NyYy9lbnRyeXBvaW50cy9iYWNrZ3JvdW5kLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0B3ZWJleHQtY29yZS9tYXRjaC1wYXR0ZXJucy9saWIvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUJhY2tncm91bmQoYXJnKSB7XG4gIGlmIChhcmcgPT0gbnVsbCB8fCB0eXBlb2YgYXJnID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB7IG1haW46IGFyZyB9O1xuICByZXR1cm4gYXJnO1xufVxuIiwiLy8gI3JlZ2lvbiBzbmlwcGV0XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IGdsb2JhbFRoaXMuYnJvd3Nlcj8ucnVudGltZT8uaWRcbiAgPyBnbG9iYWxUaGlzLmJyb3dzZXJcbiAgOiBnbG9iYWxUaGlzLmNocm9tZTtcbi8vICNlbmRyZWdpb24gc25pcHBldFxuIiwiaW1wb3J0IHsgYnJvd3NlciBhcyBfYnJvd3NlciB9IGZyb20gXCJAd3h0LWRldi9icm93c2VyXCI7XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IF9icm93c2VyO1xuZXhwb3J0IHt9O1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGxpc3RlblVwZGF0ZWRXZWxsZm91bmQodGFiSWQ6IG51bWJlciwgY2hhbmdlSW5mbzogYW55LCB0YWI6IGFueSkge1xuICAgXG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09PSAnY29tcGxldGUnICYmIHRhYi51cmw/LmluY2x1ZGVzKFwid2VsbGZvdW5kLmNvbS9qb2JzXCIpKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInRhYiBkZXRlY3RlZChvblVwZGF0ZWQpOlwiLCB0YWIudXJsLCB0YWJJZCk7XG4gICAgICAvLyBTZW5kIGEgbWVzc2FnZSB0byB0aGUgY29udGVudCBzY3JpcHQgaW4gdGhlIGN1cnJlbnQgdGFiXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyBtZXNzYWdlOiBcIlBhZ2VVcGRhdGVkV2VsbEZvdW5kXCIgfSwgYXN5bmMgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNZXNzYWdlIHNlbnQgdG8gY29udGVudCBzY3JpcHQnLCByZXNwb25zZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RlblVwZGF0ZWRJbnRlcm5zaGFsYSh0YWJJZDogbnVtYmVyLCBjaGFuZ2VJbmZvOiBhbnksIHRhYjogYW55KSB7XG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09PSAnY29tcGxldGUnICYmIHRhYi51cmw/LmluY2x1ZGVzKFwiaW50ZXJuc2hhbGEuY29tL2FwcGxpY2F0aW9uL2Zvcm1cIikpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidGFiIGRldGVjdGVkKG9uVXBkYXRlZCk6XCIsIHRhYi51cmwsIHRhYklkKTtcbiAgICAgIC8vIFNlbmQgYSBtZXNzYWdlIHRvIHRoZSBjb250ZW50IHNjcmlwdCBpbiB0aGUgY3VycmVudCB0YWJcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7IG1lc3NhZ2U6IFwiUGFnZVVwZGF0ZWRJbnRlcm5zaGFsYVwiIH0sIGFzeW5jIChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnTWVzc2FnZSBzZW50IHRvIGNvbnRlbnQgc2NyaXB0JywgcmVzcG9uc2UpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGxpc3RlblVwZGF0ZWRMaW5rZWRJbih0YWJJZDogbnVtYmVyLCBjaGFuZ2VJbmZvOiBhbnksIHRhYjogYW55KSB7XG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09PSAnY29tcGxldGUnICYmIHRhYi51cmw/LmluY2x1ZGVzKFwiaHR0cHM6Ly93d3cubGlua2VkaW4uY29tXCIpKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInRhYiBkZXRlY3RlZChvblVwZGF0ZWQpOlwiLCB0YWIudXJsLCB0YWJJZCk7XG4gICAgICAvLyBTZW5kIGEgbWVzc2FnZSB0byB0aGUgY29udGVudCBzY3JpcHQgaW4gdGhlIGN1cnJlbnQgdGFiXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyBtZXNzYWdlOiBcIlBhZ2VVcGRhdGVkTGlua2VkSW5cIiB9LCBhc3luYyAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ01lc3NhZ2Ugc2VudCB0byBjb250ZW50IHNjcmlwdCcsIHJlc3BvbnNlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuIiwiIGludGVyZmFjZSBNZXNzYWdlIHtcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgW2tleTogc3RyaW5nXTogYW55O1xuICB9XG4gIFxuICBleHBvcnQgZnVuY3Rpb24gZ29vZ2xlTG9naW4obWVzc2FnZTogTWVzc2FnZSwgc2VuZGVyOiBvYmplY3QsIHNlbmRSZXNwb25zZTogYW55KSB7XG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ0dPT0dMRV9MT0dJTicpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiaGkgM1wiKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlZGlyZWN0VXJpID0gY2hyb21lLmlkZW50aXR5LmdldFJlZGlyZWN0VVJMKCk7XG4gICAgICAgIGNvbnN0IENMSUVOVF9JRCA9IGltcG9ydC5tZXRhLmVudi5XWFRfR09PR0xFX0NMSUVOVF9JRDtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ0FjdHVhbCByZWRpcmVjdCBVUkk6JywgcmVkaXJlY3RVcmkpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnQ2xpZW50IElEIGJlaW5nIHVzZWQ6JywgQ0xJRU5UX0lEKTtcbiAgXG4gICAgICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBzdGF0ZSBhbmQgbm9uY2VcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMik7XG4gICAgICAgIGNvbnN0IG5vbmNlID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIpO1xuICBcbiAgICAgICAgY29uc3QgYXV0aFVybCA9IG5ldyBVUkwoJ2h0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi92Mi9hdXRoJyk7XG4gICAgICAgIGF1dGhVcmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnY2xpZW50X2lkJywgQ0xJRU5UX0lEKTtcbiAgICAgICAgYXV0aFVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdyZXNwb25zZV90eXBlJywgJ3Rva2VuIGlkX3Rva2VuJyk7XG4gICAgICAgIGF1dGhVcmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgncmVkaXJlY3RfdXJpJywgcmVkaXJlY3RVcmkpO1xuICAgICAgICBhdXRoVXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ3Njb3BlJywgJ29wZW5pZCBlbWFpbCBwcm9maWxlJyk7XG4gICAgICAgIGF1dGhVcmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnc3RhdGUnLCBzdGF0ZSk7XG4gICAgICAgIGF1dGhVcmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnbm9uY2UnLCBub25jZSk7XG4gICAgICAgIGF1dGhVcmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgncHJvbXB0JywgJ2NvbnNlbnQnKTsgLy8gQWRkIHByb21wdCBwYXJhbWV0ZXJcbiAgXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdGdWxsIGF1dGggVVJMOicsIGF1dGhVcmwudG9TdHJpbmcoKSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdFeHRlbnNpb24gSUQ6JywgY2hyb21lLnJ1bnRpbWUuaWQpOyAgLy8gTG9nIGV4dGVuc2lvbiBJRFxuICBcbiAgICAgICAgY2hyb21lLmlkZW50aXR5LmxhdW5jaFdlYkF1dGhGbG93KFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybDogYXV0aFVybC50b1N0cmluZygpLFxuICAgICAgICAgICAgaW50ZXJhY3RpdmU6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIChyZWRpcmVjdFVybCkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ1JlZGlyZWN0IFVSTCByZWNlaXZlZDonLCByZWRpcmVjdFVybCk7ICAvLyBMb2cgcmVkaXJlY3QgVVJMXG4gICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IGVycm9yOiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgfSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgXG4gICAgICAgICAgICBpZiAoIXJlZGlyZWN0VXJsKSB7XG4gICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IGVycm9yOiAnTm8gcmVkaXJlY3QgVVJMJyB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICBcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVkaXJlY3RVcmwpO1xuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh1cmwuaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgICAgICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSBwYXJhbXMuZ2V0KCdhY2Nlc3NfdG9rZW4nKTtcbiAgXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh1cmwsIHBhcmFtcyxhY2Nlc3NUb2tlbik7XG4gIFxuICAgICAgICAgICAgaWYgKCFhY2Nlc3NUb2tlbikge1xuICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBlcnJvcjogJ05vIGFjY2VzcyB0b2tlbicgfSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgXG4gICAgICAgICAgICAvLyBHZXQgdXNlciBpbmZvXG4gICAgICAgICAgICBmZXRjaCgnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YyL3VzZXJpbmZvJywge1xuICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7YWNjZXNzVG9rZW59YFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oYXN5bmMocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgbGV0IHVzZXIgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgdXNlcn0pO1xuICAgICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe21lc3NhZ2U6XCJMb2dpbiBTdWNjZXNzZnVsXCJ9KVxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRoIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gIFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IiwiaW1wb3J0IHtsaXN0ZW5VcGRhdGVkV2VsbGZvdW5kfSBmcm9tICcuLi91dGlscy9iYWNrZ3JvdW5kTGlzdGVuZXJzJ1xuaW1wb3J0IHsgZ29vZ2xlTG9naW4gfSBmcm9tICdAL3NlcnZpY2VzL2F1dGhlbnRpY2F0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQmFja2dyb3VuZChhc3luYyAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdIZWxsbyBmcm9tIGJhY2tncm91bmQhJywgeyBpZDogYnJvd3Nlci5ydW50aW1lLmlkIH0pO1xuXG4gIGNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkV4dGVuc2lvbiBJbnN0YWxsZWQhXCIpO1xuICB9KTtcbiAgLy8gTGlzdGVuIHRvIG5ldyB0YWIgdXBkYXRpb24gXG4gIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcihsaXN0ZW5VcGRhdGVkV2VsbGZvdW5kKTtcbiAgLy8gY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGxpc3RlblVwZGF0ZWRJbnRlcm5zaGFsYSk7XG4gIC8vIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcihsaXN0ZW5VcGRhdGVkTGlua2VkSW4pO1xuICAvLyBIYW5kbGUgdGFiIGNsb3N1cmVcbiAgY2hyb21lLnRhYnMub25SZW1vdmVkLmFkZExpc3RlbmVyKCh0YWJJZCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBUYWIgJHt0YWJJZH0gd2FzIGNsb3NlZC5gKTtcbiAgfSk7XG5cbiAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGdvb2dsZUxvZ2luKTtcbn0pO1xuXG4iLCIvLyBzcmMvaW5kZXgudHNcbnZhciBfTWF0Y2hQYXR0ZXJuID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihtYXRjaFBhdHRlcm4pIHtcbiAgICBpZiAobWF0Y2hQYXR0ZXJuID09PSBcIjxhbGxfdXJscz5cIikge1xuICAgICAgdGhpcy5pc0FsbFVybHMgPSB0cnVlO1xuICAgICAgdGhpcy5wcm90b2NvbE1hdGNoZXMgPSBbLi4uX01hdGNoUGF0dGVybi5QUk9UT0NPTFNdO1xuICAgICAgdGhpcy5ob3N0bmFtZU1hdGNoID0gXCIqXCI7XG4gICAgICB0aGlzLnBhdGhuYW1lTWF0Y2ggPSBcIipcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZ3JvdXBzID0gLyguKik6XFwvXFwvKC4qPykoXFwvLiopLy5leGVjKG1hdGNoUGF0dGVybik7XG4gICAgICBpZiAoZ3JvdXBzID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgXCJJbmNvcnJlY3QgZm9ybWF0XCIpO1xuICAgICAgY29uc3QgW18sIHByb3RvY29sLCBob3N0bmFtZSwgcGF0aG5hbWVdID0gZ3JvdXBzO1xuICAgICAgdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKTtcbiAgICAgIHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSk7XG4gICAgICB2YWxpZGF0ZVBhdGhuYW1lKG1hdGNoUGF0dGVybiwgcGF0aG5hbWUpO1xuICAgICAgdGhpcy5wcm90b2NvbE1hdGNoZXMgPSBwcm90b2NvbCA9PT0gXCIqXCIgPyBbXCJodHRwXCIsIFwiaHR0cHNcIl0gOiBbcHJvdG9jb2xdO1xuICAgICAgdGhpcy5ob3N0bmFtZU1hdGNoID0gaG9zdG5hbWU7XG4gICAgICB0aGlzLnBhdGhuYW1lTWF0Y2ggPSBwYXRobmFtZTtcbiAgICB9XG4gIH1cbiAgaW5jbHVkZXModXJsKSB7XG4gICAgaWYgKHRoaXMuaXNBbGxVcmxzKVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY29uc3QgdSA9IHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIgPyBuZXcgVVJMKHVybCkgOiB1cmwgaW5zdGFuY2VvZiBMb2NhdGlvbiA/IG5ldyBVUkwodXJsLmhyZWYpIDogdXJsO1xuICAgIHJldHVybiAhIXRoaXMucHJvdG9jb2xNYXRjaGVzLmZpbmQoKHByb3RvY29sKSA9PiB7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiaHR0cFwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0h0dHBNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJodHRwc1wiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0h0dHBzTWF0Y2godSk7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiZmlsZVwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0ZpbGVNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJmdHBcIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNGdHBNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJ1cm5cIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNVcm5NYXRjaCh1KTtcbiAgICB9KTtcbiAgfVxuICBpc0h0dHBNYXRjaCh1cmwpIHtcbiAgICByZXR1cm4gdXJsLnByb3RvY29sID09PSBcImh0dHA6XCIgJiYgdGhpcy5pc0hvc3RQYXRoTWF0Y2godXJsKTtcbiAgfVxuICBpc0h0dHBzTWF0Y2godXJsKSB7XG4gICAgcmV0dXJuIHVybC5wcm90b2NvbCA9PT0gXCJodHRwczpcIiAmJiB0aGlzLmlzSG9zdFBhdGhNYXRjaCh1cmwpO1xuICB9XG4gIGlzSG9zdFBhdGhNYXRjaCh1cmwpIHtcbiAgICBpZiAoIXRoaXMuaG9zdG5hbWVNYXRjaCB8fCAhdGhpcy5wYXRobmFtZU1hdGNoKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGhvc3RuYW1lTWF0Y2hSZWdleHMgPSBbXG4gICAgICB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gpLFxuICAgICAgdGhpcy5jb252ZXJ0UGF0dGVyblRvUmVnZXgodGhpcy5ob3N0bmFtZU1hdGNoLnJlcGxhY2UoL15cXCpcXC4vLCBcIlwiKSlcbiAgICBdO1xuICAgIGNvbnN0IHBhdGhuYW1lTWF0Y2hSZWdleCA9IHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMucGF0aG5hbWVNYXRjaCk7XG4gICAgcmV0dXJuICEhaG9zdG5hbWVNYXRjaFJlZ2V4cy5maW5kKChyZWdleCkgPT4gcmVnZXgudGVzdCh1cmwuaG9zdG5hbWUpKSAmJiBwYXRobmFtZU1hdGNoUmVnZXgudGVzdCh1cmwucGF0aG5hbWUpO1xuICB9XG4gIGlzRmlsZU1hdGNoKHVybCkge1xuICAgIHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmaWxlOi8vIHBhdHRlcm4gbWF0Y2hpbmcuIE9wZW4gYSBQUiB0byBhZGQgc3VwcG9ydFwiKTtcbiAgfVxuICBpc0Z0cE1hdGNoKHVybCkge1xuICAgIHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmdHA6Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuICB9XG4gIGlzVXJuTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IHVybjovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XG4gIH1cbiAgY29udmVydFBhdHRlcm5Ub1JlZ2V4KHBhdHRlcm4pIHtcbiAgICBjb25zdCBlc2NhcGVkID0gdGhpcy5lc2NhcGVGb3JSZWdleChwYXR0ZXJuKTtcbiAgICBjb25zdCBzdGFyc1JlcGxhY2VkID0gZXNjYXBlZC5yZXBsYWNlKC9cXFxcXFwqL2csIFwiLipcIik7XG4gICAgcmV0dXJuIFJlZ0V4cChgXiR7c3RhcnNSZXBsYWNlZH0kYCk7XG4gIH1cbiAgZXNjYXBlRm9yUmVnZXgoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7XG4gIH1cbn07XG52YXIgTWF0Y2hQYXR0ZXJuID0gX01hdGNoUGF0dGVybjtcbk1hdGNoUGF0dGVybi5QUk9UT0NPTFMgPSBbXCJodHRwXCIsIFwiaHR0cHNcIiwgXCJmaWxlXCIsIFwiZnRwXCIsIFwidXJuXCJdO1xudmFyIEludmFsaWRNYXRjaFBhdHRlcm4gPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWF0Y2hQYXR0ZXJuLCByZWFzb24pIHtcbiAgICBzdXBlcihgSW52YWxpZCBtYXRjaCBwYXR0ZXJuIFwiJHttYXRjaFBhdHRlcm59XCI6ICR7cmVhc29ufWApO1xuICB9XG59O1xuZnVuY3Rpb24gdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKSB7XG4gIGlmICghTWF0Y2hQYXR0ZXJuLlBST1RPQ09MUy5pbmNsdWRlcyhwcm90b2NvbCkgJiYgcHJvdG9jb2wgIT09IFwiKlwiKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKFxuICAgICAgbWF0Y2hQYXR0ZXJuLFxuICAgICAgYCR7cHJvdG9jb2x9IG5vdCBhIHZhbGlkIHByb3RvY29sICgke01hdGNoUGF0dGVybi5QUk9UT0NPTFMuam9pbihcIiwgXCIpfSlgXG4gICAgKTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSkge1xuICBpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCI6XCIpKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgYEhvc3RuYW1lIGNhbm5vdCBpbmNsdWRlIGEgcG9ydGApO1xuICBpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCIqXCIpICYmIGhvc3RuYW1lLmxlbmd0aCA+IDEgJiYgIWhvc3RuYW1lLnN0YXJ0c1dpdGgoXCIqLlwiKSlcbiAgICB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihcbiAgICAgIG1hdGNoUGF0dGVybixcbiAgICAgIGBJZiB1c2luZyBhIHdpbGRjYXJkICgqKSwgaXQgbXVzdCBnbyBhdCB0aGUgc3RhcnQgb2YgdGhlIGhvc3RuYW1lYFxuICAgICk7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZVBhdGhuYW1lKG1hdGNoUGF0dGVybiwgcGF0aG5hbWUpIHtcbiAgcmV0dXJuO1xufVxuZXhwb3J0IHtcbiAgSW52YWxpZE1hdGNoUGF0dGVybixcbiAgTWF0Y2hQYXR0ZXJuXG59O1xuIl0sIm5hbWVzIjpbImJyb3dzZXIiLCJfYnJvd3NlciIsIl9hIl0sIm1hcHBpbmdzIjoiOzs7QUFBTyxXQUFTLGlCQUFpQixLQUFLO0FBQ3BDLFFBQUksT0FBTyxRQUFRLE9BQU8sUUFBUSxXQUFZLFFBQU8sRUFBRSxNQUFNLElBQUc7QUFDaEUsV0FBTztBQUFBLEVBQ1Q7QUNGTyxRQUFNQSxjQUFVLHNCQUFXLFlBQVgsbUJBQW9CLFlBQXBCLG1CQUE2QixNQUNoRCxXQUFXLFVBQ1gsV0FBVztBQ0ZSLFFBQU0sVUFBVUM7QUNEaEIsV0FBUyx1QkFBdUIsT0FBZSxZQUFpQixLQUFVOztBQUU3RSxRQUFJLFdBQVcsV0FBVyxnQkFBY0MsTUFBQSxJQUFJLFFBQUosZ0JBQUFBLElBQVMsU0FBUyx3QkFBdUI7QUFDL0UsY0FBUSxJQUFJLDRCQUE0QixJQUFJLEtBQUssS0FBSztBQUV0RCxhQUFPLEtBQUssWUFBWSxPQUFPLEVBQUUsU0FBUyx1QkFBQSxHQUEwQixPQUFPLGFBQWE7QUFDdEYsZ0JBQVEsSUFBSSxrQ0FBa0MsUUFBUTtBQUFBLE1BQ3hELENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjs7QUNKTyxXQUFTLFlBQVksU0FBa0IsUUFBZ0IsY0FBbUI7QUFDL0UsUUFBSSxRQUFRLFNBQVMsZ0JBQWdCO0FBRW5DLFVBQUk7QUFDRixjQUFNLGNBQWMsT0FBTyxTQUFTLGVBQUE7QUFDcEMsY0FBTSxZQUFZO0FBS2xCLGNBQU0sUUFBUSxLQUFLLE9BQUEsRUFBUyxTQUFTLEVBQUUsRUFBRSxVQUFVLENBQUM7QUFDcEQsY0FBTSxRQUFRLEtBQUssT0FBQSxFQUFTLFNBQVMsRUFBRSxFQUFFLFVBQVUsQ0FBQztBQUVwRCxjQUFNLFVBQVUsSUFBSSxJQUFJLDhDQUE4QztBQUN0RSxnQkFBUSxhQUFhLE9BQU8sYUFBYSxTQUFTO0FBQ2xELGdCQUFRLGFBQWEsT0FBTyxpQkFBaUIsZ0JBQWdCO0FBQzdELGdCQUFRLGFBQWEsT0FBTyxn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V0FBVyxLQUFLO0FBQ2QsWUFBTSxNQUFNLG9FQUFvRTtBQUFBLElBQ2xGO0FBQUEsSUFDQSxXQUFXLEtBQUs7QUFDZCxZQUFNLE1BQU0sb0VBQW9FO0FBQUEsSUFDbEY7QUFBQSxJQUNBLHNCQUFzQixTQUFTO0FBQzdCLFlBQU0sVUFBVSxLQUFLLGVBQWUsT0FBTztBQUMzQyxZQUFNLGdCQUFnQixRQUFRLFFBQVEsU0FBUyxJQUFJO0FBQ25ELGFBQU8sT0FBTyxJQUFJLGFBQWEsR0FBRztBQUFBLElBQ3BDO0FBQUEsSUFDQSxlQUFlLFFBQVE7QUFDckIsYUFBTyxPQUFPLFFBQVEsdUJBQXVCLE1BQU07QUFBQSxJQUNyRDtBQUFBLEVBQ0Y7QUFDQSxNQUFJLGVBQWU7QUFDbkIsZUFBYSxZQUFZLENBQUMsUUFBUSxTQUFTLFFBQVEsT0FBTyxLQUFLO0FBQy9ELE1BQUksc0JBQXNCLGNBQWMsTUFBTTtBQUFBLElBQzVDLFlBQVksY0FBYyxRQUFRO0FBQ2hDLFlBQU0sMEJBQTBCLFlBQVksTUFBTSxNQUFNLEVBQUU7QUFBQSxJQUM1RDtBQUFBLEVBQ0Y7QUFDQSxXQUFTLGlCQUFpQixjQUFjLFVBQVU7QUFDaEQsUUFBSSxDQUFDLGFBQWEsVUFBVSxTQUFTLFFBQVEsS0FBSyxhQUFhO0FBQzdELFlBQU0sSUFBSTtBQUFBLFFBQ1I7QUFBQSxRQUNBLEdBQUcsUUFBUSwwQkFBMEIsYUFBYSxVQUFVLEtBQUssSUFBSSxDQUFDO0FBQUEsTUFDNUU7QUFBQSxFQUNBO0FBQ0EsV0FBUyxpQkFBaUIsY0FBYyxVQUFVO0FBQ2hELFFBQUksU0FBUyxTQUFTLEdBQUc7QUFDdkIsWUFBTSxJQUFJLG9CQUFvQixjQUFjLGdDQUFnQztBQUM5RSxRQUFJLFNBQVMsU0FBUyxHQUFHLEtBQUssU0FBUyxTQUFTLEtBQUssQ0FBQyxTQUFTLFdBQVcsSUFBSTtBQUM1RSxZQUFNLElBQUk7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLE1BQ047QUFBQSxFQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiw2XX0=
