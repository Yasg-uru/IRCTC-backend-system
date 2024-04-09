import mongoose from "mongoose";
const connectDatabase=async function(){
try {
    const response=await mongoose.connect(process.env.MONGO_URL)
    console.log(`database is connected with ${response.connection.host }`)
} catch (error) {
    console.log(`error is occured in connection of database :${error?.message}`)
}
}
export default connectDatabase;