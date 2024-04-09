class Errorhandler extends Error {
    constructor(message,statuscode){
        super(message);
        this.statuscode=statuscode;
        this.message=message;
        Error.captureStackTrace(this,this.constructor)
    }
}
export default Errorhandler;
