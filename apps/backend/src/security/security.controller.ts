import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SecurityService } from './security.service';

@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('metrics')
  async getSecurityMetrics() {
    return this.securityService.getSecurityMetrics();
  }

  @Get('attacks-by-country')
  async getAttacksByCountry() {
    return this.securityService.getAttacksByCountry();
  }

  @Get('recent-attacks')
  async getRecentAttacks(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.securityService.getRecentAttacks(limitNumber);
  }

  @Get('timeline')
  async getAttackTimeline(@Query('hours') hours?: string) {
    const hoursNumber = hours ? parseInt(hours, 10) : 24;
    return this.securityService.getAttackTimeline(hoursNumber);
  }

  @Get('top-attackers')
  async getTopAttackers(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.securityService.getTopAttackers(limitNumber);
  }
}