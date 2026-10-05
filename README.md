# 🤖 Blue-Tone Bot

An advanced, modular Facebook Group Management and Automation Bot built with **Node.js** and **`fca-unofficial`**. Designed to handle group automation, bypass Meta MQTT restrictions, and manage persistent database storage seamlessly.

---

## 🌟 Key Features

* **Modular ES Module Architecture:** Clean code structure utilizing dynamic imports and structured route management.
* **MQTT Session Bypass:** Automated handling for common Meta connection timeouts and session blocks (`Error 1357004`).
* **Database Integration:** Pre-configured schema for PostgreSQL to store user profiles, group settings, appstates, and execution logs.
* **Lightweight & Termux Compatible:** Optimized to run smoothly on low-resource environments like Termux (Android) or Linux VPS.

---

## 📁 Project Architecture

```text
blue-tone/
├── app/
│   ├── core/               # Core runtime & bootstrap context
│   └── integrations/
│       └── meta/           # Facebook client & FCA configuration (fb-client.js)
├── migrations/             # PostgreSQL database schemas
├── appstate.json           # Session cookies (keep private!)
├── index.js                # Main application entry point
├── package.json            # Node.js dependencies & scripts
└── README.md               # Project documentation
