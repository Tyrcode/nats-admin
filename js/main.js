import * as Nats from "https://cdn.jsdelivr.net/npm/nats.ws@1.30.3/esm/nats.js";
import { I18n } from "./translations.js";

const i18n = new I18n();

const MONITOR_URL_DEFAULT = "localhost:8222";
const NATS_HOST_DEFAULT = "localhost:8080";

const LS_NATS_HOST = "nats_host";
const LS_MONITOR_URL = "monitor_url";
const LS_PROTOCOL = "nats_protocol";
const LS_AUTH_METHOD = "nats_auth_method";
const LS_USERNAME = "nats_username";
const LS_TOKEN = "nats_token";
const LS_TOPICS = "subscribed_topics";
const LS_LAST_PAYLOAD = "last_publish_payload";
const LS_DARK_MODE = "dark_mode_enabled";

let nc = null;
let wsConnected = false;
let activeConnections = [];
let subscriptions = {};
let persistedTopics = [];
let currentTopic = null;
let monitorUrl = MONITOR_URL_DEFAULT;

const DB_NAME = "NATS_HISTORY";
const DB_VERSION = 1;
const STORE_NAME = "messages";
let db = null;

const publicEventContainer = document.getElementById("publicEventContainer");
const subscribeEventContainer = document.getElementById(
  "subscribeEventContainer"
);
const connectBtn = document.getElementById("connectBtn");
const publishBtn = document.getElementById("publishBtn");
const natsUrlInput = document.getElementById("natsUrl");
const publishSubjectInput = document.getElementById("publishSubject");
const publishPayloadInput = document.getElementById("publishPayload");
const subscribeSubjectInput = document.getElementById("subscribeSubject");
const subscribeBtn = document.getElementById("subscribeBtn");
const activeSubscriptionsDiv = document.getElementById("activeSubscriptions");
const statusDot = document.getElementById("statusDot");
const connectionStatus = document.getElementById("connectionStatus");
const logConsole = document.getElementById("logConsole");
const connectionsCount = document.getElementById("connectionsCount");
const streamsCount = document.getElementById("streamsCount");
const showDetailsBtn = document.getElementById("showDetailsBtn");
const connectionDetailsContainer = document.getElementById(
  "connectionDetailsContainer"
);
const connectionList = document.getElementById("connectionList");
const messagesHistoryTableBody = document.getElementById(
  "messagesHistoryTableBody"
);
const selectedTopicName = document.getElementById("selectedTopicName");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const modalPayloadContent = document.getElementById("modalPayloadContent");
const payloadModal = document.getElementById("payloadModal");
const topicSelector = document.getElementById("topicSelector");
const subscribedTopicsDatalist = document.getElementById(
  "subscribedTopicsDatalist"
);
const formatJsonBtn = document.getElementById("formatJsonBtn");
const payloadErrorMsg = document.getElementById("payloadErrorMsg");
const copyPayloadBtn = document.getElementById("copyPayloadBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const iconLight = darkModeToggle
  ? darkModeToggle.querySelector(".icon-light")
  : null;
const iconDark = darkModeToggle
  ? darkModeToggle.querySelector(".icon-dark")
  : null;
const protocolSelect = document.getElementById("protocolSelect");
const authInputsContainer = document.getElementById("authInputsContainer");
const userPassInputs = document.getElementById("userPassInputs");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const tokenInput = document.getElementById("tokenInput");
const tokenSecretInput = document.getElementById("tokenSecretInput");
const authRadios = document.querySelectorAll('input[name="authMethod"]');
const languageSelector = document.getElementById("languageSelector");
const monitorUrlInput = document.getElementById("monitorUrl");

function updateUILanguage() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translation = i18n.t(key);

    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      if (element.placeholder) {
        element.placeholder = translation;
      }
    } else {
      element.textContent = translation;
    }
  });

  if (publishSubjectInput) {
    publishSubjectInput.placeholder = i18n.t("topicPlaceholder");
  }
  if (subscribeSubjectInput) {
    subscribeSubjectInput.value = i18n.t("topicToSubscribe");
  }
  if (usernameInput) {
    usernameInput.placeholder = i18n.t("usernamePlaceholder");
  }
  if (passwordInput) {
    passwordInput.placeholder = i18n.t("passwordPlaceholder");
  }
  if (tokenSecretInput) {
    tokenSecretInput.placeholder = i18n.t("tokenPlaceholder");
  }
  if (publishPayloadInput) {
    publishPayloadInput.placeholder = i18n.t("payloadPlaceholder");
  }
  if (natsUrlInput) {
    natsUrlInput.placeholder = i18n.t("hostPortPlaceholder");
  }

  updateTopicSelector();

  updateSubscriptionsList();

  if (currentTopic) {
    renderMessageHistory(currentTopic);
  }

  if (wsConnected) {
    connectBtn.textContent = i18n.t("disconnectBtn");
  } else {
    connectBtn.textContent = i18n.t("connectBtn");
  }

  if (wsConnected) {
    connectionStatus.textContent = i18n.t("statusConnected");
  } else {
    connectionStatus.textContent = i18n.t("statusDisconnected");
  }

  if (showDetailsBtn) {
    const countElement = document.getElementById("detailsCount");
    if (countElement) {
      const count = countElement.textContent || "0";
      showDetailsBtn.innerHTML = `<span data-i18n="viewDetails">${i18n.t(
        "viewDetails"
      )}</span> (<span id="detailsCount">${count}</span>)`;
    }
  }
}

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  const p = document.createElement("p");
  p.className = "font-mono whitespace-pre-wrap";

  let color = "text-gray-400";
  let prefix = `[${type.toUpperCase()}]`;

  switch (type) {
    case "success":
      color = "text-green-400";
      prefix = `[OK]`;
      break;
    case "error":
      color = "text-red-400";
      prefix = `[ERROR]`;
      break;
    case "publish":
      color = "text-yellow-300";
      prefix = `[PUB]`;
      break;
    case "receive":
      color = "text-blue-300";
      prefix = `[SUB]`;
      break;
    case "warn":
      color = "text-orange-400";
      prefix = `[WARN]`;
      break;
    case "info":
    default:
      color = "text-gray-400";
      prefix = `[INFO]`;
      break;
  }

  p.innerHTML = `<span class="${color}">${timestamp} ${prefix}:</span> ${message}`;

  if (logConsole.children.length > 30) {
    logConsole.removeChild(logConsole.firstChild);
  }
  logConsole.appendChild(p);
  logConsole.scrollTop = logConsole.scrollHeight;
}

function updateConnectionStatus(isConnected) {
  wsConnected = isConnected;
  if (isConnected) {
    statusDot.className = "status-dot bg-green-500";
    connectionStatus.className = "ml-1 text-green-700 font-bold";
    connectionStatus.textContent = i18n.t("statusConnected");
    connectBtn.textContent = i18n.t("disconnectBtn");
    connectBtn.classList.remove("bg-green-600", "hover:bg-green-700");
    connectBtn.classList.add("bg-red-500", "hover:bg-red-600");
    publishBtn.disabled = false;
    topicSelector.disabled = false;
    clearHistoryBtn.disabled = false;
    showDetailsBtn.disabled = false;
    subscribeBtn.disabled = false;
    protocolSelect.disabled = true;
    natsUrlInput.disabled = true;
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    tokenSecretInput.disabled = true;
    monitorUrlInput.disabled = true;

    publicEventContainer.classList.remove("hidden");
    subscribeEventContainer.classList.remove("hidden");
    authRadios.forEach((radio) => {
      radio.disabled = true;
    });

    persistedTopics.forEach((topic) => subscribeNATS(topic));
  } else {
    statusDot.className = "status-dot bg-red-500";
    connectionStatus.className = "ml-1 text-red-700 font-bold";
    connectionStatus.textContent = i18n.t("statusDisconnected");
    connectBtn.textContent = i18n.t("connectBtn");
    connectBtn.classList.remove("bg-red-500", "hover:bg-red-600");
    connectBtn.classList.add("bg-green-600", "hover:bg-green-700");
    publishBtn.disabled = true;
    topicSelector.disabled = true;
    clearHistoryBtn.disabled = true;
    showDetailsBtn.disabled = true;
    subscribeBtn.disabled = true;
    monitorUrlInput.disabled = false;
    natsUrlInput.disabled = false;
    protocolSelect.disabled = false;
    usernameInput.disabled = false;
    passwordInput.disabled = false;
    tokenSecretInput.disabled = false;
    authRadios.forEach((radio) => {
      radio.disabled = false;
    });
    connectionDetailsContainer.classList.add("hidden");
    publicEventContainer.classList.add("hidden");
    subscribeEventContainer.classList.add("hidden");
    Object.keys(subscriptions).forEach((sub) =>
      subscriptions[sub].unsubscribe()
    );
    subscriptions = {};
    updateSubscriptionsList();
  }
}

function getSelectedAuthMethod() {
  const selected = document.querySelector('input[name="authMethod"]:checked');

  if (!selected?.value || selected?.value == "none") {
    connectBtn.disabled = false;
    return "none";
  }

  if (
    selected?.value == "user_pass" &&
    (!usernameInput.value || !passwordInput.value)
  ) {
    connectBtn.disabled = true;
    return selected.value;
  }

  if (selected?.value == "token" && !tokenSecretInput.value) {
    connectBtn.disabled = true;
    return selected.value;
  }

  connectBtn.disabled = false;

  return selected ? selected.value : "none";
}

function saveConnectionConfig() {
  localStorage.setItem(LS_NATS_HOST, natsUrlInput.value);
  localStorage.setItem(LS_MONITOR_URL, monitorUrlInput.value);
  localStorage.setItem(LS_PROTOCOL, protocolSelect.value);
  localStorage.setItem(LS_AUTH_METHOD, getSelectedAuthMethod());
  localStorage.setItem(LS_USERNAME, usernameInput.value);
  localStorage.setItem(LS_TOKEN, tokenSecretInput.value);
}

function loadConnectionConfig() {
  natsUrlInput.value = localStorage.getItem(LS_NATS_HOST) || NATS_HOST_DEFAULT;
  monitorUrlInput.value =
    localStorage.getItem(LS_MONITOR_URL) || MONITOR_URL_DEFAULT;
  monitorUrl = monitorUrlInput.value;
  protocolSelect.value = localStorage.getItem(LS_PROTOCOL) || "ws";

  const loadedAuthMethod = localStorage.getItem(LS_AUTH_METHOD) || "none";
  const radioId = `auth-${loadedAuthMethod.replace("_", "-")}`;
  const radioInput = document.getElementById(radioId);

  if (radioInput) {
    radioInput.checked = true;
  } else {
    document.getElementById("auth-none").checked = true;
  }

  usernameInput.value = localStorage.getItem(LS_USERNAME) || "";
  tokenSecretInput.value = localStorage.getItem(LS_TOKEN) || "";

  handleAuthMethodChange();
}

function saveTopics() {
  localStorage.setItem(LS_TOPICS, JSON.stringify(persistedTopics));
}

function loadTopics() {
  try {
    const stored = localStorage.getItem(LS_TOPICS);
    persistedTopics = stored ? JSON.parse(stored) : [];
  } catch (e) {
    log("error", i18n.t("logLoadTopicsError"));
    persistedTopics = [];
  }
}

function saveLastPayload(payload) {
  localStorage.setItem(LS_LAST_PAYLOAD, payload);
}

function loadLastPayload() {
  return (
    localStorage.getItem(LS_LAST_PAYLOAD) ||
    '{\n  "contador": 1,\n  "mensaje": "Hola NATS v5"\n}'
  );
}

function saveDarkMode(isEnabled) {
  localStorage.setItem(LS_DARK_MODE, isEnabled ? "true" : "false");
}

function loadDarkMode() {
  const stored = localStorage.getItem(LS_DARK_MODE);
  if (stored === null) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return stored === "true";
}

function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.classList.toggle("dark");
  html.classList.toggle("light", !isDark);

  saveDarkMode(isDark);

  if (isDark) {
    iconLight.classList.add("hidden");
    iconDark.classList.remove("hidden");
  } else {
    iconLight.classList.remove("hidden");
    iconDark.classList.add("hidden");
  }
}

function handleAuthMethodChange() {
  const method = getSelectedAuthMethod();

  userPassInputs.classList.add("hidden");
  tokenInput.classList.add("hidden");
  authInputsContainer.classList.remove("open");

  if (method === "user_pass") {
    userPassInputs.classList.remove("hidden");
    authInputsContainer.classList.add("open");
  } else if (method === "token") {
    tokenInput.classList.remove("hidden");
    authInputsContainer.classList.add("open");
  }

  saveConnectionConfig();
}

function initDB() {
  return new Promise((resolve, reject) => {
    log("info", i18n.t("logInitDB"));
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      log("error", `${i18n.t("logDBError")} ${event.target.error}`);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      log("success", i18n.t("logDBReady"));
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("topic_idx", "topic", { unique: false });
      log("info", i18n.t("logDBUpdate"));
    };
  });
}

async function saveMessage(topic, payload) {
  if (!db) {
    return;
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const message = {
      topic,
      timestamp: new Date().toISOString(),
      payload: payload,
    };

    const request = store.add(message);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => {
      log("error", `${i18n.t("logSaveError")} ${event.target.error}`);
      reject(event.target.error);
    };
  });
}

async function getHistorialByTopic(topic) {
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("topic_idx");

    const request = index.getAll(topic);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function clearHistoryByTopic(topic) {
  if (!db) return;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("topic_idx");

    const request = index.openCursor(IDBKeyRange.only(topic), "next");

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        log("success", `${i18n.t("logClearSuccess")} ${topic}`);
        resolve();
      }
    };

    request.onerror = (event) => {
      log("error", `${i18n.t("logClearError")} ${event.target.error}`);
      reject(event.target.error);
    };
  });
}

async function connectNATS() {
  if (nc) {
    try {
      Object.keys(subscriptions).forEach((sub) =>
        subscriptions[sub].unsubscribe()
      );
      await nc.close();
      updateConnectionStatus(false);
      nc = null;
      log("info", i18n.t("logDisconnected"));
    } catch (e) {
      log("error", `${i18n.t("logDisconnectError")} ${e.message}`);
    }
    return;
  }

  const host = natsUrlInput.value.trim() || NATS_HOST_DEFAULT;
  const protocol = protocolSelect.value;
  const authMethod = getSelectedAuthMethod();

  saveConnectionConfig();

  const connectOptions = {
    servers: [`${protocol}://${host}`],
  };

  if (authMethod === "user_pass") {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    if (!user || !pass) {
      log("error", i18n.t("logAuthRequired"));
      return;
    }
    connectOptions.user = user;
    connectOptions.pass = pass;
    log("info", `${i18n.t("logUsingAuth")} ${user}`);
  } else if (authMethod === "token") {
    const token = tokenSecretInput.value.trim();
    if (!token) {
      log("error", i18n.t("logTokenRequired"));
      return;
    }
    if (token.includes(".")) {
      connectOptions.authenticator = Nats.jwtAuthenticator(token);
      log("info", i18n.t("logUsingJWT"));
    } else {
      connectOptions.token = token;
      log("info", i18n.t("logUsingToken"));
    }
  }

  if (protocol === "wss") {
    log("info", i18n.t("logUsingSecure"));
  }

  log("info", `${i18n.t("logConnecting")} ${natsUrl}...`);

  try {
    statusDot.className = "status-dot bg-yellow-500";
    connectionStatus.className = "ml-1 text-yellow-700 font-bold";
    connectionStatus.textContent = i18n.t("statusConnecting");

    nc = await Nats.connect(connectOptions);

    (async () => {
      for await (const status of nc.status()) {
        switch (status.type) {
          case "disconnect":
            log(
              "warn",
              `${i18n.t("logConnectionDisconnected")}: ${status.data}`
            );
            break;
          case "reconnect":
            log("info", `${i18n.t("logConnectionReconnecting")}...`);
            break;
          case "reconnecting":
            log(
              "info",
              `${i18n.t("logConnectionReconnectAttempt")} ${status.data}`
            );
            break;
          case "error":
            log(
              "error",
              `${i18n.t("logConnectionStatusError")}: ${status.data}`
            );
            if (status.data && typeof status.data === "object") {
              if (status.data.code) {
                log("error", `${i18n.t("logErrorCode")}: ${status.data.code}`);
              }
              if (status.data.message) {
                log(
                  "error",
                  `${i18n.t("logServerError")}: ${status.data.message}`
                );
              }
            }
            break;
        }
      }
    })();

    nc.closed().then((err) => {
      updateConnectionStatus(false);
      if (err) {
        log("error", `${i18n.t("logConnectionError")} ${err.message}`);
      } else {
        log("info", i18n.t("logConnectionClosed"));
      }
    });

    updateConnectionStatus(true);
    log("success", i18n.t("logConnectSuccess"));

    fetchMonitoringData();
    setInterval(fetchMonitoringData, 5000);

    if (persistedTopics.length > 0) {
      const topicsToSubscribe = [...persistedTopics];
      const subscriptionPromises = topicsToSubscribe.map((topic) =>
        subscribeNATS(topic)
      );
      const results = await Promise.allSettled(subscriptionPromises);

      const successful = results.filter(
        (r) => r.status === "fulfilled" && r.value === true
      ).length;
      const failed = results.filter(
        (r) => r.status === "rejected" || r.value === false
      ).length;

      if (failed > 0) {
        log(
          "warn",
          `${i18n.t("logSubscriptionSummary")}: ${successful} ${i18n.t(
            "logSuccessful"
          )}, ${failed} ${i18n.t("logFailed")}`
        );
      }
    }
  } catch (e) {
    console.error(e);
    updateConnectionStatus(false);
    log(
      "error",
      `${i18n.t("logConnectError")} ${e.message}. ${i18n.t("logEnsureServer")}`
    );
  }
}

async function copyPayloadToClipboard() {
  const text = modalPayloadContent.textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast(i18n.t("toastCopied"), "success");
    document.getElementById("payloadModal").classList.add("hidden");
    document.getElementById("payloadModal").classList.remove("flex");
  } catch (err) {
    log("error", i18n.t("logCopyError"));
    showToast(`❌ ${i18n.t("logCopyError")}`, "error");
  }
}

function validateAndFormatJson(text) {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return null;
  }
}

// TODO Check not to save the topic when it does not have permissions.
async function publishMessage(subject, payload) {
  const pubSubject = subject || publishSubjectInput.value.trim();
  const rawPayload = payload || publishPayloadInput.value.trim();

  if (!nc || !wsConnected) {
    log("error", i18n.t("logNotConnected"));
    return;
  }
  if (!pubSubject) {
    log("error", i18n.t("logEmptyTopic"));
    return;
  }

  let finalPayload = rawPayload;
  const formattedJson = validateAndFormatJson(rawPayload);

  if (formattedJson !== null) {
    finalPayload = formattedJson;
    saveLastPayload(finalPayload);
    publishPayloadInput.classList.remove("payload-error");
    payloadErrorMsg.classList.add("hidden");
  } else if (rawPayload.startsWith("{") || rawPayload.startsWith("[")) {
    log("error", i18n.t("logInvalidJson"));
    publishPayloadInput.classList.add("payload-error");
    payloadErrorMsg.classList.remove("hidden");
    payloadErrorMsg.textContent = i18n.t("jsonError");
    return;
  } else {
    log("warn", i18n.t("logPlainText"));
    publishPayloadInput.classList.remove("payload-error");
    payloadErrorMsg.classList.add("hidden");
  }

  try {
    const sc = Nats.StringCodec();
    const data = sc.encode(finalPayload);

    await nc.publish(pubSubject, data);
    await nc.flush();

    log(
      "publish",
      `${i18n.t("logPublished")} [${pubSubject}]: ${rawPayload.substring(
        0,
        50
      )}...`
    );

    if (!persistedTopics.includes(pubSubject)) {
      // addTopicToPersistence(pubSubject);
    }
  } catch (e) {
    log("error", `${i18n.t("logPublishError")} [${pubSubject}]: ${e.message}`);

    if (e.code) {
      log("error", `${i18n.t("logErrorCode")}: ${e.code}`);
    }
    if (e.chainedError) {
      log("error", `${i18n.t("logServerError")}: ${e.chainedError}`);
    }

    showToast(`❌ ${i18n.t("logPublishError")} ${e.message}`, "error");
  }
}

function handleFormatJson() {
  const rawText = publishPayloadInput.value.trim();
  const formattedJson = validateAndFormatJson(rawText);

  if (formattedJson !== null) {
    publishPayloadInput.value = formattedJson;
    publishPayloadInput.classList.remove("payload-error");
    payloadErrorMsg.classList.add("hidden");
  } else {
    publishPayloadInput.classList.add("payload-error");
    payloadErrorMsg.classList.remove("hidden");
    payloadErrorMsg.textContent = `${i18n.t("jsonError")} ${i18n.t(
      "logFormatError"
    )}`;
  }
}

function addTopicToPersistence(subject) {
  if (!persistedTopics.includes(subject)) {
    persistedTopics.push(subject);
    persistedTopics.sort();
    saveTopics();
    updateSubscriptionsList();
    updateTopicSelector();
    updateDatalist();
  }
}

function removeTopicFromPersistence(subject) {
  persistedTopics = persistedTopics.filter((t) => t !== subject);
  saveTopics();
  updateSubscriptionsList();
  updateTopicSelector();
  updateDatalist();
}

async function subscribeToTopic() {
  const subject = subscribeSubjectInput.value.trim();
  if (!subject) {
    log("error", i18n.t("logEmptySubscribe"));
    return;
  }

  if (persistedTopics.includes(subject)) {
    log("warn", `${i18n.t("logTopicExists")} [${subject}]`);
    if (wsConnected && !subscriptions[subject]) {
      await subscribeNATS(subject);
    }
    return;
  }

  if (wsConnected) {
    const success = await subscribeNATS(subject);
    if (success && persistedTopics.includes(subject)) {
      topicSelector.value = subject;
      handleTopicSelection(subject);
    }
  } else {
    addTopicToPersistence(subject);
    topicSelector.value = subject;
    handleTopicSelection(subject);
  }
}

async function subscribeNATS(subject) {
  if (!nc || !wsConnected) {
    return false;
  }
  if (subscriptions[subject]) return true;

  try {
    const sub = nc.subscribe(subject);
    const sc = Nats.StringCodec();

    subscriptions[subject] = sub;

    if (!persistedTopics.includes(subject)) {
      addTopicToPersistence(subject);
    }

    updateSubscriptionsList();
    log("success", `${i18n.t("logSubscribed")} [${subject}]`);

    (async () => {
      try {
        for await (const m of sub) {
          const payload = sc.decode(m.data);
          log("receive", `[${m.subject}]: ${payload.substring(0, 50)}...`);

          await saveMessage(m.subject, payload);

          if (currentTopic === m.subject) {
            renderMessageHistory(m.subject);
          }
        }
      } catch (err) {
        if (
          err.code === "PERMISSIONS_VIOLATION" ||
          err.message.includes("permissions")
        ) {
          log(
            "error",
            `${i18n.t("logPermissionError")} [${subject}]: ${err.message}`
          );
          showToast(`❌ ${i18n.t("logPermissionError")} [${subject}]`, "error");
        } else {
          log(
            "error",
            `${i18n.t("logSubscriptionStreamError")} [${subject}]: ${
              err.message
            }`
          );
        }

        if (err.code) {
          log("error", `${i18n.t("logErrorCode")}: ${err.code}`);
        }
        if (err.chainedError) {
          log("error", `${i18n.t("logServerError")}: ${err.chainedError}`);
        }

        if (subscriptions[subject]) {
          try {
            subscriptions[subject].unsubscribe();
          } catch (unsubErr) {}
          delete subscriptions[subject];
          removeTopicFromPersistence(subject);
          updateSubscriptionsList();
        }
      }
    })();
  } catch (e) {
    log("error", `${i18n.t("logSubscribeError")} [${subject}]: ${e.message}`);

    if (
      e.code === "PERMISSIONS_VIOLATION" ||
      e.message.includes("permissions")
    ) {
      log("error", `${i18n.t("logPermissionError")} [${subject}]`);
      showToast(`❌ ${i18n.t("logPermissionError")} [${subject}]`, "error");
    }

    if (e.code) {
      log("error", `${i18n.t("logErrorCode")}: ${e.code}`);
    }
    if (e.chainedError) {
      log("error", `${i18n.t("logServerError")}: ${e.chainedError}`);
    }

    if (subscriptions[subject]) {
      delete subscriptions[subject];
      updateSubscriptionsList();
    }

    return false;
  }
  return true;
}

function unsubscribe(subject) {
  if (subscriptions[subject]) {
    subscriptions[subject].unsubscribe();
    delete subscriptions[subject];
    log("info", `${i18n.t("logUnsubscribed")} [${subject}]`);
  }
  removeTopicFromPersistence(subject);

  if (currentTopic === subject) {
    currentTopic = null;
    selectedTopicName.textContent = i18n.t("noTopicSelected");
    messagesHistoryTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center italic">${i18n.t(
      "topicRemoved"
    )}</td></tr>`;
    clearHistoryBtn.disabled = true;
  }
}

function updateSubscriptionsList() {
  if (persistedTopics.length === 0) {
    activeSubscriptionsDiv.innerHTML = `<p class="text-sm italic p-2">${i18n.t(
      "noTopics"
    )}</p>`;
    return;
  }

  activeSubscriptionsDiv.innerHTML = persistedTopics
    .map((s) => {
      const isActive = subscriptions[s] ? true : false;
      const statusClass = isActive
        ? "topic-active"
        : "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
      const statusText = isActive
        ? i18n.t("statusActive")
        : i18n.t("statusInactive");
      const statusDotColor = isActive ? "bg-green-500" : "bg-red-500";

      return `
        <div class="flex items-center justify-between p-2 rounded-lg ${statusClass} shadow-sm">
            <div class="flex items-center cursor-pointer w-4/5" onclick="window.handleTopicSelection('${s}'); document.getElementById('topicSelector').value = '${s}';">
                <span class="status-dot ${statusDotColor}"></span>
                <span class="font-semibold truncate" title="${i18n.t(
                  "topic"
                )}: ${s}">${s}</span>
                <span class="ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "bg-gray-400 text-white"
                }">${statusText}</span>
            </div>
            <button onclick="window.unsubscribe('${s}')" class="text-xl text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition duration-150" title="${i18n.t(
        "removeSubscription"
      )}">
                &times;
            </button>
        </div>
      `;
    })
    .join("");
}

function updateTopicSelector() {
  const selectedValue = topicSelector.value;

  topicSelector.innerHTML = `<option value="" disabled selected>--- ${i18n.t(
    "subscribedTopics"
  )}</option>`;

  if (persistedTopics.length > 0) {
    persistedTopics.forEach((topic) => {
      const option = document.createElement("option");
      option.value = topic;
      option.textContent = topic;
      topicSelector.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = i18n.t("noSavedTopics");
    option.disabled = true;
    topicSelector.appendChild(option);
  }

  if (persistedTopics.includes(selectedValue)) {
    topicSelector.value = selectedValue;
  } else if (persistedTopics.length > 0 && !selectedValue) {
    if (currentTopic === persistedTopics[0]) {
      topicSelector.value = persistedTopics[0];
      handleTopicSelection(persistedTopics[0]);
    } else {
      topicSelector.value = "";
      handleTopicSelection("");
    }
  } else {
    handleTopicSelection("");
  }

  if (currentTopic && currentTopic === topicSelector.value) {
    handleTopicSelection(currentTopic);
  }
}

function handleTopicSelection(topic) {
  if (topic) {
    loadHistory(topic);
  } else {
    currentTopic = null;
    selectedTopicName.textContent = i18n.t("noTopicSelected");
    messagesHistoryTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center italic">${i18n.t(
      "selectTopicPrompt"
    )}</td></tr>`;
    clearHistoryBtn.disabled = true;
  }
}

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  const toastMessage = document.getElementById("toastMessage");
  const mainToast = document.getElementById("mainToast");

  if (toastContainer && toastMessage && mainToast) {
    toastMessage.textContent = message;

    mainToast.classList.remove(
      "bg-indigo-600",
      "bg-red-600",
      "bg-green-600",
      "bg-yellow-600"
    );
    switch (type) {
      case "error":
        mainToast.classList.add("bg-red-600");
        break;
      case "success":
        mainToast.classList.add("bg-green-600");
        break;
      case "warning":
        mainToast.classList.add("bg-yellow-600");
        break;
      case "info":
      default:
        mainToast.classList.add("bg-indigo-600");
        break;
    }

    toastContainer.classList.remove("opacity-0", "pointer-events-none");
    toastContainer.classList.add("opacity-100");

    mainToast.classList.remove("scale-95");
    mainToast.classList.add("scale-100");

    setTimeout(() => {
      mainToast.classList.remove("scale-100");
      mainToast.classList.add("scale-95");

      toastContainer.classList.remove("opacity-100");
      toastContainer.classList.add("opacity-0", "pointer-events-none");
    }, 4000);
  }
}

function updateDatalist() {
  subscribedTopicsDatalist.innerHTML = "";
  persistedTopics.forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    subscribedTopicsDatalist.appendChild(option);
  });
}

async function loadHistory(topic) {
  currentTopic = topic;
  selectedTopicName.textContent = topic;
  clearHistoryBtn.disabled = false;

  await renderMessageHistory(topic);
}

async function renderMessageHistory(topic) {
  const loadingMessage = document.documentElement.classList.contains("dark")
    ? `<td colspan="4" class="px-6 py-4 text-center text-blue-400 font-medium">${i18n.t(
        "loadingHistory"
      )}</td>`
    : `<td colspan="4" class="px-6 py-4 text-center text-blue-500 font-medium">${i18n.t(
        "loadingHistory"
      )}</td>`;
  messagesHistoryTableBody.innerHTML = `<tr>${loadingMessage}</tr>`;

  const history = await getHistorialByTopic(topic);

  if (history.length === 0) {
    messagesHistoryTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center italic">${i18n.t(
      "noMessages"
    )}</td></tr>`;
    return;
  }

  const rows = history
    .reverse()
    .map((msg) => {
      const date = new Date(msg.timestamp).toLocaleString();

      let payloadPreview;
      try {
        const parsed = JSON.parse(msg.payload);
        payloadPreview = JSON.stringify(parsed);
      } catch (e) {
        payloadPreview = msg.payload;
      }

      payloadPreview =
        payloadPreview.length > 60
          ? payloadPreview.substring(0, 57) + "..."
          : payloadPreview;

      return `
                <tr id="msg-${
                  msg.id
                }" class="transition duration-75 hover:bg-blue-50 dark:hover:bg-gray-700">
                    <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${
                      msg.id
                    }</td>
                    <td class="px-6 py-2 whitespace-nowrap text-sm">${date}</td>
                    <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 font-mono">${payloadPreview}</td>
                    <td class="px-6 py-2 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onclick="window.inspectPayload(${
                          msg.id
                        }, '${topic}')" class="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 text-md py-1 px-2">${i18n.t(
        "actionInspect"
      )}</button>
                        <button onclick="window.resendMessage(${
                          msg.id
                        }, '${topic}')" class="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 text-md py-1 px-2">${i18n.t(
        "actionResend"
      )}</button>
                    </td>
                </tr>
            `;
    })
    .join("");

  messagesHistoryTableBody.innerHTML = rows;
}

async function inspectPayload(id, topic) {
  const history = await getHistorialByTopic(topic);
  const message = history.find((m) => m.id === id);

  if (message) {
    let formattedPayload;
    try {
      const parsed = JSON.parse(message.payload);
      formattedPayload = JSON.stringify(parsed, null, 2);
    } catch (e) {
      formattedPayload = message.payload;
    }

    modalPayloadContent.textContent = formattedPayload;

    hljs.highlightElement(modalPayloadContent);

    payloadModal.classList.remove("hidden");
    payloadModal.classList.add("flex");
  } else {
    log("error", `${i18n.t("logMessageNotFound")} ${id}`);
  }
}

async function resendMessage(id, topic) {
  const history = await getHistorialByTopic(topic);
  const message = history.find((m) => m.id === id);

  if (message) {
    log("info", `${i18n.t("logResending")} ${id} - ${topic}...`);
    await publishMessage(topic, message.payload);
  } else {
    log("error", `${i18n.t("logResendError")} ${id}}`);
  }
}

async function clearCurrentTopicHistory() {
  if (confirm(`${i18n.t("confirmClearHistory")} "${currentTopic}"`)) {
    await clearHistoryByTopic(currentTopic);
    await renderMessageHistory(currentTopic);
  }
}

async function fetchMonitoringData() {
  if (!wsConnected) {
    connectionsCount.textContent = "N/A";
    streamsCount.textContent = "N/A";
    return;
  }

  try {
    const connzResponse = await fetch(`http://${monitorUrl}/connz`);
    if (!connzResponse.ok) throw new Error(`Status: ${connzResponse.status}`);

    const connzData = await connzResponse.json();

    connectionsCount.textContent = connzData.num_connections;
    showDetailsBtn.textContent = `Ver Detalles (${connzData.num_connections})`;
    showDetailsBtn.disabled = connzData.num_connections === 0;

    activeConnections = connzData.connections || [];

    try {
      const jszResponse = await fetch(`http://${monitorUrl}/jsz?streams=true`);
      if (!jszResponse.ok) throw new Error(`Status: ${jszResponse.status}`);
      const jszData = await jszResponse.json();

      const numStreams = jszData.streams ? jszData.streams.length : 0;
      streamsCount.textContent = numStreams;
    } catch (e) {
      streamsCount.textContent = "0 (JS Error)";
    }
  } catch (e) {
    if (nc) {
      log(
        "error",
        `${i18n.t("logMonitorError")} ${monitorUrl} ${i18n.t(
          "logCorsError"
        )}. ${e.message}`
      );
    }
    connectionsCount.textContent = "Error HTTP";
    streamsCount.textContent = "Error HTTP";
  }

  if (!connectionDetailsContainer.classList.contains("hidden")) {
    renderConnectionDetails();
  }
}

function renderConnectionDetails() {
  if (activeConnections.length === 0) {
    connectionList.innerHTML = `<p class=italic">${i18n.t(
      "noActiveConnections"
    )}</p>`;
    return;
  }

  let html = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">${i18n.t(
                          "connectionId"
                        )}</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">${i18n.t(
                          "connectionName"
                        )}</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">${i18n.t(
                          "connectionLang"
                        )}</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">${i18n.t(
                          "connectionGroup"
                        )}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
        `;

  activeConnections.forEach((conn) => {
    const connName = conn.name || "N/A";
    const connLang = conn.lang || "N/A";
    const connCid = conn.cid || "N/A";
    const connGroupId = conn.group || "N/A";

    html += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${connCid}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${connName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${connLang}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${connGroupId}</td>
                </tr>
            `;
  });

  html += `
                </tbody>
            </table>
        `;

  connectionList.innerHTML = html;
}

function toggleConnectionDetails() {
  connectionDetailsContainer.classList.toggle("hidden");
  if (!connectionDetailsContainer.classList.contains("hidden")) {
    renderConnectionDetails();
  }
}

if (connectBtn) connectBtn.addEventListener("click", connectNATS);
if (publishBtn) publishBtn.addEventListener("click", () => publishMessage());
if (showDetailsBtn)
  showDetailsBtn.addEventListener("click", toggleConnectionDetails);
if (subscribeBtn) subscribeBtn.addEventListener("click", subscribeToTopic);
if (clearHistoryBtn)
  clearHistoryBtn.addEventListener("click", clearCurrentTopicHistory);
if (formatJsonBtn) formatJsonBtn.addEventListener("click", handleFormatJson);

if (copyPayloadBtn)
  copyPayloadBtn.addEventListener("click", copyPayloadToClipboard);

if (darkModeToggle) darkModeToggle.addEventListener("click", toggleDarkMode);

if (authRadios) {
  authRadios.forEach((radio) => {
    radio.addEventListener("change", handleAuthMethodChange);
  });
}
if (protocolSelect)
  protocolSelect.addEventListener("change", saveConnectionConfig);
if (natsUrlInput) natsUrlInput.addEventListener("input", saveConnectionConfig);
if (usernameInput)
  usernameInput.addEventListener("input", saveConnectionConfig);
if (passwordInput)
  passwordInput.addEventListener("input", saveConnectionConfig);
if (tokenSecretInput)
  tokenSecretInput.addEventListener("input", saveConnectionConfig);
if (monitorUrlInput) {
  monitorUrlInput.addEventListener("input", () => {
    monitorUrl = monitorUrlInput.value.trim() || MONITOR_URL_DEFAULT;
    saveConnectionConfig();
    log("info", `${i18n.t("logMonitorUrlChanged")}: ${monitorUrl}`);
  });
}

if (publishPayloadInput) {
  publishPayloadInput.addEventListener("input", () => {
    const rawText = publishPayloadInput.value.trim();
    const formattedJson = validateAndFormatJson(rawText);

    if (rawText === "") {
      publishPayloadInput.classList.remove("payload-error");
      publishBtn.disabled = true;
      payloadErrorMsg.classList.add("hidden");
    } else if (formattedJson !== null) {
      publishPayloadInput.classList.remove("payload-error");
      publishBtn.disabled = false;
      payloadErrorMsg.classList.add("hidden");
    } else if (rawText.startsWith("{") || rawText.startsWith("[")) {
      publishPayloadInput.classList.add("payload-error");
      payloadErrorMsg.classList.remove("hidden");
      payloadErrorMsg.textContent = i18n.t("jsonError");
      publishBtn.disabled = true;
    } else {
      publishPayloadInput.classList.remove("payload-error");
      payloadErrorMsg.classList.add("hidden");
      publishBtn.disabled = false;
    }
  });
}

if (languageSelector) {
  languageSelector.value = i18n.getCurrentLanguage();

  languageSelector.addEventListener("change", (e) => {
    const newLang = e.target.value;
    i18n.setLanguage(newLang);
    updateUILanguage();
    log(
      "success",
      newLang === "es"
        ? "Idioma cambiado a Español"
        : "Language changed to English"
    );
  });
}

window.handleTopicSelection = handleTopicSelection;
window.loadHistory = loadHistory;
window.unsubscribe = unsubscribe;
window.inspectPayload = inspectPayload;
window.resendMessage = resendMessage;
window.toggleConnectionDetails = toggleConnectionDetails;

async function initialize() {
  const isDark = loadDarkMode();
  const html = document.documentElement;

  if (isDark) {
    html.classList.add("dark");
    if (iconLight) iconLight.classList.add("hidden");
    if (iconDark) iconDark.classList.remove("hidden");
  } else {
    html.classList.add("light");
    if (iconLight) iconLight.classList.remove("hidden");
    if (iconDark) iconDark.classList.add("hidden");
  }

  await initDB();

  loadConnectionConfig();
  loadTopics();
  publishPayloadInput.value = loadLastPayload();

  updateSubscriptionsList();
  updateTopicSelector();
  updateDatalist();

  const savedHost = localStorage.getItem(LS_NATS_HOST);
  if (savedHost && savedHost !== NATS_HOST_DEFAULT) {
    log(
      "info",
      `${i18n.t("logAutoConnect")}: ${savedHost}.${i18n.t(
        "logAutoConnectAttempt"
      )}`
    );
    await connectNATS();
  } else {
    log("info", i18n.t("logInterfaceReady"));
    updateConnectionStatus(false);
  }
}

initialize();

