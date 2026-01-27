import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CatService } from './cat.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

@ApiTags('고양이')
@Controller('cats')
export class CatController {
  constructor(private readonly catService: CatService) {}

  @Post()
  @ApiOperation({ summary: '고양이 등록' })
  @ApiResponse({ status: 201, description: '고양이가 성공적으로 등록되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  create(@Body() createCatDto: CreateCatDto) {
    return this.catService.create(createCatDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 고양이 조회 (또는 특정 사용자의 고양이 조회)' })
  @ApiQuery({ name: 'userNo', required: false, description: '사용자 번호 (선택)' })
  @ApiResponse({ status: 200, description: '고양이 목록을 반환합니다.' })
  findAll(@Query('userNo') userNo?: string) {
    if (userNo) {
      return this.catService.findByUser(parseInt(userNo));
    }
    return this.catService.findAll();
  }

  @Get(':catNo')
  @ApiOperation({ summary: '특정 고양이 조회' })
  @ApiParam({ name: 'catNo', description: '고양이 번호' })
  @ApiResponse({ status: 200, description: '고양이 정보를 반환합니다.' })
  @ApiResponse({ status: 404, description: '고양이를 찾을 수 없습니다.' })
  findOne(@Param('catNo', ParseIntPipe) catNo: number) {
    return this.catService.findOne(catNo);
  }

  @Patch(':catNo')
  @ApiOperation({ summary: '고양이 정보 수정' })
  @ApiParam({ name: 'catNo', description: '고양이 번호' })
  @ApiResponse({ status: 200, description: '고양이 정보가 수정되었습니다.' })
  @ApiResponse({ status: 404, description: '고양이를 찾을 수 없습니다.' })
  update(
    @Param('catNo', ParseIntPipe) catNo: number,
    @Body() updateCatDto: UpdateCatDto,
  ) {
    return this.catService.update(catNo, updateCatDto);
  }

  @Delete(':catNo')
  @ApiOperation({ summary: '고양이 삭제' })
  @ApiParam({ name: 'catNo', description: '고양이 번호' })
  @ApiResponse({ status: 200, description: '고양이가 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '고양이를 찾을 수 없습니다.' })
  remove(@Param('catNo', ParseIntPipe) catNo: number) {
    return this.catService.remove(catNo);
  }
}
