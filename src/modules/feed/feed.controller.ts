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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '../auth/jwt-optional-auth.guard';
import { Multer } from 'multer'; // Multer 타입 가져오기

@Controller('feeds')
export class FeedController {
  constructor(private readonly feedService: FeedService) { }

  // 피드 작성 (인증 필요, 이미지 필수)
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createFeed(
    @Request() req: any,
    @Body() createFeedDto: CreateFeedDto,
    @UploadedFile() file: Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('이미지는 필수입니다.');
    }
    const userNo = req.user.userNo;
    return this.feedService.createFeed(userNo, createFeedDto, file);
  }

  // 피드 목록 조회 (공개, 로그인 시 좋아요 여부 isLiked 포함)
  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getFeeds(
    @Request() req: any,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const userNo = req.user?.userNo;
    return this.feedService.getFeeds(page, limit, userNo);
  }

  // 내 피드 목록 조회 (인증 필요)
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyFeeds(
    @Request() req: any,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    // TODO: JWT에서 userNo 추출
    const userNo = req.user?.userNo || 1; // 임시로 1번 사용자
    return this.feedService.getMyFeeds(userNo, page, limit);
  }

  // 특정 피드 조회 (공개, 로그인 시 좋아요 여부 포함)
  @Get(':feedNo')
  @UseGuards(JwtOptionalAuthGuard)
  async getFeed(
    @Request() req: any,
    @Param('feedNo', ParseIntPipe) feedNo: number,
  ) {
    const userNo = req.user?.userNo;
    return this.feedService.getFeed(feedNo, userNo);
  }

  // 피드 수정 (인증 필요, 이미지 필수)
  @Put(':feedNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateFeed(
    @Param('feedNo', ParseIntPipe) feedNo: number,
    @Request() req: any,
    @Body() updateFeedDto: UpdateFeedDto,
    @UploadedFile() file: Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('이미지는 필수입니다.');
    }
    const userNo = req.user.userNo;
    return this.feedService.updateFeed(feedNo, userNo, updateFeedDto, file);
  }

  // 피드 삭제 (인증 필요)
  @Delete(':feedNo')
  @UseGuards(JwtAuthGuard)
  async deleteFeed(
    @Param('feedNo', ParseIntPipe) feedNo: number,
    @Request() req: any,
  ) {
    const userNo = req.user.userNo;
    return this.feedService.deleteFeed(feedNo, userNo);
  }

  // 피드 좋아요 토글 (인증 필요)
  @Post(':feedNo/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Request() req: any,
    @Param('feedNo', ParseIntPipe) feedNo: number,
  ) {
    const userNo = req.user.userNo;
    return this.feedService.toggleLike(feedNo, userNo);
  }
}
