# Chatbot UI

**Chatbot UI** is a lightweight, customizable frontend for interacting with language models, built with **Next.js**. Every [Gaianet node](https://github.com/GaiaNet-AI/gaianet-node) ships with this UI preconfigured, but it’s also easy to use independently with any LLM API.

---

## Features

- **Plug-in Any API:** Easily point the UI to your own model or hosted API via environment configuration.
- **Next.js Framework:** Enjoy optimized routing, SSR, and built-in performance with Next.js.
- **Prompt Customization:** Tweak system prompts and interaction flows to match your use case.
- **i18n Support:** Built-in internationalization for multilingual experiences.

---

## Quick Start

### 1. Clone the Repo

```bash
git clone https://github.com/GaiaNet-AI/chatbot-ui.git
cd chatbot-ui
```

### 2. Install Dependencies

```bash
npm install
# or
yarn
```

### 3. Configure Environment

Create a `.env.local` file and add your API URL:

```bash
NEXT_PUBLIC_API_URL=<your-gaianet-node-or-api-url>
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (GitHub Pages)

### Option 1: Manual Setup

1. **Fork the repo** on GitHub.
2. Go to **Settings > Pages** in your repo.
3. Choose **Deploy from a branch**.
4. Select the `main` or `gh-pages` branch and root directory.
5. GitHub will auto-build and deploy the site.

### Option 2: GitHub Actions (Recommended)

- A deployment workflow is pre-configured in `.github/workflows/deploy.yml`.
- Push your changes to trigger automated deployment to GitHub Pages.

---

## Contributing

We welcome PRs and feature requests!

- Read the [Contributing Guide](https://github.com/GaiaNet-AI/chatbot-ui/blob/main/CONTRIBUTING.md)
- Follow our [Code of Conduct](https://github.com/GaiaNet-AI/chatbot-ui/blob/main/.github/CODE_OF_CONDUCT.md)

Found a bug? Submit an issue on the [tracker](https://github.com/GaiaNet-AI/chatbot-ui/issues).

---

## Need Help?

Join the [Telegram builder group](https://t.me/+a0bJInD5lsYxNDJl) to connect with the community and ask questions.

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/GaiaNet-AI/chatbot-ui/blob/main/LICENSE).
