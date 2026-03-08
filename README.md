<div align="center">

# 🚀 Optmyzr Event Automation

### Intelligent Inventory Monitoring with Real-Time Webhook Triggers

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Groq](https://img.shields.io/badge/Groq-AI-FF6B6B?style=for-the-badge)](https://groq.com/)
[![Google Apps Script](https://img.shields.io/badge/Apps%20Script-Enabled-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://script.google.com/)

[📺 Watch Demo Video](https://drive.google.com/file/d/1LxvSOayudh5ZU3vep46E-N1NAmm4u1vl/view?usp=sharing) 

</div>



---

## 🎯 About

**Optmyzr Event Automation** is an intelligent inventory monitoring system that watches your Google Sheets data and triggers webhooks when conditions change. Perfect for:

- 📦 **Inventory Management** - Alert when stock drops to zero
- 🏷️ **Brand Monitoring** - Track specific brand availability
- 📊 **Threshold Alerts** - Get notified when values cross limits
- 🔄 **State Change Detection** - Know when conditions break OR restore

---

## 🎬 Demo

<div align="center">

### 📺 [Watch the Full Demo Video](https://drive.google.com/file/d/1LxvSOayudh5ZU3vep46E-N1NAmm4u1vl/view?usp=sharing)

*Click above to see the tool in action!*

</div>

**Quick Preview:**
```
1. Connect Google Sheet → 2. Set Filters → 3. Generate Script → 4. Get Real-Time Alerts!
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔗 **Google Sheets Integration** | Connect any public spreadsheet instantly |
| 🤖 **AI-Powered Formulas** | Groq LLM generates COUNTIFS/FILTER formulas |
| ⚡ **Event-Driven Triggers** | No polling - fires only on actual changes |
| 🔄 **State Change Detection** | Detects both condition breaks AND restores |
| 📜 **Auto-Generated Scripts** | Copy-paste ready Apps Script code |
| 🎯 **Smart Debouncing** | 3-second delay prevents trigger spam |
| 📊 **Real-Time Dashboard** | Monitor all triggers in one place |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   Groq AI       │
│   (React)       │     │   (Express)     │     │   (Llama 3.3)   │
│   Port: 5173    │     │   Port: 3001    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                  │
                                  │ Generates
                                  ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Google Sheet   │────▶│  Apps Script    │────▶│  Webhook        │
│  (Your Data)    │     │  (handleEdit)   │     │  (ngrok tunnel) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Triggers Page  │
                                                 │  (Real-time)    │
                                                 └─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, TailwindCSS, React Router, Lucide Icons |
| **Backend** | Node.js 18+, Express.js, CORS |
| **AI** | Groq SDK, Llama 3.3 70B Versatile |
| **Triggers** | Google Apps Script (Installable Triggers) |
| **Tunnel** | ngrok (for local development) |

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/optmyzr-event-automation.git
cd optmyzr-event-automation

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start everything (3 terminals)
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: ngrok tunnel
ngrok http 3001
```

---

## 📦 Detailed Setup

### Prerequisites

- ✅ Node.js 18+ installed
- ✅ ngrok account (free tier works)
- ✅ Groq API Key ([Get it here](https://console.groq.com))
- ✅ Google Sheet (must be publicly viewable)

### Step 1: Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=3001
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Start the server:
```bash
npm start
```

Expected output:
```
Server running on http://localhost:3001
```

### Step 2: Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

Start the dev server:
```bash
npm run dev
```

Expected output:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

### Step 3: ngrok Tunnel Setup

ngrok creates a public URL that forwards to your local backend.

```bash
# Install ngrok (if not installed)
# Windows: winget install ngrok
# Mac: brew install ngrok
# Linux: snap install ngrok

# Authenticate (one-time)
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Start tunnel
ngrok http 3001
```

Expected output:
```
Forwarding    https://xxxx-xxxx-xxxx.ngrok-free.dev -> http://localhost:3001
```

**⚠️ Important:** Copy the `https://xxxx.ngrok-free.dev` URL - this is your webhook URL!

### Step 4: Google Sheet Setup

1. Create a Google Sheet with your inventory data
2. **Share** → **Anyone with the link** → **Viewer**
3. Copy the sheet URL

Example sheet structure:
| ProductID | Brand | ProductName | Category | Price | Stock |
|-----------|-------|-------------|----------|-------|-------|
| 1 | Adidas | Ultraboost | Shoes | 180 | 12 |
| 2 | Nike | Air Max | Shoes | 150 | 0 |

---

## 📖 Usage Guide

### Creating a Campaign

1. **Open** http://localhost:5173
2. **Click** "Create Campaign"
3. **Paste** your Google Sheet URL
4. **Click** "Analyze Sheet"
5. **Enter** campaign name
6. **Add filters:**
   - Column: `Brand`, Operator: `=`, Value: `Adidas`
   - Column: `Stock`, Operator: `>`, Value: `0`
7. **Click** "Generate Query" → Review AI-generated formulas
8. **Click** "Generate Apps Script"
9. **Copy** the generated script

### Installing Apps Script

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. **Delete** all existing code
4. **Paste** the generated script
5. **Save** (Ctrl+S)
6. **Run** the `setup` function
7. **Authorize** when prompted

### Testing

1. Edit an Adidas product's Stock from `12` to `0`
2. Wait 3 seconds (debounce)
3. Check the **Triggers** page - you should see the alert!

---

## 📡 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sheets/analyze` | POST | Analyze Google Sheet structure |
| `/api/campaign/create` | POST | Create new campaign |
| `/api/ai/generate-query` | POST | Generate Sheets formulas (Groq AI) |
| `/api/ai/generate-apps-script` | POST | Generate Apps Script code |
| `/api/webhook/trigger` | POST | Receive trigger from Apps Script |
| `/api/campaigns` | GET | List all campaigns |
| `/api/triggers` | GET | List all received triggers |

### Webhook Payload Example

```json
{
  "sheetId": "1ABC...XYZ",
  "triggeredAt": "2026-03-08T12:00:00.000Z",
  "conditionsMet": "CONDITION BROKE: Brand = Adidas, Stock > 0",
  "affectedRows": 1,
  "rows": [{
    "rowNumber": 5,
    "productName": "Ultraboost 22",
    "changeType": "CONDITION BROKE",
    "oldValue": "12",
    "newValue": "0"
  }]
}
```

---

## ⚠️ Limitations

### Apps Script Quotas (Free Tier)

| Quota | Limit | Impact |
|-------|-------|--------|
| Triggers per day | 20 | Max 20 edits trigger webhooks |
| Script runtime | 6 min/execution | Our script runs in <3s ✅ |
| URL Fetch calls | 20,000/day | Plenty for normal use ✅ |
| Properties storage | 500KB | ~5,000 rows trackable |


## 📁 Project Structure

```
optmyzr-event-automation/
├── backend/
│   ├── index.js          # Express server + API routes
│   ├── package.json
│   └── .env              # API keys
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateCampaign.jsx
│   │   │   └── Triggers.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   └── api/
│   │       └── index.js  # API client
│   ├── package.json
│   └── .env
├── inventory_data.csv    # Sample data
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">

**Built with ❤️ for Optmyzr**

<img width="1919" height="901" alt="image" src="https://github.com/user-attachments/assets/81843b53-a21a-4425-851b-8b7e08c5117e" />

<img width="1919" height="905" alt="image" src="https://github.com/user-attachments/assets/5bc14032-a665-402d-90a1-f1caeb2b54cb" />

<img width="1919" height="904" alt="image" src="https://github.com/user-attachments/assets/1d2c2aa4-efc6-42be-9a5a-043c6caebb1d" />

<img width="1919" height="897" alt="image" src="https://github.com/user-attachments/assets/15f45994-050d-4fe0-a366-69444722551f" />

<img width="1919" height="915" alt="image" src="https://github.com/user-attachments/assets/a226e9ee-f07b-4cf4-a451-bf58ea92d4d8" />

<img width="1919" height="911" alt="image" src="https://github.com/user-attachments/assets/8e78774c-e1e0-417e-b737-a12dd5a9660c" />

<img width="1919" height="911" alt="image" src="https://github.com/user-attachments/assets/745df1b3-48fb-4700-9561-01d314370620" />

<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/b8fb2d0f-7f1c-458b-ad3f-035b70778e91" />

<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/40508da1-554a-488c-9f33-a443d3362072" />

<img width="1919" height="911" alt="image" src="https://github.com/user-attachments/assets/dbb82aab-e061-4cf2-a8e4-7cc944e816ef" />


</div>
