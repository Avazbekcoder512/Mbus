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

        // 1) from parametri bo'lmasa xato qaytaramiz
        if (!from) {
            return res.status(400).send({ error: req.__('FROM') });
        }

        // 2) to parametri bo'lmasa faqat manzillar ro'yxatini qaytaramiz
        if (!to) {
            const destinations = await routeModel.distinct('to', { from });
            return res.status(200).send({ to: destinations });
        }

        // 3) from-to bo‘yicha route hujjatini topamiz
        const routeDoc = await routeModel.findOne({ from, to });
        if (!routeDoc) {
            return res.status(404).send({ error: req.__('ROUTE_NOT_FOUND') });
        }

        // hozirgi sana va vaqtni olamiz
        const now = new Date();
        const today = now.toISOString().slice(0, 10);            // "YYYY-MM-DD"
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hh}:${mm}`;                       // "HH:MM"

        // 4) departure_date parametri bo'lmasa: sanalar ro'yxatini qaytaramiz
        if (!departure_date) {
            // barcha mavjud sanalarni olish
            const allDates = await tripModel.distinct('departure_date', { route: routeDoc._id });

            // kelajak va bugungi kuni hali uchib ketmagan reyslari bo‘lgan sanalarni filtrlash
            const dates = [];
            for (const d of allDates) {
                if (d > today) {
                    // to‘liq kelajak sanasi
                    dates.push(d);
                } else if (d === today) {
                    // bugungi kunda hozirgi vaqtdan keyingi reyslar bormi?
                    const cnt = await tripModel.countDocuments({
                        route: routeDoc._id,
                        departure_date: today,
                        departure_time: { $gt: currentTime }
                    });
                    if (cnt > 0) {
                        dates.push(d);
                    }
                }
                // o'tgan kunlar qo'shilmaydi
            }

            return res.status(200).send({ departure_date: dates });
        }

        // 5) departure_date berilgan bo'lsa, so'rovni tayyorlaymiz
        const query = { route: routeDoc._id, departure_date };

        // 6) agar sana bugungi kunga teng bo'lsa, faqat hozirgi vaqtdan keyingi reyslar
        if (departure_date === today) {
            query.departure_time = { $gt: currentTime };
        }

        // 7) triplarni topamiz va populate qilamiz
        const trips = await tripModel.find(query)
            .populate('bus')
            .populate({
                path: 'route',
                select: 'from to -_id uz_name ru_name en_name'
            });

        if (trips.length === 0) {
            return res.status(404).send({ error: req.__('DATE_TRIP_NOT_FOUND') });
        }

        // 8) Natijani jo‘natamiz
        return res.status(200).send({ data: trips });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: req.__('SERVER_ERROR') });
    }
};

export const getTripPage = async (req, res) => {
    return res.render('seats', {
        layout: false
    })
}

export const getTripPageRu = async (req, res) => {
    return res.render('seatsRu', {
        layout: false
    })
}

export const getTripPageEn = async (req, res) => {
    return res.render('seatsEn', {
        layout: false
    })
}

export const getTrip = async (req, res) => {
    try {
        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: req.__('INVALID_ID')
            })
        }

        const trip = await tripModel.findById(id)
            .populate('seats')
            .populate({ path: 'route' });

        if (!trip) {
            return res.status(404).send({
                error: req.__('TRIP_NOT_FOUND')
            })
        }

        return res.status(200).send({
            trip,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: req.__('SERVER_ERROR')
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
                error: req.__('USER_TOKEN_WRONG')
            })
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => req.__(error.msg))
            })
        }

        const data = matchedData(req)

        const passengers = data.passengers;

        const createdTickets = [];

        for (const passenger of passengers) {
            const seat = await seatModel.findById(passenger.seatId);

            if (!seat) {
                return res.status(404).send({ error: req.__('SEAT_NOT_FOUND') });
            }

            if (seat.status === "busy") {
                return res.status(400).send({ error: req.__('SEAT_BUSY') });
            }

            const trip = await tripModel.findById(seat.trip);
            if (!trip) {
                return res.status(404).send({ error: req.__('TRIP_NOT_FOUND') });
            }

            const bus = await busModel.findById(trip.bus);
            if (!bus) {
                return res.status(404).send({ error: req.__('BUS_NOT_FOUND') });
            }

            if (!user.bank_card || !user.expiryDate || !user.passport || !user.gender) {
                return res.status(400).send({
                    error: req.__('USER_DATA')
                })
            }

            const tempTicket = await tempTicketModel.create({
                passenger_Id: userId,
                passenger: passenger.fullName,
                gender: passenger.gender,
                passport: passenger.passport,
                phoneNumber: passenger.phoneNumber,
                seat_number: passenger.seatNumber,
                seat: seat._id,
                class_status: seat.class,
                bus_number: bus.bus_number,
                from: data.from,
                to: data.to,
                departure_date: data.departure_date,
                departure_time: data.departure_time,
                arrival_date: data.arrival_date,
                arrival_time: data.arrival_time,
                price: seat.price
            });

            createdTickets.push(tempTicket);

            await userModel.findByIdAndUpdate(user._id, { tempTicketId: tempTicket.id });
        }
        const ticketIds = createdTickets.map(ticket => ticket._id)
        const order = generateToken(ticketIds, userId)

        const generateRandomCode = () =>
            Math.floor(100000 + Math.random() * 900000);

        const verificationCode = generateRandomCode();
        console.log(verificationCode);



        const Token = await getNewToken()

        const Phone = user.phoneNumber
        const Message = `Qovunsayli.uz saytidagi telefon raqamingizni tasdiqlash kodi ${verificationCode}`

        axios.post('https://notify.eskiz.uz/api/message/sms/send', {
            mobile_phone: Phone,
            message: Message,
            from: process.env.Eskiz_From
        }, {
            headers: {
                Authorization: `Bearer ${Token}`
            }
        })
            .then(res => console.log(res.data))
            .catch(err => console.error('SMS yuborishda xatolik:', err.response?.data || err))

        await userModel.findByIdAndUpdate(user._id, { verification_code: verificationCode })

        return res.status(200).send({
            tempTickets: createdTickets,
            order: order
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: req.__('SERVER_ERROR')
        })
    }
}

export const confirmOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => req.__(error.msg))
            });
        }

        const token = req.cookies.token
        const orderToken = req.headers["ordertoken"];

        if (!orderToken) {
            return res.status(400).send({ error: "Order token topilmadi!" });
        }

        const decodedUser = jwt.verify(token, process.env.JWT_KEY);
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
            return res.status(404).send({ error: req.__('USER_NOT_FOUND') });
        }

        if (user.verification_code !== data.verificationCode) {
            return res.status(400).send({ error: req.__('REGISTERCODE_ERROR') });
        }

        const tempTickets = await tempTicketModel.find({
            _id: { $in: tempTicketIds },
            passenger_Id: userId
        });

        if (!tempTickets || tempTickets.length === 0) {
            return res.status(404).send({ error: "Ko‘rsatilgan vaqtinchalik chiptalar topilmadi!" });
        }

        const createdTickets = [];

        const generateUniqueTicketId = async () => {
            let unique = false;
            let ticketId;

            while (!unique) {
                ticketId = '#' + Math.floor(100000 + Math.random() * 900000);
                const existing = await ticketModel.findOne({ ticketId });
                if (!existing) {
                    unique = true;
                }
            }

            return ticketId;
        };

        for (const temp of tempTickets) {
            const ticketId = await generateUniqueTicketId();

            const ticket = await ticketModel.create({
                ticketId: ticketId,
                passenger_Id: temp.passenger_Id,
                passenger: temp.passenger,
                gender: temp.gender,
                passport: temp.passport,
                phoneNumber: temp.phoneNumber,
                seat_number: temp.seat_number,
                seat: temp.seat,
                class_status: temp.class_status,
                bus_number: temp.bus_number,
                from: temp.from,
                to: temp.to,
                departure_date: temp.departure_date,
                departure_time: temp.departure_time,
                arrival_date: temp.arrival_date,
                arrival_time: temp.arrival_time,
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

            await seatModel.findByIdAndUpdate(temp.seat, {
                status: "busy",
                passenger_gender: temp.gender
            });

            await tempTicketModel.findByIdAndDelete(temp._id);
            createdTickets.push(ticket);
        }

        // 7. Foydalanuvchiga chiptalarni biriktirish
        await userModel.findByIdAndUpdate(userId, {
            $push: { tickets: { $each: createdTickets.map(t => t._id) } }
        });

        return res.status(201).send({
            message: req.__('CREATE_TICKET'),
            tickets: createdTickets
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                error: req.__('TICKET_TOKEN_ERROR'),
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({
                error: req.__('TICKET_TOKEN_ERROR'),
            });
        }

        return res.status(500).send({
            error: req.__('SERVER_ERROR')
        });
    }
};

export const ticketsPage = async (req, res) => {
    return res.render('ticket', {
        layout: false
    })
}

export const ticketsPageRu = async (req, res) => {
    return res.render('ticketRu', {
        layout: false
    })
}

export const ticketsPageEn = async (req, res) => {
    return res.render('ticketEn', {
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
                error: req.__('USER_NOT_FOUND')
            })
        }

        const tickets = await ticketModel.find({ passenger_Id: userId })

        if (!tickets.length === 0) {
            return res.status(404).send({
                error: (req.__('TICKETS_NOT_FOUND'))
            })
        }

        return res.status(200).send({
            success: true,
            tickets
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: req.__('SERVER_ERROR')
        });
    }
}

export const downloadTicket = async (req, res) => {
    try {
        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: req.__('INVALID_ID')
            })
        }

        const ticket = await ticketModel.findById(id)

        if (!ticket) {
            return res.status(404).send({
                error: req.__('TICKET_NOT_FOUND')
            })
        }

        createPdf(ticket, res)

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: req.__('SERVER_ERROR')
        });
    }
}

export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: req.__('INVALID_ID')
            })
        }

        const ticket = await ticketModel.findById(id)

        if (!ticket) {
            return res.status(404).send({
                error: req.__('TICKET_NOT_FOUND')
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
            message: req.__('DELETE_TICKET')
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: req.__('SERVER_ERROR')
        });
    }
}

export const cancelTicket = async (req, res) => {
    try {
        const { id } = req.params

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: req.__('INVALID_ID')
            })
        }

        const ticket = await ticketModel.findById(id)

        if (!ticket) {
            return res.status(404).send({
                error: req.__('TICKET_NOT_FOUND')
            })
        }

        const seat = seatModel.findById(ticket.seat)

        if (!seat) {
            return res.status(404).send({
                error: req.__('SEAT_NOT_FOUND')
            })
        }

        await seatModel.findByIdAndUpdate(ticket.seat, { status: "empty" })

        await ticketModel.findByIdAndDelete(ticket._id)

        return res.status(200).send({
            message: req.__('CANCEL_TICKET')
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: req.__('SERVER_ERROR')
        });
    }
}