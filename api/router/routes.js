import { Router } from 'express'
import { login, register } from '../controller/authController.js'
import { checkExact, checkSchema } from 'express-validator'
import { loginValidate, registerValidate } from '../validator/authValidate.js'
import { confirmOrder, deleteTicket, downloadTicket, getTicket, getTrip, pendingTicket, routeFind, seatBooking } from '../controller/ticketController.js'
import { cityFind } from '../controller/cityController.js'
import { jwtAccessMiddleware } from '../middleware/jwtAccessMiddleware.js'
import { resetPasswordSchema, sendCodeSchema } from '../validator/passwordValidate.js'
import { resetPassword, sendCode } from '../controller/passwordController.js'
import { confirmOrderSchema, pendingTicketSchema, seatBookingSchema } from '../validator/ticketValidate.js'

export const router = Router()

router
    .post('/register', checkSchema(registerValidate), register)
    .post('/login', checkSchema(loginValidate), login)
    .get('/findroute', routeFind)
    .get('/cities', cityFind)
    .get('/trip/:id', jwtAccessMiddleware, getTrip)
    .post('/send-code', checkSchema(sendCodeSchema), sendCode)
    .post('/reset-password', checkSchema(resetPasswordSchema), resetPassword)
    .post('/ticket-pending', jwtAccessMiddleware, checkSchema(pendingTicketSchema), pendingTicket)
    .post('/seat-booking', jwtAccessMiddleware, checkSchema(seatBookingSchema), seatBooking)
    .post('/confirm', jwtAccessMiddleware, checkSchema(confirmOrderSchema), confirmOrder)
    .get('/tickets', jwtAccessMiddleware, getTicket)
    .get('/ticket/:id/download', jwtAccessMiddleware, downloadTicket)
    .delete('/ticket/:id/delete', jwtAccessMiddleware, deleteTicket)