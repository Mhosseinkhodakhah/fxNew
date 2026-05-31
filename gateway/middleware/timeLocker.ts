

export default (req : any , res : any , next : any)=>{

    let currentTime = new Date().toLocaleString('fa-IR')
    let time = currentTime.split(',')[0].split(':')
    
    if (time[0] >= '23' && time[0] <= '8'){
        return res.status(401).json({
            msg : 'کارشناس محترم لطفا برای کار در پنل ادمین در ساعات مجاز مراجعه فرمایید',
            error : 'کارشناس محترم لطفا برای کار در پنل ادمین در ساعات مجاز مراجعه فرمایید',
        })
    }

}