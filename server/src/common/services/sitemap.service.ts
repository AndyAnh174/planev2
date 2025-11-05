import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PagesService } from "../../pages/pages.service";

@Injectable()
export class SitemapService {
  constructor(
    @Inject(forwardRef(() => PagesService))
    private pagesService: PagesService,
    private configService: ConfigService
  ) {}

  /**
   * Generate sitemap.xml for indexed public pages
   */
  async generateSitemap(): Promise<string> {
    const pages = await this.pagesService.findIndexedPages();
    const baseUrl = this.configService.get<string>("APP_URL") || "http://localhost:3000";

    const urls = pages.map((page) => {
      const url = `${baseUrl}/p/${page.slug}`;
      const lastmod = page.updatedAt.toISOString();
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
  }
}

