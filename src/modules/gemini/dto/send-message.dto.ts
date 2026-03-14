import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: '메시지를 입력해주세요.' })
  message: string;
}
