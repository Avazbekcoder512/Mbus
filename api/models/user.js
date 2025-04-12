import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phoneNumber: String,
    smsCode: String,
    bank_card: String,
    expiryDate: String,
    verification_code: Number,
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    tempTicketId: { type: mongoose.Schema.Types.ObjectId, ref: "tempTicket" }
})

export const userModel = mongoose.model("User", userSchema)