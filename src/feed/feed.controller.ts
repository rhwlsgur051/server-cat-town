import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';

// TODO: JWT Guard 적용 (인증 필요한 라우트)
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feeds')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  // 피드 작성 (인증 필요)
  @Post()
  // @UseGuards(JwtAuthGuard) // TODO: 인증 가드 추가
  async createFeed(@Request() req: any, @Body() createFeedDto: CreateFeedDto) {
    // TODO: JWT에서 userNo 추출
    const userNo = req.user?.userNo || 1; // 임시로 1번 사용자
    return this.feedService.createFeed(userNo, createFeedDto);
  }

  // 피드 목록 조회 (공개)
  @Get()
  async getFeeds(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.feedService.getFeeds(page, limit);
  }

  // 내 피드 목록 조회 (인증 필요)
  @Get('my')
  // @UseGuards(JwtAuthGuard) // TODO: 인증 가드 추가
  async getMyFeeds(
    @Request() req: any,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    // TODO: JWT에서 userNo 추출
    const userNo = req.user?.userNo || 1; // 임시로 1번 사용자
    return this.feedService.getMyFeeds(userNo, page, limit);
  }

  // 특정 피드 조회 (공개)
  @Get(':feedNo')
  async getFeed(@Param('feedNo', ParseIntPipe) feedNo: number) {
    return this.feedService.getFeed(feedNo);
  }

  // 피드 수정 (인증 필요)
  @Put(':feedNo')
  // @UseGuards(JwtAuthGuard) // TODO: 인증 가드 추가
  async updateFeed(
    @Param('feedNo', ParseIntPipe) feedNo: number,
    @Request() req: any,
    @Body() updateFeedDto: UpdateFeedDto,
  ) {
    // TODO: JWT에서 userNo 추출
    const userNo = req.user?.userNo || 1; // 임시로 1번 사용자
    return this.feedService.updateFeed(feedNo, userNo, updateFeedDto);
  }

  // 피드 삭제 (인증 필요)
  @Delete(':feedNo')
  // @UseGuards(JwtAuthGuard) // TODO: 인증 가드 추가
  async deleteFeed(
    @Param('feedNo', ParseIntPipe) feedNo: number,
    @Request() req: any,
  ) {
    // TODO: JWT에서 userNo 추출
    const userNo = req.user?.userNo || 1; // 임시로 1번 사용자
    return this.feedService.deleteFeed(feedNo, userNo);
  }

  // 피드 좋아요 (공개 - 추후 인증 추가 필요)
  @Post(':feedNo/like')
  async likeFeed(@Param('feedNo', ParseIntPipe) feedNo: number) {
    return this.feedService.likeFeed(feedNo);
  }
}
