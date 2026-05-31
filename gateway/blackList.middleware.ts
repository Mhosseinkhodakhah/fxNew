import winston from "winston";
import blackList from "./service/blackList";
import monitor from "./service/statusMonitor";



export async function blackListMiddleWare(req : any, res : any, next : any) {
    if (req.headers.authorization){
             if (await blackList.checker(req.headers.authorization)) {
                 winston.info({message : 'تلاش برای ورود با توکن غیر مجاز'})
                winston.info({message : 'ttttttt >>> ' , data : await blackList.checker(req.headers.authorization)})
                winston.info({message : 'check the blacklist>>>>>',data :  blackList.checker(req.headers.authorization)})
                monitor.error.push(`تلاش برای ورود با توکن غیر مجاز`)
                return res.status(401).json({
                  error: "token is in the blackList"
                });
              }else{
                winston.info({message : 'token is not in blacklist'})
                next()
              }
    }else{
        winston.info({message : 'no token provided'})
        next()
    }

}