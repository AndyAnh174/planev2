# Frontend Architecture & UI/UX Guide

## Tổng quan
Frontend được xây dựng với **Next.js 15+ (App Router)**, **shadcn/ui**, và các thư viện UI hiện đại để tạo trải nghiệm người dùng chuyên nghiệp, dễ sử dụng.

---

## 1. Tech Stack

### Core Framework
- **Next.js 15+**: App Router, Server Components, SSR/SSG
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Component library (đã setup sẵn)

### UI Libraries
- **Radix UI**: Unstyled, accessible components (primitive của shadcn/ui)
- **Lucide Icons**: Icon library
- **Framer Motion**: Animations và transitions

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Integration React Hook Form + Zod

### Data Display
- **TanStack Table (React Table)**: Advanced tables, sorting, filtering, pagination
- **Recharts**: Charts và data visualization (hoặc Chart.js nếu prefer)

### Editor
- **TipTap**: Rich text editor (block-based như Notion)

### State Management
- **Zustand**: Global state management (lightweight, simple)
- **React Query (TanStack Query)**: Server state, caching, sync

### Realtime
- **Socket.IO Client**: Real-time collaboration, presence

### Utilities
- **date-fns**: Date formatting
- **clsx / tailwind-merge**: Conditional classnames
- **axios**: HTTP client

---

## 2. Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected routes group
│   │   ├── workspace/
│   │   │   ├── [workspaceId]/
│   │   │   │   ├── page.tsx      # Workspace dashboard
│   │   │   │   ├── pages/
│   │   │   │   │   └── [pageId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── boards/
│   │   │   │       └── [boardId]/
│   │   │   │           └── page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── p/                        # Public pages
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── api/                      # API routes (proxy)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing/home page
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Breadcrumb.tsx
│   ├── editor/                   # Editor components
│   │   ├── TipTapEditor.tsx
│   │   ├── BlockMenu.tsx
│   │   ├── SlashCommand.tsx
│   │   └── blocks/
│   │       ├── TextBlock.tsx
│   │       ├── HeadingBlock.tsx
│   │       ├── CodeBlock.tsx
│   │       ├── TableBlock.tsx
│   │       └── ...
│   ├── kanban/                   # Kanban components
│   │   ├── BoardView.tsx
│   │   ├── Column.tsx
│   │   ├── Card.tsx
│   │   ├── CardDialog.tsx
│   │   └── DragDropProvider.tsx
│   ├── workspace/                # Workspace components
│   │   ├── WorkspaceSelector.tsx
│   │   ├── WorkspaceSettings.tsx
│   │   └── MemberList.tsx
│   ├── ai/                       # AI components
│   │   ├── AIPanel.tsx
│   │   ├── AICommand.tsx
│   │   ├── AISummarize.tsx
│   │   └── RAGQuery.tsx
│   ├── realtime/                 # Realtime components
│   │   ├── PresenceIndicator.tsx
│   │   ├── CursorTracker.tsx
│   │   └── CollaborationBar.tsx
│   └── shared/                   # Shared components
│       ├── FileUpload.tsx
│       ├── SearchBar.tsx
│       ├── UserAvatar.tsx
│       └── EmptyState.tsx
│
├── lib/
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   ├── api.ts                    # API client (axios setup)
│   ├── socket.ts                 # Socket.IO client
│   ├── auth.ts                   # Auth utilities
│   └── validations/              # Zod schemas
│       ├── auth.schema.ts
│       ├── workspace.schema.ts
│       └── page.schema.ts
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useRealtime.ts
│   ├── useDebounce.ts
│   └── useTheme.ts
│
├── store/                        # Zustand stores
│   ├── authStore.ts
│   ├── workspaceStore.ts
│   ├── editorStore.ts
│   └── uiStore.ts
│
├── styles/
│   └── globals.css               # Global styles + Tailwind
│
└── types/                        # TypeScript types
    ├── api.types.ts
    ├── workspace.types.ts
    ├── page.types.ts
    └── user.types.ts
```

---

## 3. UI/UX Design Principles

### 3.1 Design System
- **Color Palette**: 
  - Light mode: Neutral grays với accent color (blue/purple)
  - Dark mode: Dark grays với same accent
  - Semantic colors: success (green), warning (yellow), error (red)
- **Typography**: 
  - Font family: Inter hoặc system sans-serif
  - Font sizes: 12px, 14px, 16px, 18px, 24px, 32px
  - Line heights: 1.5 for body, 1.2 for headings
- **Spacing**: 
  - Tailwind spacing scale (4px base)
  - Consistent padding/margins
- **Border Radius**: 
  - Small: 4px (inputs, badges)
  - Medium: 8px (cards, buttons)
  - Large: 12px (modals, large cards)

### 3.2 UX Guidelines

#### Navigation
- **Sidebar**: Collapsible, hiển thị workspaces, pages, search
- **Breadcrumbs**: Hiển thị hierarchy (Workspace > Page)
- **Keyboard shortcuts**: 
  - `Cmd/Ctrl + K`: Command palette (search)
  - `Cmd/Ctrl + N`: New page
  - `Cmd/Ctrl + B`: Toggle sidebar
  - `Esc`: Close dialogs

#### Feedback
- **Loading states**: Skeleton loaders cho async data
- **Error states**: Clear error messages với retry actions
- **Success states**: Toast notifications cho actions
- **Empty states**: Helpful illustrations và CTAs

#### Accessibility
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: ARIA labels, semantic HTML
- **Focus management**: Visible focus indicators
- **Color contrast**: WCAG AA compliant

#### Responsive Design
- **Mobile**: Stack layout, bottom navigation
- **Tablet**: Sidebar toggle, responsive tables
- **Desktop**: Full sidebar, multi-column layouts

---

## 4. Core Pages & Components

### 4.1 Authentication Pages

#### Login Page (`/login`)
- **Layout**: Centered card trên background gradient
- **Components**: 
  - Email/password form (React Hook Form + Zod)
  - GitLab OAuth button với icon
  - "Quên mật khẩu?" link
- **Features**:
  - Form validation (Zod)
  - Loading state khi submit
  - Error messages inline

#### Register Page (`/register`)
- Similar layout như login
- Form fields: email, username, password, confirm password
- Terms & conditions checkbox
- Link đến login nếu đã có tài khoản

### 4.2 Dashboard Layout

#### Main Layout (`(dashboard)/layout.tsx`)
- **Structure**:
  ```
  ┌─────────────────────────────────────┐
  │ Header (Search, Notifications, User)│
  ├──────────┬──────────────────────────┤
  │ Sidebar  │ Main Content Area       │
  │          │                          │
  │ Workspace│ Page Editor / Board     │
  │ List     │                          │
  │          │                          │
  └──────────┴──────────────────────────┘
  ```
- **Components**:
  - `<Sidebar />`: Collapsible, workspace/pages tree
  - `<Header />`: Search bar, notifications, user menu
  - `<Breadcrumb />`: Navigation breadcrumbs

#### Sidebar Component
- **Sections**:
  1. Workspace selector (dropdown)
  2. Quick actions (New page, New board)
  3. Pages list (tree view)
  4. Boards list
  5. Trash
- **Features**:
  - Collapse/expand sections
  - Drag để reorder
  - Right-click context menu
  - Search trong sidebar

### 4.3 Page Editor (`/workspace/[workspaceId]/pages/[pageId]`)

#### Page Layout
- **Header**:
  - Page title (editable)
  - Action buttons: Share, Settings, AI tools
  - Presence indicators (users đang edit)
- **Editor Area**:
  - TipTap editor với block-based system
  - Slash commands (`/heading`, `/code`, `/table`)
  - Drag handle để reorder blocks
- **Sidebar** (optional):
  - Table of contents
  - Comments
  - Page history

#### TipTap Editor Integration
```typescript
// Editor component với block support
<TipTapEditor
  content={pageContent}
  onChange={handleChange}
  onBlockChange={handleBlockChange}
  readOnly={isPublicPage}
/>
```

#### Block Types
- **Text**: Paragraph, rich text formatting
- **Heading**: H1, H2, H3
- **Code**: Syntax highlighting (Prism/Shiki)
- **Table**: Editable table với row/column actions
- **Checklist**: Checkbox list
- **Image**: Upload hoặc embed URL
- **Embed**: YouTube, CodePen, etc.
- **Quote**: Blockquote
- **Divider**: Horizontal line

### 4.4 Kanban Board (`/workspace/[workspaceId]/boards/[boardId]`)

#### Board View
- **Layout**: Horizontal scroll columns
- **Components**:
  - `<BoardView />`: Container
  - `<Column />`: Kanban columns (Todo, In Progress, Done)
  - `<Card />`: Kanban cards
- **Features**:
  - Drag & drop cards (dnd-kit hoặc react-beautiful-dnd)
  - Add new card button
  - Column actions (rename, delete, add column)
  - Card quick edit trên hover

#### Card Component
- **Header**: Title, assignee avatar, labels
- **Body**: Description preview
- **Footer**: Due date, comment count
- **Dialog**: Full card details khi click

#### TanStack Table cho Card List View (optional)
- Switch giữa Board view và Table view
- Table với sorting, filtering
- Columns: Title, Status, Assignee, Due Date, Labels

### 4.5 Public Page (`/p/[slug]`)

#### Public Page Layout
- **Header**: 
  - Page title
  - Author info
  - Last updated date
  - Share button (copy link, embed)
- **Content**: 
  - Read-only editor view
  - No editing tools
- **Footer**: 
  - "Xem trên Notion Clone" link (nếu có account)

---

## 5. Component Details

### 5.1 Form Components (React Hook Form + Zod)

#### Example: Create Workspace Form
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const workspaceSchema = z.object({
  name: z.string().min(1, "Tên workspace không được để trống"),
  description: z.string().optional(),
});

type WorkspaceForm = z.infer<typeof workspaceSchema>;

function CreateWorkspaceDialog() {
  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
  });

  return (
    <Dialog>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên workspace</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Tạo</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 5.2 Table Components (TanStack Table)

#### Example: Pages Table
```typescript
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

function PagesTable({ pages }: { pages: Page[] }) {
  const columns = [
    {
      accessorKey: "title",
      header: "Tiêu đề",
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật",
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
  ];

  const table = useReactTable({
    data: pages,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.column.columnDef.header}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {/* Render cells */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### 5.3 Chart Components (Recharts)

#### Example: Workspace Analytics
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

function WorkspaceStats({ data }: { data: StatsData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê hoạt động</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart width={600} height={300} data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="pages" stroke="#8884d8" />
          <Line type="monotone" dataKey="edits" stroke="#82ca9d" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
```

### 5.4 Animation Components (Framer Motion)

#### Page Transitions
```typescript
import { motion } from "framer-motion";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

#### Sidebar Animation
```typescript
const sidebarVariants = {
  open: { width: 240, opacity: 1 },
  closed: { width: 0, opacity: 0 },
};

function Sidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.aside
      variants={sidebarVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Sidebar content */}
    </motion.aside>
  );
}
```

---

## 6. State Management

### 6.1 Zustand Stores

#### Auth Store
```typescript
// store/authStore.ts
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

#### Workspace Store
```typescript
// store/workspaceStore.ts
interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
}
```

### 6.2 React Query (Server State)

#### Example: Fetch Workspaces
```typescript
import { useQuery } from "@tanstack/react-query";

function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api.getWorkspaces(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## 7. Realtime UI Integration

### 7.1 Socket.IO Hook

```typescript
// hooks/useSocket.ts
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export function useSocket(event: string, callback: (data: any) => void) {
  useEffect(() => {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }, [event, callback]);
}
```

### 7.2 Presence Indicator

```typescript
// components/realtime/PresenceIndicator.tsx
function PresenceIndicator({ pageId }: { pageId: string }) {
  const [users, setUsers] = useState<User[]>([]);

  useSocket(`page:${pageId}:users`, (data) => {
    setUsers(data.users);
  });

  return (
    <div className="flex -space-x-2">
      {users.map((user) => (
        <Avatar key={user.id} src={user.avatarUrl} />
      ))}
    </div>
  );
}
```

### 7.3 Cursor Tracking

```typescript
// components/realtime/CursorTracker.tsx
function CursorTracker() {
  const [cursors, setCursors] = useState<Map<string, Position>>(new Map());

  useSocket("cursor:move", (data) => {
    setCursors((prev) => new Map(prev).set(data.userId, data.position));
  });

  return (
    <>
      {Array.from(cursors.entries()).map(([userId, position]) => (
        <motion.div
          key={userId}
          className="absolute pointer-events-none"
          style={{ left: position.x, top: position.y }}
          animate={{ x: position.x, y: position.y }}
        >
          <CursorIcon color={getUserColor(userId)} />
        </motion.div>
      ))}
    </>
  );
}
```

---

## 8. AI Integration UI

### 8.1 AI Command Panel

```typescript
// components/ai/AIPanel.tsx
function AIPanel({ pageId }: { pageId: string }) {
  const [command, setCommand] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAISummarize = async () => {
    setIsLoading(true);
    const result = await api.ai.summarize(pageId);
    // Show result in dialog
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAISummarize} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : "Tóm tắt"}
        </Button>
        <Button onClick={handleAIBrainstorm}>
          Sinh ý tưởng
        </Button>
        <Input
          placeholder="Hỏi về nội dung..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <Button onClick={handleAIAsk}>Hỏi AI</Button>
      </CardContent>
    </Card>
  );
}
```

### 8.2 Slash Commands trong Editor

```typescript
// TipTap slash command extension
const slashCommand = {
  commands: [
    {
      name: "ai-summarize",
      label: "Tóm tắt với AI",
      icon: Sparkles,
      action: ({ editor }: { editor: Editor }) => {
        // Call AI API và insert result
      },
    },
    {
      name: "ai-translate",
      label: "Dịch với AI",
      icon: Languages,
      action: ({ editor }: { editor: Editor }) => {
        // Translation UI
      },
    },
  ],
};
```

---

## 9. File Upload Component

```typescript
// components/shared/FileUpload.tsx
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

function FileUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && onUpload(files[0]),
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
        isDragActive && "border-primary"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2">Kéo thả file hoặc click để upload</p>
    </div>
  );
}
```

---

## 10. Dark Mode

### 10.1 Theme Provider

```typescript
// app/providers.tsx
import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
```

### 10.2 Theme Toggle

```typescript
// components/layout/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

---

## 11. Error Handling & Loading States

### 11.1 Error Boundary

```typescript
// app/error.tsx (Next.js error boundary)
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Đã xảy ra lỗi</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
```

### 11.2 Loading Skeleton

```typescript
// components/shared/PageSkeleton.tsx
function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-3/4" /> {/* Title */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
```

---

## 12. API Integration

### 12.1 API Client Setup

```typescript
// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 12.2 API Hooks (React Query)

```typescript
// hooks/useWorkspaces.ts
export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api.get("/workspaces").then((res) => res.data),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) =>
      api.post("/workspaces", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
```

---

## 13. Performance Optimization

### 13.1 Code Splitting
- Dynamic imports cho heavy components (TipTap editor, charts)
- Route-based code splitting với Next.js

### 13.2 Image Optimization
- Next.js Image component cho images
- Lazy loading cho images trong pages

### 13.3 Memoization
- React.memo cho expensive components
- useMemo cho computed values
- useCallback cho event handlers

---

## 14. Testing Strategy (Optional)

### 14.1 Component Tests
- Vitest + React Testing Library
- Test critical components (forms, tables)

### 14.2 E2E Tests
- Playwright hoặc Cypress
- Test user flows (login, create page, edit)

---

## 15. Build & Deployment

### 15.1 Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ENABLE_AI=true
```

### 15.2 Build Command
```bash
npm run build
npm start  # Production server
```

---

**Lưu ý:** 
- Tất cả components sử dụng shadcn/ui base components
- Icons từ Lucide Icons
- Animations với Framer Motion (subtle, không quá flashy)
- Forms luôn có validation với Zod
- Tables dùng TanStack Table cho advanced features
- Charts dùng Recharts cho data visualization

