import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
        createdAt: true,
        updatedAt: true,
        // userPwd 제외
      },
    });
  }

  async remove(userNo: number) {
    await this.findOne(userNo); // 존재 여부 확인

    return await this.prisma.user.delete({
      where: { userNo },
    });
  }
}
