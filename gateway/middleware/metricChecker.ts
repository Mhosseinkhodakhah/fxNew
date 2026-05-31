import winston from "winston"



export function ipChecker(req : any , res : any , next : any){
    winston.info({message : '111' , data : req.headers['x-real-ip']})
    winston.info({message :  '222', data : req.connection.remoteAddress})
    winston.info({message : '3333' ,data :  req.headers.host})
    if (req.connection.remoteAddress.split(":")[3] === "91.234.39.198"){
        return next()
    }else{
        return res.status(403).json({
            message : 'forbidden user'
        })
    }
}