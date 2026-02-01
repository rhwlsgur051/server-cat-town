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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Multer } from 'multer';

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
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiParam({ name: 'userNo', description: '사용자 번호' })
  @ApiResponse({ status: 200, description: '사용자가 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  remove(@Param('userNo', ParseIntPipe) userNo: number) {
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
