import { Controller, Get, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../auth/decorators/public.decorator";
import { SitemapService } from "../services/sitemap.service";
import type { Response } from "express";

@ApiTags("seo")
@Controller("sitemap")
export class SitemapController {
  constructor(private sitemapService: SitemapService) {}

  @Get("xml")
  @Public()
  @ApiOperation({ summary: "Generate sitemap.xml for indexed public pages" })
  @ApiResponse({ status: 200, description: "Sitemap XML", content: { "application/xml": {} } })
  async getSitemap(@Res() res: Response) {
    const sitemap = await this.sitemapService.generateSitemap();
    res.setHeader("Content-Type", "application/xml");
    res.send(sitemap);
  }
}

