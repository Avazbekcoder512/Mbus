import { matchedData, validationResult } from 'express-validator'
import { busModel } from '../models/bus.js'
import { routeModel } from '../models/route.js'
import { seatModel } from '../models/seat.js'
import { config } from 'dotenv'
import { userModel } from '../models/user.js'
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
                error: "Reys topilmadi!"
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

export const getBus = async (req, res) => {
    try {
        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: "Id noto'g'ri!"
            })
        }

        const bus = await busModel.findById(id)
            .populate('seats')
            .populate({
                path: 'trip',
                populate: {
                    path: 'route'
                }
            });

        if (!bus) {
            return res.status(404).send({
                error: "Avtobus topilmadi!"
            })
        }

        return res.status(200).send({
            bus
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
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}