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
import { createPdf } from '../middleware/ticketMiddleware.js'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'
import axios from 'axios'
import { getNewToken } from '../middleware/tokenMiddleware.js'

config()

const supabase = createClient(
    process.env.Supabase_Url,
    process.env.Anon_key,
);

const generateToken = (ticketIds, userId) => {
    const payload = { ticketIds, userId }
    return jwt.sign(payload, process.env.ORDER_KEY, { expiresIn: '5m' })
}

export const routeFind = async (req, res) => {
    try {
        const { from, to, departure_date } = req.query;

        if (!from || !to || !departure_date) {
            return res.status(400).send({
                error: 'Iltimos, 3 ta maydonni ham kiriting!'
            });
        }

        const now = new Date();
        const todayISO = now.toISOString().split('T')[0];

        // Marshrut va unga tegishli reyslarni sana bo'yicha topish
        const data = await routeModel.findOne(
            { from, to }
        ).populate({
            path: 'trips',
            match: { departure_date },
            populate: [{ path: 'bus' }]
        });

        if (!data || !data.trips.length) {
            return res.status(404).send({ error: 'Bunday reys mavjud emas!' });
        }

        // Agar qidirilayotgan sana bugun bo'lsa, faqat hozirgi vaqtdan keyingi reyslarni ajratish
        let validTrips = data.trips;
        if (departure_date === todayISO) {
            validTrips = data.trips.filter(trip => {
                // trip.departure_time formatini 'HH:mm' deb hisoblaymiz
                const [hh, mm] = trip.departure_time.split(':').map(Number);
                const departureDateTime = new Date(now);
                departureDateTime.setHours(hh, mm, 0, 0);
                return departureDateTime >= now;
            });
        }

        if (!validTrips.length) {
            return res.status(404).send({ error: 'Bunday reys mavjud emas!' });
        }

        // Faqat haqiqiy reyslarni qaytarish
        const result = data.toObject();
        result.trips = validTrips;

        return res.status(200).send({ data: result });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Serverda xatolik!' });
    }
};

export const getTripPage = async (req, res) => {
    return res.render('seats', {
        layout: false
    })
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
            trip,
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

        const token = req.cookies.token

        const decodet = jwt.verify(token, process.env.JWT_KEY);

        const userId = decodet.id;

        const user = await userModel.findById(userId)

        if (!user) {
            return res.status(400).send({
                error: 'Token bu foydalanuvchiga tegishli emas!'
            })
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => error.msg)
            })
        }

        const data = matchedData(req)

        const passengers = data.passengers;

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
                from: data.from,
                to: data.to,
                departure_date: data.departure_date,
                departure_time: data.departure_time,
                price: seat.price
            });

            createdTickets.push(tempTicket);

            await userModel.findByIdAndUpdate(user._id, { tempTicketId: tempTicket.id });
        }
        const ticketIds = createdTickets.map(ticket => ticket._id)
        const order = generateToken(ticketIds, userId)

        return res.status(200).send({
            tempTickets: createdTickets,
            order: order
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}

export const cardPage = async (req, res) => {
    return res.render('card', {
        layout: false
    })
}

export const seatBooking = async (req, res) => {
    try {

        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];

        const decodet = jwt.verify(token, process.env.JWT_KEY);

        const userId = decodet.id;

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => error.msg)
            })
        }

        const data = matchedData(req)

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

        // const Token = await getNewToken()
        
        // const Phone = user.phoneNumber
        // const Message = `Qovunsayli.uz saytidagi telefon raqamingizni tasdiqlash kodi ${verificationCode}`

        // axios.post('https://notify.eskiz.uz/api/message/sms/send', {
        //     mobile_phone: Phone,
        //     message: Message,
        //     from: process.env.Eskiz_From
        // }, {
        //     headers: {
        //         Authorization: `Bearer ${Token}`
        //     }
        // })
        //     .then(res => console.log(res.data))
        //     .catch(err => console.error('SMS yuborishda xatolik:', err.response?.data || err))


        await userModel.findByIdAndUpdate(user.id, { bank_card: data.bank_card, expiryDate: data.expiryDate, verification_code: verificationCode })

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => error.msg)
            });
        }

        const authHeader = req.headers["authorization"];
        const orderToken = req.headers["ordertoken"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ error: "Authorization token noto‘g‘ri yoki mavjud emas!" });
        }

        if (!orderToken) {
            return res.status(400).send({ error: "Order token topilmadi!" });
        }

        const accessToken = authHeader.split(" ")[1];

        const decodedUser = jwt.verify(accessToken, process.env.JWT_KEY);
        const decodedOrder = jwt.verify(orderToken, process.env.ORDER_KEY);

        const userId = decodedUser.id;

        if (decodedOrder.userId && decodedOrder.userId !== userId) {
            return res.status(403).send({ error: "Order token foydalanuvchiga tegishli emas!" });
        }

        const tempTicketIds = decodedOrder.ticketIds;

        if (!Array.isArray(tempTicketIds) || tempTicketIds.length === 0) {
            return res.status(400).send({ error: "Order token noto‘g‘ri yoki chiptalar topilmadi!" });
        }

        const data = matchedData(req);
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).send({ error: "Foydalanuvchi topilmadi!" });
        }

        if (user.verification_code !== data.verificationCode) {
            return res.status(400).send({ error: "Tasdiqlash kodi noto‘g‘ri!" });
        }

        const tempTickets = await tempTicketModel.find({
            _id: { $in: tempTicketIds },
            passenger_Id: userId
        });

        if (!tempTickets || tempTickets.length === 0) {
            return res.status(404).send({ error: "Ko‘rsatilgan vaqtinchalik chiptalar topilmadi!" });
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

            const downloadUrl = `${process.env.BASE_URL}/${ticket._id}/download`;
            const qrBuffer = await QRCode.toBuffer(downloadUrl, { type: 'png' });

            const fileName = `qr/${ticket._id}.png`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("mbus_bucket")
                .upload(fileName, qrBuffer, {
                    contentType: 'image/png',
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(`Fayl yuklanmadi: ${uploadError.message}`);
            }

            const fileUrl = `${supabase.storageUrl}/object/public/mbus_bucket/${fileName}`;

            ticket.qrImage = fileUrl;
            await ticket.save();



            await seatModel.findByIdAndUpdate(temp.seat, { status: "busy" });

            await tempTicketModel.findByIdAndDelete(temp._id);
            createdTickets.push(ticket);
        }

        // 7. Foydalanuvchiga chiptalarni biriktirish
        await userModel.findByIdAndUpdate(userId, {
            $push: { tickets: { $each: createdTickets.map(t => t._id) } }
        });

        return res.status(201).send({
            message: "Chiptalar yaratildi!",
            tickets: createdTickets
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                error: 'Token muddati tugagan. Iltimos, qayta kirish qiling!',
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({
                error: 'Token noto‘g‘ri. Iltimos, qayta kirish qiling!',
            });
        }

        return res.status(500).send({
            error: "Serverda kutilmagan xatolik yuz berdi!"
        });
    }
};

export const ticketsPage = async (req, res) => {
    return res.render('ticket', {
        layout: false
    })
}

export const getTicket = async (req, res) => {
    try {
        const token = req.cookies.token
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

export const downloadTicket = async (req, res) => {
    try {
        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: "Id noto'g'ri!"
            })
        }

        const ticket = await ticketModel.findById(id)

        if (!ticket) {
            return res.status(404).send({
                error: "Chipta topilmadi!"
            })
        }

        createPdf(ticket, res)

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        });
    }
}

export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: "Id noto'g'ri!"
            })
        }

        const ticket = await ticketModel.findById(id)

        if (!ticket) {
            return res.status(404).send({
                error: "Chipta topilmadi!"
            })
        }

        const fileUrl = ticket.qrImage


        if (fileUrl) {
            const filePath = fileUrl.replace(`${supabase.storageUrl}/object/public/mbus_bucket/`, '');


            const { data: fileExists, error: checkError } = await supabase
                .storage
                .from('mbus_bucket')
                .list('', { prefix: filePath });

            if (checkError) {
                console.error(`Fayl mavjudligini tekshirishda xatolik: ${checkError.message}`);
            } else if (fileExists && fileExists.length > 0) {
                const { error: deleteError } = await supabase
                    .storage
                    .from('mbus_bucket')
                    .remove([filePath]);

                if (deleteError) {
                    throw new Error(`Faylni o'chirishda xatolik: ${deleteError.message}`);
                }
            }
        }

        await ticketModel.findByIdAndDelete(ticket._id)

        return res.status(200).send({
            message: "Chipta muvaffaqiyatli o'chirildi!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        });
    }
}

export const cancelTicket = async (req, res) => {
    try {
        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: "Id noto'g'ri!"
            })
        }

        const ticket = await ticketModel.findById(id)

        if (!ticket) {
            return res.status(404).send({
                error: "Chipta topilmadi!"
            })
        }

        const seat = seatModel.findById(ticket.seat)

        if (!seat) {
            return res.status(404).send({
                error: "O'rindiq topilmadi!"
            })
        }

        await seatModel.findByIdAndUpdate(ticket.seat, { status: "empty" })

        await ticketModel.findByIdAndDelete(ticket._id)

        return res.status(200).send({
            message: "Chipta bekor qilindi!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        });
    }
}