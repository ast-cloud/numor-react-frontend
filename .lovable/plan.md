

## Plan: Switch ChatBot to SSE streaming endpoint

### Change: `src/components/ChatBot.tsx` — `handleSend` function (lines 95-120)

Replace the current `fetch` + `res.json()` approach with:

1. **POST to `/api/chatbot/chat/stream`** instead of `/api/chatbot/chat/`
2. **Immediately add an empty assistant message** to `messages` state (for live token-by-token display)
3. **Read the SSE stream** using `res.body.getReader()` + `TextDecoder`:
   - Parse each `data: <token>` line and append to the assistant message content
   - On `event: end` — stop reading
   - On `event: error` — show error in the message
4. Set `isLoading = false` after stream completes

The streaming logic:
```
- Read chunks from reader
- Split by "\n\n" to get SSE frames
- For lines starting with "data: " (not preceded by "event:"), append token to assistant message
- For "event: end", break
- For "event: error", show error
```

No other files need changes. The request body and auth headers stay the same.

