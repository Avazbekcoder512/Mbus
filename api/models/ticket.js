import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
    bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat" },
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    price: Number,
    status: { type: String, enum: ["booked", "canceled"], default: "booked" },
    ticketNumber: String,
}, { timestamps: true })

export const ticketModel = mongoose.model("Ticket", ticketSchema)