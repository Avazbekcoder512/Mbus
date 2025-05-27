import mongoose from "mongoose"
const citySchema = new mongoose.Schema({
    name: String,
}, { timestamps: true })

export const cityModel = mongoose.model("City", citySchema)