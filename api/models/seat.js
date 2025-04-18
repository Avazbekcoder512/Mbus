import mongoose from 'mongoose'

const seatSchema = new mongoose.Schema({
    seatNumber: Number,
    departure_date: String,
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    status: { type: String, enum: ["empty", "busy"], default: "empty" },
    booked_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    price: Number
}, { timestamps: true })

export const seatModel = mongoose.model("Seat", seatSchema)