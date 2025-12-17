import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionStep from './components/QuestionStep';
import type { Question, FormData, Choice, ExtensionMessage } from './types';
import { generateCommitMessage } from './utils/generator';

// --- VS CODE API INITIALIZATION ---
// This grabs the API injected by the VS Code host
const vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : null;

// --- ANIMATION VARIANTS ---
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.99
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.99
  }),
};

const App: React.FC = () => {
  // --- STATE ---
  const [reviewers, setReviewers] = useState<Choice[]>([]);
  const [prefix, setPrefix] = useState<string | undefined>('');
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<FormData>({});
  const [finished, setFinished] = useState(false);
  const [finalString, setFinalString] = useState('');
  const [loaded, setLoaded] = useState(false);

  // --- 1. LISTEN FOR VS CODE DATA ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as ExtensionMessage;
      if (message.command === 'init') {
        setReviewers(message.data.reviewers);
        setPrefix(message.data.prefix);
        setLoaded(true);
      }
    };

    window.addEventListener('message', handleMessage);

    if (vscode) {
      vscode.postMessage({ command: 'webviewLoaded' });
    } else {
      // Mock for browser testing
      console.warn('VS Code API not found. Using mock data.');
      setTimeout(() => {
        window.postMessage({
          command: 'init',
          data: {
            reviewers: [
              { name: 'Joe (Dev)', value: 'Joe' },
              { name: 'Alice (Lead)', value: 'Alice' }
            ]
          }
        }, '*');
      }, 500);
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- 2. DYNAMIC QUESTIONS CONFIG ---
  const questions: Question[] = useMemo(() => {
    // 1. Determine if Issue Number is mandatory based on previous answer
    const currentType = answers.change_type;
    const isIssueRequired = ['feat', 'enh', 'fix'].includes(currentType || '');

    // 2. Define the full list of potential questions
    const allQuestions: Question[] = [
      {
        type: 'list',
        name: 'change_type',
        message: 'Select the type of change:',
        required: true,
        choices: [
          { value: 'maint', name: 'maint: General maintenance (Writing Automatic tests, Updating dependencies...)' },
          { value: 'bug', name: 'bug: Internal bug fixing (not reported in bug tracking system)' },
          { value: 'feat', name: 'feat: A new feature' },
          { value: 'enh', name: 'enh: An enhancement' },
          { value: 'fix', name: 'fix: PR issued in Jira/ClearQuest' },
          { value: 'docs', name: 'docs: Update documentation' },
        ]
      },
      {
        type: 'input',
        name: 'issue_number',
        // Dynamic label logic
        message: !prefix
          ? 'Enter issue number:'
          : `Enter issue number (Prefix "${prefix}-" will be added):`,
        placeholder: 'e.g. 1234',
        // Dynamic required logic
        required: isIssueRequired
      },
      {
        type: 'input',
        name: 'message',
        message: 'Short description:',
        placeholder: 'e.g. updated api endpoint',
        required: true
      },
      {
        type: 'list',
        name: 'reviewer1',
        message: 'Select the first reviewer (Technical review):',
        choices: reviewers,
        required: true
      },
      {
        type: 'list',
        name: 'reviewer2',
        message: 'Select the second reviewer (Functional review):',
        choices: reviewers,
        required: true
      }
    ];

    // 3. Filter out issue_number if the type is 'bug'
    if (currentType === 'bug') {
      return allQuestions.filter(q => q.name !== 'issue_number');
    }

    return allQuestions;
  }, [reviewers, prefix, answers.change_type]);

  const currentQ = questions[index];

  // --- LOGIC ---
  const goNext = () => {
    const val = answers[currentQ.name];
    if (currentQ.required && (!val || val.trim() === '')) {
      return;
    }

    if (index < questions.length - 1) {
      setDirection(1);
      setIndex((prev) => prev + 1);
    } else {
      // TRANSITION TO PREVIEW
      const result = generateCommitMessage(answers, prefix);
      setFinalString(result);
      setFinished(true);
    }
  };

  const goBack = () => {
    if (index > 0) {
      setDirection(-1);
      setIndex((prev) => prev - 1);
    }
  };

  const handleUpdate = (val: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.name]: val }));
  };

  const handleSubmit = () => {
    if (vscode) {
      vscode.postMessage({ command: 'submit', text: finalString });
    } else {
      console.log('Submitted (Browser Mode):', finalString);
    }
  };

  // --- RENDER ---
  if (!loaded) {
    return <div className="h-screen flex items-center justify-center text-[--vscode-descriptionForeground]">Loading configuration...</div>;
  }

  // --- FINAL PREVIEW SCREEN ---
  if (finished) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-[--vscode-editor-background] text-[--vscode-editor-foreground] p-5">
        <div className="text-3xl font-semibold">Ready to Commit?</div>

        <div className="w-full max-w-lg bg-[--vscode-editorWidget-background] border border-[--vscode-editorWidget-border] p-4 rounded-sm">
          <code className="block w-full break-all font-mono text-sm text-[--vscode-textPreformat-foreground]">
            {finalString}
          </code>
        </div>

        {/* --- STAGE FILES WARNING --- */}
        <div className="flex items-start gap-2 max-w-lg text-xs opacity-80 bg-[--vscode-inputValidation-warningBackground] border border-[--vscode-inputValidation-warningBorder] p-3 rounded">
          <span className="text-lg">⚠️</span>
          <p>
            Please ensure you have <strong>staged your files</strong> in the Source Control tab before clicking Commit.
            This action will use the currently staged changes.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setFinished(false)}
            className="px-6 py-2 text-sm opacity-80 hover:opacity-100"
          >
            Edit
          </button>
          <button
            className="px-6 py-2 text-sm text-white font-medium shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--vscode-button-background)' }}
            onClick={handleSubmit}
          >
            Commit
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  // --- QUESTIONS CAROUSEL ---
  return (
    <div className="h-screen w-full relative flex flex-col items-center justify-center overflow-hidden bg-[--vscode-editor-background] text-[--vscode-editor-foreground]">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-[--vscode-editorWidget-border]">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${((index + 1) / questions.length) * 100}%`,
            backgroundColor: 'var(--vscode-progressBar-background, #0e639c)'
          }}
        />
      </div>

      <div className="relative w-full max-w-lg flex flex-col items-center gap-6">
        {/* The Question Card */}
        <div className="relative w-full h-[400px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <QuestionStep
                question={currentQ}
                value={answers[currentQ.name] || ''}
                onChange={handleUpdate}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-4">
          <button
            disabled={index === 0}
            onClick={goBack}
            className="px-6 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
          >
            Back
          </button>
          <button
            onClick={goNext}
            className="px-6 py-2 text-sm font-medium bg-[--vscode-button-background] text-white hover:opacity-90 transition-opacity"
          >
            {index < questions.length - 1 ? 'Next' : 'Preview'}
          </button>
        </div>
      </div>
      <div className='w-50 h-50 bg-red-100'>.</div>
    </div>
  );
};

export default App;