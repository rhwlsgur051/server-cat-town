import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { supabaseUpload, supabaseDelete } from '../../util/supabase/supabase.upload';
import { Multer } from 'multer';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) { }

  // 피드 작성
  async createFeed(
    userNo: number,
    createFeedDto: CreateFeedDto,
    file: Multer.File,
  ) {
    // 이미지 파일 Supabase에 업로드 (필수)
    let imageUrl: string;
    try {
      const uploadResult = await supabaseUpload(file, 'feed-images');
      imageUrl = uploadResult.url;
    } catch (error) {
      throw new BadRequestException('이미지 업로드에 실패했습니다.');
    }

    const feed = await this.prisma.feed.create({
      data: {
        feedContent: createFeedDto.feedContent,
        feedImageUrl: imageUrl,
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
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return {
      success: true,
      message: '피드가 작성되었습니다.',
      feed: {
        ...feed,
        likeCount: feed._count.likes,
        isLiked: false,
      },
    };
  }

  // 피드 목록 조회 (페이지네이션)
  async getFeeds(page: number = 1, limit: number = 10, userNo?: number) {
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
              userAvatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true, // 좋아요 개수
            },
          },
        },
      }),
      this.prisma.feed.count(),
    ]);

    // 좋아요 여부 추가 (로그인한 사용자인 경우)
    const feedsWithLikes = userNo
      ? await Promise.all(
        feeds.map(async (feed) => {
          const isLiked = await this.isLiked(feed.feedNo, userNo);
          return {
            ...feed,
            likeCount: feed._count.likes,
            isLiked,
          };
        }),
      )
      : feeds.map((feed) => ({
        ...feed,
        likeCount: feed._count.likes,
        isLiked: false,
      }));

    return {
      success: true,
      message: '피드 목록을 조회했습니다.',
      feeds: feedsWithLikes,
      total,
      page,
      limit,
    };
  }

  // 특정 피드 조회
  async getFeed(feedNo: number, userNo?: number) {
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
        _count: {
          select: {
            likes: true, // 좋아요 개수
          },
        },
      },
    });

    if (!feed) {
      throw new NotFoundException('피드를 찾을 수 없습니다.');
    }

    // 좋아요 여부 확인
    const isLiked = userNo ? await this.isLiked(feedNo, userNo) : false;

    return {
      success: true,
      message: '피드를 조회했습니다.',
      feed: {
        ...feed,
        likeCount: feed._count.likes,
        isLiked,
      },
    };
  }

  // 피드 수정
  async updateFeed(
    feedNo: number,
    userNo: number,
    updateFeedDto: UpdateFeedDto,
    file: Multer.File,
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

    // 기존 이미지 삭제
    if (feed.feedImageUrl) {
      try {
        const oldFileName = feed.feedImageUrl.split('/').pop();
        if (oldFileName) {
          await supabaseDelete(oldFileName, 'feed-images');
        }
      } catch (error) {
        console.error('기존 이미지 삭제 실패:', error);
      }
    }

    // 새 이미지 업로드 (필수)
    let imageUrl: string;
    try {
      const uploadResult = await supabaseUpload(file, 'feed-images');
      imageUrl = uploadResult.url;
    } catch (error) {
      throw new BadRequestException('이미지 업로드에 실패했습니다.');
    }

    const updatedFeed = await this.prisma.feed.update({
      where: { feedNo },
      data: {
        feedContent: updateFeedDto.feedContent,
        feedImageUrl: imageUrl,
      },
      include: {
        user: {
          select: {
            userNo: true,
            userId: true,
            userName: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    // 좋아요 여부 확인
    const isLiked = await this.isLiked(feedNo, userNo);

    return {
      success: true,
      message: '피드가 수정되었습니다.',
      feed: {
        ...updatedFeed,
        likeCount: updatedFeed._count.likes,
        isLiked,
      },
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

    // Supabase에서 이미지 삭제 (있으면)
    if (feed.feedImageUrl) {
      try {
        const fileName = feed.feedImageUrl.split('/').pop();
        if (fileName) {
          await supabaseDelete(fileName, 'feed-images');
        }
      } catch (error) {
        // 이미지 삭제 실패해도 피드는 삭제
        console.error('이미지 삭제 실패:', error);
      }
    }

    await this.prisma.feed.delete({
      where: { feedNo },
    });

    return {
      success: true,
      message: '피드가 삭제되었습니다.',
    };
  }

  // 피드 좋아요 토글 (좋아요/취소)
  async toggleLike(feedNo: number, userNo: number) {
    // 피드 존재 확인
    const feed = await this.prisma.feed.findUnique({
      where: { feedNo },
    });

    if (!feed) {
      throw new NotFoundException('피드를 찾을 수 없습니다.');
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await this.prisma.feedLike.findUnique({
      where: {
        feedNo_userNo: {
          feedNo,
          userNo,
        },
      },
    });

    if (existingLike) {
      // 이미 좋아요를 눌렀으면 취소
      await this.prisma.feedLike.delete({
        where: {
          feedLikeNo: existingLike.feedLikeNo,
        },
      });

      return {
        success: true,
        message: '좋아요를 취소했습니다.',
        liked: false,
      };
    } else {
      // 좋아요 추가
      await this.prisma.feedLike.create({
        data: {
          feedNo,
          userNo,
        },
      });

      return {
        success: true,
        message: '좋아요를 눌렀습니다.',
        liked: true,
      };
    }
  }

  // 피드 좋아요 개수 조회
  async getLikeCount(feedNo: number) {
    const count = await this.prisma.feedLike.count({
      where: { feedNo },
    });

    return count;
  }

  // 사용자가 특정 피드에 좋아요를 눌렀는지 확인
  async isLiked(feedNo: number, userNo: number) {
    const like = await this.prisma.feedLike.findUnique({
      where: {
        feedNo_userNo: {
          feedNo,
          userNo,
        },
      },
    });

    return !!like;
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
          _count: {
            select: {
              likes: true, // 좋아요 개수
            },
          },
        },
      }),
      this.prisma.feed.count({
        where: { userNo },
      }),
    ]);

    // 좋아요 여부 추가
    const feedsWithLikes = await Promise.all(
      feeds.map(async (feed) => {
        const isLiked = await this.isLiked(feed.feedNo, userNo);
        return {
          ...feed,
          likeCount: feed._count.likes,
          isLiked,
        };
      }),
    );

    return {
      success: true,
      message: '내 피드 목록을 조회했습니다.',
      feeds: feedsWithLikes,
      total,
      page,
      limit,
    };
  }
}
