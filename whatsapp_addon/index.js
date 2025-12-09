import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import { WhatsappClient } from "./whatsapp.js";
import log4js from "log4js";
import qrimage from "qr-image";

const logger = log4js.getLogger();
logger.level = "info";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const clients = {};
let addonOptions = {};

const onReady = (key) => {
  logger.info(key, "client is ready.");
  axios.post(
    "http://supervisor/core/api/services/persistent_notification/dismiss",
    {
      notification_id: `whatsapp_addon_qrcode_${key}`,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}`,
      },
    }
  );
};

const onQr = (qr, key) => {
  logger.info(
    key,
    "require authentication over QRCode, please see your notifications..."
  );

  var code = qrimage.image(qr, { type: "png" });

  code.on("readable", function () {
    var img_string = code.read().toString("base64");
    axios.post(
      "http://supervisor/core/api/services/persistent_notification/create",
      {
        title: `Whatsapp QRCode (${key})`,
        message: `Please scan the following QRCode for **${key}** client... ![QRCode](data:image/png;base64,${img_string})`,
        notification_id: `whatsapp_addon_qrcode_${key}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}`,
        },
      }
    );
  });
};

const onMsg = (msg, key) => {
  axios.post(
    "http://supervisor/core/api/events/new_whatsapp_message",
    { clientId: key, ...msg },
    {
      headers: {
        Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}`,
      },
    }
  );
  logger.debug(`New message event fired from ${key}.`);
};

const onPresenceUpdate = (presence, key) => {
  axios.post(
    "http://supervisor/core/api/events/whatsapp_presence_update",
    { clientId: key, ...presence },
    {
      headers: {
        Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}`,
      },
    }
  );
  logger.debug(`New presence event fired from ${key}.`);
};

const onLogout = async (key) => {
  logger.info(`Client ${key} was logged out. Restarting...`);
  fs.rm(`/data/${key}`, { recursive: true }, () => {});

  init(key);
};

const init = (key) => {
  clients[key] = new WhatsappClient({ path: `/data/${key}` });

  clients[key].on("restart", () => logger.debug(`${key} client restarting...`));
  clients[key].on("qr", (qr) => onQr(qr, key));
  clients[key].once("ready", () => onReady(key));
  clients[key].on("msg", (msg) => onMsg(msg, key));
  clients[key].on("logout", () => onLogout(key));
  clients[key].on("presence_update", (presence) =>
    onPresenceUpdate(presence, key)
  );
};

// Funzione per chiamare OpenAI API
const callOpenAI = async (message, conversationHistory = []) => {
  if (!addonOptions.ai?.openai_api_key) {
    throw new Error("OpenAI API key not configured");
  }

  const messages = [
    { role: "system", content: addonOptions.ai.system_prompt || "Sei un assistente utile." },
    ...conversationHistory,
    { role: "user", content: message }
  ];

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: addonOptions.ai.model_openai || "gpt-4o-mini",
      messages: messages,
      max_tokens: addonOptions.ai.max_tokens || 500,
    },
    {
      headers: {
        "Authorization": `Bearer ${addonOptions.ai.openai_api_key}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
};

// Funzione per chiamare Anthropic (Claude) API
const callAnthropic = async (message, conversationHistory = []) => {
  if (!addonOptions.ai?.anthropic_api_key) {
    throw new Error("Anthropic API key not configured");
  }

  const messages = [
    ...conversationHistory,
    { role: "user", content: message }
  ];

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: addonOptions.ai.model_anthropic || "claude-3-haiku-20240307",
      max_tokens: addonOptions.ai.max_tokens || 500,
      system: addonOptions.ai.system_prompt || "Sei un assistente utile.",
      messages: messages,
    },
    {
      headers: {
        "x-api-key": addonOptions.ai.anthropic_api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.content[0].text;
};

// Funzione wrapper per chiamare l'AI configurata
const callAI = async (message, conversationHistory = [], preferredAI = null) => {
  const aiToUse = preferredAI || addonOptions.ai?.default_ai || "openai";

  if (aiToUse === "anthropic") {
    return await callAnthropic(message, conversationHistory);
  } else {
    return await callOpenAI(message, conversationHistory);
  }
};

fs.readFile("data/options.json", function (error, content) {
  var options = JSON.parse(content);
  addonOptions = options;

  options.clients.forEach((key) => {
    init(key);
  });

  app.listen(port, () => logger.info(`Whatsapp Addon started.`));

  app.post("/sendMessage", (req, res) => {
    const message = req.body;
    if (message.hasOwnProperty("clientId")) {
      if (clients.hasOwnProperty(message.clientId)) {
        const wapp = clients[message.clientId];
        wapp
          .sendMessage(message.to, message.body, message.options)
          .then(() => {
            res.send("OK");
            logger.debug("Message successfully sended from addon.");
          })
          .catch((error) => {
            res.send("KO");
            logger.error(error.message);
          });
      } else {
        logger.error("Error in sending message. Client ID not found.");
        res.send("KO");
      }
    } else {
      logger.error("Error in sending message. Please specify client ID.");
      res.send("KO");
    }
  });

  app.post("/setStatus", (req, res) => {
    const status = req.body.status;
    if (req.body.hasOwnProperty("clientId")) {
      if (clients.hasOwnProperty(req.body.clientId)) {
        const wapp = clients[req.body.clientId];

        wapp
          .updateProfileStatus(status)
          .then(() => {
            res.send("OK");
          })
          .catch((error) => {
            res.send("KO");
            logger.error(error.message);
          });
      } else {
        logger.error("Error in set status. Client ID not found.");
        res.send("KO");
      }
    } else {
      logger.error("Error in set status. Please specify client ID.");
      res.send("KO");
    }
  });

  app.post("/presenceSubscribe", (req, res) => {
    const request = req.body;

    if (req.body.hasOwnProperty("clientId")) {
      if (clients.hasOwnProperty(req.body.clientId)) {
        const wapp = clients[req.body.clientId];

        wapp
          .presenceSubscribe(request.userId)
          .then(() => {
            res.send("OK");
          })
          .catch((error) => {
            res.send("KO");
            logger.error(error.message);
          });
      } else {
        logger.error("Error in subscribe presence. Client ID not found.");
        res.send("KO");
      }
    } else {
      logger.error("Error in subscribe presence. Please specify client ID.");
      res.send("KO");
    }
  });

  app.post("/sendPresenceUpdate", (req, res) => {
    const request = req.body;

    if (req.body.hasOwnProperty("clientId")) {
      if (clients.hasOwnProperty(req.body.clientId)) {
        const wapp = clients[req.body.clientId];

        wapp
          .sendPresenceUpdate(request.type, request.to)
          .then(() => {
            res.send("OK");
          })
          .catch((error) => {
            res.send("KO");
            logger.error(error.message);
          });
      } else {
        logger.error("Error in presence update. Client ID not found.");
        res.send("KO");
      }
    } else {
      logger.error("Error in presence update. Please specify client ID.");
      res.send("KO");
    }
  });

  app.post("/sendInfinityPresenceUpdate", (req, res) => {
    const request = req.body;

    if (req.body.hasOwnProperty("clientId")) {
      if (clients.hasOwnProperty(req.body.clientId)) {
        const wapp = clients[req.body.clientId];

        wapp
          .setSendPresenceUpdateInterval(request.type, request.to)
          .then(() => {
            res.send("OK");
          })
          .catch((error) => {
            res.send("KO");
            logger.error(error.message);
          });
      } else {
        logger.error("Error in presence update. Client ID not found.");
        res.send("KO");
      }
    } else {
      logger.error("Error in presence update. Please specify client ID.");
      res.send("KO");
    }
  });

  // Endpoint per chiamare l'AI
  app.post("/ai/chat", async (req, res) => {
    const { message, conversationHistory, preferredAI } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    try {
      const response = await callAI(message, conversationHistory || [], preferredAI);
      res.json({ response, ai: preferredAI || addonOptions.ai?.default_ai || "openai" });
      logger.debug("AI response generated successfully.");
    } catch (error) {
      res.status(500).json({ error: error.message });
      logger.error("AI error:", error.message);
    }
  });

  // Endpoint per ottenere la configurazione (senza chiavi API)
  app.get("/config", (req, res) => {
    const safeConfig = {
      ai: {
        default_ai: addonOptions.ai?.default_ai,
        model_openai: addonOptions.ai?.model_openai,
        model_anthropic: addonOptions.ai?.model_anthropic,
        system_prompt: addonOptions.ai?.system_prompt,
        max_tokens: addonOptions.ai?.max_tokens,
        openai_configured: !!addonOptions.ai?.openai_api_key,
        anthropic_configured: !!addonOptions.ai?.anthropic_api_key,
      },
      business_hours: addonOptions.business_hours,
      authorized_numbers: addonOptions.authorized_numbers,
      groups: addonOptions.groups,
      logging: addonOptions.logging,
    };
    res.json(safeConfig);
  });

  // Endpoint per verificare se un numero è autorizzato
  app.post("/checkAuthorized", (req, res) => {
    const { number } = req.body;
    const authorized = addonOptions.authorized_numbers || [];
    const isAuthorized = authorized.length === 0 || authorized.includes(number);
    res.json({ authorized: isAuthorized });
  });

  // Endpoint per verificare orario lavorativo
  app.get("/businessHours/check", (req, res) => {
    const bh = addonOptions.business_hours;
    if (!bh?.enabled) {
      res.json({ enabled: false, isOpen: true });
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const workDays = bh.work_days || [1, 2, 3, 4, 5];

    const isWorkDay = workDays.includes(day);
    const isWorkHour = hour >= bh.start_hour && hour < bh.end_hour;
    const isOpen = isWorkDay && isWorkHour;

    res.json({
      enabled: true,
      isOpen,
      isWorkDay,
      isWorkHour,
      currentHour: hour,
      currentDay: day,
      autoReplyMessage: bh.auto_reply_message,
    });
  });

  // Endpoint per logging
  app.post("/log", (req, res) => {
    if (!addonOptions.logging?.enabled) {
      res.json({ logged: false, reason: "Logging disabled" });
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      ...req.body,
    };

    const logFile = addonOptions.logging.log_file || "/config/whatsapp_log.json";

    fs.readFile(logFile, (err, data) => {
      let logs = [];
      if (!err && data) {
        try {
          logs = JSON.parse(data);
        } catch (e) {
          logs = [];
        }
      }

      logs.push(logEntry);

      // Mantieni solo gli ultimi 1000 log
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }

      fs.writeFile(logFile, JSON.stringify(logs, null, 2), (err) => {
        if (err) {
          res.status(500).json({ logged: false, error: err.message });
        } else {
          res.json({ logged: true });
        }
      });
    });
  });

  // Endpoint per ottenere i log
  app.get("/logs", (req, res) => {
    if (!addonOptions.logging?.enabled) {
      res.json({ logs: [], reason: "Logging disabled" });
      return;
    }

    const logFile = addonOptions.logging.log_file || "/config/whatsapp_log.json";
    const limit = parseInt(req.query.limit) || 100;

    fs.readFile(logFile, (err, data) => {
      if (err) {
        res.json({ logs: [] });
        return;
      }

      try {
        const logs = JSON.parse(data);
        res.json({ logs: logs.slice(-limit) });
      } catch (e) {
        res.json({ logs: [] });
      }
    });
  });
});
