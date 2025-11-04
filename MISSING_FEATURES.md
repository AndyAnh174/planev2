# Danh sách chức năng còn thiếu - PlaneV2.0

Dựa trên documentation và code hiện tại, đây là danh sách các chức năng còn thiếu hoặc chưa hoàn thiện:

## 🔐 Authentication & Authorization

### 1. Refresh Token Implementation ⚠️ **QUAN TRỌNG** ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `server/src/auth/auth.service.ts`, `server/src/auth/auth.controller.ts`, `client/lib/api.ts`, `client/store/authStore.ts`
- **Đã implement**: 
  - ✅ Lưu refresh token vào Redis với TTL 7 days
  - ✅ Implement endpoint `/auth/refresh` hoàn chỉnh với token rotation
  - ✅ Token rotation khi refresh (xóa token cũ, tạo token mới)
  - ✅ Xử lý refresh token trong frontend (auto-refresh khi access token hết hạn)
  - ✅ Logout endpoint để invalidate refresh token

### 2. Password Reset / Forgot Password
- **Status**: Chưa có
- **Cần**: 
  - Endpoint `/auth/forgot-password`
  - Endpoint `/auth/reset-password`
  - Email service để gửi reset link
  - Token reset password (JWT với expiration ngắn)

### 3. Email Verification
- **Status**: Chưa có
- **Cần**: 
  - Gửi email verification khi đăng ký
  - Endpoint `/auth/verify-email`
  - Xác thực email trước khi cho phép login

### 4. ALLOW_LOCAL_SIGNUP Configuration
- **Status**: Chưa kiểm tra trong code
- **Cần**: 
  - Middleware/Guard để check `ALLOW_LOCAL_SIGNUP` env variable
  - Block register endpoint nếu `ALLOW_LOCAL_SIGNUP=false`

---

## 📄 Pages & Versioning

### 5. Page History API Endpoints ⚠️ **QUAN TRỌNG** ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `server/src/pages/pages.controller.ts`, `server/src/pages/page-history/page-history.service.ts`
- **Đã implement**:
  - ✅ `GET /pages/:id/history` - Lấy danh sách versions với pagination
  - ✅ `GET /pages/:id/history/:versionId` - Xem chi tiết version
  - ✅ `POST /pages/:id/history/:versionId/restore` - Restore về version cũ
  - ✅ `GET /pages/:id/history/compare?version1=:v1&version2=:v2` - So sánh 2 versions
  - ✅ Permission checks cho từng endpoint
  - ✅ Error handling với proper HTTP exceptions

### 6. Auto-create Page History on Update ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `server/src/pages/pages.service.ts`
- **Đã implement**: 
  - ✅ Tự động tạo page history snapshot mỗi khi page được update
  - ⚠️ Cleanup old versions (90 days) - có service nhưng chưa có scheduled job (cần implement sau)

### 7. Block History API
- **Status**: Entity đã có nhưng chưa có service/controller
- **Cần**: 
  - Block history service
  - API endpoints tương tự page history

### 8. Page History Timeline UI
- **Status**: Chưa có frontend
- **Cần**: 
  - Component hiển thị history timeline
  - Restore button
  - Compare versions UI

---

## 🌐 Public Pages

### 9. Public Page Frontend Implementation ⚠️ **QUAN TRỌNG** ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `client/app/p/[slug]/page.tsx`, `client/components/shared/BlockRenderer.tsx`, `client/components/shared/ShareButton.tsx`, `client/components/shared/PublicPageHeader.tsx`
- **Đã implement**: 
  - ✅ Fetch page data từ API `/pages/public/:slug` với React Query
  - ✅ Render page content trong read-only mode với BlockRenderer component
  - ✅ Hiển thị metadata (author, updated date) trong PublicPageHeader
  - ✅ Share button (copy link, embed code) với ShareButton component
  - ✅ SEO meta tags với dynamic metadata trong `layout.tsx` nếu `is_indexed=true`
  - ✅ Loading states và error handling
  - ✅ Support tất cả block types và nested blocks

### 10. Public Page SEO Indexing
- **Status**: Field `is_indexed` đã có nhưng chưa có logic
- **Cần**: 
  - Toggle `is_indexed` khi publish
  - Generate sitemap cho public pages
  - Meta tags cho SEO

### 11. Public Page Embed Code ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `client/lib/utils.ts`, `client/components/shared/ShareButton.tsx`
- **Đã implement**: 
  - ✅ Logic để generate embed iframe code trong `generateEmbedCode()` utility
  - ✅ UI để copy embed code trong ShareButton component với dialog

---

## 🔄 Realtime Collaboration

### 12. Realtime Block Updates Integration ⚠️ **QUAN TRỌNG** ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `server/src/realtime/realtime.gateway.ts`, `server/src/realtime/block-update-queue.service.ts`, `server/src/pages/blocks/blocks.service.ts`
- **Đã implement**: 
  - ✅ Tự động save block updates từ realtime events với debouncing (500ms)
  - ✅ Conflict resolution với last-write-wins strategy (timestamp comparison)
  - ✅ Batch saving để tránh quá nhiều database writes
  - ✅ Permission checks (yêu cầu member role để edit)
  - ✅ Auto-update page.updatedAt khi blocks được save
  - ✅ Flush pending updates khi user disconnect
  - ✅ Comprehensive error handling và logging

### 13. Presence Indicator Frontend
- **Status**: Component đã có nhưng cần kiểm tra
- **Cần**: 
  - Hiển thị avatars của users đang edit
  - Cursor tracking UI (nếu cần)
  - "User is typing..." indicator

---

## 🤖 AI Integration

### 14. AI Rate Limiting ⚠️ **QUAN TRỌNG** ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `server/src/common/interceptors/ai-rate-limit.interceptor.ts`, `server/src/common/decorators/ai-rate-limit.decorator.ts`, `server/src/ai/ai.controller.ts`, `server/src/ai/gemini/gemini.service.ts`
- **Đã implement**: 
  - ✅ Rate limiting riêng cho AI endpoints (10 req/min cho Ollama, 15 req/min cho Gemini)
  - ✅ AIRateLimitInterceptor với provider-specific limits
  - ✅ Rate limit headers (X-AI-RateLimit-*)
  - ✅ Cost tracking cho Gemini API (token usage, estimated costs)
  - ✅ Usage stats tracking trong Redis
  - ✅ Configurable via environment variables

### 15. AI Slash Commands trong Editor
- **Status**: Chưa có
- **Cần**: 
  - TipTap extension cho `/ai-summarize`, `/ai-translate`, `/ai-brainstorm`
  - UI để nhập và hiển thị kết quả

### 16. RAG Embedding Auto-generation
- **Status**: Embedding service đã có nhưng chưa tự động chạy
- **Cần**: 
  - Tự động generate embedding khi block được tạo/cập nhật
  - Background job để generate embeddings cho blocks cũ

---

## 📊 Workspace Management

### 17. Workspace Export (JSON/PDF) ⚠️ **QUAN TRỌNG** ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `server/src/workspaces/workspace-export.service.ts`, `server/src/common/services/pdf-generation.service.ts`, `server/src/workspaces/workspaces.controller.ts`
- **Đã implement**: 
  - ✅ Endpoint `/workspaces/:id/export?format=json|pdf` với format parameter
  - ✅ Export tất cả pages (với blocks), boards (với cards), files trong workspace
  - ✅ PDF generation service sử dụng @react-pdf/renderer
  - ✅ File binaries được bao gồm trong JSON export (base64 encoded)
  - ✅ Permission checks (user phải là workspace member)
  - ✅ Download file từ MinIO và include trong export
  - ✅ Swagger documentation với examples
  - ✅ Comprehensive error handling

### 18. Workspace Templates
- **Status**: Chưa có
- **Cần**: 
  - Template system
  - Pre-built templates (project management, meeting notes, etc.)

---

## 🔍 Search

### 19. Search Frontend
- **Status**: Backend có nhưng chưa check frontend
- **Cần**: 
  - Search bar component
  - Search results UI
  - Filter by workspace, type (page/board)

### 20. Semantic Search UI
- **Status**: Backend có nhưng chưa check frontend
- **Cần**: 
  - UI để hiển thị semantic search results
  - Highlight relevant parts

---

## 📁 Files & Storage

### 21. File Preview
- **Status**: Chưa có
- **Cần**: 
  - Image preview
  - PDF viewer
  - Video preview
  - Document preview (Office files)

### 22. File Size Limits
- **Status**: Chưa có validation
- **Cần**: 
  - Config max file size
  - Validation khi upload
  - Error handling cho files quá lớn

---

## 💬 Comments

### 23. Comments UI
- **Status**: Backend có nhưng chưa check frontend
- **Cần**: 
  - Comment component trên pages/blocks/cards
  - Threaded comments
  - Mention users (@username)
  - Notifications khi có comment mới

---

## 📈 Analytics & Monitoring

### 24. Health Checks Implementation
- **Status**: Controller đã có nhưng cần check logic
- **Cần**: 
  - `/health/ready` - Check database, Redis, MinIO connections
  - `/health/live` - Basic liveness check
  - Metrics endpoint `/metrics` (Prometheus format)

### 25. Error Tracking (Sentry)
- **Status**: Chưa có
- **Cần**: 
  - Integrate Sentry hoặc Rollbar
  - Error logging và alerting

### 26. APM (Application Performance Monitoring)
- **Status**: Chưa có
- **Cần**: 
  - OpenTelemetry setup
  - Track API calls, DB queries, AI calls
  - Identify bottlenecks

---

## 🔒 Security & Performance

### 27. Rate Limiting Applied ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `server/src/common/interceptors/rate-limit.interceptor.ts`, `server/src/common/decorators/skip-rate-limit.decorator.ts`, `server/src/app.module.ts`
- **Đã implement**: 
  - ✅ Apply rate limiting globally qua APP_INTERCEPTOR
  - ✅ Different limits cho authenticated (100 req/min) vs public (30 req/min) endpoints
  - ✅ @SkipRateLimit() decorator để skip cho specific endpoints
  - ✅ Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
  - ✅ Health check endpoints được exempt từ rate limiting
  - ✅ Configurable via environment variables

### 28. CORS Configuration
- **Status**: Cần check cấu hình
- **Cần**: 
  - Whitelist domains
  - Proper CORS headers

### 29. CSRF Protection
- **Status**: Chưa có
- **Cần**: 
  - CSRF tokens
  - Validate CSRF cho state-changing operations

### 30. SQL Injection Prevention
- **Status**: TypeORM đã có parameterized queries nhưng cần audit
- **Cần**: 
  - Audit tất cả queries
  - Ensure no raw SQL với user input

### 31. XSS Prevention
- **Status**: Cần check
- **Cần**: 
  - Sanitize user input
  - Content Security Policy (CSP) headers
  - Validate HTML content

---

## 🗄️ Database & Migrations

### 32. Database Migrations ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `server/src/database/data-source.ts`, `server/src/database/migrations/`
- **Đã implement**: 
  - ✅ TypeORM migrations setup với DataSource config
  - ✅ Initial schema migration với tất cả tables
  - ✅ Migration scripts trong package.json (generate, create, run, revert, show)
  - ✅ Documentation trong migrations/README.md

### 33. pgvector Index Creation ✅ **DONE**
- **Status**: ✅ **ĐÃ HOÀN THÀNH**
- **Location**: `server/src/database/migrations/1699123456790-EnablePgvector.ts`, `server/src/database/migrations/1699123456791-CreateEmbeddingsIndex.ts`
- **Đã implement**: 
  - ✅ Migration để enable pgvector extension
  - ✅ Create IVFFlat index cho embeddings.vector column
  - ⚠️ Auto-create index khi có > 1000 embeddings - Index được tạo sẵn, nhưng nên rebuild sau khi có đủ data

---

## 🎨 Frontend Features

### 34. Dark Mode Toggle
- **Status**: Package `next-themes` đã có nhưng cần check UI
- **Cần**: 
  - Theme toggle button trong header
  - Persist theme preference

### 35. Keyboard Shortcuts
- **Status**: Chưa có
- **Cần**: 
  - `Cmd/Ctrl + K`: Command palette
  - `Cmd/Ctrl + N`: New page
  - `Cmd/Ctrl + B`: Toggle sidebar
  - Shortcut help modal

### 36. Command Palette
- **Status**: Chưa có
- **Cần**: 
  - Search pages, boards
  - Quick actions (new page, new board)
  - Navigation

### 37. Mobile Responsive
- **Status**: Cần test
- **Cần**: 
  - Mobile-friendly layout
  - Bottom navigation trên mobile
  - Touch gestures cho drag & drop

---

## 📦 Deployment & DevOps

### 38. Docker Compose Production Setup
- **Status**: Có docker-compose.yml nhưng cần check production config
- **Cần**: 
  - Production-ready docker-compose
  - Environment variables
  - Health checks trong docker-compose

### 39. Automated Backups
- **Status**: Chưa có
- **Cần**: 
  - Daily PostgreSQL backup script
  - MinIO backup/replication
  - Redis backup
  - Backup retention policy

### 40. CI/CD Pipeline
- **Status**: Chưa có
- **Cần**: 
  - Automated tests
  - Build và deploy pipeline
  - Environment-specific configs

---

## 📝 Documentation

### 41. API Documentation (Swagger)
- **Status**: Swagger đã setup nhưng cần check completeness
- **Cần**: 
  - Tất cả endpoints đều có Swagger docs
  - Example requests/responses
  - Authentication flow docs

### 42. User Documentation
- **Status**: Chưa có
- **Cần**: 
  - User guide
  - Feature documentation
  - FAQ

---

## 🧪 Testing

### 43. Unit Tests
- **Status**: Chưa có hoặc ít
- **Cần**: 
  - Test cho services
  - Test cho controllers
  - Test coverage > 70%

### 44. E2E Tests
- **Status**: Có structure nhưng chưa có tests
- **Cần**: 
  - Test user flows (login, create page, edit)
  - Test public pages
  - Test Kanban board

---

## 🎯 Priority Summary

### 🔴 **CRITICAL** (Cần làm ngay):
1. ✅ Refresh Token Implementation (#1) - **DONE**
2. ✅ Page History API Endpoints (#5) - **DONE**
3. ✅ Public Page Frontend Implementation (#9) - **DONE**
4. ✅ Database Migrations (#32) - **DONE**

### 🟡 **HIGH** (Quan trọng):
5. ✅ Auto-create Page History on Update (#6) - **DONE**
6. ✅ Realtime Block Updates Integration (#12) - **DONE**
7. ✅ AI Rate Limiting (#14) - **DONE**
8. ✅ Workspace Export (#17) - **DONE**
9. ✅ Rate Limiting Applied (#27) - **DONE**
10. ✅ pgvector Index Creation (#33) - **DONE**

### 🟢 **MEDIUM** (Có thể làm sau):
11. Password Reset (#2)
12. Block History API (#7)
13. Public Page SEO (#10)
14. File Preview (#21)
15. Comments UI (#23)
16. Command Palette (#36)

### ⚪ **LOW** (Nice to have):
17. Email Verification (#3)
18. Workspace Templates (#18)
19. APM (#26)
20. User Documentation (#42)

---

## ✅ **ĐÃ HOÀN THÀNH** (Summary)

### CRITICAL Tasks (4/4) ✅
1. ✅ **Refresh Token Implementation** - Redis storage, token rotation, auto-refresh
2. ✅ **Page History API Endpoints** - Full CRUD với permission checks
3. ✅ **Public Page Frontend Implementation** - Complete UI với SEO, share, embed code
4. ✅ **Database Migrations** - TypeORM migrations setup với initial schema

### HIGH Priority Tasks (6/6) ✅
5. ✅ **Auto-create Page History on Update** - Auto snapshot khi update page
6. ✅ **Realtime Block Updates Integration** - Debounced auto-save với conflict resolution
7. ✅ **AI Rate Limiting** - Provider-specific limits với cost tracking
8. ✅ **Workspace Export** - JSON/PDF export với file binaries, permission checks
9. ✅ **Rate Limiting Applied** - Global rate limiting với different limits cho authenticated/public
10. ✅ **pgvector Index Creation** - pgvector extension và IVFFlat index

### Additional Completed Features
- ✅ **Public Page Embed Code** - Generate và copy embed iframe code
- ✅ **Page History Auto-creation** - Tự động tạo history khi update

**Tổng kết**: Đã hoàn thành **10/44** chức năng (4/4 CRITICAL, 6/6 HIGH)

---

**Lưu ý**: 
- Một số chức năng có thể đã được implement nhưng chưa được test hoặc chưa hoàn thiện
- Cần review code kỹ hơn để xác nhận những gì đã có và chưa có
- Ưu tiên các chức năng CRITICAL và HIGH trước

