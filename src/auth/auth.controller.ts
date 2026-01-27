import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JoinDto } from './dto/join.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('join')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입이 완료되었습니다.' })
  @ApiResponse({ status: 409, description: '이미 사용 중인 이메일 또는 아이디입니다.' })
  async join(@Body() joinDto: JoinDto) {
    return await this.authService.join(joinDto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '아이디 또는 비밀번호가 일치하지 않습니다.' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}
