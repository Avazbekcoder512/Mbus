import mongoose from 'mongoose'

const seatSchema = new mongoose.Schema({
    seatNumber: Number,
    departure_date: String,
    bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    status: { type: String, enum: ["bo'sh", "band"], default: "bo'sh" },
    booked_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    price: Number
}, { timestamps: true })

export const seatModel = mongoose.model("Seat", seatSchema)