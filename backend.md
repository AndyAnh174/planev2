# Backend Architecture & API Guide

## Tổng quan
Backend được xây dựng với **NestJS**, framework Node.js mạnh mẽ, type-safe với TypeScript, và architecture modular để dễ maintain và scale.

---

## 1. Tech Stack

### Core Framework
- **NestJS**: Progressive Node.js framework với TypeScript
- **TypeScript**: Type safety, better DX
- **Node.js 18+**: Runtime environment

### Database & ORM
- **PostgreSQL 15+**: Primary database
- **TypeORM** hoặc **Prisma**: ORM cho database operations
- **pgvector**: Extension cho vector storage (embeddings)
- **Redis 7+**: Cache, sessions, pub/sub

### Authentication & Security
- **@nestjs/jwt**: JWT token management
- **@nestjs/passport**: Authentication strategies
- **passport-gitlab2**: GitLab OAuth strategy
- **bcrypt**: Password hashing
- **class-validator**: DTO validation
- **class-transformer**: DTO transformation

### API & Realtime
- **@nestjs/platform-express**: REST API
- **@nestjs/websockets**: WebSocket support
- **socket.io**: Real-time collaboration
- **@nestjs/redis**: Redis integration

### File Storage
- **@nestjs/bull**: Queue management (optional)
- **minio**: MinIO client (S3-compatible)

### AI Integration
- **axios**: HTTP client cho external APIs
- **ollama**: Ollama client (optional package)

### Utilities
- **date-fns**: Date manipulation
- **uuid**: UUID generation
- **winston** hoặc **pino**: Logging
- **helmet**: Security headers
- **compression**: Response compression

---

## 2. Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── auth/                      # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── gitlab.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── users/                     # Users module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── workspaces/                # Workspaces module
│   │   ├── workspaces.module.ts
│   │   ├── workspaces.controller.ts
│   │   ├── workspaces.service.ts
│   │   ├── workspace-members/
│   │   │   ├── workspace-members.service.ts
│   │   │   └── workspace-members.controller.ts
│   │   ├── guards/
│   │   │   └── workspace-permission.guard.ts
│   │   └── dto/
│   │       ├── create-workspace.dto.ts
│   │       └── update-workspace.dto.ts
│   │
│   ├── pages/                     # Pages module
│   │   ├── pages.module.ts
│   │   ├── pages.controller.ts
│   │   ├── pages.service.ts
│   │   ├── blocks/
│   │   │   ├── blocks.service.ts
│   │   │   └── blocks.controller.ts
│   │   ├── page-history/
│   │   │   └── page-history.service.ts
│   │   └── dto/
│   │       ├── create-page.dto.ts
│   │       └── update-page.dto.ts
│   │
│   ├── boards/                    # Kanban boards module
│   │   ├── boards.module.ts
│   │   ├── boards.controller.ts
│   │   ├── boards.service.ts
│   │   ├── cards/
│   │   │   ├── cards.service.ts
│   │   │   └── cards.controller.ts
│   │   └── dto/
│   │       ├── create-board.dto.ts
│   │       └── create-card.dto.ts
│   │
│   ├── comments/                  # Comments module
│   │   ├── comments.module.ts
│   │   ├── comments.controller.ts
│   │   ├── comments.service.ts
│   │   └── entities/
│   │       └── comment.entity.ts
│   │
│   ├── ai/                        # AI integration module
│   │   ├── ai.module.ts
│   │   ├── ai.controller.ts
│   │   ├── ai.service.ts
│   │   ├── ollama/
│   │   │   └── ollama.service.ts
│   │   ├── gemini/
│   │   │   └── gemini.service.ts
│   │   ├── embedding/
│   │   │   └── embedding.service.ts
│   │   └── rag/
│   │       └── rag.service.ts
│   │
│   ├── search/                    # Search module
│   │   ├── search.module.ts
│   │   ├── search.controller.ts
│   │   ├── search.service.ts
│   │   └── semantic-search.service.ts
│   │
│   ├── files/                     # File upload module
│   │   ├── files.module.ts
│   │   ├── files.controller.ts
│   │   ├── files.service.ts
│   │   └── minio.service.ts
│   │
│   ├── realtime/                  # Realtime module
│   │   ├── realtime.module.ts
│   │   ├── realtime.gateway.ts
│   │   └── presence.service.ts
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── workspace-permission.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── validation.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── guards/
│   │       ├── roles.guard.ts
│   │       └── rbac.guard.ts
│   │
│   ├── database/                  # Database configuration
│   │   ├── database.module.ts
│   │   ├── database.service.ts
│   │   └── migrations/
│   │
│   ├── config/                    # Configuration
│   │   ├── config.module.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── minio.config.ts
│   │   └── ai.config.ts
│   │
│   └── utils/                     # Utility functions
│       ├── logger.ts
│       ├── hash.util.ts
│       └── date.util.ts
│
├── test/                          # Tests
│   ├── e2e/
│   └── unit/
│
├── .env.example                   # Environment variables template
├── nest-cli.json                  # NestJS CLI config
├── tsconfig.json                  # TypeScript config
├── package.json
└── Dockerfile
```

---

## 3. Module Architecture

### 3.1 Auth Module

#### Responsibilities
- GitLab OAuth authentication
- Local authentication (email/password)
- JWT token generation & refresh
- Password hashing & validation

#### Implementation
```typescript
// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async validateGitLabUser(gitlabId: string, email: string) {
    let user = await this.usersService.findByGitLabId(gitlabId);
    if (!user) {
      user = await this.usersService.createFromGitLab({ gitlabId, email });
    }
    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    
    // Store refresh token in Redis
    await this.redisService.set(
      `refresh:${user.id}`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60, // 7 days
    );

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    // Validate refresh token from Redis
    // Generate new access token
    // Rotate refresh token
  }
}
```

#### GitLab OAuth Strategy
```typescript
// auth/strategies/gitlab.strategy.ts
@Injectable()
export class GitLabStrategy extends PassportStrategy(Strategy, 'gitlab') {
  constructor() {
    super({
      clientID: process.env.GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET,
      callbackURL: process.env.GITLAB_REDIRECT_URI,
      authorizationURL: `${process.env.GITLAB_BASE_URL}/oauth/authorize`,
      tokenURL: `${process.env.GITLAB_BASE_URL}/oauth/token`,
      scope: ['read_user', 'api'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, emails } = profile;
    return {
      gitlabId: id.toString(),
      email: emails[0].value,
    };
  }
}
```

### 3.2 Workspace Module

#### Responsibilities
- CRUD operations cho workspaces
- Workspace members management
- Permission checking (RBAC)

#### Service Example
```typescript
// workspaces/workspaces.service.ts
@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    private workspaceMembersService: WorkspaceMembersService,
  ) {}

  async create(createDto: CreateWorkspaceDto, ownerId: string) {
    const workspace = this.workspaceRepository.create({
      ...createDto,
      ownerId,
    });
    const saved = await this.workspaceRepository.save(workspace);
    
    // Add owner as member
    await this.workspaceMembersService.addMember(
      saved.id,
      ownerId,
      'owner',
    );
    
    return saved;
  }

  async findUserWorkspaces(userId: string) {
    return this.workspaceRepository
      .createQueryBuilder('workspace')
      .innerJoin('workspace.members', 'member')
      .where('member.userId = :userId', { userId })
      .getMany();
  }
}
```

#### Permission Guard
```typescript
// workspaces/guards/workspace-permission.guard.ts
@Injectable()
export class WorkspacePermissionGuard implements CanActivate {
  constructor(
    private workspaceMembersService: WorkspaceMembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId;
    const requiredRole = this.reflector.get<WorkspaceRole>(
      'workspace-role',
      context.getHandler(),
    );

    const member = await this.workspaceMembersService.findMember(
      workspaceId,
      user.id,
    );

    if (!member) return false;

    const roleHierarchy = ['viewer', 'member', 'admin', 'owner'];
    const userRoleIndex = roleHierarchy.indexOf(member.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    return userRoleIndex >= requiredRoleIndex;
  }
}
```

### 3.3 Pages Module

#### Responsibilities
- Page CRUD operations
- Block management
- Page versioning
- Public page handling

#### Block Service
```typescript
// pages/blocks/blocks.service.ts
@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    private embeddingService: EmbeddingService,
  ) {}

  async create(createDto: CreateBlockDto, pageId: string, userId: string) {
    const block = this.blockRepository.create({
      ...createDto,
      pageId,
      authorId: userId,
    });
    const saved = await this.blockRepository.save(block);

    // Generate embedding nếu AI enabled
    if (process.env.AI_PROVIDER !== 'none') {
      await this.embeddingService.generateEmbedding(saved);
    }

    return saved;
  }

  async updateOrder(pageId: string, blockIds: string[]) {
    // Update order_index for all blocks
    const updatePromises = blockIds.map((id, index) =>
      this.blockRepository.update(id, { orderIndex: index }),
    );
    await Promise.all(updatePromises);
  }
}
```

### 3.4 AI Module

#### AI Service
```typescript
// ai/ai.service.ts
@Injectable()
export class AIService {
  constructor(
    private ollamaService: OllamaService,
    private geminiService: GeminiService,
    private ragService: RAGService,
  ) {}

  private getProvider(): 'ollama' | 'gemini' {
    return process.env.AI_PROVIDER as 'ollama' | 'gemini';
  }

  async summarize(content: string): Promise<string> {
    const provider = this.getProvider();
    const prompt = `Tóm tắt nội dung sau bằng tiếng Việt:\n\n${content}`;

    if (provider === 'ollama') {
      return this.ollamaService.generate(prompt);
    } else {
      return this.geminiService.generate(prompt);
    }
  }

  async ask(query: string, workspaceId: string): Promise<string> {
    // RAG pipeline: search relevant blocks → generate answer
    const context = await this.ragService.search(query, workspaceId);
    const prompt = `Dựa vào ngữ cảnh sau, trả lời câu hỏi:\n\nNgữ cảnh:\n${context}\n\nCâu hỏi: ${query}`;
    
    if (this.getProvider() === 'ollama') {
      return this.ollamaService.generate(prompt);
    } else {
      return this.geminiService.generate(prompt);
    }
  }
}
```

#### Ollama Service
```typescript
// ai/ollama/ollama.service.ts
@Injectable()
export class OllamaService {
  private readonly baseURL = process.env.LLAMA_HOST;

  async generate(prompt: string): Promise<string> {
    const response = await axios.post(
      `${this.baseURL}/api/generate`,
      {
        model: process.env.LLAMA_MODEL,
        prompt,
        stream: false,
      },
    );
    return response.data.response;
  }
}
```

#### Embedding Service
```typescript
// ai/embedding/embedding.service.ts
@Injectable()
export class EmbeddingService {
  private readonly apiUrl = process.env.EMBEDDING_API_URL;

  async generateEmbedding(block: Block): Promise<void> {
    const text = this.extractTextFromBlock(block);
    if (!text) return;

    const response = await axios.post(this.apiUrl, {
      texts: [text],
      max_length: 512,
    });

    const embedding = response.data.embeddings[0];

    // Save to database
    await this.embeddingsRepository.save({
      blockId: block.id,
      pageId: block.pageId,
      vector: embedding,
      metadata: {
        model: 'BAAI/bge-m3',
        dimension: 1024,
      },
    });
  }

  async searchSimilar(query: string, limit: number = 5) {
    // Generate embedding for query
    const queryEmbedding = await this.generateEmbeddingForText(query);

    // Semantic search using pgvector
    return this.embeddingsRepository
      .createQueryBuilder('embedding')
      .select()
      .orderBy(
        `embedding.vector <=> :query`,
        'ASC',
      )
      .setParameters({ query: `[${queryEmbedding.join(',')}]` })
      .limit(limit)
      .getMany();
  }
}
```

### 3.5 Realtime Module

#### Socket.IO Gateway
```typescript
// realtime/realtime.gateway.ts
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private presenceService: PresenceService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const user = await this.authenticateSocket(client);
    client.data.user = user;
  }

  async handleDisconnect(client: Socket) {
    await this.presenceService.removeUser(client.data.user.id);
  }

  @SubscribeMessage('page:join')
  async handleJoinPage(client: Socket, pageId: string) {
    await client.join(`page:${pageId}`);
    await this.presenceService.addUserToPage(
      client.data.user.id,
      pageId,
    );
    
    // Notify other users
    this.server.to(`page:${pageId}`).emit('user:joined', {
      userId: client.data.user.id,
      username: client.data.user.username,
    });
  }

  @SubscribeMessage('block:update')
  async handleBlockUpdate(client: Socket, data: { pageId: string; block: Block }) {
    // Broadcast to all users in the page room (except sender)
    client.to(`page:${data.pageId}`).emit('block:updated', data.block);
  }

  @SubscribeMessage('cursor:move')
  async handleCursorMove(client: Socket, data: { pageId: string; position: Position }) {
    client.to(`page:${data.pageId}`).emit('cursor:moved', {
      userId: client.data.user.id,
      position: data.position,
    });
  }
}
```

### 3.6 Files Module

#### MinIO Service
```typescript
// files/minio.service.ts
@Injectable()
export class MinIOService {
  private client: Client;

  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }

  async uploadFile(file: Express.Multer.File, workspaceId: string): Promise<string> {
    const fileName = `${workspaceId}/${Date.now()}-${file.originalname}`;
    
    await this.client.putObject(
      process.env.MINIO_BUCKET,
      fileName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    const url = `${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET}/${fileName}`;
    return url;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.client.removeObject(process.env.MINIO_BUCKET, fileName);
  }
}
```

---

## 4. API Design

### 4.1 RESTful API Conventions

#### Endpoints Structure
```
GET    /api/workspaces              # List workspaces
POST   /api/workspaces              # Create workspace
GET    /api/workspaces/:id          # Get workspace
PATCH  /api/workspaces/:id          # Update workspace
DELETE /api/workspaces/:id          # Delete workspace

GET    /api/workspaces/:id/pages     # List pages in workspace
POST   /api/workspaces/:id/pages    # Create page
GET    /api/pages/:id               # Get page
PATCH  /api/pages/:id               # Update page
DELETE /api/pages/:id               # Delete page

POST   /api/pages/:id/publish       # Publish page (make public)
DELETE /api/pages/:id/publish       # Unpublish page

GET    /api/pages/:id/blocks        # Get blocks in page
POST   /api/pages/:id/blocks        # Create block
PATCH  /api/blocks/:id              # Update block
DELETE /api/blocks/:id              # Delete block

GET    /api/ai/summarize            # AI summarize
POST   /api/ai/ask                  # RAG Q&A
POST   /api/ai/brainstorm           # AI brainstorm
POST   /api/ai/translate            # AI translate

GET    /api/public/:slug            # Public page (no auth)
```

### 4.2 DTO Validation

```typescript
// pages/dto/create-page.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEnum(['private', 'workspace', 'public'])
  @IsOptional()
  visibility?: 'private' | 'workspace' | 'public';

  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
```

### 4.3 Response Format

#### Success Response
```typescript
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

#### Error Response
```typescript
{
  "success": false,
  "error": {
    "code": "WORKSPACE_NOT_FOUND",
    "message": "Workspace không tồn tại",
    "statusCode": 404
  }
}
```

---

## 5. Database Integration

### 5.1 TypeORM Setup

```typescript
// database/database.module.ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations in production
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### 5.2 Entity Example

```typescript
// pages/entities/page.entity.ts
@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: ['private', 'workspace', 'public'],
    default: 'private',
  })
  visibility: 'private' | 'workspace' | 'public';

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'boolean', default: false })
  isIndexed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Block, (block) => block.page)
  blocks: Block[];

  @ManyToOne(() => Workspace, (workspace) => workspace.pages)
  workspace: Workspace;
}
```

### 5.3 pgvector Integration

```typescript
// ai/entities/embedding.entity.ts
@Entity('embeddings')
export class Embedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  blockId: string;

  @Column({ type: 'uuid' })
  pageId: string;

  @Column({ type: 'vector', length: 1024 })
  vector: string; // pgvector type

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 6. Error Handling

### 6.1 Global Exception Filter

```typescript
// common/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      error: {
        code: exception.constructor.name,
        message,
        statusCode: status,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### 6.2 Validation Pipe

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true,
    transform: true, // Auto transform DTOs
  }),
);
```

---

## 7. Security

### 7.1 Guards

```typescript
// auth/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

### 7.2 Rate Limiting

```typescript
// common/interceptors/rate-limit.interceptor.ts
@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const key = `rate-limit:${request.user?.id || request.ip}`;
    
    const count = await this.redisService.incr(key);
    if (count === 1) {
      await this.redisService.expire(key, 60); // 1 minute
    }
    
    if (count > 60) { // 60 requests per minute
      throw new TooManyRequestsException();
    }

    return next.handle();
  }
}
```

---

## 8. Testing

### 8.1 Unit Tests

```typescript
// workspaces/workspaces.service.spec.ts
describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let repository: Repository<Workspace>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  it('should create workspace', async () => {
    const dto = { name: 'Test Workspace' };
    const result = await service.create(dto, 'user-id');
    expect(result.name).toBe(dto.name);
  });
});
```

### 8.2 E2E Tests

```typescript
// test/e2e/pages.e2e-spec.ts
describe('Pages (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = loginResponse.body.accessToken;
  });

  it('/pages (POST)', () => {
    return request(app.getHttpServer())
      .post('/pages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Page', workspaceId: 'workspace-id' })
      .expect(201);
  });
});
```

---

## 9. Performance Optimization

### 9.1 Caching

```typescript
// Use Redis for caching
@Injectable()
export class WorkspacesService {
  async findOne(id: string) {
    const cacheKey = `workspace:${id}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const workspace = await this.repository.findOne({ where: { id } });
    await this.redisService.setex(
      cacheKey,
      300, // 5 minutes
      JSON.stringify(workspace),
    );
    
    return workspace;
  }
}
```

### 9.2 Database Indexes

- Ensure all foreign keys have indexes
- Composite indexes for frequent queries
- pgvector IVFFlat index for embeddings

### 9.3 Connection Pooling

```typescript
// TypeORM connection pool config
{
  type: 'postgres',
  // ...
  extra: {
    max: 20, // Maximum connections
    min: 5,  // Minimum connections
  },
}
```

---

## 10. Logging

```typescript
// utils/logger.ts
import { Logger } from '@nestjs/common';
import * as winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
```

---

## 11. Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=notion

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_BUCKET=notion-files
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# GitLab OAuth
GITLAB_CLIENT_ID=your_client_id
GITLAB_CLIENT_SECRET=your_client_secret
GITLAB_REDIRECT_URI=http://localhost:3000/api/auth/gitlab/callback
GITLAB_BASE_URL=https://git.hcmutertic.com

# AI
AI_PROVIDER=llama
LLAMA_HOST=https://222.253.80.30:11434
LLAMA_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct
GEMINI_API_KEY=your_api_key
EMBEDDING_API_URL=https://embed.andyanh.id.vn/embed

# Application
PORT=3001
NODE_ENV=development
ALLOW_LOCAL_SIGNUP=true
```

---

## 12. Deployment

### 12.1 Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

### 12.2 Health Checks

```typescript
// health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    // Check database, Redis connections
    return { status: 'ready' };
  }
}
```

---

**Lưu ý:**
- Sử dụng TypeORM hoặc Prisma tùy preference
- Implement proper error handling và logging
- Add rate limiting cho all public endpoints
- Use DTOs với class-validator cho all requests
- Implement proper RBAC checks trong guards
- Cache frequently accessed data với Redis
- Use database transactions cho complex operations
- Monitor performance với APM tools

