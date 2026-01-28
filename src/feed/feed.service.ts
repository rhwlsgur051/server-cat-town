import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  // 피드 작성
  async createFeed(userNo: number, createFeedDto: CreateFeedDto) {
    const feed = await this.prisma.feed.create({
      data: {
        feedContent: createFeedDto.feedContent,
        feedImageUrl: createFeedDto.feedImageUrl,
        userNo,
      },
      include: {
        user: {
          select: {
            userNo: true,
            userId: true,
            userName: true,
          },
        },
      },
    });

    return {
      success: true,
      message: '피드가 작성되었습니다.',
      feed,
    };
  }

  // 피드 목록 조회 (페이지네이션)
  async getFeeds(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [feeds, total] = await Promise.all([
      this.prisma.feed.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              userNo: true,
              userId: true,
              userName: true,
            },
          },
        },
      }),
      this.prisma.feed.count(),
    ]);

    return {
      success: true,
      message: '피드 목록을 조회했습니다.',
      feeds,
      total,
      page,
      limit,
    };
  }

  // 특정 피드 조회
  async getFeed(feedNo: number) {
    const feed = await this.prisma.feed.findUnique({
      where: { feedNo },
      include: {
        user: {
          select: {
            userNo: true,
            userId: true,
            userName: true,
          },
        },
      },
    });

    if (!feed) {
      throw new NotFoundException('피드를 찾을 수 없습니다.');
    }

    return {
      success: true,
      message: '피드를 조회했습니다.',
      feed,
    };
  }

  // 피드 수정
  async updateFeed(
    feedNo: number,
    userNo: number,
    updateFeedDto: UpdateFeedDto,
  ) {
    // 피드 존재 여부 및 작성자 확인
    const feed = await this.prisma.feed.findUnique({
      where: { feedNo },
    });

    if (!feed) {
      throw new NotFoundException('피드를 찾을 수 없습니다.');
    }

    if (feed.userNo !== userNo) {
      throw new ForbiddenException('본인의 피드만 수정할 수 있습니다.');
    }

    const updatedFeed = await this.prisma.feed.update({
      where: { feedNo },
      data: updateFeedDto,
      include: {
        user: {
          select: {
            userNo: true,
            userId: true,
            userName: true,
          },
        },
      },
    });

    return {
      success: true,
      message: '피드가 수정되었습니다.',
      feed: updatedFeed,
    };
  }

  // 피드 삭제
  async deleteFeed(feedNo: number, userNo: number) {
    // 피드 존재 여부 및 작성자 확인
    const feed = await this.prisma.feed.findUnique({
      where: { feedNo },
    });

    if (!feed) {
      throw new NotFoundException('피드를 찾을 수 없습니다.');
    }

    if (feed.userNo !== userNo) {
      throw new ForbiddenException('본인의 피드만 삭제할 수 있습니다.');
    }

    await this.prisma.feed.delete({
      where: { feedNo },
    });

    return {
      success: true,
      message: '피드가 삭제되었습니다.',
    };
  }

  // 피드 좋아요 (간단 버전 - 실제로는 좋아요 테이블 분리 필요)
  async likeFeed(feedNo: number) {
    const feed = await this.prisma.feed.findUnique({
      where: { feedNo },
    });

    if (!feed) {
      throw new NotFoundException('피드를 찾을 수 없습니다.');
    }

    const updatedFeed = await this.prisma.feed.update({
      where: { feedNo },
      data: {
        feedLikes: {
          increment: 1,
        },
      },
      include: {
        user: {
          select: {
            userNo: true,
            userId: true,
            userName: true,
          },
        },
      },
    });

    return {
      success: true,
      message: '좋아요를 눌렀습니다.',
      feed: updatedFeed,
    };
  }

  // 내가 작성한 피드 목록
  async getMyFeeds(userNo: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [feeds, total] = await Promise.all([
      this.prisma.feed.findMany({
        where: { userNo },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              userNo: true,
              userId: true,
              userName: true,
            },
          },
        },
      }),
      this.prisma.feed.count({
        where: { userNo },
      }),
    ]);

    return {
      success: true,
      message: '내 피드 목록을 조회했습니다.',
      feeds,
      total,
      page,
      limit,
    };
  }
}
