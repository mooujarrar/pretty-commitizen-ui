# Pretty Commitizen UI Source

This directory contains the source code for the **React Webview UI** used by the "Pretty Commitizen" VS Code extension.

It is a standalone React application built with Vite, designed to run inside a VS Code Webview panel. It handles the interactive step-by-step form, captures user input, generates the formatted commit message, and communicates back to the parent VS Code extension host.

## 🛠️ Tech Stack

* **Framework:** React (TypeScript)
* **Build Tool:** Vite
* **Animations:** Framer Motion
* **Styling:** CSS variables derived from the active VS Code theme for native integration.
* **Communication:** VS Code Webview API (`postMessage` / `onDidReceiveMessage`).

## 🚀 Getting Started

### Prerequisites

* Node.js (LTS version recommended)
* npm (or yarn/pnpm)

### Installation

Navigate to this directory and install dependencies:

```bash
cd webview-ui  # adjust path if necessary
npm install
```

-----

## 💻 Development Workflow

You can develop the UI in a standard browser without launching the full VS Code debug host.

### Running Standalone (Browser Mode)

Start the local Vite development server:

```bash
npm run dev
```

Open `http://localhost:5173` (or the port shown in your terminal) in your browser.

**⚠️ Important Note on Browser Mocking:**

Because the browser does not have access to the native VS Code API (`acquireVsCodeApi`), the app is set up to detect this environment and **use mock data**.

You will see console warnings indicating that mocked data (e.g., hardcoded reviewers) is being used. This allows you to test UI flows and animations rapidly.

-----

## 📦 Building for the Extension

When you are ready to integrate changes back into the VS Code extension, you must build the project into static assets (`index.js` and `index.css`) and move them to the extension's `media` folder.

We have a dedicated script for this pipeline.

### Build and Deploy Script

Run the following command to build the React app for production and automatically copy the output files to the parent extension's media directory:

```bash
npm run build
```

**Note: Check `package.json` to see the exact paths used in this script. It typically runs `vite build` followed by a copy command.**

### Vite Configuration Note

The `vite.config.ts` file is specifically configured to:

1. Use a relative base path (`base: './'`) so assets load correctly within the VS Code webview context.
2. Disable file hashing in filenames (outputting predictable names like `index.js` instead of `index.c8a2e.js`), making it easier for the extension host to load them.

-----

## 📂 Project Structure

```
/src
  ├── components/
  │   └── QuestionStep.tsx   # The reusable UI component for a single form step
  ├── App.tsx                # Main application logic, state, and VS Code communication
  ├── types.ts               # Shared TypeScript interfaces (FormData, Questions, ExtensionMessage)
  ├── index.css              # Global styles and VS Code theme variable mappings
  └── main.tsx               # React entry point
```