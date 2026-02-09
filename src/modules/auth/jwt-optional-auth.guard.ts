import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT가 있으면 req.user를 채우고, 없거나 유효하지 않으면 401 없이 통과 (req.user 없음).
 * 피드 목록 등 로그인 선택 API에서 isLiked 등 로그인 시에만 필요한 값에 사용.
 */
@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const canActivateResult = await Promise.resolve(super.canActivate(context));
      if (typeof canActivateResult === 'boolean') {
        return canActivateResult;
      } else if (
        canActivateResult &&
        typeof canActivateResult.subscribe === 'function'
      ) {
        // Handle Observable<boolean>
        return await new Promise<boolean>((resolve, reject) => {
          canActivateResult.subscribe({
            next: resolve,
            error: reject,
          });
        });
      }
      // fallback: deny access
      return false;
    } catch (e) {
      // If the JWT is invalid or missing, allow the request to continue without user
      return true;
    }
  }

  handleRequest<TUser>(err: any, user: TUser): TUser | undefined {
    // If there was any authentication error, just allow undefined user (optional auth)
    return user ?? undefined;
  }
}
