<!-- ab7ee216-898f-4820-8fbd-62fd13ace681 155af278-0f02-4e6f-9a34-5f24fc697c84 -->
# Plan: Chuẩn bị toàn bộ dự án Frontend + Backend

## Mục tiêu

Chuẩn bị đầy đủ cấu trúc thư mục, dependencies, config files, và skeleton code cho cả frontend (Next.js) và backend (NestJS) theo các file documentation đã cung cấp.

---

## Phase 1: Frontend Setup (client/)

### 1.1 Cấu trúc thư mục

Tạo đầy đủ folder structure theo `frontend.md`:

- `app/(auth)/`, `app/(dashboard)/`, `app/p/`, `app/api/`
- `components/ui/`, `components/layout/`, `components/editor/`, `components/kanban/`, `components/workspace/`, `components/ai/`, `components/realtime/`, `components/shared/`
- `lib/`, `hooks/`, `store/`, `types/`, `styles/`

### 1.2 Dependencies

Cài đặt packages theo tech stack trong `frontend.md`:

- Form: `react-hook-form`, `@hookform/resolvers`, `zod`
- Table: `@tanstack/react-table`
- Charts: `recharts`
- Editor: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*`
- State: `zustand`, `@tanstack/react-query`
- Realtime: `socket.io-client`
- Animation: `framer-motion`
- Utils: `date-fns`, `axios`
- Theme: `next-themes`

### 1.3 Config files

- Update `tsconfig.json` với paths aliases
- Tạo/update `tailwind.config.ts` với design system colors
- Tạo `lib/utils.ts` với `cn()` helper (nếu chưa có)
- Setup `next-themes` provider trong layout

### 1.4 Skeleton code chính

- **Auth pages**: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
- **Dashboard layout**: `app/(dashboard)/layout.tsx` với Sidebar + Header
- **Workspace pages**: `app/(dashboard)/workspace/[workspaceId]/page.tsx`
- **Page editor**: `app/(dashboard)/workspace/[workspaceId]/pages/[pageId]/page.tsx`
- **Board**: `app/(dashboard)/workspace/[workspaceId]/boards/[boardId]/page.tsx`
- **Public page**: `app/p/[slug]/page.tsx`
- **Components skeleton**: Sidebar, Header, TipTapEditor, BoardView, AIPanel
- **Hooks**: `useAuth.ts`, `useSocket.ts`, `useRealtime.ts`
- **Stores**: `authStore.ts`, `workspaceStore.ts`, `editorStore.ts`
- **Types**: `api.types.ts`, `workspace.types.ts`, `page.types.ts`
- **API client**: `lib/api.ts` với axios + interceptors
- **Validations**: `lib/validations/auth.schema.ts`, `workspace.schema.ts`

---

## Phase 2: Backend Setup (server/)

### 2.1 Cấu trúc thư mục

Tạo đầy đủ folder structure theo `backend.md`:

- `src/auth/` với strategies, guards, decorators, dto
- `src/users/`, `src/workspaces/`, `src/pages/`, `src/boards/`, `src/comments/`
- `src/ai/` với ollama, gemini, embedding, rag
- `src/search/`, `src/files/`, `src/realtime/`
- `src/common/` với decorators, filters, interceptors, pipes, guards
- `src/database/`, `src/config/`, `src/utils/`

### 2.2 Dependencies

Cài đặt packages theo tech stack:

- Database: `@nestjs/typeorm`, `typeorm`, `pg`, `pgvector`
- Redis: `@nestjs/redis`, `redis`, `ioredis`
- Auth: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `passport-local`, `passport-gitlab2`, `bcrypt`
- WebSocket: `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
- File: `minio`
- Validation: `class-validator`, `class-transformer`
- Utils: `uuid`, `date-fns`, `winston` hoặc `pino`
- Security: `helmet`, `compression`

### 2.3 Config files

- `src/config/config.module.ts` - ConfigModule với ConfigService
- `src/config/database.config.ts` - TypeORM config
- `src/config/redis.config.ts` - Redis config
- `src/config/minio.config.ts` - MinIO config
- `src/config/ai.config.ts` - AI provider config
- Update `.env.example` với đầy đủ variables (đã có, chỉ cần review)

### 2.4 Entities

Tạo tất cả entities theo `database-schema.md`:

- `users/entities/user.entity.ts`
- `workspaces/entities/workspace.entity.ts`
- `workspaces/entities/workspace-member.entity.ts`
- `pages/entities/page.entity.ts`
- `pages/entities/page-history.entity.ts`
- `pages/blocks/entities/block.entity.ts`
- `pages/blocks/entities/block-history.entity.ts`
- `boards/entities/board.entity.ts`
- `boards/cards/entities/card.entity.ts`
- `comments/entities/comment.entity.ts`
- `ai/embedding/entities/embedding.entity.ts`
- `files/entities/file-upload.entity.ts`

### 2.5 Modules skeleton

Tạo modules với controllers, services, DTOs cơ bản:

- **Auth Module**: GitLab OAuth strategy, JWT guards, login/register endpoints
- **Users Module**: CRUD users
- **Workspaces Module**: CRUD workspaces, members management, permission guard
- **Pages Module**: CRUD pages, blocks service, publish endpoints
- **Boards Module**: CRUD boards, cards service
- **Comments Module**: CRUD comments
- **AI Module**: Ollama/Gemini services, RAG service, embedding service
- **Search Module**: Full-text + semantic search services
- **Files Module**: MinIO service, upload/download endpoints
- **Realtime Module**: Socket.IO gateway, presence service

### 2.6 Database setup

- `src/database/database.module.ts` - TypeORM root module
- Migration files cơ bản (hoặc setup migration structure)
- Enable pgvector extension

### 2.7 Common utilities

- `common/filters/http-exception.filter.ts` - Global exception filter
- `common/pipes/validation.pipe.ts` - Validation pipe
- `common/interceptors/logging.interceptor.ts` - Logging
- `common/interceptors/transform.interceptor.ts` - Response transform
- `utils/logger.ts` - Winston/Pino logger

### 2.8 Main application setup

- Update `main.ts` với global pipes, filters, CORS, security
- Update `app.module.ts` với tất cả modules

---

## Phase 3: Shared & Root Level

### 3.1 Docker & Deployment

- Review `docker-compose.yml` (đã có)
- Thêm services cho frontend và backend nếu cần
- Tạo Dockerfile cho backend

### 3.2 Root level files

- Review và update `README.md` với setup instructions
- Tạo `.gitignore` phù hợp

---

## Implementation Order

1. **Frontend dependencies** → Cài packages
2. **Frontend folder structure** → Tạo folders
3. **Frontend config files** → Setup configs
4. **Frontend skeleton code** → Tạo components, hooks, stores
5. **Backend dependencies** → Cài packages  
6. **Backend folder structure** → Tạo folders
7. **Backend config files** → Setup configs
8. **Backend entities** → Tạo entities
9. **Backend modules** → Tạo modules skeleton
10. **Backend main setup** → Wire everything together
11. **Review & cleanup** → Kiểm tra và hoàn thiện

## Implementation Todos

### Phase 1: Frontend Setup

#### Frontend Dependencies

- **frontend-deps-form**: Cài đặt form packages (react-hook-form, @hookform/resolvers, zod)
- **frontend-deps-table**: Cài đặt table packages (@tanstack/react-table)
- **frontend-deps-charts**: Cài đặt charts (recharts)
- **frontend-deps-editor**: Cài đặt TipTap editor packages (@tiptap/react, starter-kit, extensions)
- **frontend-deps-state**: Cài đặt state management (zustand, @tanstack/react-query)
- **frontend-deps-realtime**: Cài đặt realtime (socket.io-client)
- **frontend-deps-animation**: Cài đặt animation (framer-motion)
- **frontend-deps-utils**: Cài đặt utils (date-fns, axios, next-themes)

#### Frontend Folder Structure

- **frontend-folder-app**: Tạo app router structure ((auth)/, (dashboard)/, p/, api/)
- **frontend-folder-components**: Tạo components folders (ui/, layout/, editor/, kanban/, workspace/, ai/, realtime/, shared/)
- **frontend-folder-lib**: Tạo lib/ với subfolders (validations/)
- **frontend-folder-hooks**: Tạo hooks/ folder
- **frontend-folder-store**: Tạo store/ folder
- **frontend-folder-types**: Tạo types/ folder

#### Frontend Config Files

- **frontend-config-tsconfig**: Update tsconfig.json với paths aliases (@/...)
- **frontend-config-tailwind**: Tạo/update tailwind.config.ts với design system colors
- **frontend-config-utils**: Tạo lib/utils.ts với cn() helper
- **frontend-config-theme**: Setup next-themes provider trong layout

#### Frontend Skeleton Code - Pages

- **frontend-page-login**: Tạo app/(auth)/login/page.tsx
- **frontend-page-register**: Tạo app/(auth)/register/page.tsx
- **frontend-layout-dashboard**: Tạo app/(dashboard)/layout.tsx với Sidebar + Header
- **frontend-page-workspace**: Tạo app/(dashboard)/workspace/[workspaceId]/page.tsx
- **frontend-page-editor**: Tạo app/(dashboard)/workspace/[workspaceId]/pages/[pageId]/page.tsx
- **frontend-page-board**: Tạo app/(dashboard)/workspace/[workspaceId]/boards/[boardId]/page.tsx
- **frontend-page-public**: Tạo app/p/[slug]/page.tsx

#### Frontend Skeleton Code - Components

- **frontend-component-sidebar**: Tạo components/layout/Sidebar.tsx
- **frontend-component-header**: Tạo components/layout/Header.tsx
- **frontend-component-navigation**: Tạo components/layout/Navigation.tsx
- **frontend-component-breadcrumb**: Tạo components/layout/Breadcrumb.tsx
- **frontend-component-editor**: Tạo components/editor/TipTapEditor.tsx
- **frontend-component-board**: Tạo components/kanban/BoardView.tsx
- **frontend-component-ai**: Tạo components/ai/AIPanel.tsx
- **frontend-component-presence**: Tạo components/realtime/PresenceIndicator.tsx

#### Frontend Skeleton Code - Core

- **frontend-hook-auth**: Tạo hooks/useAuth.ts
- **frontend-hook-socket**: Tạo hooks/useSocket.ts
- **frontend-hook-realtime**: Tạo hooks/useRealtime.ts
- **frontend-store-auth**: Tạo store/authStore.ts với Zustand
- **frontend-store-workspace**: Tạo store/workspaceStore.ts
- **frontend-store-editor**: Tạo store/editorStore.ts
- **frontend-api-client**: Tạo lib/api.ts với axios + interceptors
- **frontend-types-api**: Tạo types/api.types.ts
- **frontend-types-workspace**: Tạo types/workspace.types.ts
- **frontend-types-page**: Tạo types/page.types.ts
- **frontend-validations-auth**: Tạo lib/validations/auth.schema.ts với Zod
- **frontend-validations-workspace**: Tạo lib/validations/workspace.schema.ts

### Phase 2: Backend Setup

#### Backend Dependencies

- **backend-deps-database**: Cài đặt database packages (@nestjs/typeorm, typeorm, pg)
- **backend-deps-redis**: Cài đặt Redis packages (@nestjs/redis, ioredis)
- **backend-deps-auth**: Cài đặt auth packages (@nestjs/jwt, @nestjs/passport, passport packages, bcrypt)
- **backend-deps-websocket**: Cài đặt WebSocket packages (@nestjs/websockets, @nestjs/platform-socket.io, socket.io)
- **backend-deps-file**: Cài đặt file storage (minio)
- **backend-deps-validation**: Cài đặt validation (class-validator, class-transformer)
- **backend-deps-utils**: Cài đặt utils (uuid, date-fns, winston/pino)
- **backend-deps-security**: Cài đặt security (helmet, compression)

#### Backend Folder Structure

- **backend-folder-auth**: Tạo src/auth/ với subfolders (strategies/, guards/, decorators/, dto/)
- **backend-folder-users**: Tạo src/users/
- **backend-folder-workspaces**: Tạo src/workspaces/ với workspace-members/
- **backend-folder-pages**: Tạo src/pages/ với blocks/ và page-history/
- **backend-folder-boards**: Tạo src/boards/ với cards/
- **backend-folder-comments**: Tạo src/comments/
- **backend-folder-ai**: Tạo src/ai/ với ollama/, gemini/, embedding/, rag/
- **backend-folder-search**: Tạo src/search/
- **backend-folder-files**: Tạo src/files/
- **backend-folder-realtime**: Tạo src/realtime/
- **backend-folder-common**: Tạo src/common/ với decorators/, filters/, interceptors/, pipes/, guards/
- **backend-folder-database**: Tạo src/database/
- **backend-folder-config**: Tạo src/config/
- **backend-folder-utils**: Tạo src/utils/

#### Backend Config Files

- **backend-config-module**: Tạo src/config/config.module.ts với ConfigModule
- **backend-config-database**: Tạo src/config/database.config.ts cho TypeORM
- **backend-config-redis**: Tạo src/config/redis.config.ts
- **backend-config-minio**: Tạo src/config/minio.config.ts
- **backend-config-ai**: Tạo src/config/ai.config.ts cho AI providers

#### Backend Entities

- **backend-entity-user**: Tạo users/entities/user.entity.ts
- **backend-entity-workspace**: Tạo workspaces/entities/workspace.entity.ts
- **backend-entity-workspace-member**: Tạo workspaces/entities/workspace-member.entity.ts
- **backend-entity-page**: Tạo pages/entities/page.entity.ts
- **backend-entity-page-history**: Tạo pages/entities/page-history.entity.ts
- **backend-entity-block**: Tạo pages/blocks/entities/block.entity.ts
- **backend-entity-block-history**: Tạo pages/blocks/entities/block-history.entity.ts
- **backend-entity-board**: Tạo boards/entities/board.entity.ts
- **backend-entity-card**: Tạo boards/cards/entities/card.entity.ts
- **backend-entity-comment**: Tạo comments/entities/comment.entity.ts
- **backend-entity-embedding**: Tạo ai/embedding/entities/embedding.entity.ts với pgvector
- **backend-entity-file**: Tạo files/entities/file-upload.entity.ts

#### Backend Modules - Auth

- **backend-module-auth**: Tạo auth.module.ts
- **backend-auth-controller**: Tạo auth.controller.ts với login/register/OAuth endpoints
- **backend-auth-service**: Tạo auth.service.ts với JWT logic
- **backend-auth-gitlab-strategy**: Tạo strategies/gitlab.strategy.ts
- **backend-auth-local-strategy**: Tạo strategies/local.strategy.ts
- **backend-auth-jwt-guard**: Tạo guards/jwt-auth.guard.ts
- **backend-auth-decorators**: Tạo decorators (current-user.decorator.ts, public.decorator.ts)
- **backend-auth-dtos**: Tạo DTOs (login.dto.ts, register.dto.ts)

#### Backend Modules - Users

- **backend-module-users**: Tạo users.module.ts
- **backend-users-controller**: Tạo users.controller.ts
- **backend-users-service**: Tạo users.service.ts với CRUD
- **backend-users-entity**: Link user.entity.ts vào module

#### Backend Modules - Workspaces

- **backend-module-workspaces**: Tạo workspaces.module.ts
- **backend-workspaces-controller**: Tạo workspaces.controller.ts với CRUD
- **backend-workspaces-service**: Tạo workspaces.service.ts
- **backend-workspace-members-service**: Tạo workspace-members/workspace-members.service.ts
- **backend-workspace-permission-guard**: Tạo guards/workspace-permission.guard.ts

#### Backend Modules - Pages

- **backend-module-pages**: Tạo pages.module.ts
- **backend-pages-controller**: Tạo pages.controller.ts với CRUD + publish endpoints
- **backend-pages-service**: Tạo pages.service.ts
- **backend-blocks-service**: Tạo blocks/blocks.service.ts
- **backend-page-history-service**: Tạo page-history/page-history.service.ts

#### Backend Modules - Boards

- **backend-module-boards**: Tạo boards.module.ts
- **backend-boards-controller**: Tạo boards.controller.ts
- **backend-boards-service**: Tạo boards.service.ts
- **backend-cards-service**: Tạo cards/cards.service.ts

#### Backend Modules - Other

- **backend-module-comments**: Tạo comments.module.ts với controller và service
- **backend-module-ai**: Tạo ai.module.ts với các sub-services
- **backend-ai-ollama-service**: Tạo ai/ollama/ollama.service.ts
- **backend-ai-gemini-service**: Tạo ai/gemini/gemini.service.ts
- **backend-ai-embedding-service**: Tạo ai/embedding/embedding.service.ts
- **backend-ai-rag-service**: Tạo ai/rag/rag.service.ts
- **backend-ai-controller**: Tạo ai.controller.ts với /summarize, /ask, /brainstorm endpoints
- **backend-module-search**: Tạo search.module.ts với full-text + semantic search
- **backend-module-files**: Tạo files.module.ts với MinIO service
- **backend-files-minio-service**: Tạo files/minio.service.ts
- **backend-module-realtime**: Tạo realtime.module.ts
- **backend-realtime-gateway**: Tạo realtime/realtime.gateway.ts với Socket.IO
- **backend-realtime-presence**: Tạo realtime/presence.service.ts

#### Backend Common Utilities

- **backend-exception-filter**: Tạo common/filters/http-exception.filter.ts
- **backend-validation-pipe**: Tạo common/pipes/validation.pipe.ts
- **backend-logging-interceptor**: Tạo common/interceptors/logging.interceptor.ts
- **backend-transform-interceptor**: Tạo common/interceptors/transform.interceptor.ts
- **backend-logger**: Tạo utils/logger.ts với Winston/Pino

#### Backend Database Setup

- **backend-database-module**: Tạo database/database.module.ts với TypeORM config
- **backend-database-extension**: Setup pgvector extension trong database config

#### Backend Main Application

- **backend-main-update**: Update main.ts với global pipes, filters, CORS, helmet, compression
- **backend-app-module**: Update app.module.ts import tất cả modules

### Phase 3: Shared & Root Level

#### Docker & Deployment

- **docker-review**: Review docker-compose.yml
- **docker-backend-file**: Tạo Dockerfile cho backend trong server/

#### Root Level

- **root-readme**: Review và update README.md với setup instructions
- **root-gitignore**: Review và update .gitignore

---

## Files quan trọng sẽ tạo/cập nhật

### Frontend

- `client/package.json` - Dependencies
- `client/app/` - App Router structure
- `client/components/` - All component folders + skeletons
- `client/lib/api.ts` - API client
- `client/lib/validations/` - Zod schemas
- `client/hooks/`, `client/store/`, `client/types/`

### Backend

- `server/package.json` - Dependencies
- `server/src/config/` - All config files
- `server/src/**/entities/` - All entities
- `server/src/**/*.module.ts` - All modules
- `server/src/**/*.service.ts` - Service skeletons
- `server/src/**/*.controller.ts` - Controller skeletons
- `server/src/**/dto/*.dto.ts` - DTOs
- `server/src/main.ts` - App bootstrap với middleware

### To-dos

- [ ] Cài đặt form packages (react-hook-form, @hookform/resolvers, zod)
- [ ] Cài đặt table packages (@tanstack/react-table)
- [ ] Cài đặt charts (recharts)
- [ ] Cài đặt TipTap editor packages (@tiptap/react, starter-kit, extensions)
- [ ] Cài đặt state management (zustand, @tanstack/react-query)
- [ ] Cài đặt realtime (socket.io-client)
- [ ] Cài đặt animation (framer-motion)
- [ ] Cài đặt utils (date-fns, axios, next-themes)
- [ ] Tạo app router structure ((auth)/, (dashboard)/, p/, api/)
- [ ] Tạo components folders (ui/, layout/, editor/, kanban/, workspace/, ai/, realtime/, shared/)
- [ ] Tạo lib/ với subfolders (validations/)
- [ ] Tạo hooks/ folder
- [ ] Tạo store/ folder
- [ ] Tạo types/ folder
- [ ] Update tsconfig.json với paths aliases (@/...)
- [ ] Tạo/update tailwind.config.ts với design system colors
- [ ] Tạo lib/utils.ts với cn() helper
- [ ] Setup next-themes provider trong layout
- [ ] Tạo app/(auth)/login/page.tsx
- [ ] Tạo app/(auth)/register/page.tsx
- [ ] Tạo app/(dashboard)/layout.tsx với Sidebar + Header
- [ ] Tạo app/(dashboard)/workspace/[workspaceId]/page.tsx
- [ ] Tạo app/(dashboard)/workspace/[workspaceId]/pages/[pageId]/page.tsx
- [ ] Tạo app/(dashboard)/workspace/[workspaceId]/boards/[boardId]/page.tsx
- [ ] Tạo app/p/[slug]/page.tsx
- [ ] Tạo components/layout/Sidebar.tsx
- [ ] Tạo components/layout/Header.tsx
- [ ] Tạo components/layout/Navigation.tsx
- [ ] Tạo components/layout/Breadcrumb.tsx
- [ ] Tạo components/editor/TipTapEditor.tsx
- [ ] Tạo components/kanban/BoardView.tsx
- [ ] Tạo components/ai/AIPanel.tsx
- [ ] Tạo components/realtime/PresenceIndicator.tsx
- [ ] Tạo hooks/useAuth.ts
- [ ] Tạo hooks/useSocket.ts
- [ ] Tạo hooks/useRealtime.ts
- [ ] Tạo store/authStore.ts với Zustand
- [ ] Tạo store/workspaceStore.ts
- [ ] Tạo store/editorStore.ts
- [ ] Tạo lib/api.ts với axios + interceptors
- [ ] Tạo types/api.types.ts
- [ ] Tạo types/workspace.types.ts
- [ ] Tạo types/page.types.ts
- [ ] Tạo lib/validations/auth.schema.ts với Zod
- [ ] Tạo lib/validations/workspace.schema.ts
- [ ] Cài đặt database packages (@nestjs/typeorm, typeorm, pg)
- [ ] Cài đặt Redis packages (@nestjs/redis, ioredis)
- [ ] Cài đặt auth packages (@nestjs/jwt, @nestjs/passport, passport packages, bcrypt)
- [ ] Cài đặt WebSocket packages (@nestjs/websockets, @nestjs/platform-socket.io, socket.io)
- [ ] Cài đặt file storage (minio)
- [ ] Cài đặt validation (class-validator, class-transformer)
- [ ] Cài đặt utils (uuid, date-fns, winston/pino)
- [ ] Cài đặt security (helmet, compression)
- [ ] Tạo src/auth/ với subfolders (strategies/, guards/, decorators/, dto/)
- [ ] Tạo src/users/
- [ ] Tạo src/workspaces/ với workspace-members/
- [ ] Tạo src/pages/ với blocks/ và page-history/
- [ ] Tạo src/boards/ với cards/
- [ ] Tạo src/comments/
- [ ] Tạo src/ai/ với ollama/, gemini/, embedding/, rag/
- [ ] Tạo src/search/
- [ ] Tạo src/files/
- [ ] Tạo src/realtime/
- [ ] Tạo src/common/ với decorators/, filters/, interceptors/, pipes/, guards/
- [ ] Tạo src/database/
- [ ] Tạo src/config/
- [ ] Tạo src/utils/
- [ ] Tạo src/config/config.module.ts với ConfigModule
- [ ] Tạo src/config/database.config.ts cho TypeORM
- [ ] Tạo src/config/redis.config.ts
- [ ] Tạo src/config/minio.config.ts
- [ ] Tạo src/config/ai.config.ts cho AI providers
- [ ] Tạo users/entities/user.entity.ts
- [ ] Tạo workspaces/entities/workspace.entity.ts
- [ ] Tạo workspaces/entities/workspace-member.entity.ts
- [ ] Tạo pages/entities/page.entity.ts
- [ ] Tạo pages/entities/page-history.entity.ts
- [ ] Tạo pages/blocks/entities/block.entity.ts
- [ ] Tạo pages/blocks/entities/block-history.entity.ts
- [ ] Tạo boards/entities/board.entity.ts
- [ ] Tạo boards/cards/entities/card.entity.ts
- [ ] Tạo comments/entities/comment.entity.ts
- [ ] Tạo ai/embedding/entities/embedding.entity.ts với pgvector
- [ ] Tạo files/entities/file-upload.entity.ts
- [ ] Tạo auth.module.ts
- [ ] Tạo auth.controller.ts với login/register/OAuth endpoints
- [ ] Tạo auth.service.ts với JWT logic
- [ ] Tạo strategies/gitlab.strategy.ts
- [ ] Tạo strategies/local.strategy.ts
- [ ] Tạo guards/jwt-auth.guard.ts
- [ ] Tạo decorators (current-user.decorator.ts, public.decorator.ts)
- [ ] Tạo DTOs (login.dto.ts, register.dto.ts)
- [ ] Tạo users.module.ts
- [ ] Tạo users.controller.ts
- [ ] Tạo users.service.ts với CRUD
- [ ] Tạo workspaces.module.ts
- [ ] Tạo workspaces.controller.ts với CRUD
- [ ] Tạo workspaces.service.ts
- [ ] Tạo workspace-members/workspace-members.service.ts
- [ ] Tạo guards/workspace-permission.guard.ts
- [ ] Tạo pages.module.ts
- [ ] Tạo pages.controller.ts với CRUD + publish endpoints
- [ ] Tạo pages.service.ts
- [ ] Tạo blocks/blocks.service.ts
- [ ] Tạo page-history/page-history.service.ts
- [ ] Tạo boards.module.ts
- [ ] Tạo boards.controller.ts
- [ ] Tạo boards.service.ts
- [ ] Tạo cards/cards.service.ts
- [ ] Tạo comments.module.ts với controller và service
- [ ] Tạo ai.module.ts với các sub-services
- [ ] Tạo ai/ollama/ollama.service.ts
- [ ] Tạo ai/gemini/gemini.service.ts
- [ ] Tạo ai/embedding/embedding.service.ts
- [ ] Tạo ai/rag/rag.service.ts
- [ ] Tạo ai.controller.ts với /summarize, /ask, /brainstorm endpoints
- [ ] Tạo search.module.ts với full-text + semantic search
- [ ] Tạo files.module.ts với MinIO service
- [ ] Tạo files/minio.service.ts
- [ ] Tạo realtime.module.ts
- [ ] Tạo realtime/realtime.gateway.ts với Socket.IO
- [ ] Tạo realtime/presence.service.ts
- [ ] Tạo common/filters/http-exception.filter.ts
- [ ] Tạo common/pipes/validation.pipe.ts
- [ ] Tạo common/interceptors/logging.interceptor.ts
- [ ] Tạo common/interceptors/transform.interceptor.ts
- [ ] Tạo utils/logger.ts với Winston/Pino
- [ ] Tạo database/database.module.ts với TypeORM config
- [ ] Setup pgvector extension trong database config
- [ ] Update main.ts với global pipes, filters, CORS, helmet, compression
- [ ] Update app.module.ts import tất cả modules
- [ ] Review docker-compose.yml
- [ ] Tạo Dockerfile cho backend trong server/
- [ ] Review và update README.md với setup instructions
- [ ] Review và update .gitignore