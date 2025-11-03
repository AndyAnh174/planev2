# Mục tiêu
Xây dựng hệ thống ghi chú + quản lý công việc kiểu **Notion/Kanban** với khả năng **public page**, **OAuth GitLab EE**, lưu trữ tệp bằng **MinIO**, cơ sở dữ liệu **PostgreSQL**, và tích hợp **AI (Llama 3.1 8B qua Ollama hoặc Gemini 2.0 Flash)**.

---

## 1) Phạm vi & trải nghiệm người dùng
- **Đối tượng**: nhóm kỹ thuật & vận hành nội bộ, hoặc chia sẻ công khai trang nội dung.
- **Use-cases chính**:
  1. Soạn thảo ghi chú dạng block (text, heading, code, table, checklist...)
  2. Bảng Kanban (Board) cho dự án với kéo‑thả, labels, due date.
  3. Đăng nhập bằng GitLab EE (OAuth 2.0) hoặc local tùy cấu hình.
  4. Tích hợp AI: tóm tắt, sinh ý tưởng, RAG tìm kiếm tri thức nội bộ.
  5. Cho phép chia sẻ **public page** như Notion — bất kỳ ai có link đều xem được.
  6. Cho phép root bật/tắt **đăng ký tài khoản nội bộ**.

---

## 2) Kiến trúc tổng thể

> **📐 C4 Diagrams & Architecture**: Xem file [`c4-architecture.md`](./c4-architecture.md) - bao gồm System Context, Container, Component diagrams, Deployment diagram, và Data Flow diagrams.
> 
> **🎨 Frontend Architecture**: Xem file [`frontend.md`](./frontend.md) - bao gồm tech stack, component structure, UI/UX guidelines, và implementation details.
> 
> **⚙️ Backend Architecture**: Xem file [`backend.md`](./backend.md) - bao gồm module structure, API design, database integration, và implementation details.

- **Frontend**: Next.js + Tailwind + TipTap Editor, hỗ trợ dark mode.
- **Backend**: NestJS (Node.js) với RESTFul API.
- **CSDL**: PostgreSQL.
- **Cache & Realtime**: Redis + WebSocket (Socket.IO).
- **Lưu trữ tệp**: **MinIO (self‑hosted)** dùng API S3 tương thích.
- **AI Integration**:
  - **Llama 3.1 8B** thông qua **Ollama** tại URL: `https://222.253.80.30:11434`
  - **Gemini 2.0 Flash** qua Google API (`GEMINI_API_KEY`)
  - Biến môi trường chọn AI provider: `AI_PROVIDER=llama|gemini|none`
- **Search**: PostgreSQL full‑text + pgvector (nếu bật RAG).

---

## 3) Chức năng Public Page
- Mỗi page có thuộc tính `visibility`: `private | workspace | public`.
- Khi `public`, hệ thống tạo slug ngẫu nhiên hoặc user định nghĩa (ví dụ: `/p/abc123` hoặc `/public/meeting-notes`).
- Người dùng không cần đăng nhập vẫn có thể xem nội dung, block, và đính kèm file (nếu cho phép).
- Page public có thể:
  - Hiển thị metadata: tiêu đề, tác giả, ngày cập nhật.
  - Cho phép share embed (iframe) hoặc copy link.
  - Có thể bật “Public Indexing” (cho phép SEO crawler index trang public).
- Endpoint mẫu:
  - `GET /public/:slug` → render page công khai.
  - `POST /api/pages/:id/publish` → chuyển chế độ private → public.
  - `DELETE /api/pages/:id/publish` → hủy chế độ public.

---

## 4) AI tích hợp chi tiết
### 4.1 Cấu hình
```env
AI_PROVIDER=llama
LLAMA_HOST=https://222.253.80.30:11434
LLAMA_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct
# hoặc Gemini
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash
```

### 4.2 Tính năng
- `/ai summarize` → tóm tắt nội dung trang hoặc thẻ.
- `/ai brainstorm` → sinh ý tưởng hoặc task gợi ý.
- `/ai translate` → dịch nội dung block.
- `/ai ask` → Q&A với dữ liệu trong workspace qua RAG (pgvector search).

### 4.3 RAG pipeline (tùy chọn bật)
- **Embedding Generation**:
  - Khi lưu block, tự động tạo embedding (nếu AI enabled)
  - Dùng **BGE-M3** (BAAI/bge-m3) qua API embedding: `https://embed.andyanh.id.vn/embed`
  - Vector dimension: **1024** (BGE-M3)
  - Max length: 512 tokens
  - Lưu vào bảng `embeddings` với pgvector type
  - API Request format:
    ```json
    {
      "texts": ["text content"],
      "max_length": 512
    }
    ```
  - API Response format:
    ```json
    {
      "embeddings": [[0.0166, 0.0245, ...]],
      "device": "cuda:0",
      "model_info": {
        "model_name": "BAAI/bge-m3",
        "max_length": 512,
        "truncate_dim": null
      }
    }
    ```
- **Semantic Search**:
  - Khi truy vấn `/ai ask`, tạo embedding cho query qua BGE-M3 API
  - Dùng pgvector `cosine distance` để tìm top-k similar blocks
  - Context window: top 5-10 most relevant blocks
  - Gửi context + query đến AI model để generate answer
- **Indexing**:
  - Tạo IVFFlat index trên `embeddings.vector` cho search nhanh
  - Auto-index khi có > 1000 embeddings
  - Re-index định kỳ khi data thay đổi nhiều
- **Lợi ích BGE-M3**:
  - Hỗ trợ hơn 100 ngôn ngữ, đặc biệt tốt với tiếng Việt
  - Multi-lingual embeddings chất lượng cao
  - Không cần tự host embedding model (dùng external API)

---

## 5) Database & Storage
- **Database**: PostgreSQL
  - Lưu dữ liệu cho user, page, block, board, card, comment, v.v.
  - Dùng pgvector để lưu embedding nếu bật AI.
- **MinIO**: lưu file, ảnh, và asset.
  - **Development**: dùng `http://minio:9000` (internal Docker network)
  - **Production**: dùng `https://minio.example.com` (external URL với SSL)
  - Env:
    ```env
    # Production
    MINIO_ENDPOINT=https://minio.example.com
    MINIO_USE_SSL=true
    
    # Development (Docker Compose)
    MINIO_ENDPOINT=http://minio:9000
    MINIO_USE_SSL=false
    
    MINIO_BUCKET=notion-files
    MINIO_ACCESS_KEY=access
    MINIO_SECRET_KEY=secret
    ```

---

## 6) Authentication & Authorization

### 6.1 GitLab OAuth 2.0
- **Cấu hình GitLab EE**:
  1. Vào GitLab EE → **Admin Area** → **Applications** → **New Application**
  2. Điền thông tin:
     - **Name**: Notion Clone App
     - **Redirect URI**: `https://your-domain.com/api/auth/gitlab/callback`
     - **Scopes**: `read_user`, `api`
  3. Lưu **Application ID** và **Secret**
- **Cấu hình Backend**:
  ```env
  GITLAB_CLIENT_ID=your_client_id
  GITLAB_CLIENT_SECRET=your_client_secret
  GITLAB_REDIRECT_URI=https://your-domain.com/api/auth/gitlab/callback
  GITLAB_BASE_URL=https://git.hcmutertic.com
  ```
- **Flow**: Authorization Code với PKCE (bảo mật hơn)

### 6.2 JWT Token Management
- **Access Token**: JWT với expiration 15 phút
- **Refresh Token**: JWT lưu trong Redis, expiration 7 ngày
- **Token Storage**: 
  - Access token: localStorage (frontend)
  - Refresh token: HttpOnly cookie (backend)
- **Token Rotation**: Refresh token được rotate mỗi lần refresh

### 6.3 Local Authentication
- Đăng ký nội bộ khi `ALLOW_LOCAL_SIGNUP=true`
- Password policy: tối thiểu 8 ký tự, có số, chữ hoa/thường
- Password hashing: bcrypt với salt rounds = 10

---

## 7) Workspace Management
- **Workspace**: không gian làm việc riêng biệt, có thể có nhiều pages/boards
- **Mỗi user có thể**:
  - Tạo unlimited workspaces
  - Mời thành viên vào workspace (email hoặc GitLab username)
  - Set role: `owner`, `admin`, `member`, `viewer`
- **Permissions**:
  - `owner`: full control, có thể xóa workspace
  - `admin`: quản lý members, pages, settings
  - `member`: tạo/edit pages, comment
  - `viewer`: chỉ xem, không edit
- **Workspace settings**:
  - Tên, avatar, description
  - Bật/tắt public pages cho workspace
  - Export workspace data (JSON/PDF)

---

## 8) Database Schema Design

> **📄 Chi tiết đầy đủ**: Xem file [`database-schema.md`](./database-schema.md) - bao gồm ERD diagram, chi tiết từng bảng, relationships, indexes, và constraints.

### 8.1 Các bảng chính (Tóm tắt)
- **users**: id, email, username, password_hash, avatar_url, gitlab_id, created_at, updated_at
- **workspaces**: id, name, slug, description, avatar_url, owner_id, created_at, updated_at
- **workspace_members**: workspace_id, user_id, role (owner|admin|member|viewer), joined_at
- **pages**: id, workspace_id, title, slug, visibility (private|workspace|public), author_id, is_indexed (SEO), created_at, updated_at
- **page_history**: id, page_id, content_snapshot (JSONB), version, author_id, created_at (để versioning)
- **blocks**: id, page_id, type (text|heading|code|table|checklist...), content (JSONB), order_index, parent_id, created_at, updated_at
- **block_history**: id, block_id, content_snapshot (JSONB), version, author_id, created_at (để versioning)
- **boards**: id, workspace_id, name, description, created_at, updated_at
- **cards**: id, board_id, column_id, title, description, assignee_id, due_date, labels (JSONB), order_index, created_at, updated_at
- **comments**: id, target_type (page|block|card), target_id, author_id, content, created_at, updated_at
- **embeddings**: id, block_id, page_id, vector (pgvector), metadata (JSONB), created_at
- **file_uploads**: id, workspace_id, uploader_id, filename, original_name, mime_type, size, minio_path, url, created_at

### 8.2 Indexes
- `pages(workspace_id, visibility)` để query nhanh
- `blocks(page_id, order_index)` để sort blocks
- `embeddings USING ivfflat (vector vector_cosine_ops)` cho semantic search
- `workspace_members(workspace_id, user_id)` unique constraint

### 8.3 Migrations
- Dùng TypeORM/Prisma để quản lý migrations
- Version control cho schema changes

---

## 9) Realtime Collaboration

### 9.1 WebSocket với Socket.IO
- **Connection**: user connect qua WebSocket khi mở page/board
- **Room-based**: mỗi page/board là một room
  - `page:{pageId}` cho page editing
  - `board:{boardId}` cho board updates
- **Events**:
  - `block:update` → broadcast block changes đến tất cả clients trong room
  - `cursor:move` → hiển thị cursor của user khác
  - `user:join` → notify khi user join/leave
- **Conflict Resolution**: 
  - Operational Transform (OT) hoặc CRDT
  - Last-write-wins cho đơn giản (có thể nâng cấp sau)

### 9.2 Presence System
- Track user đang online/offline
- Hiển thị avatars của users đang edit page
- Redis để store presence data với TTL

---

## 10) Versioning & History

### 10.1 Page Versioning
- Mỗi khi page được update, tạo snapshot vào `page_history`
- Giữ tối đa 30 versions, auto cleanup versions cũ hơn 90 ngày
- User có thể:
  - Xem history timeline
  - Restore về version cũ
  - Compare 2 versions

### 10.2 Block-level History
- Mỗi block có history trong `block_history`
- Timestamp và author cho mỗi change
- API: `GET /api/pages/:id/history` → list versions

---

## 11) Rate Limiting & API Quotas

### 11.1 AI API Rate Limiting
- **Llama (Ollama)**: 
  - 10 requests/phút/user
  - 100 requests/giờ/user
  - Queue system nếu quá tải
- **Gemini API**:
  - 15 requests/phút/user (free tier)
  - 1000 requests/ngày/user
  - Cost tracking cho admin
- **Redis** để track rate limits (sliding window counter)

### 11.2 General API Rate Limiting
- 60 requests/phút/user cho các endpoints thông thường
- 120 requests/phút/user cho authenticated users
- IP-based rate limiting cho public endpoints

---

## 12) Bảo mật & quyền
- TLS bắt buộc (HTTPS), cookie HttpOnly + Secure + SameSite=Strict + CSRF bảo vệ.
- Public page chỉ read-only (không edit, comment, share).
- Quản trị root bật/tắt đăng ký nội bộ (`ALLOW_LOCAL_SIGNUP`).
- RBAC chi tiết theo workspace, page, block:
  - Workspace level: owner > admin > member > viewer
  - Page level: inherit từ workspace hoặc override
  - Block level: inherit từ page
- CORS: whitelist domains cho API
- SQL Injection: dùng parameterized queries (TypeORM/Prisma)
- XSS: sanitize user input, Content Security Policy (CSP)

---

## 13) Ngôn ngữ & Giao diện
- **Ngôn ngữ**: Chỉ hỗ trợ **Tiếng Việt**
- **Giao diện**: Toàn bộ UI/UX dùng tiếng Việt
- **Không cần i18n**: Do chỉ hỗ trợ một ngôn ngữ duy nhất

---

## 14) Cấu hình môi trường
```env
# Database
DB_URL=postgresql://user:pass@db:5432/notion

# Redis
REDIS_URL=redis://redis:6379

# MinIO (Production: https, Development: http)
MINIO_ENDPOINT=https://minio.example.com
MINIO_BUCKET=notion-files
MINIO_ACCESS_KEY=access
MINIO_SECRET_KEY=secret
MINIO_USE_SSL=true

# AI Provider
AI_PROVIDER=llama
LLAMA_HOST=https://222.253.80.30:11434
LLAMA_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct
# hoặc Gemini
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash

# Embedding API (BGE-M3)
EMBEDDING_API_URL=https://embed.andyanh.id.vn/embed
EMBEDDING_MODEL=BAAI/bge-m3
EMBEDDING_MAX_LENGTH=512
EMBEDDING_DIMENSION=1024

# Authentication
ALLOW_LOCAL_SIGNUP=true
ENFORCE_SSO=false
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# GitLab OAuth
GITLAB_CLIENT_ID=your_client_id
GITLAB_CLIENT_SECRET=your_client_secret
GITLAB_REDIRECT_URI=https://your-domain.com/api/auth/gitlab/callback
GITLAB_BASE_URL=https://gitlab.your-domain.com

# Application
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
```

---

## 15) Monitoring & Logging

### 15.1 Logging Strategy
- **Structured Logging**: JSON format với Winston hoặc Pino
- **Log Levels**: `error`, `warn`, `info`, `debug`
- **Log Storage**:
  - Development: console + file
  - Production: stdout/stderr → Docker logs → ELK stack hoặc Loki
- **Log Rotation**: Daily rotation, giữ 30 ngày

### 15.2 Monitoring & Metrics
- **Health Checks**:
  - `GET /health` → check database, Redis, MinIO connectivity
  - `GET /health/ready` → readiness probe (check dependencies đã sẵn sàng)
  - `GET /health/live` → liveness probe (check app còn chạy)
  - Docker Compose có thể dùng healthcheck để auto-restart containers
- **Metrics**:
  - Prometheus metrics endpoint: `/metrics`
  - Track: request rate, error rate, response time, DB query time
  - Grafana dashboard để visualize
- **Error Tracking**:
  - Sentry hoặc Rollbar cho error tracking
  - Alert khi error rate > threshold

### 15.3 APM (Application Performance Monitoring)
- OpenTelemetry cho distributed tracing
- Track: API calls, database queries, AI API calls
- Identify bottlenecks và slow queries

---

## 16) Backup & Recovery

### 16.1 PostgreSQL Backup
- **Strategy**: 
  - Daily full backup (pg_dump)
  - Continuous WAL archiving (Point-in-Time Recovery)
- **Backup Storage**: 
  - Local backup → MinIO hoặc S3-compatible storage
  - Giữ 30 ngày daily backups
  - Monthly backups giữ 12 tháng
- **Recovery**:
  - Restore từ latest backup
  - PITR restore về bất kỳ point trong 30 ngày qua

### 16.2 MinIO Backup
- **Strategy**: 
  - MinIO mirroring/replication sang secondary MinIO
  - Hoặc sync sang S3-compatible storage khác
- **Frequency**: Real-time replication hoặc hourly sync

### 16.3 Redis Backup
- **Strategy**: 
  - RDB snapshots mỗi 6 giờ
  - AOF (Append Only File) cho durability
- **Recovery**: Restore từ latest RDB snapshot

### 16.4 Disaster Recovery Plan
- **RTO (Recovery Time Objective)**: < 4 giờ
- **RPO (Recovery Point Objective)**: < 1 giờ
- **Test Recovery**: Monthly DR drill

---

## 17) Deployment với Docker Compose

### 17.1 Docker Compose Setup
```yaml
version: '3.9'
services:
  app:
    build: .
    environment:
      - DB_URL=postgresql://postgres:postgres@db:5432/notion
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=http://minio:9000
      - MINIO_BUCKET=notion-files
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - AI_PROVIDER=llama
      - LLAMA_HOST=https://222.253.80.30:11434
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
      - minio
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: notion
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  minio:
    image: minio/minio
    command: server /data --console-address :9001
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    restart: unless-stopped

volumes:
  pgdata:
  redis_data:
  minio_data:
```

### 17.2 Production với Reverse Proxy (Nginx)
- **Reverse Proxy**: Nginx đặt trước Docker Compose để:
  - SSL termination với Let's Encrypt (Certbot)
  - Load balancing (nếu scale multiple app instances)
  - Rate limiting
  - Static file serving (tùy chọn)
- **Setup Nginx**:
  ```nginx
  server {
      listen 80;
      server_name your-domain.com;
      
      location / {
          proxy_pass http://localhost:3000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```
- **SSL**: Dùng Certbot để tự động cài SSL certificate

### 17.3 Deployment Commands
- **Khởi động**:
  ```bash
  docker-compose up -d
  ```
- **Xem logs**:
  ```bash
  docker-compose logs -f app
  ```
- **Dừng**:
  ```bash
  docker-compose down
  ```
- **Cập nhật**:
  ```bash
  docker-compose pull
  docker-compose up -d --build
  ```
- **Backup database**:
  ```bash
  docker-compose exec db pg_dump -U postgres notion > backup.sql
  ```

### 17.4 Lưu ý cho Production
- Đổi passwords mặc định (database, MinIO, Redis)
- Cấu hình firewall (chỉ mở ports cần thiết)
- Enable auto-restart cho containers
- Monitor resource usage (CPU, memory, disk)
- Setup automated backups (xem Section 16)
- **Kubernetes**: Sẽ triển khai sau khi hệ thống ổn định và cần scale lớn

---

## 18) Backlog/roadmap
- **v0.1**: Auth GitLab + local toggle, workspace, pages/blocks, upload (MinIO), public page cơ bản.
- **v0.2**: Kanban board, search, comment, audit, versioning.
- **v0.3**: Realtime editor (Socket.IO), AI summarize & RAG, presence system.
- **v0.4**: SEO indexing cho public pages, AI brainstorm, translate.
- **v0.5**: Advanced RBAC, workspace templates, analytics dashboard.
- **v0.6**: Mobile app (React Native), offline mode, sync.

---

## 19) Tóm tắt công nghệ

### 19.1 Tech Stack
- **Frontend**: Next.js 14+, Tailwind CSS, TipTap Editor, Socket.IO Client
- **Backend**: NestJS, TypeScript, TypeORM/Prisma, Socket.IO Server
- **Database**: PostgreSQL 15+ với pgvector extension
- **Cache**: Redis 7+
- **Storage**: MinIO (S3-compatible)
- **AI**: Ollama (Llama 3.1 8B) hoặc Google Gemini 2.0 Flash
- **Authentication**: GitLab OAuth 2.0 + JWT
- **Realtime**: Socket.IO với Redis adapter
- **Monitoring**: Prometheus + Grafana, Sentry
- **Deployment**: Docker Compose (development & production)

### 19.2 Tính năng chính
- ✅ **Ghi chú dạng block**: Text, heading, code, table, checklist, embed
- ✅ **Kanban Board**: Kéo-thả cards, labels, due date, assignees
- ✅ **Public Pages**: Chia sẻ công khai như Notion
- ✅ **Realtime Collaboration**: Multi-user editing, presence
- ✅ **AI Integration**: Summarize, brainstorm, translate, RAG Q&A
- ✅ **Versioning**: Page/block history, restore versions
- ✅ **Workspace Management**: Multi-workspace, member roles
- ✅ **File Storage**: Upload, preview, MinIO integration
- ✅ **Search**: Full-text + semantic search (pgvector)
- ✅ **Ngôn ngữ**: Chỉ hỗ trợ tiếng Việt

### 19.3 Security Features
- TLS/HTTPS bắt buộc
- JWT với refresh tokens
- RBAC chi tiết (workspace → page → block)
- CSRF protection
- XSS prevention
- SQL injection prevention
- Rate limiting
- CORS whitelist

### 19.4 Infrastructure
- **Deployment**: Docker Compose (development & production)
  - Reverse proxy Nginx cho production (SSL, load balancing)
- **Backup**: Automated daily backups (PostgreSQL, MinIO, Redis)
- **Monitoring**: Health checks, metrics, logging, error tracking
- **CI/CD**: Automated testing, deployment pipeline (tùy chọn)
- **Kubernetes**: Sẽ triển khai sau khi cần scale lớn

---

