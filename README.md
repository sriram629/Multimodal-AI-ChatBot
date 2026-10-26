# ⚡ Multimodal AI Chatbot: AI Chat with Provider Fallback

Multimodal AI Chatbot combines streamed conversations with document questions and image inputs. It uses React and FastAPI, with MongoDB for saved conversations. Text responses follow a Gemini → Groq → Mistral fallback chain when provider requests fail. Web search and AI Horde image generation are available within the chat interface.

---

## 🎯 The "Why"

This project provides one conversation interface for questions about text, documents, and images. Saved sessions let users return to earlier work. Provider fallback gives text requests another path when a service fails, although availability still depends on API quotas, network access, and database health.

The implementation combines native WebSocket streaming with bounded document retrieval. Extracted text is stored in MongoDB, and relevant passages are selected through word overlap. This keeps document questions independent of an embedding service. Image generation has its own queue-based workflow, while web search can be requested explicitly.

---

## 🛠 Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
* **Backend:** FastAPI, Python 3.11, Uvicorn
* **Real-Time:** Native WebSockets for streamed responses and status events
* **AI Providers:** Google Gemini, Groq, Mistral AI
* **Database & Retrieval:** MongoDB, Motor, Beanie ODM, keyword-based document excerpts
* **Document Parsing:** PyPDF2 and UTF-8 text decoding
* **Search & Image Generation:** Serper, DuckDuckGo, AI Horde
* **Authentication:** Bcrypt, JWT, Google/GitHub sign-in, EmailJS OTP verification

The current chat model IDs are `gemini-3.5-flash-lite`, `llama-3.3-70b-versatile`, and `mistral-small-latest`. These are the values configured in `server/app/chat.py`; access depends on the provider account. Check supported model IDs before deployment.

---

## 🔄 System Architecture & Flow

The server checks conversation ownership before processing a message. Image-generation requests take a separate path; other requests can receive document context and explicit web-search results before the provider call.

```mermaid
flowchart TD
    A[Authenticated conversation] --> B[Validate message and save user input]
    B --> C{Image request without attachment or search?}
    C -- Yes --> D[Submit AI Horde job]
    D --> E[Poll for image or report failure]
    C -- No --> F[Retrieve conversation document excerpts]
    F --> G{Web search requested?}
    G -- Yes --> H[Serper and DuckDuckGo in parallel]
    G -- No --> I[Gemini response]
    H --> I
    I -- Provider failure --> J[Groq text fallback]
    J -- Provider failure --> K[Mistral text fallback]
    I --> L[Stream answer to browser]
    J --> L
    K --> L
    E --> M[Persist assistant response]
    L --> M
    M --> N[Send completion event]
    N --> O[Queue title generation if needed]
    O --> P[Gemini title with optional Groq fallback]
    P --> Q[Save title unless manually renamed]
```

## ✨ Key Features

### 🧠 AI Orchestration & Resilience

* **Text Fallback:** Gemini requests can fall back to Groq, then Mistral. Provider failures are handled within the response workflow.
* **Request Routing:** A keyword pattern detects image-generation requests. Web search is enabled by `/search ` or the request's search flag.
* **Provider Feedback:** The interface displays provider labels and processing status. Text-only fallback providers cannot replace Gemini's image understanding.

### 🔍 Document Retrieval & Web Search

* **Document Questions:** Upload text-based PDFs or UTF-8 TXT, Markdown, Python, and JavaScript files. Extracted text remains associated with the conversation.
* **Bounded Context:** Word-overlap ranking selects excerpts from longer documents. The context budget is 24,000 characters, so an answer may cover only selected passages.
* **Explicit Web Search:** Prefix a question with `/search ` to request Google results through Serper alongside DuckDuckGo results. Retrieved snippets provide context; their combination does not establish factual accuracy.

Scanned PDFs require OCR before upload. OCR is not implemented in this application.

### 🎨 Image Inputs & Generation

* **Image Questions:** PNG, JPEG, WebP, and GIF inputs can be passed to Gemini. The interface supports expandable previews.
* **AI Horde Generation:** Suitable image requests submit a 576 × 576 generation job and poll for its result.
* **Failure Feedback:** Unavailable services and expired polling attempts produce a message. The current implementation has no secondary image-generation provider.

### 🔐 Identity Management System

* **Email Accounts:** Bcrypt password hashing, EmailJS verification codes, and a password-reset workflow.
* **Social Sign-In:** Google and GitHub authentication when their client settings are configured.
* **Authorization:** JWT authentication and conversation ownership checks. Tokens currently expire after seven days, as defined in `server/app/auth.py`.

### ⚡ Asynchronous Architecture

* **WebSocket Streaming:** Answers and status events reach the client over a native WebSocket connection. Stop cancels the active response task.
* **Generated Titles:** A separate asynchronous job creates a short title using Gemini, with Groq as an optional fallback. Manual names are protected from replacement.
* **Saved Conversations:** Sessions and messages are persisted in MongoDB. Title jobs can complete after the user leaves a conversation.

### 🖥️ Responsive Interface

* **Chat Controls:** Copy answers, edit a question, or regenerate the latest answer. Editing removes messages after the edited question; regeneration replaces the continuation after the latest user message.
* **Conversation History:** Create, rename, and remove sessions through the sidebar. Removal is a soft delete from history; stored messages and documents are not permanently erased.
* **Message Formatting:** Markdown tables, highlighted code, and mathematical notation are rendered in the conversation.
* **Interaction Feedback:** Attachment previews, upload progress, and connection feedback accompany the composer. Sidebar actions are available through hover or keyboard focus on pointer devices and remain available on touch devices.

---

## 🧠 Technical Deep Dive: The Horde Bottleneck Challenge

**The Challenge:** AI Horde processes requests through a worker queue. A submitted job may wait for capacity, fail, or exceed the application's polling budget.

**The Implementation:** The backend submits a job with the anonymous API key configured in `server/app/tools.py`. It polls at five-second intervals and waits ten seconds after an HTTP 429 response. Successful results are returned as Markdown images.

The loop checks a 120-second elapsed-time budget. An in-flight network request or sleep can extend the observed duration, so this is not a strict two-minute completion guarantee. The enclosing chat task has a separate 180-second timeout. When generation fails, the application returns an explanatory message.

---

## 🚀 Step-by-Step Setup

Use **Python 3.11**, **Node.js 22.12+**, and a reachable MongoDB deployment. MongoDB Atlas with TLS is suitable for the current database configuration. Provider credentials are needed for the corresponding integrations.

### 1. Clone the Repository

```bash
git clone https://github.com/sriram629/Multimodal-AI-ChatBot.git
cd Multimodal-AI-ChatBot
```

### 2. Backend Configuration (FastAPI)

From the repository root:

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

On Windows Command Prompt, activate with `venv\Scripts\activate`. In PowerShell, use `.\venv\Scripts\Activate.ps1`.

### 3. Frontend Configuration (React)

In a second terminal, from the repository root:

```bash
cd client
npm ci
```

### 4. Environment Variables

Create `server/.env`:

```dotenv
# Database and authentication
MONGO_URI=mongodb+srv://USER:PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
ALGORITHM=HS256
FRONTEND_URL=http://localhost:5173

# Text providers
GOOGLE_API_KEY=YOUR_GEMINI_KEY
GROQ_API_KEY=YOUR_GROQ_KEY
MISTRAL_API_KEY=YOUR_MISTRAL_KEY

# Optional title model override
TITLE_MODEL=gemini-3.5-flash-lite

# Google search through Serper
SERPER_API_KEY=YOUR_SERPER_KEY

# Email verification and password reset
EMAILJS_SERVICE_ID=YOUR_SERVICE_ID
EMAILJS_TEMPLATE_ID=YOUR_TEMPLATE_ID
EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
EMAILJS_PRIVATE_KEY=YOUR_PRIVATE_KEY

# GitHub sign-in
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET
```

`MONGO_URI` and a private `SECRET_KEY` are required at startup. Generate a signing secret with `openssl rand -hex 32`. Configure the provider credentials for the integrations you intend to exercise. EmailJS templates must accept `to_email` and `otp`.

The application uses `ai_chatbot_db` for accounts and conversations. Uploaded document text is stored in `ai_chat_db.vector_storage`. The database user needs access to both databases; the URI's database path does not override these explicit names. The collection name is retained for compatibility, while retrieval uses stored text and keyword matching.

AI Horde currently uses an anonymous key defined in source. An `AI_HORDE_KEY` environment setting does not override it. SMTP variables, `JWT_SECRET`, and `ACCESS_TOKEN_EXPIRE_MINUTES` are not configuration inputs for the current authentication implementation.

Create `client/.env`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
```

OAuth client settings enable the corresponding sign-in buttons. Configure the frontend origin with the provider and the frontend `/login` redirect where required, for example `http://localhost:5173/login`. GitHub client IDs must match between frontend and backend. Keep secrets in backend settings; frontend `VITE_` values are included in the browser build.

### 5. Running the Application

**Terminal 1 — backend:** from `server/`, with the virtual environment active:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — frontend:** from `client/`:

```bash
npm run dev
```

Open [localhost:5173](http://localhost:5173). API documentation is available at [localhost:8000/docs](http://127.0.0.1:8000/docs).

**Deployment:** build the frontend with `npm ci` and `npm run build`, then publish `client/dist`. Set `VITE_API_URL` to the HTTPS backend origin before the build. Configure a fallback to `index.html` for client routes. Run the backend from `server/` with `uvicorn main:app --host 0.0.0.0 --port $PORT`, or use its Dockerfile, which exposes port 10000. Set `FRONTEND_URL` to the deployed frontend origin; multiple origins are comma-separated without extra spaces.

`GET /health` checks database connectivity and returns 503 when unavailable. The scheduled database-health workflow makes a daily check; it does not guarantee uninterrupted service. The frontend Dockerfile and Nginx configuration provide a separate container deployment option.

---

## 📊 Runtime Limits & Validation

| Area | Current implementation |
| :--- | :--- |
| **File upload** | Maximum 2 MB through the upload handler |
| **Extracted document text** | Maximum 200,000 characters |
| **Chat message** | Maximum 20,000 characters |
| **Document context** | Maximum 24,000 characters of selected text |
| **Image generation** | 120-second polling budget; network operations can extend elapsed time |
| **Chat processing** | 180-second enclosing task timeout |
| **Title generation** | Eight-second timeout per provider attempt; Gemini and optional Groq fallback |
| **JWT lifetime** | Seven days, defined in backend code |

These values describe limits and timeouts. No measured latency or uptime benchmark is claimed.

From `client/`, validate the production build:

```bash
npm run build
```

From the repository root, with the backend environment active:

```bash
python -m unittest discover -s server/tests
```

The backend tests cover reliability behavior and title generation. The Node.js workflow checks the frontend build. Live verification is still needed for provider credentials, email delivery, and deployed database access. Before release, exercise document questions and image inputs; also check Stop, edit/regenerate, renamed titles after reload, and failed-upload feedback.

---

## 🛡️ Multi-Tier Failover Strategy

Text responses follow this order:

1. **Primary — Gemini:** receives text and supported image inputs.
2. **Fallback — Groq:** handles text when the Gemini request fails.
3. **Final fallback — Mistral:** handles text when the earlier provider path fails.

Fallback providers receive text context. They cannot inspect an image on Gemini's behalf. When all providers are unavailable, the request can still fail.

Title generation has a separate Gemini → Groq path. Groq is used only when configured, and manually renamed titles are preserved. Image generation depends on AI Horde independently of the text-provider chain.

---

## 🔄 Request Lifecycle

1. The browser opens a WebSocket for an existing conversation. JWT authentication and session ownership are checked.
2. The server validates the message and attachment. A new user message is saved; edit and regeneration requests update the applicable conversation continuation.
3. A matching image-generation request without attachments or explicit search is sent to AI Horde. Other requests receive available document excerpts, with web results added when requested.
4. Gemini processes the question and context. Text-provider failures can invoke Groq, followed by Mistral.
5. Response chunks and status events are sent to the browser. The completed assistant response is stored in MongoDB.
6. An asynchronous title job runs when needed. Its database update checks that the user has not supplied a custom title or removed the conversation. Untitled conversations can also be reconsidered when reopened.

---

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg?style=for-the-badge&logo=render)](https://ai-chatbot-frontend-yq89.onrender.com)

Render may need time to start an inactive service. Allow at least ten seconds; a cold start can take longer.

---

## 🖼️ Full Gallery

<details>
<summary>Click to view all screenshots</summary>

### Website Page

Current public landing page, captured on 26 October 2026 after the service loaded.

![Current AI Chat landing page](./screenshots/Website_current.png)

### Authentication Flow

Current sign-in page, captured on 26 October 2026.

![Current sign-in page with email and social login options](./screenshots/Login_current.png)

The registration image below is retained from the earlier gallery and may differ from the current interface.

![Earlier registration interface](./screenshots/Register_page.png)

### App Flow

These existing authenticated views are retained as earlier interface screenshots. Current conversation screenshots require a demo account with non-sensitive sample content.

![Earlier conversation home interface](./screenshots/Home_page.png)
![Earlier chat conversation interface](./screenshots/Chat_page.png)

</details>

---

## 🏗️ Project Structure

```text
Multimodal-AI-ChatBot/
├── client/
│   ├── src/
│   │   ├── components/        # Composer, messages, sidebar, shared UI
│   │   ├── contexts/          # Authentication state
│   │   ├── hooks/             # WebSocket and session hooks
│   │   ├── pages/             # Landing, authentication, chat
│   │   ├── lib/               # API client and utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── server/
│   ├── app/
│   │   ├── auth.py            # Accounts, OTP, JWT, OAuth
│   │   ├── chat.py            # Sessions, streaming, provider fallback
│   │   ├── database.py        # Database initialization and health
│   │   ├── models.py          # Beanie document models
│   │   ├── rag.py             # Document storage and excerpt retrieval
│   │   ├── titles.py          # Title generation and background jobs
│   │   ├── tools.py           # Web search and AI Horde generation
│   │   ├── utils.py           # Upload validation and parsing
│   │   └── email_service.py   # EmailJS integration
│   ├── tests/                 # Reliability and title tests
│   ├── main.py                # Startup, middleware, health route
│   ├── Dockerfile
│   └── requirements.txt
├── screenshots/
├── .github/workflows/         # Frontend build and database health check
└── README.md
```

Create `server/.env` and `client/.env` locally as described above. Environment files are not part of the published setup examples.

---

## 🤝 Contributing

Contributions are welcome through pull requests. Describe the affected behavior and run the relevant validation commands above. Include reproduction steps for bugs and redact credentials or authentication tokens from logs.

---

## 📝 License

A standalone license file has not been included in this repository. Contact the maintainer for licensing terms before redistribution or reuse.

---

## 🔗 Links

- **Live Demo:** [ai-chatbot-frontend-yq89.onrender.com](https://ai-chatbot-frontend-yq89.onrender.com)
- **Source Code:** [Multimodal-AI-ChatBot](https://github.com/sriram629/Multimodal-AI-ChatBot)
- **Report Issues:** [GitHub Issues](https://github.com/sriram629/Multimodal-AI-ChatBot/issues)

---

**Built with ❤️ using React, TypeScript, FastAPI, and MongoDB**
