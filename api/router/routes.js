import { Router } from 'express'
import { confirmRegistration, login, loginPage, loginPageEn, loginPageRu, logout, register } from '../controller/authController.js'
import { checkSchema } from 'express-validator'
import { confirmRegistrationSchema, loginValidate, registerValidate } from '../validator/authValidate.js'
import { cancelTicket, cardPageEn, cardPageRu, cardPageUz, confirmOrder, deleteTicket, downloadTicket, getTicket, getTrip, getTripPage, getTripPageEn, getTripPageRu, pendingTicket, routeFind, ticketsPage, ticketsPageEn, ticketsPageRu } from '../controller/ticketController.js'
import { cityFind, get, getEn, getRu } from '../controller/cityController.js'
import { jwtAccessMiddleware } from '../middleware/jwtAccessMiddleware.js'
import { resetPasswordSchema, sendCodeSchema } from '../validator/passwordValidate.js'
import { resetPassword, sendCode } from '../controller/passwordController.js'
import { confirmOrderSchema, pendingTicketSchema } from '../validator/ticketValidate.js'
import { loginLimit } from '../middleware/loginLimit.js'
import { limit } from '../middleware/limit.js'
import { page404, page404En, page404Ru, page429, page429En, page429Ru, page500, page500En, page500Ru } from '../controller/errorController.js'
import { profileImageDelete, profileImageUpdate, updateProfile, userPage, userPageEn, userPageRu, userProfile } from '../controller/userController.js'
import multer from 'multer'
import { profileUpdateSchema } from '../validator/userValidate.js'
const upload = multer()

export const router = Router()

router
    .get('/', get)
    .get('/ru', getRu)
    .get('/en', getEn)

    // login & register router
    .get('/login', loginPage)
    .get('/login/ru', loginPageRu)
    .get('/login/en', loginPageEn)
    .post('/register', loginLimit, checkSchema(registerValidate), register)
    .post('/confirmregistration', loginLimit, checkSchema(confirmRegistrationSchema), confirmRegistration)
    .post('/login', loginLimit, checkSchema(loginValidate), login)
    .get('/logout', logout)
    .post('/send-code', loginLimit, checkSchema(sendCodeSchema), sendCode)
    .post('/reset-password', loginLimit, checkSchema(resetPasswordSchema), resetPassword)

    // user router
    .get('/profile', jwtAccessMiddleware, userPage)
    .get('/profile/ru', jwtAccessMiddleware, userPageRu)
    .get('/profile/en', jwtAccessMiddleware, userPageEn)
    .get('/profile/:id', jwtAccessMiddleware, userProfile)
    .put('/profile/:id/update', jwtAccessMiddleware, checkSchema(profileUpdateSchema), updateProfile)
    .put('/profile/:id/avatar', jwtAccessMiddleware, upload.single('image'), profileImageUpdate)
    .delete('/profile/:id/avatar', jwtAccessMiddleware, profileImageDelete)


    // ticket router
    .get('/findroute', routeFind)
    .get('/cities', cityFind)
    .get('/trip', getTripPage)
    .get('/trip/ru', getTripPageRu)
    .get('/trip/en', getTripPageEn)
    .get('/trip/:id', jwtAccessMiddleware, getTrip)
    .post('/ticket-pending', jwtAccessMiddleware, checkSchema(pendingTicketSchema), pendingTicket)
    .post('/confirm', jwtAccessMiddleware, limit, checkSchema(confirmOrderSchema), confirmOrder)
    .get('/card', jwtAccessMiddleware, cardPageUz)
    .get('/card/en', jwtAccessMiddleware, cardPageEn)
    .get('/card/ru', jwtAccessMiddleware, cardPageRu)

    // tickets page router
    .get('/ticket', jwtAccessMiddleware, ticketsPage)
    .get('/ticket/ru', jwtAccessMiddleware, ticketsPageRu)
    .get('/ticket/en', jwtAccessMiddleware, ticketsPageEn)
    .get('/tickets', jwtAccessMiddleware, getTicket)
    .get('/ticket/:id/download', downloadTicket)
    .put('/ticket/:id/cancel', jwtAccessMiddleware, cancelTicket)
    .delete('/ticket/:id/delete', jwtAccessMiddleware, deleteTicket)

    // error router
    .get('/404', page404)
    .get('/404/ru', page404Ru)
    .get('/404/en', page404En)
    .get('/429', page429)
    .get('/429/ru', page429Ru)
    .get('/429/en', page429En)
    .get('/500', page500)
    .get('/500/ru', page500Ru)
    .get('/500/en', page500En)

router.use((req, res) => {
    res.redirect('/404')
})