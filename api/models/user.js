import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    first_Name: String,
    last_Name: String,
    password: String,
    gender: String,
    phoneNumber: String,
    register_code: String,
    smsCode: String,
    bank_card: String,
    expiryDate: String,
    verification_code: Number,
    last_Login: { type: Date, default: null },
    ticket: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
    tempTicketId: [{ type: mongoose.Schema.Types.ObjectId, ref: "tempTicket" }]
})

export const userModel = mongoose.model("User", userSchema)