import { matchedData, validationResult } from 'express-validator'
import { busModel } from '../models/bus.js'
import { routeModel } from '../models/route.js'
import { seatModel } from '../models/seat.js'
import { config } from 'dotenv'
import { userModel } from '../models/user.js'
import { tempTicketModel } from '../models/tempticket.js'
import { tripModel } from '../models/trip.js'
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
            .populate({path: 'route'});

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

export const seatSelection = async (req, res) => {
    try {

        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];

        const decodet = jwt.verify(token, process.env.JWT_KEY);

        const userId = decodet.id;

        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: "Id noto'g'ri!"
            })
        }

        const seat = await seatModel.findById(id)

        if (!seat) {
            return res.status(404).send({
                error: "O'rindiq topilmadi!"
            })
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => error.msg)
            })
        }

        const data = matchedData(req)

        if (seat.status === "band") {
            return res.status(400).send({
                error: "Bu o'rindiq band qilingan!"
            })
        }

        const checkPrice = await seatModel.findOne({ price: data.price })

        if (!checkPrice) {
            return res.status(400).send({
                error: "Chipta narxi to'g'ri emas!"
            })
        }

        const generateRandomCode = () =>
            Math.floor(100000 + Math.random() * 900000);

        const verificationCode = generateRandomCode();

        await userModel.findByIdAndUpdate(userId, {
            bank_card: data.bank_card,
            verification_code: verificationCode
        })

        return res.status(200).send({
            seat
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}

export const seatReservation = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => error.msg)
            })
        }

        const data = matchedData(req)

        const seats = await seatModel.find({ _id: { $in: data.seats } })

        if (seats.length !== data.seats.length) {
            return res.status(400).send({
                error: "No to'g'ri o'rindiqlar tanlandi!"
            })
        }

        const anyBooked = seats.some(seat => seat.status === "band")
        if (anyBooked) {
            return res.status(400).send({
                error: "Ba'zi o'rindiqlar band qilingan!"
            })
        }

        const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0)
        if (totalPrice !== data.price) {
            return res.status(400).send({
                error: "Narx chipta narxiga mos emmas!"
            })
        }

        const generateRandomCode = () =>
            Math.floor(100000 + Math.random() * 900000);

        const verificationCode = generateRandomCode();

        const createdTempTickets = [];

        for (const seat of seats) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            const tempTicket = await tempTicketModel.create({
                bus_number: seat.bus,
                seat: seat._id,
                seat_number: seat.seatNumber,
                passenger_Id: userId,
                passenger: user,
                route: rou,
                departure_date: data,
                cardNumber,
                inputPrice: seat.price, // individual narx
                code,
            });

            await sendSmsToUser(userId, `Seat: ${seat.number} uchun kod: ${code}`);

            createdTempTickets.push(tempTicket._id);
        }


    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}