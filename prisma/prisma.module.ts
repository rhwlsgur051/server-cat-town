// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 전역으로 사용. 미작성 시 Prisma 사용하는 모듈마다 imports: [PrismaModule] 해야함.
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
