import { IsString, IsOptional, MaxLength, MinLength, IsIn } from 'class-validator';

export const FEED_TYPES = ['daily', 'health', 'question'] as const;
export type FeedType = (typeof FEED_TYPES)[number];

export class CreateFeedDto {
  @IsString()
  @MinLength(1, { message: '내용은 최소 1자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '내용은 최대 1000자까지 입력 가능합니다.' })
  feedContent: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedImageUrl?: string;

  @IsString()
  @IsIn(FEED_TYPES, { message: 'feedType은 daily, health, question 중 하나여야 합니다.' })
  feedType: FeedType;
}
