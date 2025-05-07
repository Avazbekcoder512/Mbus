import mongoose from 'mongoose'

const seatSchema = new mongoose.Schema({
    seatNumber: Number,
    departure_date: String,
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    status: { type: String, enum: ["empty", "busy"], default: "empty" },
    booked_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    passenger_gender: String,
    price: Number,
    class: {type: String, enum: ['vip', 'premium', 'economy']}
}, { timestamps: true })

export const seatModel = mongoose.model("Seat", seatSchema)