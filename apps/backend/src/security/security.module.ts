import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

@Module({
  controllers: [SecurityController],
  providers: [SecurityService, PrismaService],
  exports: [SecurityService],
})
export class SecurityModule {}