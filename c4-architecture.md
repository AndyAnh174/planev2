# C4 Architecture Diagrams

## Tổng quan
Tài liệu này mô tả kiến trúc hệ thống sử dụng C4 Model (Context, Container, Component, Code).

---

## 1. System Context Diagram (Level 1)

Mô tả hệ thống và các actors tương tác với nó.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Notion Clone System                       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │              [Next.js Frontend + NestJS Backend]          │   │
│  │                                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Users       │    │  GitLab EE    │    │  Public Users  │
│ (Nội bộ)      │    │  (OAuth)      │    │ (View Public)  │
└───────────────┘    └───────────────┘    └───────────────┘

        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  External APIs   │
                    ├──────────────────┤
                    │ • Ollama (AI)    │
                    │ • Gemini API     │
                    │ • BGE-M3 Embed  │
                    └──────────────────┘
```

**Actors:**
- **Users (Nội bộ)**: Nhóm kỹ thuật & vận hành nội bộ - tạo, edit pages/boards
- **GitLab EE**: OAuth provider cho authentication
- **Public Users**: Xem public pages không cần đăng nhập

**External Systems:**
- **Ollama**: Llama 3.1 8B model tại `https://222.253.80.30:11434`
- **Gemini API**: Google Gemini 2.0 Flash model
- **BGE-M3 Embed API**: `https://embed.andyanh.id.vn/embed` cho embeddings

---

## 2. Container Diagram (Level 2)

Mô tả các containers (ứng dụng, databases, etc.) trong hệ thống.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Notion Clone System                          │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    Next.js Frontend                           │ │
│  │  • React 18+                                                  │ │
│  │  • TipTap Editor                                             │ │
│  │  • Socket.IO Client                                          │ │
│  │  • Tailwind CSS                                              │ │
│  │  • SSR/SSG                                                   │ │
│  └───────────────────────────┬─────────────────────────────────┘ │
│                                │                                     │
│                                │ HTTP/WebSocket                     │
│                                ▼                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                  NestJS Backend API                            │ │
│  │  • REST API                                                   │ │
│  │  • Socket.IO Server                                           │ │
│  │  • Authentication (JWT)                                      │ │
│  │  • Authorization (RBAC)                                     │ │
│  └──────┬────────────┬────────────┬────────────┬─────────────────┘ │
│         │            │            │            │                   │
│         │            │            │            │                   │
│         ▼            ▼            ▼            ▼                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│  │PostgreSQL│  │  Redis   │  │  MinIO   │  │  External    │     │
│  │          │  │          │  │          │  │  AI APIs     │     │
│  │• Users   │  │• Cache   │  │• Files   │  │              │     │
│  │• Pages   │  │• Sessions│  │• Images  │  │• Ollama      │     │
│  │• Blocks  │  │• Pub/Sub │  │• Assets  │  │• Gemini      │     │
│  │• Boards  │  │• Rate    │  │(S3 API)  │  │• BGE-M3      │     │
│  │• pgvector│  │  Limits  │  │          │  │  Embed       │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### Containers:

#### 1. Next.js Frontend
- **Technology**: Next.js 14+, React 18+, TypeScript
- **Responsibilities**:
  - UI rendering (SSR/SSG)
  - Client-side routing
  - State management (Zustand/Redux)
  - Real-time UI updates (Socket.IO client)
  - TipTap editor cho rich text editing
- **Communication**: HTTP REST API, WebSocket

#### 2. NestJS Backend API
- **Technology**: NestJS, TypeScript, Node.js
- **Responsibilities**:
  - Business logic
  - API endpoints (REST)
  - Authentication & Authorization
  - WebSocket server cho realtime
  - File upload handling
  - AI integration (Ollama/Gemini)
  - Embedding generation (BGE-M3 API)
- **Communication**: 
  - HTTP với Frontend
  - WebSocket với Frontend
  - Database queries với PostgreSQL
  - Cache operations với Redis
  - File operations với MinIO
  - External API calls

#### 3. PostgreSQL Database
- **Technology**: PostgreSQL 15+ với pgvector extension
- **Responsibilities**:
  - Persistent data storage
  - Vector storage cho embeddings
  - Full-text search
  - Semantic search (pgvector)
- **Schema**: Xem `database-schema.md`

#### 4. Redis Cache
- **Technology**: Redis 7+
- **Responsibilities**:
  - Session storage
  - Cache layer
  - Pub/Sub cho realtime messaging
  - Rate limiting counters
  - Presence tracking

#### 5. MinIO Storage
- **Technology**: MinIO (S3-compatible)
- **Responsibilities**:
  - File storage (images, documents, assets)
  - S3-compatible API
  - Self-hosted object storage

#### 6. External AI APIs
- **Ollama**: Llama 3.1 8B inference
- **Gemini API**: Google Gemini 2.0 Flash
- **BGE-M3 Embed API**: Embedding generation

---

## 3. Component Diagram - Backend (Level 3)

Mô tả các components chính trong NestJS Backend.

```
┌──────────────────────────────────────────────────────────────────┐
│                     NestJS Backend API                            │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  API Gateway / Router                       │ │
│  │  • Authentication Middleware                                │ │
│  │  • Authorization Guard                                      │ │
│  │  • Rate Limiting                                            │ │
│  │  • CORS, CSRF Protection                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Auth       │  │  Workspace  │  │    Page      │           │
│  │  Module      │  │   Module    │  │   Module    │           │
│  │              │  │              │  │              │           │
│  │• OAuth       │  │• CRUD       │  │• CRUD        │           │
│  │• JWT         │  │• Members    │  │• Blocks      │           │
│  │• Local Auth  │  │• Permissions│  │• Publishing   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Board      │  │     AI       │  │    Search    │           │
│  │   Module     │  │   Module     │  │   Module     │           │
│  │              │  │              │  │              │           │
│  │• Kanban CRUD │  │• Summarize   │  │• Full-text   │           │
│  │• Cards       │  │• Brainstorm  │  │• Semantic   │           │
│  │• Drag-drop   │  │• Translate   │  │• RAG        │           │
│  │              │  │• RAG Q&A    │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Realtime    │  │    File       │  │  Embedding    │           │
│  │   Module     │  │   Module      │  │   Module      │           │
│  │              │  │              │  │              │           │
│  │• Socket.IO   │  │• Upload       │  │• Generate     │           │
│  │• Presence    │  │• MinIO       │  │• Store        │           │
│  │• Broadcast   │  │• CDN URLs    │  │• Search       │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Shared Services / Utilities                     │ │
│  │  • Database Service (TypeORM/Prisma)                        │ │
│  │  • Cache Service (Redis)                                    │ │
│  │  • Logger Service                                           │ │
│  │  • Error Handler                                            │ │
│  │  • Validation (class-validator)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Components:

#### Auth Module
- **Controllers**: `AuthController` - OAuth callback, login/logout
- **Services**: `AuthService`, `JwtService`, `OAuthService`
- **Guards**: `JwtAuthGuard`, `LocalAuthGuard`
- **Strategies**: `GitLabOAuthStrategy`, `LocalStrategy`

#### Workspace Module
- **Controllers**: `WorkspaceController` - CRUD, members, settings
- **Services**: `WorkspaceService`, `WorkspaceMemberService`
- **Guards**: `WorkspacePermissionGuard`

#### Page Module
- **Controllers**: `PageController` - CRUD, publish, versioning
- **Services**: `PageService`, `BlockService`, `VersionService`
- **Guards**: `PagePermissionGuard`

#### Board Module
- **Controllers**: `BoardController`, `CardController` - Kanban operations
- **Services**: `BoardService`, `CardService`

#### AI Module
- **Controllers**: `AIController` - `/ai/summarize`, `/ai/brainstorm`, `/ai/ask`
- **Services**: `AIService`, `OllamaService`, `GeminiService`, `RAGService`
- **Integration**: External AI APIs

#### Search Module
- **Controllers**: `SearchController` - Full-text + semantic search
- **Services**: `SearchService`, `SemanticSearchService`
- **Integration**: PostgreSQL full-text + pgvector

#### Realtime Module
- **Gateways**: `RealtimeGateway` (Socket.IO)
- **Services**: `PresenceService`, `BroadcastService`
- **Integration**: Redis Pub/Sub

#### File Module
- **Controllers**: `FileController` - Upload/download
- **Services**: `FileService`, `MinIOService`

#### Embedding Module
- **Services**: `EmbeddingService` - Generate/store embeddings
- **Integration**: BGE-M3 API, pgvector

---

## 4. Component Diagram - Frontend (Level 3)

Mô tả các components chính trong Next.js Frontend.

```
┌──────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                               │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  App Router (Next.js 14)                    │ │
│  │  • Server Components                                        │ │
│  │  • Client Components                                        │ │
│  │  • Route Handlers (API routes)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Auth       │  │  Workspace   │  │    Editor     │           │
│  │  Components  │  │  Components  │  │  Components   │           │
│  │              │  │              │  │              │           │
│  │• Login       │  │• List        │  │• TipTap       │           │
│  │• OAuth       │  │• Create      │  │• Blocks       │           │
│  │• Profile     │  │• Settings   │  │• Toolbar      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Kanban     │  │  Public      │  │   Realtime   │           │
│  │  Components  │  │   Pages      │  │   Services   │           │
│  │              │  │              │  │              │           │
│  │• Board       │  │• Public View │  │• Socket.IO   │           │
│  │• Card        │  │• Share Link  │  │• Presence    │           │
│  │• Drag-drop   │  │• Embed       │  │• Cursors     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Shared Services / Hooks                         │ │
│  │  • API Client (axios/fetch)                                 │ │
│  │  • State Management (Zustand)                               │ │
│  │  • Auth Context/Hook                                       │ │
│  │  • Socket Hook                                             │ │
│  │  • Theme Hook (dark mode)                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Deployment Diagram

Mô tả cách hệ thống được deploy với Docker Compose.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Compose Network                       │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  Nginx (Reverse Proxy)                     │ │
│  │  • SSL Termination (Let's Encrypt)                        │ │
│  │  • Load Balancing                                          │ │
│  │  • Rate Limiting                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                             │                                     │
│                             │ (proxy)                             │
│                             ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend (Container)                  │ │
│  │  • Port: 3000                                              │ │
│  │  • SSR/SSG                                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                             │                                     │
│                             │ HTTP/WebSocket                       │
│                             ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              NestJS Backend (Container)                    │ │
│  │  • Port: 3001 (internal)                                   │ │
│  │  • REST API                                                │ │
│  │  • WebSocket Server                                        │ │
│  └──────┬────────────┬────────────┬────────────┬─────────────┘ │
│         │            │            │            │               │
│         │            │            │            │               │
│         ▼            ▼            ▼            ▼               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │PostgreSQL│  │  Redis   │  │  MinIO   │  │  Host Network │ │
│  │:5432     │  │:6379     │  │:9000     │  │              │ │
│  │          │  │          │  │:9001     │  │• Ollama      │ │
│  │• Volume  │  │• Volume  │  │• Volume  │  │• BGE-M3 API │ │
│  │  pgdata  │  │  redis   │  │  minio   │  │• Gemini API │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Volumes:**
- `pgdata`: PostgreSQL data persistence
- `redis_data`: Redis data persistence
- `minio_data`: MinIO file storage

**Networks:**
- Default bridge network cho internal communication
- Host network access cho external APIs

---

## 6. Data Flow Diagram

Mô tả luồng dữ liệu trong hệ thống.

### 6.1 User Creates Page Flow

```
User → Frontend → Backend API → PostgreSQL → Backend → Frontend → User
  │       │            │            │           │          │         │
  │       │            │            │           │          │         │
  │       │     [1] POST /api/pages │           │          │         │
  │       │            │            │           │          │         │
  │       │            │     [2] INSERT page    │          │         │
  │       │            │            │           │          │         │
  │       │            │     [3] RETURN page_id │          │         │
  │       │            │            │           │          │         │
  │       │     [4] RETURN response │           │          │         │
  │       │            │            │           │          │         │
  │ [5] Display page   │            │           │          │         │
```

### 6.2 Realtime Collaboration Flow

```
User A → Frontend → Socket.IO → Redis Pub/Sub → Socket.IO → Frontend → User B
   │         │           │            │              │          │         │
   │         │  [1] block:update     │              │          │         │
   │         │           │            │              │          │         │
   │         │           │   [2] PUBLISH to room      │          │         │
   │         │           │            │              │          │         │
   │         │           │            │   [3] SUBSCRIBE message   │         │
   │         │           │            │              │          │         │
   │         │           │            │     [4] EMIT to clients │         │
   │         │           │            │              │          │         │
   │         │           │            │              │   [5] Update UI │
```

### 6.3 RAG Query Flow

```
User → Frontend → Backend API → BGE-M3 API → Embedding → PostgreSQL → Backend → Ollama/Gemini → Backend → Frontend → User
  │       │            │              │           │            │         │            │           │          │         │
  │       │   [1] POST /ai/ask        │           │            │         │            │           │          │         │
  │       │            │              │           │            │         │            │           │          │         │
  │       │            │    [2] Generate query embedding       │         │            │           │          │         │
  │       │            │              │           │            │         │            │           │          │         │
  │       │            │              │    [3] Semantic search (pgvector) │            │           │          │         │
  │       │            │              │           │            │         │            │           │          │         │
  │       │            │              │           │    [4] Get top-k blocks             │           │          │         │
  │       │            │              │           │            │         │            │           │          │         │
  │       │            │              │           │            │   [5] Generate answer with context             │         │
  │       │            │              │           │            │         │            │           │          │         │
  │       │            │              │           │            │         │    [6] Return answer│          │         │
  │       │            │              │           │            │         │            │           │          │         │
  │ [7] Display answer │              │           │            │         │            │           │          │         │
```

---

## 7. Technology Stack Summary

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **Editor**: TipTap
- **State**: Zustand hoặc Redux Toolkit
- **Realtime**: Socket.IO Client
- **HTTP Client**: axios hoặc fetch

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: TypeORM hoặc Prisma
- **Validation**: class-validator, class-transformer
- **WebSocket**: Socket.IO
- **HTTP Client**: axios hoặc fetch

### Database
- **Primary DB**: PostgreSQL 15+
- **Extensions**: pgvector (vector search)
- **Cache**: Redis 7+

### Storage
- **Object Storage**: MinIO (S3-compatible)

### External Services
- **AI**: Ollama (Llama 3.1 8B), Gemini API
- **Embedding**: BGE-M3 API (`https://embed.andyanh.id.vn/embed`)
- **OAuth**: GitLab EE

### Deployment
- **Containers**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt (Certbot)

---

## 8. Security Architecture

### Authentication Flow
1. User chọn GitLab OAuth hoặc Local login
2. OAuth: Redirect đến GitLab → Callback với code → Exchange code lấy token
3. Backend verify token → Generate JWT (access + refresh)
4. Frontend store access token (localStorage) và refresh token (HttpOnly cookie)

### Authorization Flow
1. Frontend gửi request với access token trong header
2. Backend verify JWT → Extract user info
3. Check permissions (workspace → page → block level)
4. Allow/Deny request

### Data Security
- TLS/HTTPS bắt buộc
- JWT với short expiration (15 phút)
- Refresh tokens với rotation
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization, CSP)

---

**Lưu ý:** Các diagrams này là high-level overview. Chi tiết implementation có thể thay đổi trong quá trình phát triển.

