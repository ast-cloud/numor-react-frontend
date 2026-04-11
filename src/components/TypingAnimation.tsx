import { useState, useEffect, useCallback } from "react";

const questions = [
  "What's my total revenue this month?",
  "Show me overdue invoices",
  "How much did I spend on marketing?",
  "Compare Q1 vs Q2 expenses",
  "Who are my top 5 clients?",
  "What's my cash flow forecast?",
];

const TypingAnimation = () => {
  const [displayText, setDisplayText] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = questions[questionIndex];

  const tick = useCallback(() => {
    if (!isDeleting) {
      if (displayText.length < currentQuestion.length) {
        setDisplayText(currentQuestion.slice(0, displayText.length + 1));
        return 60 + Math.random() * 40;
      } else {
        // Pause before deleting
        setIsDeleting(true);
        return 1800;
      }
    } else {
      if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1));
        return 30;
      } else {
        setIsDeleting(false);
        setQuestionIndex((i) => (i + 1) % questions.length);
        return 400;
      }
    }
  }, [displayText, isDeleting, currentQuestion]);

  useEffect(() => {
    const delay = tick();
    const timeout = setTimeout(() => tick(), delay);
    // Re-run effect when state changes
    return () => clearTimeout(timeout);
  }, []);

  // Use a separate effect for the typing loop
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const run = () => {
      setDisplayText((prev) => {
        const question = questions[questionIndex];
        if (!isDeleting) {
          if (prev.length < question.length) {
            return question.slice(0, prev.length + 1);
          }
          return prev;
        } else {
          return prev.slice(0, -1);
        }
      });
    };

    // Determine delay based on current state
    let delay: number;
    if (!isDeleting) {
      if (displayText.length < currentQuestion.length) {
        delay = 60 + Math.random() * 40;
      } else {
        delay = 1800;
        timeout = setTimeout(() => setIsDeleting(true), delay);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText.length > 0) {
        delay = 30;
      } else {
        delay = 400;
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setQuestionIndex((i) => (i + 1) % questions.length);
        }, delay);
        return () => clearTimeout(timeout);
      }
    }

    timeout = setTimeout(run, delay);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, questionIndex, currentQuestion]);

  return (
    <div className="w-full flex flex-col">
      {/* Chat area */}
      <div className="flex flex-col p-4 gap-3">
        {/* Sample AI response bubbles */}
        <div className="flex gap-2 items-start">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-primary">AI</span>
          </div>
          <div className="bg-secondary/50 rounded-lg rounded-tl-none px-3 py-2 max-w-[80%]">
            <p className="text-xs text-muted-foreground">
              Your total revenue this month is <span className="text-foreground font-semibold">₹4,52,300</span>. That's a 12% increase from last month.
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-start">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-primary">AI</span>
          </div>
          <div className="bg-secondary/50 rounded-lg rounded-tl-none px-3 py-2 max-w-[80%]">
            <p className="text-xs text-muted-foreground">
              You have <span className="text-foreground font-semibold">3 overdue invoices</span> totaling ₹87,500. Want me to send reminders?
            </p>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2.5">
          <div className="flex-1 min-h-[20px]">
            <span className="text-sm text-foreground">{displayText}</span>
            <span
              className={`inline-block w-[2px] h-4 bg-primary ml-[1px] align-middle transition-opacity duration-100 ${
                cursorVisible ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
          <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingAnimation;
