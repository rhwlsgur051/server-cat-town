import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [FeedController],
  providers: [FeedService, PrismaService],
  exports: [FeedService],
})
export class FeedModule {}
