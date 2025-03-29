import mongoose from 'mongoose'

const seatSchema = new mongoose.Schema({
    seetNumber: Number,
    bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    status: { type: String, enum: ["bo'sh", "band"], default: "bo'sh" },
    booked_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true })

export const seatModel = mongoose.model("Seat", seatSchema)