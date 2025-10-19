// translations.js - Sistema de traducciones para NATS Admin Pro

export const translations = {
  es: {
    // Header
    appTitle: "NATS Admin Pro V1",
    brandName: "Tyrcode",
    lightMode: "☀️ Modo Claro",
    darkMode: "🌙 Modo Oscuro",

    // Connection Section
    connectionTitle: "Conexión y Estado",
    authMethodTitle: "Método de Autenticación",
    authNone: "🔓 Ninguno",
    authUserPass: "👤 User/Pass",
    authToken: "🔑 Token",
    username: "Usuario",
    password: "Contraseña",
    token: "Token (JWT o Secreto)",
    protocol: "Protocolo",
    hostPort: "Host y Puerto (Ej: localhost:8080)",
    hostPortPlaceholder: "Host:Puerto",
    monitorUrl: "URL de Monitoreo (Ej: localhost:8222)",
    connectBtn: "Conectar",
    disconnectBtn: "Desconectar",
    statusLabel: "Estado:",
    statusConnected: "Conectado",
    statusDisconnected: "Desconectado",
    statusConnecting: "Conectando...",
    logReady: "Estado: Listo. Cargando configuración guardada...",

    // Stats Cards
    activeConnections: "Conexiones Activas",
    monitoring: "Monitoreo",
    viewDetails: "Ver Detalles",
    totalStreams: "Streams Totales",
    jetstream: "JetStream",

    // Publish Section
    publishTitle: "Publicar Mensaje",
    topic: "Tópico (Subject)",
    topicPlaceholder: "mi.topico.ejemplo",
    payload: "Payload (JSON)",
    formatJson: "Formatear JSON",
    publishBtn: "🚀 Publicar",
    jsonError: "⚠️ Error de JSON: El payload no es un JSON válido.",
    jsonErrorIncomplete:
      "⚠️ Error de JSON: El payload no es un JSON válido o está incompleto.",

    // Subscribe Section
    subscribeTitle: "Suscripciones Locales",
    topicToSubscribe: "topico.a.suscribir",
    subscribeBtn: "+ Suscribir",
    loadingTopics: "Cargando tópicos guardados...",
    noTopics: "Aún no hay tópicos persistentes. Suscribe uno.",
    statusActive: "ACTIVO",
    statusInactive: "INACTIVO",
    removeSubscription: "Eliminar Suscripción Persistente y Desuscribir NATS",

    // Connection Details
    connectionDetailsTitle: "Detalles de Conexiones Activas",
    loadingDetails: "Cargando detalles...",
    noActiveConnections: "No hay conexiones activas que mostrar.",
    connectionId: "ID",
    connectionName: "Nombre (Name)",
    connectionLang: "Lenguaje (Lang)",
    connectionGroup: "ID de Grupo",

    // Message History
    historyTitle: "Historial de Mensajes",
    selectTopic: "Selecciona Tópico para Historial",
    subscribedTopics: "--- Tópicos Suscritos ---",
    clearHistory: "🗑️ Limpiar Historial del Tópico Seleccionado",
    currentTopic: "Tópico actual:",
    noTopicSelected: "Ninguno",
    selectTopicPrompt: "Selecciona un tópico de la lista.",
    noMessages:
      "No hay mensajes guardados en la base de datos para este tópico.",
    loadingHistory: "Cargando historial...",
    topicRemoved: "Tópico eliminado. Selecciona otro o suscribe uno nuevo.",
    noSavedTopics: "No hay tópicos guardados",
    noMessagesLoaded: "No hay mensajes cargados. Selecciona un tópico.",

    // Table Headers
    tableId: "ID",
    tableDateTime: "Fecha/Hora",
    tablePayload: "Payload (Vista Previa)",
    tableActions: "Acciones",
    actionInspect: "👁️ Inspeccionar",
    actionResend: "🔄 Reenviar",

    // Modal
    modalTitle: "Payload Completo",
    copyPayload: "Copiar Payload",
    closeModal: "Cerrar",

    // Toast Messages
    toastCopied: "✅ ¡Payload copiado al portapapeles!",

    // Log Messages
    logInitDB: "Inicializando IndexDB...",
    logDBReady: "IndexDB listo.",
    logDBError: "Fallo al abrir IndexDB:",
    logDBUpdate: "IndexDB actualizado.",
    logSaveError: "Fallo al guardar mensaje en DB:",
    logClearSuccess: "Historial limpiado para el tópico:",
    logClearError: "Fallo al limpiar historial en DB:",
    logDisconnected: "Desconectado de NATS.",
    logDisconnectError: "Error al intentar desconectar:",
    logConnecting: "Intentando conectar a",
    logConnectSuccess: "Conexión exitosa. Listo para publicar/suscribir.",
    logConnectError: "Fallo de conexión:",
    logEnsureServer:
      "Asegúrese de que el servidor NATS esté corriendo con la configuración correcta.",
    logNotConnected: "No estás conectado al servidor NATS.",
    logEmptyTopic: "El tópico no puede estar vacío.",
    logInvalidJson:
      "El payload ingresado NO es un JSON válido. Por favor, corrígelo o usa el botón Formatear.",
    logPlainText: "Publicando payload como texto plano.",
    logPublished: "Publicado en",
    logPublishError: "Error al publicar mensaje:",
    logReceived: "Recibido en",
    logSubscribed: "Suscrito (activo) al tópico",
    logSubscribeError: "Error al suscribirse a NATS",
    logUnsubscribed: "Desuscrito (NATS) de",
    logTopicExists: "El tópico ya está en la lista de persistencia.",
    logEmptySubscribe: "El tópico de suscripción no puede estar vacío.",
    logLoadTopicsError: "Error al cargar tópicos de LocalStorage.",
    logMonitorError: "Fallo al obtener datos de",
    logCorsError: "(CORS/Puerto 8222).",
    logResending: "Reenviando mensaje ID",
    logResendError: "Mensaje ID no encontrado para reenviar.",
    logInspectError: "Mensaje no encontrado para el tópico",
    logAuthRequired:
      "Usuario y Contraseña son requeridos para esta autenticación.",
    logTokenRequired: "Token Secreto/JWT es requerido para esta autenticación.",
    logUsingAuth: "Usando autenticación con Usuario:",
    logUsingJWT: "Usando autenticación con JWT.",
    logUsingToken: "Usando autenticación con Token Secreto.",
    logUsingSecure: "Conectando usando protocolo seguro (wss/TLS).",
    logConnectionClosed: "Conexión cerrada limpiamente.",
    logConnectionError: "Conexión cerrada con error:",
    logMessageNotFound: "Mensaje no encontrado para el tópico",
    logInterfaceReady:
      "Interfaz de NATS lista. Ingresa la configuración y conecta.",
    logAutoConnect: "Host NATS detectado:",
    logAutoConnectAttempt: "Intentando conexión automática...",
    logCopyError:
      "Fallo al intentar copiar el payload. Asegúrate de que tu navegador lo permita.",
    logFormatError: "No se puede formatear. No es un JSON válido.",
    logMonitorUrlChanged: "URL de monitoreo actualizada",
    logErrorCode: "Código de error",
    logServerError: "Error del servidor",
    logPermissionError: "Error de permisos - Acceso denegado al tópico",
    logSubscriptionStreamError: "Error en el stream de suscripción",
    logConnectionDisconnected: "Conexión desconectada",
    logConnectionReconnecting: "Reconectando al servidor",
    logConnectionReconnectAttempt: "Intento de reconexión",
    logConnectionStatusError: "Error de estado de conexión",
    logSubscriptionSummary: "Resumen de suscripciones",
    logSuccessful: "exitosas",
    logFailed: "fallidas",

    // Confirm Messages
    confirmClearHistory:
      "¿Estás seguro de que quieres borrar TODOS los mensajes guardados localmente para el tópico",
    confirmIrreversible: "Esta acción es irreversible.",

    // Placeholders
    usernamePlaceholder: "usuario NATS",
    passwordPlaceholder: "contraseña",
    tokenPlaceholder: "Tu token secreto o JWT",
    payloadPlaceholder: '{"data": "tu_mensaje_json", "timestamp": "ISO_DATE"}',
  },

  en: {
    // Header
    appTitle: "NATS Admin Pro V1",
    brandName: "Tyrcode",
    lightMode: "☀️ Light Mode",
    darkMode: "🌙 Dark Mode",

    // Connection Section
    connectionTitle: "Connection & Status",
    authMethodTitle: "Authentication Method",
    authNone: "🔓 None",
    authUserPass: "👤 User/Pass",
    authToken: "🔑 Token",
    username: "Username",
    password: "Password",
    token: "Token (JWT or Secret)",
    protocol: "Protocol",
    hostPort: "Host and Port (Ex: localhost:8080)",
    hostPortPlaceholder: "Host:Port",
    monitorUrl: "Monitor URL (Ex: localhost:8222)",
    connectBtn: "Connect",
    disconnectBtn: "Disconnect",
    statusLabel: "Status:",
    statusConnected: "Connected",
    statusDisconnected: "Disconnected",
    statusConnecting: "Connecting...",
    logReady: "Status: Ready. Loading saved configuration...",

    // Stats Cards
    activeConnections: "Active Connections",
    monitoring: "Monitoring",
    viewDetails: "View Details",
    totalStreams: "Total Streams",
    jetstream: "JetStream",

    // Publish Section
    publishTitle: "Publish Message",
    topic: "Topic (Subject)",
    topicPlaceholder: "my.topic.example",
    payload: "Payload (JSON)",
    formatJson: "Format JSON",
    publishBtn: "🚀 Publish",
    jsonError: "⚠️ JSON Error: The payload is not valid JSON.",
    jsonErrorIncomplete:
      "⚠️ JSON Error: The payload is not valid JSON or is incomplete.",

    // Subscribe Section
    subscribeTitle: "Local Subscriptions",
    topicToSubscribe: "topic.to.subscribe",
    subscribeBtn: "+ Subscribe",
    loadingTopics: "Loading saved topics...",
    noTopics: "No persistent topics yet. Subscribe to one.",
    statusActive: "ACTIVE",
    statusInactive: "INACTIVE",
    removeSubscription:
      "Remove Persistent Subscription and Unsubscribe from NATS",

    // Connection Details
    connectionDetailsTitle: "Active Connection Details",
    loadingDetails: "Loading details...",
    noActiveConnections: "No active connections to display.",
    connectionId: "ID",
    connectionName: "Name",
    connectionLang: "Language (Lang)",
    connectionGroup: "Group ID",

    // Message History
    historyTitle: "Message History",
    selectTopic: "Select Topic for History",
    subscribedTopics: "--- Subscribed Topics ---",
    clearHistory: "🗑️ Clear History for Selected Topic",
    currentTopic: "Current topic:",
    noTopicSelected: "None",
    selectTopicPrompt: "Select a topic from the list.",
    noMessages: "No messages saved in IndexDB for this topic.",
    loadingHistory: "Loading history...",
    topicRemoved: "Topic removed. Select another or subscribe to a new one.",
    noSavedTopics: "No saved topics",
    noMessagesLoaded: "No messages loaded. Select a topic.",

    // Table Headers
    tableId: "ID",
    tableDateTime: "Date/Time",
    tablePayload: "Payload (Preview)",
    tableActions: "Actions",
    actionInspect: "👁️ Inspect",
    actionResend: "🔄 Resend",

    // Modal
    modalTitle: "Complete Payload",
    copyPayload: "Copy Payload",
    closeModal: "Close",

    // Toast Messages
    toastCopied: "✅ Payload copied to clipboard!",

    // Log Messages
    logInitDB: "Initializing IndexDB...",
    logDBReady: "IndexDB ready.",
    logDBError: "Failed to open IndexDB:",
    logDBUpdate: "IndexDB updated.",
    logSaveError: "Failed to save message to DB:",
    logClearSuccess: "History cleared for topic:",
    logClearError: "Failed to clear history in DB:",
    logDisconnected: "Disconnected from NATS.",
    logDisconnectError: "Error attempting to disconnect:",
    logConnecting: "Attempting to connect to",
    logConnectSuccess: "Connection successful. Ready to publish/subscribe.",
    logConnectError: "Connection failed:",
    logEnsureServer:
      "Make sure the NATS server is running with the correct configuration.",
    logNotConnected: "You are not connected to the NATS server.",
    logEmptyTopic: "Topic cannot be empty.",
    logInvalidJson:
      "The entered payload is NOT valid JSON. Please correct it or use the Format button.",
    logPlainText: "Publishing payload as plain text.",
    logPublished: "Published to",
    logPublishError: "Error publishing message:",
    logReceived: "Received on",
    logSubscribed: "Subscribed (active) to topic",
    logSubscribeError: "Error subscribing to NATS",
    logUnsubscribed: "Unsubscribed (NATS) from",
    logTopicExists: "The topic is already in the persistence list.",
    logEmptySubscribe: "Subscription topic cannot be empty.",
    logLoadTopicsError: "Error loading topics from LocalStorage.",
    logMonitorError: "Failed to fetch data from",
    logCorsError: "(CORS/Port 8222).",
    logResending: "Resending message ID",
    logResendError: "Message ID not found for resend.",
    logInspectError: "Message not found for topic",
    logAuthRequired:
      "Username and Password are required for this authentication.",
    logTokenRequired: "Secret Token/JWT is required for this authentication.",
    logUsingAuth: "Using authentication with Username:",
    logUsingJWT: "Using authentication with JWT.",
    logUsingToken: "Using authentication with Secret Token.",
    logUsingSecure: "Connecting using secure protocol (wss/TLS).",
    logConnectionClosed: "Connection closed cleanly.",
    logConnectionError: "Connection closed with error:",
    logInterfaceReady: "NATS interface ready. Enter configuration and connect.",
    logAutoConnect: "NATS host detected:",
    logAutoConnectAttempt: "Attempting automatic connection...",
    logCopyError: "Failed to copy payload. Make sure your browser allows it.",
    logFormatError: "Cannot format. Not valid JSON.",
    logMonitorUrlChanged: "Monitor URL updated",
    logErrorCode: "Error code",
    logServerError: "Server error",
    logPermissionError: "Permission error - Access denied to topic",
    logSubscriptionStreamError: "Subscription stream error",
    logConnectionDisconnected: "Connection disconnected",
    logConnectionReconnecting: "Reconnecting to server",
    logConnectionReconnectAttempt: "Reconnection attempt",
    logConnectionStatusError: "Connection status error",
    logSubscriptionSummary: "Subscription summary",
    logSuccessful: "successful",
    logFailed: "failed",

    // Confirm Messages
    confirmClearHistory:
      "Are you sure you want to delete ALL locally saved messages for the topic",
    confirmIrreversible: "This action is irreversible.",

    // Placeholders
    usernamePlaceholder: "NATS username",
    passwordPlaceholder: "password",
    tokenPlaceholder: "Your secret token or JWT",
    payloadPlaceholder:
      '{"data": "your_json_message", "timestamp": "ISO_DATE"}',
  },
};

// Sistema de internacionalización
export class I18n {
  constructor() {
    this.currentLang = this.loadLanguage();
    this.translations = translations;
  }

  loadLanguage() {
    const saved = localStorage.getItem("nats_language");
    if (saved && (saved === "es" || saved === "en")) {
      return saved;
    }
    // Detectar idioma del navegador
    const browserLang = navigator.language.split("-")[0];
    return browserLang === "es" ? "es" : "en";
  }

  saveLanguage(lang) {
    localStorage.setItem("nats_language", lang);
    this.currentLang = lang;
  }

  t(key) {
    return this.translations[this.currentLang][key] || key;
  }

  setLanguage(lang) {
    if (lang === "es" || lang === "en") {
      this.saveLanguage(lang);
      this.currentLang = lang;
      return true;
    }
    return false;
  }

  getCurrentLanguage() {
    return this.currentLang;
  }
}

