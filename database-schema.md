# Database Schema & Data Model

## Tổng quan
Hệ thống sử dụng **PostgreSQL 15+** với extension **pgvector** cho semantic search. Tất cả các bảng được thiết kế với:
- UUID primary keys (hoặc auto-increment integer)
- Timestamps: `created_at`, `updated_at`
- Soft delete pattern (optional): `deleted_at`
- JSONB cho flexible data storage

---

## ERD Diagram (Entity Relationship Diagram)

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│    users    │         │   workspaces     │         │   pages     │
├─────────────┤         ├──────────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)          │         │ id (PK)     │
│ email       │◄──┐     │ name             │◄─────────┤ workspace_id│
│ username    │   │     │ slug             │         │ title       │
│ password    │   │     │ description      │         │ slug        │
│ avatar_url  │   │     │ avatar_url       │         │ visibility  │
│ gitlab_id   │   │     │ owner_id (FK)    │         │ author_id   │
│ created_at  │   │     │ created_at       │         │ is_indexed  │
│ updated_at  │   │     │ updated_at       │         │ created_at  │
└─────────────┘   │     └──────────────────┘         │ updated_at  │
                  │              │                    └─────────────┘
                  │              │                           │
                  │              │                           │
                  │     ┌────────▼───────────┐              │
                  │     │ workspace_members   │              │
                  └────►│────────────────────│              │
                        │ workspace_id (FK)   │              │
                        │ user_id (FK)        │              │
                        │ role                │              │
                        │ joined_at           │              │
                        └─────────────────────┘              │
                                                              │
                    ┌────────────────────────────────────────┘
                    │
          ┌─────────▼──────────┐
          │      blocks        │
          ├────────────────────┤
          │ id (PK)            │
          │ page_id (FK)       │
          │ type               │
          │ content (JSONB)   │
          │ order_index        │
          │ parent_id (FK)    │
          │ created_at         │
          │ updated_at         │
          └────────────────────┘
                    │
                    │
          ┌─────────▼───────────┐
          │   block_history     │
          ├─────────────────────┤
          │ id (PK)             │
          │ block_id (FK)       │
          │ content_snapshot    │
          │ version             │
          │ author_id (FK)      │
          │ created_at          │
          └─────────────────────┘


┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   boards    │         │    cards    │         │  comments   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │         │ id (PK)     │
│ workspace_id│         │ board_id(FK)│         │ target_type │
│ name        │◄────────┤ column_id  │         │ target_id   │
│ description │         │ title       │         │ author_id   │
│ created_at  │         │ description  │         │ content     │
│ updated_at  │         │ assignee_id │         │ created_at  │
└─────────────┘         │ due_date    │         │ updated_at  │
                        │ labels(JSONB)│         └─────────────┘
                        │ order_index │
                        │ created_at  │
                        │ updated_at  │
                        └─────────────┘

┌─────────────┐         ┌─────────────┐
│ embeddings  │         │file_uploads │
├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │
│ block_id(FK)│         │ workspace_id│
│ page_id(FK) │         │ uploader_id │
│ vector(pgv) │         │ filename    │
│ metadata    │         │ original_nm │
│ created_at  │         │ mime_type   │
└─────────────┘         │ size        │
                        │ minio_path  │
                        │ url         │
                        │ created_at  │
                        └─────────────┘
```

---

## Chi tiết các bảng

### 1. users
Người dùng trong hệ thống.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `email` | VARCHAR(255) UNIQUE | Email đăng nhập |
| `username` | VARCHAR(100) UNIQUE | Tên người dùng |
| `password_hash` | VARCHAR(255) NULL | Mật khẩu đã hash (NULL nếu chỉ dùng GitLab) |
| `avatar_url` | TEXT NULL | URL ảnh đại diện |
| `gitlab_id` | VARCHAR(100) NULL UNIQUE | GitLab user ID (nếu đăng nhập qua GitLab) |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_users_email` trên `email`
- `idx_users_gitlab_id` trên `gitlab_id` (nếu có)

---

### 2. workspaces
Workspace là không gian làm việc chứa nhiều pages và boards.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `name` | VARCHAR(255) | Tên workspace |
| `slug` | VARCHAR(255) UNIQUE | URL-friendly name |
| `description` | TEXT NULL | Mô tả workspace |
| `avatar_url` | TEXT NULL | URL ảnh đại diện |
| `owner_id` | UUID (FK) → users.id | Người tạo workspace |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_workspaces_owner` trên `owner_id`
- `idx_workspaces_slug` trên `slug`

---

### 3. workspace_members
Quan hệ nhiều-nhiều giữa users và workspaces (với role).

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `workspace_id` | UUID (FK) → workspaces.id | Workspace |
| `user_id` | UUID (FK) → users.id | User |
| `role` | VARCHAR(20) | `owner`, `admin`, `member`, `viewer` |
| `joined_at` | TIMESTAMP | Thời gian tham gia |

**Constraints:**
- Primary key: `(workspace_id, user_id)`
- Unique constraint: một user chỉ có một role trong một workspace

**Indexes:**
- `idx_workspace_members_workspace` trên `workspace_id`
- `idx_workspace_members_user` trên `user_id`

---

### 4. pages
Trang ghi chú trong workspace.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `workspace_id` | UUID (FK) → workspaces.id | Workspace chứa page |
| `title` | VARCHAR(500) | Tiêu đề trang |
| `slug` | VARCHAR(500) | URL-friendly slug (unique trong workspace) |
| `visibility` | VARCHAR(20) | `private`, `workspace`, `public` |
| `author_id` | UUID (FK) → users.id | Người tạo |
| `is_indexed` | BOOLEAN DEFAULT false | Cho phép SEO indexing (nếu public) |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_pages_workspace_visibility` trên `(workspace_id, visibility)`
- `idx_pages_author` trên `author_id`
- `idx_pages_slug` trên `slug`
- `idx_pages_public` trên `(visibility, is_indexed)` WHERE `visibility = 'public'`

---

### 5. page_history
Lịch sử các phiên bản của page (versioning).

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `page_id` | UUID (FK) → pages.id | Page |
| `content_snapshot` | JSONB | Snapshot toàn bộ content của page (tất cả blocks) |
| `version` | INTEGER | Số phiên bản (auto-increment) |
| `author_id` | UUID (FK) → users.id | Người tạo phiên bản này |
| `created_at` | TIMESTAMP | Thời gian tạo |

**Indexes:**
- `idx_page_history_page` trên `page_id`
- `idx_page_history_version` trên `(page_id, version DESC)`

**Lưu ý:** Auto cleanup versions cũ hơn 90 ngày (giữ tối đa 30 versions).

---

### 6. blocks
Các block nội dung trong page (text, heading, code, table, etc.).

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `page_id` | UUID (FK) → pages.id | Page chứa block |
| `type` | VARCHAR(50) | `text`, `heading`, `code`, `table`, `checklist`, `image`, `embed`, etc. |
| `content` | JSONB | Nội dung block (format khác nhau tùy type) |
| `order_index` | INTEGER | Thứ tự trong page |
| `parent_id` | UUID (FK) → blocks.id NULL | Block cha (cho nested blocks) |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_blocks_page_order` trên `(page_id, order_index)`
- `idx_blocks_parent` trên `parent_id`
- `idx_blocks_type` trên `type` (cho filter theo type)

**Content JSONB Examples:**
```json
// Text block
{
  "text": "Nội dung văn bản",
  "format": {"bold": true, "italic": false}
}

// Heading block
{
  "text": "Tiêu đề",
  "level": 1
}

// Code block
{
  "code": "function hello() {}",
  "language": "javascript"
}

// Checklist block
{
  "items": [
    {"checked": true, "text": "Task 1"},
    {"checked": false, "text": "Task 2"}
  ]
}
```

---

### 7. block_history
Lịch sử các phiên bản của block (cho track changes).

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `block_id` | UUID (FK) → blocks.id | Block |
| `content_snapshot` | JSONB | Snapshot nội dung block |
| `version` | INTEGER | Số phiên bản |
| `author_id` | UUID (FK) → users.id | Người chỉnh sửa |
| `created_at` | TIMESTAMP | Thời gian tạo |

**Indexes:**
- `idx_block_history_block` trên `block_id`
- `idx_block_history_version` trên `(block_id, version DESC)`

---

### 8. boards
Kanban boards trong workspace.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `workspace_id` | UUID (FK) → workspaces.id | Workspace |
| `name` | VARCHAR(255) | Tên board |
| `description` | TEXT NULL | Mô tả |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_boards_workspace` trên `workspace_id`

---

### 9. cards
Cards trong Kanban board.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `board_id` | UUID (FK) → boards.id | Board |
| `column_id` | VARCHAR(100) | ID cột (e.g., "todo", "in-progress", "done") |
| `title` | VARCHAR(500) | Tiêu đề card |
| `description` | TEXT NULL | Mô tả chi tiết |
| `assignee_id` | UUID (FK) → users.id NULL | Người được giao |
| `due_date` | TIMESTAMP NULL | Hạn hoàn thành |
| `labels` | JSONB | Mảng labels `["urgent", "bug", "feature"]` |
| `order_index` | INTEGER | Thứ tự trong cột |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_cards_board_column` trên `(board_id, column_id, order_index)`
- `idx_cards_assignee` trên `assignee_id`
- `idx_cards_due_date` trên `due_date` WHERE `due_date IS NOT NULL`

---

### 10. comments
Comments trên pages, blocks, hoặc cards.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `target_type` | VARCHAR(20) | `page`, `block`, `card` |
| `target_id` | UUID | ID của target (page_id, block_id, hoặc card_id) |
| `author_id` | UUID (FK) → users.id | Người comment |
| `content` | TEXT | Nội dung comment |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_comments_target` trên `(target_type, target_id)`
- `idx_comments_author` trên `author_id`

---

### 11. embeddings
Embeddings cho RAG (Retrieval-Augmented Generation).

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `block_id` | UUID (FK) → blocks.id | Block được embed |
| `page_id` | UUID (FK) → pages.id | Page chứa block (denormalized để query nhanh) |
| `vector` | VECTOR(1024) | Embedding vector từ BGE-M3 (1024 dimensions) |
| `metadata` | JSONB | Metadata về embedding (model version, timestamp, etc.) |
| `created_at` | TIMESTAMP | Thời gian tạo |

**Indexes:**
- `idx_embeddings_block` trên `block_id`
- `idx_embeddings_page` trên `page_id`
- **IVFFlat index** trên `vector` cho semantic search:
  ```sql
  CREATE INDEX idx_embeddings_vector 
  ON embeddings 
  USING ivfflat (vector vector_cosine_ops) 
  WITH (lists = 100);
  ```

**Lưu ý:** 
- IVFFlat index chỉ tạo khi có > 1000 embeddings
- Re-index định kỳ khi data thay đổi nhiều

---

### 12. file_uploads
Files được upload lên MinIO.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID (PK) | Primary key |
| `workspace_id` | UUID (FK) → workspaces.id | Workspace |
| `uploader_id` | UUID (FK) → users.id | Người upload |
| `filename` | VARCHAR(255) | Tên file trên server |
| `original_name` | VARCHAR(500) | Tên file gốc |
| `mime_type` | VARCHAR(100) | MIME type (e.g., "image/png", "application/pdf") |
| `size` | BIGINT | Kích thước file (bytes) |
| `minio_path` | VARCHAR(500) | Path trong MinIO |
| `url` | TEXT | Public URL để truy cập file |
| `created_at` | TIMESTAMP | Thời gian tạo |

**Indexes:**
- `idx_file_uploads_workspace` trên `workspace_id`
- `idx_file_uploads_uploader` trên `uploader_id`
- `idx_file_uploads_mime_type` trên `mime_type`

---

## Relationships Summary

### One-to-Many
- `users` → `workspaces` (owner)
- `workspaces` → `pages`
- `workspaces` → `boards`
- `workspaces` → `file_uploads`
- `pages` → `blocks`
- `pages` → `page_history`
- `boards` → `cards`
- `blocks` → `block_history`
- `blocks` → `embeddings`

### Many-to-Many
- `users` ↔ `workspaces` (qua `workspace_members`)

### Polymorphic
- `comments` → `pages`, `blocks`, hoặc `cards` (qua `target_type`, `target_id`)

---

## Constraints & Validations

### Database Constraints
- `workspace_members.role` chỉ nhận: `owner`, `admin`, `member`, `viewer`
- `pages.visibility` chỉ nhận: `private`, `workspace`, `public`
- `comments.target_type` chỉ nhận: `page`, `block`, `card`
- Foreign keys với `ON DELETE CASCADE` hoặc `ON DELETE RESTRICT` tùy case

### Business Logic Constraints
- Một workspace phải có ít nhất 1 owner
- Không thể xóa owner cuối cùng của workspace
- Page slug phải unique trong workspace
- Block order_index phải unique trong page

---

## Performance Optimizations

### Indexes
- Tất cả foreign keys đều có index
- Composite indexes cho các query pattern thường dùng
- Partial indexes cho filtered queries (ví dụ: public pages)

### Query Optimization
- JSONB indexes cho frequent queries trong `content` field
- Materialized views cho complex aggregations (nếu cần)
- Connection pooling với PgBouncer

### pgvector Optimization
- IVFFlat index với số lists phù hợp (default: 100 lists cho < 1M vectors)
- Monitor index quality và rebuild nếu cần

---

## Migration Strategy

1. **Initial Schema**: Tạo tất cả tables với migrations
2. **Extensions**: Enable `pgvector` extension trước khi tạo `embeddings` table
3. **Data Seeding**: Seed default data (admin user, default workspace)
4. **Indexes**: Tạo indexes sau khi có data (để optimize)
5. **Backups**: Setup automated backups sau khi schema stable

---

## Backup & Recovery

### Backup Strategy
- Daily full backup với `pg_dump`
- Continuous WAL archiving cho Point-in-Time Recovery
- Backup storage: MinIO hoặc S3-compatible

### Recovery Scenarios
- Restore từ latest backup
- PITR restore về bất kỳ point trong 30 ngày qua
- Test recovery monthly

---

**Lưu ý:** Schema này có thể thay đổi trong quá trình phát triển. Sử dụng migrations (TypeORM/Prisma) để quản lý schema changes.

