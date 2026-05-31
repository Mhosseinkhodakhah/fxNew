import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { format } from 'date-fns';


@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((res:any)=>{
      const ctx = context.switchToHttp();
      const response = ctx.getResponse();
      const req = ctx.getRequest();

      if (req.path === '/metrics') {
        return next.handle();
      }

      this.responseHandler(res, response)
    }))
  }


    responseHandler(res: any, response: any) {
      let newResponse = { success : (res.statusCode == 200) ? true : false , 
        ...res , 
        error : (res.error) ? res.error : null ,
        data : (res.data) ? res.data : null ,
        timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss')}
      delete newResponse.statusCode
      return response.status(+res.statusCode).json(newResponse)
    }
  
  }
