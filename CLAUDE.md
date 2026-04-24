# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps + prisma generate + migrate
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (unit tests)
npm run db:reset     # Reset SQLite database
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates and edits code using tool calls; the result renders live in an iframe.

### Request / response flow

1. **User types in chat** → `ChatProvider` (`src/lib/contexts/chat-context.tsx`) accumulates messages and the current virtual filesystem state, then POSTs to `/api/chat`.
2. **`/api/chat`** (`src/app/api/chat/route.ts`) reconstructs a `VirtualFileSystem` from the serialized state, builds the system prompt (`src/lib/prompts/generation.tsx`), and calls Claude via the Vercel AI SDK with two tools: `str_replace_editor` and `file_manager`.
3. **Tool calls** from Claude are handled server-side and mutate the `VirtualFileSystem`. The updated filesystem is streamed back to the client.
4. **PreviewFrame** (`src/components/preview/`) receives file contents, runs Babel JSX transformation (`src/lib/transform/jsx-transformer.ts`), and renders the output in a sandboxed iframe.
5. **Persistence** — authenticated users have project messages and filesystem state saved as JSON strings in SQLite via Prisma server actions (`src/actions/`).

### Key abstractions

- **`VirtualFileSystem`** (`src/lib/file-system.ts`) — in-memory file store; serialized as JSON between client and server so there are no disk writes.
- **AI tools** (`src/lib/tools/`) — `str_replace_editor` for targeted text edits, `file_manager` for create/rename/delete; these are the only way Claude modifies files.
- **Language model provider** (`src/lib/provider.ts`) — returns the real Anthropic client when `ANTHROPIC_API_KEY` is set, otherwise a `MockLanguageModel` that returns static code. Max 40 tool steps for real, 4 for mock.
- **Auth** (`src/lib/auth.ts`, `src/middleware.ts`) — JWT sessions in httpOnly cookies (7-day expiry); server actions in `src/actions/` handle sign-up/login/logout.

### Tech stack

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4
- Prisma + SQLite (`prisma/schema.prisma`)
- Anthropic Claude (`claude-haiku-4-5`) via `@ai-sdk/anthropic` with prompt caching on the system message
- Monaco Editor for code editing, shadcn/ui (Radix + Tailwind) for UI primitives
- Vitest + React Testing Library for tests

### Path alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
