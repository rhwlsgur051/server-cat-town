import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JoinDto } from './dto/join.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async join(joinDto: JoinDto) {
    // 이메일 중복 확인
    const existingEmail = await this.prisma.user.findUnique({
      where: { userEmail: joinDto.userEmail },
    });

    if (existingEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 아이디 중복 확인
    const existingUserId = await this.prisma.user.findUnique({
      where: { userId: joinDto.userId },
    });

    if (existingUserId) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(joinDto.userPwd, 10);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        userId: joinDto.userId,
        userEmail: joinDto.userEmail,
        userName: joinDto.userName,
        userPwd: hashedPassword,
      },
      select: {
        userNo: true,
        userId: true,
        userEmail: true,
        userName: true,
        createdAt: true,
        updatedAt: true,
        // userPwd는 반환하지 않음
      },
    });

    return {
      message: '회원가입이 완료되었습니다.',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    // 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { userId: loginDto.userId },
    });

    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(loginDto.userPwd, user.userPwd);

    if (!isPasswordValid) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    // JWT 토큰 생성
    const tokens = await this.generateTokens(user.userNo, user.userId);

    // 로그인 성공
    return {
      user: {
        userNo: user.userNo,
        userId: user.userId,
        userEmail: user.userEmail,
        userName: user.userName,
      },
      ...tokens,
    };
  }

  // AccessToken과 RefreshToken 생성
  private async generateTokens(userNo: number, userId: string) {
    // AccessToken: 짧은 유효기간 (1시간), 더 많은 정보 포함
    const accessPayload = { sub: userNo, userId };
    const accessToken = await this.jwtService.signAsync(accessPayload);

    // RefreshToken: 긴 유효기간 (7일), 최소한의 정보만 포함 (보안)
    const refreshPayload = { sub: userNo };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
