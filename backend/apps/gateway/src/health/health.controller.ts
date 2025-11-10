import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom, timeout } from 'rxjs';
import { MESSAGE_PATTERNS } from '@app/common/interfaces/message-patterns';

/**
 * Health Check Controller
 * Provides readiness and liveness probes for Kubernetes/Docker
 * Tests connectivity to dependent services
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  /**
   * Basic health check
   * GET /api/health
   */
  @Get()
  @ApiOperation({ summary: 'Check gateway service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  check() {
    return {
      status: 'ok',
      service: 'gateway',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe - checks if service can handle requests
   * GET /api/health/ready
   */
  @Get('ready')
  @ApiOperation({ summary: 'Check if service is ready to handle requests' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async ready() {
    try {
      // Check if auth service is reachable (5 second timeout)
      const authHealth = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.HEALTH_CHECK, {}).pipe(timeout(5000)),
      );

      return {
        status: 'ok',
        services: {
          gateway: 'up',
          authentication: authHealth.status,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // If auth service unreachable, we're not ready
      return {
        status: 'degraded',
        services: {
          gateway: 'up',
          authentication: 'down',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
