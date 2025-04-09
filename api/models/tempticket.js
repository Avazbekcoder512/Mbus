import mongoose from "mongoose";

const tempTicketSchema = new mongoose.Schema({
    bus_number: String,
    seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat" },
    seat_number: Number,
    passenger_Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    passenger: String,
    route: String,
    departure_date: String,
    departure_time: String,
    price: Number,
    status: { type: String, enum: ["booked", "canceled"], default: "booked" },
    ticketNumber: String,
}, { timestamps: true })

export const tempTicketModel = mongoose.model('tempTicket', tempTicketSchema)