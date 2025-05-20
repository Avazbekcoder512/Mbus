import mongoose from "mongoose"
const citySchema = new mongoose.Schema({
    uz_name: String,
    ru_name: String,
    en_name: String
}, { timestamps: true })

export const cityModel = mongoose.model("City", citySchema)