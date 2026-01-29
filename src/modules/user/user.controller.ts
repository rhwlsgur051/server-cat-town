import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('사용자')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Patch(':userNo')
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
}
