import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('기본')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '헬로 월드' })
  @ApiResponse({ status: 200, description: '성공' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/db')
  @ApiOperation({ summary: '데이터베이스 연결 상태 확인' })
  @ApiResponse({
    status: 200,
    description: 'DB 연결 상태',
    schema: {
      example: {
        status: 'success',
        message: 'Database connection is healthy',
        timestamp: '2026-01-27T12:34:56.789Z',
      },
    },
  })
  async checkDatabase() {
    return await this.appService.checkDatabaseConnection();
  }
}
