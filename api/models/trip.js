import mongoose from 'mongoose'
import { routeModel } from './route.js'

const tripSchema = new mongoose.Schema({
    route: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
    bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    departure_date: String,
    departure_time: String,
    arrival_date: String,
    arrival_time: String,
    ticket_price: Number,
}, { timestamps: true })

export const tripModel = mongoose.model('Trip', tripSchema)