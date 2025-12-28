import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class InternalTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-internal-token'];

    if (token !== process.env.INTERSERVICE_TOKEN) {
      throw new UnauthorizedException('Invalid internal token');
    }

    return true;
  }
}   
