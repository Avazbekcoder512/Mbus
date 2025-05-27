import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
    ticketId: String,
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
    arrival_date: String,
    arrival_time: String,
    price: Number,
    status: { type: String, enum: ["booked", "canceled"], default: "booked" },
    class_status: String,
    qrImage: String
}, { timestamps: true })

export const ticketModel = mongoose.model("Ticket", ticketSchema)