import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '사용자 아이디' })
  userId?: string;

  @ApiPropertyOptional({ description: '사용자 이메일' })
  userEmail?: string;

  @ApiPropertyOptional({ description: '사용자 비밀번호' })
  userPwd?: string;

  @ApiPropertyOptional({ description: '사용자 이름' })
  userName?: string;
}
