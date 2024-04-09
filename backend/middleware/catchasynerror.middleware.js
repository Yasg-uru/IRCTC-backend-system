const catchasynerror=(thefunc)=>{
    return  (req,res,next)=>{
        thefunc(req,res,next).catch(next)
    }
}
export default catchasynerror;

