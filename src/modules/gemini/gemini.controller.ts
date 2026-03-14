import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('send-message')
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.geminiService.sendMessage(dto.message);
  }
}
