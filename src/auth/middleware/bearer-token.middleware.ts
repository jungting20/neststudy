import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { envVariables } from 'src/common/const/env.const';

@Injectable()
class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    //Basic token
    //Bearer token
    const authHeader = req.headers['authorization'] as string;

    if (!authHeader) {
      next();
      return;
    }

    try {
      const token = this.validateBearerToken(authHeader);

      const blockedToken = await this.cacheManager.get(`BLOCK_TOKEN_${token}`);

      if (blockedToken) {
        throw new UnauthorizedException('차단된 토큰 입니다.');
      }

      const tokenKey = `TOKEN_${token}`;
      const cachedPayload = await this.cacheManager.get(tokenKey);

      if (cachedPayload) {
        req.user = cachedPayload;
        next();
        return;
      }

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

      const expiryDate = +new Date(payload.exp * 1000);

      const now = +Date.now();
      const differenceInSeconds = (expiryDate - now) / 1000;

      await this.cacheManager.set(
        tokenKey,
        payload,
        Math.max((differenceInSeconds - 30) * 1000, 1),
      );

      req.user = payload;
      next();
    } catch (error) {
      if (error.name === 'TokenExpireError') {
        throw new UnauthorizedException('토큰이 만료됐습니다.');
      }
      next();
      // throw new UnauthorizedException('토큰이 만료되었습니다!');
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
