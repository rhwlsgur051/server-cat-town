import {
  Controller,
  Get,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('사용자')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @ApiOperation({ summary: '모든 사용자 조회' })
  @ApiResponse({ status: 200, description: '사용자 목록을 반환합니다.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':userNo')
  @ApiOperation({ summary: '특정 사용자 조회' })
  @ApiParam({ name: 'userNo', description: '사용자 번호' })
  @ApiResponse({ status: 200, description: '사용자 정보를 반환합니다.' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  findOne(@Param('userNo', ParseIntPipe) userNo: number) {
    return this.userService.findOne(userNo);
  }

  @Put(':userNo')
  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiParam({ name: 'userNo', description: '사용자 번호' })
  @ApiResponse({ status: 200, description: '사용자 정보가 수정되었습니다.' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  update(
    @Param('userNo', ParseIntPipe) userNo: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userNo, updateUserDto);
  }

  @Delete(':userNo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원 탈퇴 (본인만 가능)' })
  @ApiParam({ name: 'userNo', description: '사용자 번호' })
  @ApiResponse({ status: 200, description: '회원 탈퇴가 완료되었습니다.' })
  @ApiResponse({ status: 403, description: '본인만 탈퇴할 수 있습니다.' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  remove(
    @Param('userNo', ParseIntPipe) userNo: number,
    @Request() req: any,
  ) {
    // JWT에서 추출한 사용자 번호와 파라미터의 userNo가 일치하는지 확인
    if (req.user.userNo !== userNo) {
      throw new ForbiddenException('본인만 탈퇴할 수 있습니다.');
    }
    return this.userService.remove(userNo);
  }

  @Put(':userNo/image')
  @ApiOperation({ summary: '사용자 프로필 이미지 업로드/교체' })
  @ApiParam({ name: 'userNo', description: '사용자 번호' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '이미지가 업로드되었습니다.' })
  @ApiResponse({ status: 400, description: '이미지 파일이 필요합니다.' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('userNo', ParseIntPipe) userNo: number,
    @UploadedFile() file: Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('이미지 파일이 필요합니다.');
    }

    return this.userService.uploadImage(userNo, file);
  }
}
