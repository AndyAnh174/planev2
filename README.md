# PlaneV2.0 - Notion/Kanban Clone

Hệ thống ghi chú + quản lý công việc kiểu **Notion/Kanban** với public pages, OAuth GitLab EE, MinIO storage, PostgreSQL, và tích hợp AI (Llama 3.1 8B qua Ollama hoặc Gemini 2.0 Flash).

## 🚀 Tech Stack

### Frontend
- **Next.js 15+** (App Router, Server Components)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **React Hook Form** + **Zod** (Form validation)
- **TanStack Query** (Server state)
- **TanStack Table** (Advanced tables)
- **Zustand** (Client state)
- **Socket.IO Client** (Realtime)
- **TipTap** (Rich text editor)
- **Framer Motion** (Animations)
- **Recharts** (Charts)

### Backend
- **NestJS** (Node.js framework)
- **TypeScript**
- **PostgreSQL 15+** với **pgvector** (Vector search)
- **Redis 7+** (Cache, sessions, pub/sub)
- **MinIO** (S3-compatible storage)
- **Socket.IO Server** (Realtime collaboration)
- **JWT Authentication** + **GitLab OAuth**
- **TypeORM** (ORM)

### AI Integration
- **Ollama** (Llama 3.1 8B) tại `https://222.253.80.30:11434`
- **Google Gemini 2.0 Flash** (Alternative)
- **BGE-M3 Embedding API** (`https://embed.andyanh.id.vn/embed`)

### Infrastructure
- **Docker Compose** (PostgreSQL, Redis, MinIO)
- **PostgreSQL** với pgvector extension

---

## 📋 Features

✅ **Block-based Editor**: Text, heading, code, table, checklist, image, embed  
✅ **Kanban Boards**: Drag & drop cards, labels, due dates, assignees  
✅ **Public Pages**: Share pages publicly như Notion  
✅ **Realtime Collaboration**: Multi-user editing, presence indicators  
✅ **AI Integration**: Summarize, brainstorm, translate, RAG Q&A  
✅ **Versioning**: Page/block history, restore versions  
✅ **Workspace Management**: Multi-workspace, member roles (owner/admin/member/viewer)  
✅ **File Storage**: Upload, preview, MinIO integration  
✅ **Search**: Full-text + semantic search (pgvector)  
✅ **Authentication**: GitLab OAuth + Local login  
✅ **Dark Mode**: Full dark mode support  

---

## 🏃 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- npm hoặc yarn

### 1. Start Infrastructure

```bash
# Start PostgreSQL, Redis, MinIO
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f
```

**Services:**
- **PostgreSQL**: `localhost:5432` (database: `notion`, user: `postgres`, password: `postgres`)
- **Redis**: `localhost:6379`
- **MinIO API**: `http://localhost:9000` (access: `minioadmin`, secret: `minioadmin`)
- **MinIO Console**: `http://localhost:9001`

### 2. Setup Backend

```bash
cd server
npm install

# Copy và chỉnh sửa .env
cp .env.example .env

# Chạy migrations (khi có)
# npm run migration:run

# Start development server
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3001`

### 3. Setup Frontend

```bash
cd client
npm install

# Copy và chỉnh sửa .env.local
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

Xem `server/.env.example` để biết đầy đủ variables. Một số quan trọng:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=notion

# Redis
REDIS_URL=redis://localhost:6379

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_BUCKET=notion-files
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRATION=15m

# GitLab OAuth (optional)
GITLAB_CLIENT_ID=your_client_id
GITLAB_CLIENT_SECRET=your_client_secret
GITLAB_BASE_URL=https://git.hcmutertic.com

# AI Provider
AI_PROVIDER=llama  # or 'gemini' or 'none'
LLAMA_HOST=https://222.253.80.30:11434
LLAMA_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct

# Embedding API
EMBEDDING_API_URL=https://embed.andyanh.id.vn/embed
```

### Frontend (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ENABLE_AI=true
```

---

## 📁 Project Structure

```
PlaneV2.0/
├── client/                 # Next.js Frontend
│   ├── app/               # App Router pages
│   │   ├── (auth)/        # Authentication routes
│   │   ├── (dashboard)/   # Protected dashboard routes
│   │   └── p/             # Public pages
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Layout components
│   │   ├── editor/        # TipTap editor
│   │   ├── kanban/        # Kanban components
│   │   └── shared/        # Shared components
│   ├── lib/               # Utilities, API client
│   ├── hooks/             # Custom hooks
│   ├── store/             # Zustand stores
│   └── types/             # TypeScript types
│
├── server/                # NestJS Backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # Users module
│   │   ├── workspaces/    # Workspaces module
│   │   ├── pages/         # Pages module
│   │   ├── boards/       # Kanban boards module
│   │   ├── ai/            # AI integration module
│   │   ├── search/        # Search module
│   │   ├── files/         # File upload module
│   │   ├── realtime/      # WebSocket module
│   │   ├── common/         # Shared utilities
│   │   └── config/        # Configuration
│   └── test/              # Tests
│
├── docker-compose.yml      # Infrastructure services
├── information.md          # Project overview
├── frontend.md             # Frontend architecture
├── backend.md              # Backend architecture
├── database-schema.md       # Database schema
└── c4-architecture.md      # C4 diagrams
```

---

## 🔧 Development

### Backend Commands

```bash
cd server

# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Test
npm run test
npm run test:e2e
```

### Frontend Commands

```bash
cd client

# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

---

## 📚 Documentation

Chi tiết xem các file documentation:

- **[information.md](./information.md)** - Tổng quan về hệ thống, use cases, tech stack
- **[frontend.md](./frontend.md)** - Frontend architecture, components, UI/UX guidelines
- **[backend.md](./backend.md)** - Backend architecture, modules, API design
- **[database-schema.md](./database-schema.md)** - Database schema, entities, relationships
- **[c4-architecture.md](./c4-architecture.md)** - C4 architecture diagrams

---

## 🗄️ Database Setup

Database sẽ được tự động tạo khi chạy Docker Compose. Để setup pgvector extension:

```sql
-- Connect to PostgreSQL
psql -U postgres -d notion

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

Migrations sẽ được tạo sau khi schema được finalize.

---

## 🔐 Authentication

### GitLab OAuth Setup

1. Vào GitLab EE → **Admin Area** → **Applications** → **New Application**
2. Điền:
   - **Name**: Notion Clone App
   - **Redirect URI**: `http://localhost:3000/api/auth/gitlab/callback`
   - **Scopes**: `read_user`, `api`
3. Lưu **Application ID** và **Secret**
4. Thêm vào `server/.env`:
   ```
   GITLAB_CLIENT_ID=your_client_id
   GITLAB_CLIENT_SECRET=your_client_secret
   GITLAB_BASE_URL=https://git.hcmutertic.com
   ```

### Local Authentication

Local signup được bật/tắt bằng biến `ALLOW_LOCAL_SIGNUP=true` trong `.env`.

---

## 🧪 Testing

```bash
# Backend tests
cd server
npm run test
npm run test:e2e

# Frontend tests (khi setup)
cd client
npm run test
```

---

## 📦 Deployment

### Docker Production

Xem `server/Dockerfile` cho backend containerization.

### Environment

Đảm bảo set đúng environment variables cho production:
- Database connection
- Redis connection
- MinIO endpoint (HTTPS)
- JWT secret (strong random)
- CORS origin
- AI provider settings

---

## 🤝 Contributing

Private project - Internal use only.

---

## 📝 License

Private - Internal use only

---

## 🐛 Known Issues / TODO

- [ ] Database migrations
- [ ] Refresh token implementation
- [ ] Rate limiting middleware
- [ ] File upload size limits
- [ ] Email notifications
- [ ] Mobile responsive improvements
