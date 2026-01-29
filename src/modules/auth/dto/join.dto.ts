import { ApiProperty } from '@nestjs/swagger';

export class JoinDto {
  @ApiProperty({ description: '사용자 아이디', example: 'john_doe' })
  userId: string;

  @ApiProperty({ description: '사용자 이메일', example: 'john@example.com' })
  userEmail: string;

  @ApiProperty({ description: '사용자 비밀번호', example: 'password123' })
  userPwd: string;

  @ApiProperty({ description: '사용자 이름', example: 'John Doe' })
  userName: string;
}
