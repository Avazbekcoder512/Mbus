import { matchedData, param, validationResult } from 'express-validator'
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
        const passengers = body.passengers;

        const createdTickets = [];

        for (const passenger of passengers) {
            const seat = await seatModel.findById(passenger.seatId);

            if (!seat) {
                return res.status(404).send({ error: "O'rindiq topilmadi!" });
            }

            if (seat.status === "band") {
                return res.status(400).send({ error: `O'rindiq ${passenger.seatNumber} band qilingan!` });
            }

            const trip = await tripModel.findById(seat.trip);
            if (!trip) {
                return res.status(404).send({ error: "Reys mavjud emas!" });
            }

            const bus = await busModel.findById(trip.bus);
            if (!bus) {
                return res.status(404).send({ error: "Avtobus mavjud emas!" });
            }

            const tempTicket = await tempTicketModel.create({
                passenger_Id: userId,
                passenger: passenger.fullName,
                birthday: passenger.birthday,
                passport: passenger.passport,
                phoneNumber: passenger.phoneNumber,
                seat_number: passenger.seatNumber,
                seat: seat._id,
                bus_number: bus.bus_number,
                from: body.from,
                to: body.to,
                departure_date: body.departure_date,
                departure_time: body.departure_time,
                price: seat.price
            });

            createdTickets.push(tempTicket);

            await userModel.findByIdAndUpdate(userId, { tempTicketId: tempTicket.id });
        }

        return res.status(200).send({
            tempTickets: createdTickets
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}

export const seatBooking = async (req, res) => {
    try {

        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];

        const decodet = jwt.verify(token, process.env.JWT_KEY);

        const userId = decodet.id;

        const body = req.body

        const user = await userModel.findById(userId)

        if (!user) {
            return res.status(400).send({
                error: "Foydalanuvchi topilmadi!"
            })
        }

        const generateRandomCode = () =>
            Math.floor(100000 + Math.random() * 900000);

        const verificationCode = generateRandomCode();
        console.log(verificationCode);


        await userModel.findByIdAndUpdate(user.id, { bank_card: body.bank_card, expiryDate: body.expiryDate, verification_code: verificationCode })

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
        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];
        const decodet = jwt.verify(token, process.env.JWT_KEY);
        const userId = decodet.id;

        const body = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).send({ error: "Foydalanuvchi topilmadi!" });
        }

        if (user.verification_code !== body.verificationCode) {
            return res.status(400).send({ error: "Tasdiqlash kodi xato!" });
        }

        const tempTickets = await tempTicketModel.find({ passenger_Id: userId });

        if (!tempTickets || tempTickets.length === 0) {
            return res.status(404).send({ error: "Hech qanday vaqtinchalik chipta topilmadi!" });
        }

        const createdTickets = [];

        for (const temp of tempTickets) {
            const ticket = await ticketModel.create({
                passenger_Id: temp.passenger_Id,
                passenger: temp.passenger,
                birthday: temp.birthday,
                passport: temp.passport,
                phoneNumber: temp.phoneNumber,
                seat_number: temp.seat_number,
                seat: temp.seat,
                bus_number: temp.bus_number,
                from: temp.from,
                to: temp.to,
                departure_date: temp.departure_date,
                departure_time: temp.departure_time,
                price: temp.price,
            });

            createdTickets.push(ticket);

            await seatModel.findByIdAndUpdate(temp.seat, { status: "band" });

            await tempTicketModel.findByIdAndDelete(temp._id);
        }

        await userModel.findByIdAndUpdate(userId, { tickets: createdTickets.map(t => t._id) });

        return res.status(201).send({
            success: true,
            message: "Barcha chiptalar yaratildi!",
            tickets: createdTickets
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        });
    }
};


export const getTicket = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];
        const decodet = jwt.verify(token, process.env.JWT_KEY);
        const userId = decodet.id;

        const user = userModel.findById(userId)

        if (!user) {
            return res.status(404).send({
                error: "Foydalanuvchi topilmadi!"
            })
        }

        const tickets = await ticketModel.find({ passenger_Id: userId })

        if (!tickets.length === 0) {
            return res.status(404).send({
                error: "Sizda sotib olingan chiptalar yo'q!"
            })
        }

        return res.status(200).send({
            success: true,
            tickets
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        });
    }
}