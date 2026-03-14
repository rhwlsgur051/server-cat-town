import { Injectable, BadGatewayException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
/** 무료 한도 넉넉함: 15 RPM, 1,000 RPD (2.0-flash는 5 RPM, 20 RPD 수준) */
const MODEL = 'gemini-2.5-flash-lite';

const SYSTEM_INSTRUCTION = `당신은 고양이 건강과 상태에 대해 조언하는 전문가입니다.
사용자의 고양이 관련 질문(증상, 식습관, 행동, 영양 등)에 정확하고 안전한 정보를 제공하세요.
반드시 수의사 진단을 대체할 수 없음을 안내하고, 심한 증상이면 병원 방문을 권유하세요.
답변은 친절하고 이해하기 쉽게 한국어로 작성하세요.`;

@Injectable()
export class GeminiService {
  constructor(private readonly config: ConfigService) {}

  async sendMessage(userMessage: string): Promise<{ message: string }> {
    const trimmed = userMessage?.trim();
    if (!trimmed) {
      throw new BadRequestException('메시지를 입력해주세요.');
    }
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new BadGatewayException('Gemini API 키가 설정되지 않았습니다.');
    }

    const url = `${GEMINI_BASE}/models/${MODEL}:generateContent?key=${apiKey}`;
    const body = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          parts: [{ text: trimmed }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new BadGatewayException(
          'AI 사용량이 일시적으로 초과되었습니다. 무료 한도(분당·일일) 제한이 있어요. 잠시 후 다시 시도해 주세요.',
        );
      }
      const errText = await res.text();
      throw new BadGatewayException(
        `Gemini API 오류: ${res.status}. ${errText.slice(0, 200)}`,
      );
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    return { message: text || '답변을 생성하지 못했습니다.' };
  }
}
