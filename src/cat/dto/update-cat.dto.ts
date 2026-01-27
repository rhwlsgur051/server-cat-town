import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCatDto {
  @ApiPropertyOptional({ description: '고양이 이름' })
  catName?: string;

  @ApiPropertyOptional({ description: '고양이 생년월일 (YYYY-MM-DD)' })
  catBirth?: string;

  @ApiPropertyOptional({ description: '고양이 성별', enum: ['male', 'female'] })
  catGender?: string;

  @ApiPropertyOptional({ description: '고양이 품종' })
  catBreed?: string;

  @ApiPropertyOptional({ description: '사용자 번호' })
  userNo?: number;
}
