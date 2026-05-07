## Fix scrollbar in empty chatbot state

Replace `h-full` with `min-h-full` on the empty-state wrapper inside the messages container in `src/components/ChatBot.tsx`. This lets the empty state fill available space without exceeding the parent's content box (which is shrunk by `p-4` padding), removing the spurious scrollbar.

### Change
- **File**: `src/components/ChatBot.tsx` (~line 251)
- **From**: `<div className="relative h-full flex flex-col items-center justify-center ...">`
- **To**: `<div className="relative min-h-full flex flex-col items-center justify-center ...">`

No other behavior changes; once messages exist, scrolling continues to work as before.