import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phoneNumber: String,
    smsCode: String,
    bank_card: String,
    verification_code: Number,
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }
})

export const userModel = mongoose.model("User", userSchema)