import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
    passenger_Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    passenger: String,
    birthday: String,
    passport: String,
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
    pdfUrl: String
}, { timestamps: true })

export const ticketModel = mongoose.model("Ticket", ticketSchema)