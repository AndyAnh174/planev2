<!-- 5e6c3897-b3e1-49ae-803d-fc1ebccd998c d72c5d01-fc8a-456b-933a-0bb2712514a1 -->
# Page History API Endpoints

## Overview

Thêm các API endpoints để quản lý page history: xem danh sách versions, xem chi tiết version, restore về version cũ, và so sánh 2 versions.

## Implementation

### 1. Inject PageHistoryService vào PagesController

- File: `server/src/pages/pages.controller.ts`
- Inject PageHistoryService vào constructor
- Cần import PageHistoryService

### 2. Add GET /pages/:id/history endpoint

- File: `server/src/pages/pages.controller.ts`
- Endpoint: `GET /pages/:id/history`
- Query: Optional `limit` parameter (default 30)
- Response: Array of page history versions với metadata (id, version, createdAt, author)
- Include relations: author
- Order by: version DESC

### 3. Add GET /pages/:id/history/:versionId endpoint

- File: `server/src/pages/pages.controller.ts`
- Endpoint: `GET /pages/:id/history/:versionId`
- Response: Full page history với contentSnapshot
- Include relations: author, page
- Validate: versionId phải thuộc về pageId

### 4. Add restore method trong PageHistoryService

- File: `server/src/pages/page-history/page-history.service.ts`
- Method: `async restore(pageId: string, versionId: string, userId: string)`
- Logic:

1. Get history version by versionId và pageId
2. Get current page với blocks
3. Create new history snapshot của current state (trước khi restore)
4. Restore page content từ contentSnapshot
5. Update blocks từ contentSnapshot
6. Return restored page

### 5. Add POST /pages/:id/history/:versionId/restore endpoint

- File: `server/src/pages/pages.controller.ts`
- Endpoint: `POST /pages/:id/history/:versionId/restore`
- Body: Optional message/note
- Logic:

1. Validate user có quyền edit page (workspace member)
2. Call PageHistoryService.restore()
3. Return restored page

### 6. Add GET /pages/:id/history/compare endpoint

- File: `server/src/pages/pages.controller.ts`
- Endpoint: `GET /pages/:id/history/compare?version1=:v1&version2=:v2`
- Query params: version1 (required), version2 (required)
- Response: Comparison object với:
- version1 data
- version2 data
- diff (optional - có thể implement sau)

### 7. Add compare method trong PageHistoryService (optional)

- File: `server/src/pages/page-history/page-history.service.ts`
- Method: `async compare(pageId: string, version1: string, version2: string)`
- Return: Both versions và basic diff info

## Notes

- Tất cả endpoints cần authentication (JWT guard)
- Cần check permission: user phải là member của workspace chứa page
- Restore sẽ tạo history snapshot mới của current state trước khi restore
- Cleanup old versions (90 days) có thể làm sau với scheduled job

### To-dos

- [ ] Setup Redis client trong AuthService (tương tự RateLimitInterceptor pattern)
- [ ] Update AuthService.login() để lưu refresh token vào Redis với TTL 7 days
- [ ] Implement AuthService.refresh() với token rotation logic
- [ ] Complete AuthController.refresh() endpoint với error handling
- [ ] Add logout endpoint để invalidate refresh token trong Redis
- [ ] Update authStore để lưu và quản lý refreshToken
- [ ] Implement auto-refresh logic trong API client interceptor
- [ ] Update login/register pages để lưu refreshToken vào store
- [ ] Update useAuth hook để check refreshToken khi initialize