import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '사용자 아이디', example: 'john_doe' })
  userId: string;

  @ApiProperty({ description: '사용자 비밀번호', example: 'password123' })
  userPwd: string;
}
