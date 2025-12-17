export interface Choice {
  name: string;
  value: string;
}

export type Question =
  | { type: 'input'; name: string; message: string; placeholder?: string; required?: boolean }
  | { type: 'list'; name: string; message: string; choices: Choice[]; required?: boolean };

export interface FormData {
  [key: string]: string;
}

// Payload coming FROM the VS Code Extension
export interface ExtensionState {
  reviewers: Choice[];
  prefix?: string;
}

export type ExtensionMessage = {
  command: 'init';
  data: ExtensionState;
};

export type WebviewMessage =
  | { command: 'webviewLoaded' }
  | { command: 'submit'; text: string };

export interface VsCodeApi {
  postMessage: (message: WebviewMessage) => void;
}

declare global {
  interface Window {
    acquireVsCodeApi?: () => VsCodeApi;
  }
}