import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller("health")
@Public()
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Health check - Basic status" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  check() {
    return this.healthService.check();
  }

  @Get("ready")
  @ApiOperation({ summary: "Readiness check - All services ready" })
  @ApiResponse({ status: 200, description: "All services are ready" })
  async ready() {
    return this.healthService.ready();
  }

  @Get("live")
  @ApiOperation({ summary: "Liveness check" })
  @ApiResponse({ status: 200, description: "Service is alive" })
  live() {
    return { status: "ok" };
  }
}

