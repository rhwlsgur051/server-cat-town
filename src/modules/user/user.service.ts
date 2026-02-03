import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { supabaseUpload, supabaseDelete } from '../../util/supabase/supabase.upload';
import { Multer } from 'multer';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(createUserDto.userPwd, 10);

    // cats를 제외한 사용자 데이터만 추출
    const { userId, userEmail, userName, cats } = createUserDto;

    return await this.prisma.user.create({
      data: {
        userId,
        userEmail,
        userName,
        userPwd: hashedPassword, // 해시된 비밀번호로 저장
        // 고양이가 있으면 함께 생성
        ...(cats &&
          cats.length > 0 && {
          cats: {
            create: cats.map((cat) => ({
              catName: cat.catName,
              catBirth: cat.catBirth,
              catGender: cat.catGender,
              catBreed: cat.catBreed,
            })),
          },
        }),
      },
      select: {
        userNo: true,
        userId: true,
        userEmail: true,
        userName: true,
        userAvatarUrl: true,
        createdAt: true,
        updatedAt: true,
        cats: true, // 생성된 고양이 정보도 반환
        // userPwd는 반환하지 않음 (보안)
      },
    });
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        userNo: true,
        userId: true,
        userEmail: true,
        userName: true,
        userAvatarUrl: true,
        createdAt: true,
        updatedAt: true,
        cats: true,
        // userPwd 제외
      },
    });
  }

  async findOne(userNo: number) {
    const user = await this.prisma.user.findUnique({
      where: { userNo },
      select: {
        userNo: true,
        userId: true,
        userEmail: true,
        userName: true,
        userAvatarUrl: true,
        createdAt: true,
        updatedAt: true,
        cats: true,
        // userPwd 제외
      },
    });

    if (!user) {
      throw new NotFoundException(`사용자 번호 ${userNo}를 찾을 수 없습니다.`);
    }

    return user;
  }

  async update(userNo: number, updateUserDto: UpdateUserDto) {
    await this.findOne(userNo); // 존재 여부 확인

    // 비밀번호가 포함되어 있으면 해시화
    const updateData = { ...updateUserDto };
    if (updateUserDto.userPwd) {
      updateData.userPwd = await bcrypt.hash(updateUserDto.userPwd, 10);
    }

    return await this.prisma.user.update({
      where: { userNo },
      data: updateData,
      select: {
        userNo: true,
        userId: true,
        userEmail: true,
        userName: true,
        userAvatarUrl: true,
        createdAt: true,
        updatedAt: true,
        // userPwd 제외
      },
    });
  }

  async remove(userNo: number) {
    // 사용자 존재 여부 및 아바타 정보 확인
    const user = await this.prisma.user.findUnique({
      where: { userNo },
      select: { userNo: true, userAvatarUrl: true },
    });

    if (!user) {
      throw new NotFoundException(`사용자 번호 ${userNo}를 찾을 수 없습니다.`);
    }

    // 사용자의 아바타 이미지가 있으면 삭제
    if (user.userAvatarUrl) {
      try {
        const urlParts = user.userAvatarUrl.split('/');
        const fileName = urlParts.slice(-2).join('/');
        await supabaseDelete(fileName, 'user-avatar');
      } catch (error) {
        console.error('사용자 아바타 삭제 실패:', error);
        // 이미지 삭제 실패해도 계정은 삭제
      }
    }

    // 사용자가 작성한 피드의 이미지들 삭제
    const feeds = await this.prisma.feed.findMany({
      where: { userNo },
      select: { feedImageUrl: true },
    });

    for (const feed of feeds) {
      if (feed.feedImageUrl) {
        try {
          const fileName = feed.feedImageUrl.split('/').pop();
          if (fileName) {
            await supabaseDelete(fileName, 'feed-images');
          }
        } catch (error) {
          console.error('피드 이미지 삭제 실패:', error);
          // 이미지 삭제 실패해도 계속 진행
        }
      }
    }

    // 사용자 삭제 (Cascade로 관련 데이터도 자동 삭제)
    await this.prisma.user.delete({
      where: { userNo },
    });

    return {
      success: true,
      message: '회원 탈퇴가 완료되었습니다.',
    };
  }

  async uploadImage(userNo: number, file: Multer.File) {
    // 사용자 존재 여부 확인 및 기존 이미지 정보 가져오기
    const user = await this.prisma.user.findUnique({
      where: { userNo },
      select: { userNo: true, userAvatarUrl: true },
    });

    if (!user) {
      throw new NotFoundException(`사용자 번호 ${userNo}를 찾을 수 없습니다.`);
    }

    // 기존 이미지가 있으면 삭제
    if (user.userAvatarUrl) {
      try {
        // URL에서 파일 경로 추출 (예: cat-avatar/uuid.jpg)
        const urlParts = user.userAvatarUrl.split('/');
        const fileName = urlParts.slice(-2).join('/'); // 마지막 2개 부분 (폴더/파일명)
        await supabaseDelete(fileName, 'user-avatar');
      } catch (error) {
        console.error('기존 이미지 삭제 실패:', error);
        // 삭제 실패해도 계속 진행
      }
    }

    // 새 이미지 업로드 (cat-avatar 경로 사용)
    const uploadResult = await supabaseUpload(file, 'user-avatar');

    // DB 업데이트
    return await this.prisma.user.update({
      where: { userNo },
      data: {
        userAvatarUrl: uploadResult.url,
      },
      select: {
        userNo: true,
        userId: true,
        userEmail: true,
        userName: true,
        userAvatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
