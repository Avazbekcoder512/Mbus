import mongoose from "mongoose"
import { seatModel } from './seat.js'
import { tripModel } from './trip.js'

const busSchema = new mongoose.Schema({
    bus_number: String,
    bus_model: String,
    seats_count: Number,
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    image: String,
}, { timestamps: true })

export const busModel = mongoose.model("Bus", busSchema)