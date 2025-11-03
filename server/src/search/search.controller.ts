import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { SemanticSearchService } from "./semantic-search.service";

@ApiTags("search")
@ApiBearerAuth("JWT-auth")
@Controller("search")
@UseGuards(AuthGuard("jwt"))
export class SearchController {
  constructor(
    private searchService: SearchService,
    private semanticSearchService: SemanticSearchService
  ) {}

  @Get()
  @ApiOperation({ summary: "Tìm kiếm pages và blocks" })
  @ApiQuery({ name: "q", required: true, description: "Từ khóa tìm kiếm" })
  @ApiQuery({ name: "workspaceId", required: true, description: "ID của workspace" })
  @ApiQuery({ 
    name: "type", 
    required: false, 
    enum: ["fulltext", "semantic", "hybrid"],
    description: "Loại tìm kiếm",
    example: "fulltext"
  })
  @ApiResponse({ status: 200, description: "Kết quả tìm kiếm" })
  async search(
    @Query("q") query: string,
    @Query("workspaceId") workspaceId: string,
    @Query("type") type: "fulltext" | "semantic" | "hybrid" = "fulltext"
  ) {
    if (type === "semantic") {
      const blocks = await this.semanticSearchService.semanticSearch(
        query,
        workspaceId
      );
      return { blocks };
    }

    if (type === "hybrid") {
      return this.semanticSearchService.hybridSearch(query, workspaceId);
    }

    // Default: full-text search
    return this.searchService.fullTextSearch(query, workspaceId);
  }
}

