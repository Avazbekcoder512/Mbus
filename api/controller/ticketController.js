import { matchedData, validationResult } from 'express-validator'
import { busModel } from '../models/bus.js'
import { routeModel } from '../models/route.js'
import { seatModel } from '../models/seat.js'
import { config } from 'dotenv'
import { userModel } from '../models/user.js'
import { tempTicketModel } from '../models/tempticket.js'
import { tripModel } from '../models/trip.js'
import jwt from 'jsonwebtoken'
import { ticketModel } from '../models/ticket.js'
config()

export const routeFind = async (req, res) => {
    try {
        const from = req.query.from
        const to = req.query.to
        const departure_date = req.query.departure_date

        if (!from || !to || !departure_date) {
            return res.status(400).send({
                error: 'Iltimos, 3 ta maydonni ham kiriting!'
            })
        }

        const data = await routeModel.findOne({ from: from, to: to }).populate({
            path: 'trips',
            match: { departure_date },
            populate: [
                { path: 'bus' }
            ]
        })

        if (!data || !data.trips.length) {
            return res.status(404).send({
                error: "Bunday reys mavjud emas!"
            })
        }

        return res.status(200).send({
            data
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}

export const getTrip = async (req, res) => {
    try {
        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: "Id noto'g'ri!"
            })
        }

        const trip = await tripModel.findById(id)
            .populate('seats')
            .populate({ path: 'route' });

        if (!trip) {
            return res.status(404).send({
                error: "Reys topilmadi!"
            })
        }

        return res.status(200).send({
            trip
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}

export const pendingTicket = async (req, res) => {
    try {

        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];

        const decodet = jwt.verify(token, process.env.JWT_KEY);

        const userId = decodet.id;

        const body = req.body
        const passengers = body.passengers[0]
        console.log(body);
        console.log("sdfsdf:", passengers);



        const seat = await seatModel.findById(passengers.seatId)

        if (!seat) {
            return res.status(404).send({
                error: "O'rindiq topilmadi!"
            })
        }

        if (seat.status === "band") {
            return res.status(400).send({
                error: "Bu o'rindiq band qilingan!"
            })
        }

        const trip = await tripModel.findById(seat.trip)

        if (!trip) {
            return res.status(404).send({
                error: "Reys mavjud emas!"
            })
        }

        const bus = await busModel.findById(trip.bus)

        if (!bus) {
            return res.status(404).send({
                error: "Avtobus mavjud emas!"
            })
        }

        const tempTicket = await tempTicketModel.create({
            passenger_Id: userId,
            passenger: passengers.fullName,
            birthday: passengers.birthday,
            passport: passengers.passport,
            phoneNumber: passengers.phoneNumber,
            seat_number: passengers.seatNumber,
            seat: seat._id,
            bus_number: bus.bus_number,
            from: body.from,
            to: body.to,
            departure_date: body.departure_date,
            departure_time: body.departure_time,
            price: seat.price
        })

        return res.status(200).send({
            tempTicket
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}

export const seatBooking = async (req, res) => {
    try {
        const body = req.body

        const tempTicket = await tempTicketModel.findById(body.tempTicketId)

        if (!tempTicket) {
            return res.status(400).send({
                error: "tempTicket topilmadi!"
            })
        }

        const generateRandomCode = () =>
            Math.floor(100000 + Math.random() * 900000);

        const verificationCode = generateRandomCode();
        console.log(verificationCode);


        await userModel.findByIdAndUpdate(tempTicket.passenger_Id, { bank_card: body.bank_card, verification_code: verificationCode })

        return res.status(201).send({
            message: "Telefon raqamga sms cod yuborildi!"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}

export const confirmOrder = async (req, res) => {
    try {
        const { id } = req.params
        const body = req.body

        const user = await userModel.findById(id)

        if (!user) {
            return res.status(404).send({
                error: "Foydalanuvchi topilmadi!"
            })
        }

        if (!user.verification_code === body.verificationCode) {
            return res.status(400).send({
                error: "Tasdiqlash kodi xato!"
            })
        }

        const tempTicket = await tempTicketModel.findById(body.tempTicketId);

        if (!tempTicket) {
            return res.status(404).send({
                error: "Tarmoqda nosozlik!"
            })
        }

        await ticketModel.create({
            passenger_Id: tempTicket.passenger_Id,
            passenger: tempTicket.passenger,
            birthday: tempTicket.birthday,
            passport: tempTicket.passport,
            phoneNumber: tempTicket.phoneNumber,
            seat_number: tempTicket.seat_number,
            seat: tempTicket.seat,
            bus_number: tempTicket.bus_number,
            from: tempTicket.from,
            to: tempTicket.to,
            departure_date: tempTicket.departure_date,
            departure_time: tempTicket.departure_time,
            price: tempTicket.price,
        })

        return res.status(201).send({
            message: "Chipta yaratildi!"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}