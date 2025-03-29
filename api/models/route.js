import mongoose from 'mongoose'
const routeSchema = new mongoose.Schema({
    name: String,
    from: String,
    to: String,
    trips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }]
}, { timestamps: true })

export const routeModel = mongoose.model("Route", routeSchema)