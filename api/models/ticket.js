import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
    bus_number: String,
    seat_number: Number,
    seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat" },
    route: String,
    departure_date: String,
    departure_time: String,
    passenger_Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    passenger: String,
    price: Number,
    status: { type: String, enum: ["booked", "canceled"], default: "booked" },
    ticketNumber: String,
}, { timestamps: true })

export const ticketModel = mongoose.model("Ticket", ticketSchema)