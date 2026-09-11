# Aether — Professional AI Chatbot

A polished, production-quality AI chatbot inspired by ChatGPT, Claude, and Gemini — powered by Google's Gemini models and backed by Supabase cloud synchronization. Built with React 19, TypeScript, Vite, Tailwind CSS v4, and the official `@google/genai` SDK.

---

## ✨ Features

- **⚡ Real-time Token Streaming**: Token-by-token dynamic generation with a smooth typing cursor, abort/stop controls, and instantaneous rendering.
- **☁️ Supabase Cloud Sync & Auth**: Optional sign-in with email/password or guest mode, keeping your conversations synchronized across browsers while retaining instant offline local-first fallback.
- **🧠 Model Switcher & Thinking Models**: Seamlessly toggle between Gemini 2.5 Flash, Gemini 2.5 Pro, and Gemini 2.0 Flash Thinking with collapsible step-by-step reasoning process inspection.
- **🖼️ Multimodal Vision Support**: Upload, drag-and-drop, or paste screenshots and images directly from your clipboard for deep visual reasoning with Gemini.
- **🎙️ Voice Dictation & Read Aloud**: Hands-free voice input via Web Speech API and text-to-speech audio playback with pause/play controls.
- **💻 Developer-grade Code Blocks**: Syntax highlighting with Prism, language pill tags, one-click copy, and auto-wrapping.
- **📑 Export & Sharing**: Export conversations as formatted Markdown (`.md`), JSON (`.json`), or plain text (`.txt`).
- **🎨 Modern Aesthetic Design**: Dark/Light mode with curated HSL color tokens, glassmorphic headers, responsive sidebar drawer for mobile, and micro-animations.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# In Windows PowerShell:
cmd /c npm install
```

### 2. Configure Environment
A ready `.env` file is included with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://pagkktpafxzkyvekgrbr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(You can also paste your Gemini API key directly into **Settings → Gemini API Credentials** within the app)*

### 3. Run Development Server
```bash
cmd /c npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🗄️ Supabase Cloud Setup (Optional)

If you'd like your conversations automatically synced to Supabase:
1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/pagkktpafxzkyvekgrbr/sql).
2. Click **View SQL Schema** in Aether's **Settings** page and click **Copy SQL**.
3. Paste and run the SQL script in Supabase to create the `conversations` and `messages` tables with Row Level Security.

---

## 🛠️ Available Scripts

- `cmd /c npm run dev` — Start Vite local dev server
- `cmd /c npm run build` — TypeScript type-check and production build
- `cmd /c npm run preview` — Preview the production bundle locally
