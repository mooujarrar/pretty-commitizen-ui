import React from "react";
import type { Question } from "../types";

interface QuestionStepProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

const QuestionStep: React.FC<QuestionStepProps> = ({
  question,
  value,
  onChange,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className="p-6 rounded-md shadow-lg border"
        style={{
          backgroundColor: "var(--vscode-editorWidget-background)",
          borderColor: "var(--vscode-editorWidget-border)",
        }}
      >
        {/* --- TITLE --- */}
        <h2
          className="text-base font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--vscode-editor-foreground)" }}
        >
          {question.message}
          {question.required && (
            <span style={{ color: "var(--vscode-errorForeground)" }}>*</span>
          )}
        </h2>

        {/* --- INPUT TYPE --- */}
        {question.type === "input" && (
          <div className="flex flex-col gap-2">
            <input
              autoFocus
              type="text"
              className="vscode-focus w-full px-3 py-2 text-sm border outline-none"
              style={{
                backgroundColor: "var(--vscode-input-background)",
                color: "var(--vscode-input-foreground)",
                borderColor: "var(--vscode-input-border)",
              }}
              placeholder={question.placeholder || ""}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        )}

        {/* --- LIST TYPE --- */}
        {question.type === "list" && (
          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
            {question.choices.map((choice, idx) => {
              const isActive = value === choice.value;

              return (
                <button
                  key={choice.value}
                  autoFocus={idx === 0}
                  onClick={() => {
                    // ONLY update state, do not trigger navigation
                    onChange(choice.value);
                  }}
                  className="w-full text-left px-3 py-2 text-sm cursor-pointer outline-none border border-transparent focus:border-[var(--vscode-focusBorder)]"
                  style={{
                    backgroundColor: isActive
                      ? "var(--vscode-list-activeSelectionBackground)"
                      : "transparent",
                    color: isActive
                      ? "var(--vscode-list-activeSelectionForeground)"
                      : "var(--vscode-list-hoverForeground)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "var(--vscode-list-hoverBackground)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <span className="font-medium">{choice.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionStep;
