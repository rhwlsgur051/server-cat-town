import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateCatDto } from '../../cat/dto/create-cat.dto';

// CreateCatDto에서 userNo만 제외
class CatWithoutUserDto extends OmitType(CreateCatDto, ['userNo'] as const) {}

export class CreateUserDto {
  @ApiProperty({ description: '사용자 아이디', example: 'john_doe' })
  userId: string;

  @ApiProperty({ description: '사용자 이메일', example: 'john@example.com' })
  userEmail: string;

  @ApiProperty({ description: '사용자 비밀번호', example: 'password123' })
  userPwd: string;

  @ApiProperty({ description: '사용자 이름', example: 'John Doe' })
  userName: string;

  @ApiPropertyOptional({
    description: '고양이 목록 (선택)',
    type: [CatWithoutUserDto],
    example: [
      {
        catName: '나비',
        catBirth: '2020-05-15',
        catGender: 'female',
        catBreed: '코리안 숏헤어',
      },
    ],
  })
  cats?: CatWithoutUserDto[];
}
