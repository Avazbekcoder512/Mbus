import { Router } from 'express'
import { confirmRegistration, login, loginPage, logout, register } from '../controller/authController.js'
import { checkSchema } from 'express-validator'
import { confirmRegistrationSchema, loginValidate, registerValidate } from '../validator/authValidate.js'
import { cancelTicket, cardPage, confirmOrder, deleteTicket, downloadTicket, getTicket, getTrip, getTripPage, pendingTicket, routeFind, seatBooking, ticketsPage } from '../controller/ticketController.js'
import { cityFind, get } from '../controller/cityController.js'
import { jwtAccessMiddleware } from '../middleware/jwtAccessMiddleware.js'
import { resetPasswordSchema, sendCodeSchema } from '../validator/passwordValidate.js'
import { resetPassword, sendCode } from '../controller/passwordController.js'
import { confirmOrderSchema, pendingTicketSchema, seatBookingSchema } from '../validator/ticketValidate.js'
import { loginLimit } from '../middleware/loginLimit.js'
import { limit } from '../middleware/limit.js'
import { page404, page500 } from '../controller/errorController.js'
import { updateProfile, userPage, userProfile } from '../controller/userController.js'

export const router = Router()

router
    .get('/', get)

    // login & register router
    .get('/login', loginPage)
    .post('/register', checkSchema(registerValidate), register)
    .post('/confirmregistration', checkSchema(confirmRegistrationSchema), confirmRegistration)
    .post('/login', loginLimit, checkSchema(loginValidate), login)
    .get('/logout', logout)
    .post('/send-code', checkSchema(sendCodeSchema), sendCode)
    .post('/reset-password', checkSchema(resetPasswordSchema), resetPassword)

    // user router
    .get('/profile', jwtAccessMiddleware, userPage)
    .get('/profile/:id', jwtAccessMiddleware, userProfile)
    .put('/profile/:id/update', jwtAccessMiddleware, updateProfile)

    // ticket router
    .get('/findroute', routeFind)
    .get('/cities', cityFind)
    .get('/trip', jwtAccessMiddleware, getTripPage)
    .get('/trip/:id', jwtAccessMiddleware, getTrip)
    .get('/card', jwtAccessMiddleware, cardPage)
    .post('/ticket-pending', limit, jwtAccessMiddleware, checkSchema(pendingTicketSchema), pendingTicket)
    .post('/seat-booking', limit, jwtAccessMiddleware, checkSchema(seatBookingSchema), seatBooking)
    .post('/confirm', limit, jwtAccessMiddleware, checkSchema(confirmOrderSchema), confirmOrder)

    // tickets page router
    .get('/ticket', jwtAccessMiddleware, ticketsPage)
    .get('/tickets', jwtAccessMiddleware, getTicket)
    .get('/ticket/:id/download', downloadTicket)
    .put('/ticket/:id/cancel', jwtAccessMiddleware, cancelTicket)
    .delete('/ticket/:id/delete', jwtAccessMiddleware, deleteTicket)

    // error router
    .get('/404', page404)
    .get('/500', page500)

router.use((req, res) => {
    res.redirect('/404')
})