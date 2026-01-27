import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkDatabaseConnection(): Promise<{
    status: string;
    message: string;
    timestamp: string;
    details?: any;
  }> {
    try {
      console.log('🔍 Attempting database connection check...');
      
      // PrismaService의 pool을 직접 사용
      const connection = await (this.prisma as any).pool.getConnection();
      console.log('✅ Got connection from pool, ID:', connection.threadId);
      
      // 간단한 쿼리 실행
      const [rows] = await connection.query('SELECT 1 as test, DATABASE() as db, USER() as user');
      console.log('✅ Query result:', rows);
      
      connection.release();
      
      return {
        status: 'success',
        message: 'Database connection is healthy',
        timestamp: new Date().toISOString(),
        details: rows[0],
      };
    } catch (error) {
      console.error('❌ Database connection check failed:', error);
      return {
        status: 'error',
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        details: {
          code: error.code,
          errno: error.errno,
        },
      };
    }
  }
}
