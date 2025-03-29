import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

export const Connect = async () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log("Mongodb muvaffaqiyatli ulandi!"))
        .catch((error) => console.log(error))
}