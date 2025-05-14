import mongoose from "mongoose";

const tempTicketSchema = new mongoose.Schema({
    passenger_Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    passenger: String,
    passport: String,
    gender: String,
    phoneNumber: String,
    seat_number: Number,
    seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat" },
    bus_number: String,
    from: String,
    to: String,
    departure_date: String,
    departure_time: String,
    price: Number,
    status: { type: String, enum: ["booked", "canceled"], default: "booked" },
    class_status: String
}, { timestamps: true })

export const tempTicketModel = mongoose.model('tempTicket', tempTicketSchema)