import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { envVariables } from 'src/common/const/env.const';

@Injectable()
class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    //Basic token
    //Bearer token
    const authHeader = req.headers['authorization'] as string;

    if (!authHeader) {
      next();
      return;
    } else {
      const token = this.validateBearerToken(authHeader);

      try {
        const decodedPayload = this.jwtService.decode(token);

        if (
          decodedPayload.type !== 'access' &&
          decodedPayload.type !== 'refresh'
        ) {
          throw new BadRequestException('잘못된 토큰 입니다.');
        }

        const secretKey =
          decodedPayload.type === 'refresh'
            ? envVariables.refreshTokenSecret
            : envVariables.accessTokenSecret;
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>(secretKey),
        });

        const isRefreshToken = decodedPayload.type === 'refresh';

        if (isRefreshToken) {
          if (payload.type !== 'refresh') {
            throw new BadRequestException('리프레시 토콘을 입력해 주세요');
          }
        } else {
          if (payload.type !== 'access') {
            throw new BadRequestException('엑세스 토콘을 입력해주세요');
          }
        }
        req.user = payload;
        next();
      } catch (error) {
        throw new UnauthorizedException('토큰이 만료되었습니다!');
      }
    }
  }

  validateBearerToken(rawToken: string) {
    const bearerSplit = rawToken.split(' ');

    if (bearerSplit.length !== 2) {
      throw new BadRequestException('Invalid bearer token');
    }

    const [bearer, token] = bearerSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('Invalid bearer token');
    }

    return token;
  }
}

export default BearerTokenMiddleware;
