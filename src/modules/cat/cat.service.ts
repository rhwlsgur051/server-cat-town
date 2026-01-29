import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

@Injectable()
export class CatService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCatDto: CreateCatDto) {
    return await this.prisma.cat.create({
      data: createCatDto,
      include: {
        user: true, // 소유자 정보 포함
      },
    });
  }

  async findAll() {
    return await this.prisma.cat.findMany({
      include: {
        user: true,
      },
    });
  }

  async findOne(catNo: number) {
    const cat = await this.prisma.cat.findUnique({
      where: { catNo },
      include: {
        user: true,
      },
    });

    if (!cat) {
      throw new NotFoundException(`고양이 번호 ${catNo}를 찾을 수 없습니다.`);
    }

    return cat;
  }

  async findByUser(userNo: number) {
    return await this.prisma.cat.findMany({
      where: { userNo },
      include: {
        user: true,
      },
    });
  }

  async update(catNo: number, updateCatDto: UpdateCatDto) {
    await this.findOne(catNo); // 존재 여부 확인

    return await this.prisma.cat.update({
      where: { catNo },
      data: updateCatDto,
      include: {
        user: true,
      },
    });
  }

  async remove(catNo: number) {
    await this.findOne(catNo); // 존재 여부 확인

    return await this.prisma.cat.delete({
      where: { catNo },
    });
  }
}
