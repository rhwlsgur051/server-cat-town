import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { createPool } from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private pool: any;

  constructor(private configService: ConfigService) {
    const host = configService.get<string>('DATABASE_HOST', 'localhost');
    const port = parseInt(configService.get<string>('DATABASE_PORT', '3306'), 10);
    const user = configService.get<string>('DATABASE_USER', 'root');
    const password = configService.get<string>('DATABASE_PASSWORD', '');
    const database = configService.get<string>('DATABASE_NAME', 'cat_town');

    console.log('🔍 DB Connection Info:', {
      host,
      port,
      user,
      database,
      hasPassword: !!password,
      passwordLength: password?.length,
    });

    // PrismaMariaDb는 pool 대신 config를 받습니다
    const poolConfig = {
      host: String(host),
      port: Number(port),
      user: String(user),
      password: String(password),
      database: String(database),
    };

    const adapter = new PrismaMariaDb(poolConfig as any);
    
    // 별도로 테스트용 pool 생성
    const pool = createPool({
      ...poolConfig,
      connectionLimit: 10,
      waitForConnections: true,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
    });
    
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });

    // super() 호출 후에 this 사용 가능
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      // 먼저 pool 연결 테스트 - release 하지 않고 connection 유지
      const connection = await this.pool.getConnection();
      console.log('✅ MySQL connection pool test successful');
      console.log('   Connection ID:', connection.threadId);
      
      // 간단한 쿼리로 테스트
      const [rows] = await connection.query('SELECT 1 as test');
      console.log('   Test query result:', rows);
      
      // connection을 pool에 반환
      connection.release();

      // 그 다음 Prisma 연결
      await this.$connect();
      console.log('✅ Prisma Client connected successfully');
      
      // Prisma를 통한 직접 쿼리 테스트
      const result = await this.$queryRaw`SELECT 1 as prisma_test`;
      console.log('✅ Prisma query test successful:', result);
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('   Error details:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
