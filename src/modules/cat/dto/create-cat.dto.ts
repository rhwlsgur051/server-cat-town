import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty({ description: '고양이 이름', example: '나비' })
  catName: string;

  @ApiProperty({ description: '고양이 생년월일 (YYYY-MM-DD)', example: '2020-05-15' })
  catBirth: string;

  @ApiProperty({ description: '고양이 성별', example: 'female', enum: ['male', 'female'] })
  catGender: string;

  @ApiProperty({ description: '고양이 품종', example: '코리안 숏헤어' })
  catBreed: string;

  @ApiProperty({ description: '사용자 번호', example: 1 })
  userNo: number;
}
