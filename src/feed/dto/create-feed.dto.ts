import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateFeedDto {
  @IsString()
  @MinLength(1, { message: '내용은 최소 1자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '내용은 최대 1000자까지 입력 가능합니다.' })
  feedContent: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedImageUrl?: string;
}
