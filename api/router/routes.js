import { Router } from 'express'
import { login, register } from '../controller/authController.js'
import { checkSchema } from 'express-validator'
import { loginValidate, registerValidate } from '../validator/authValidate.js'
import { getBus, routeFind, seatSelection } from '../controller/ticketController.js'
import { cityFind } from '../controller/cityController.js'

export const router = Router()

router
    .post('/register', checkSchema(registerValidate), register)
    .post('/login', checkSchema(loginValidate), login)
    .get('/findroute', routeFind)
    .get('/cities', cityFind)
    .get('/bus/:id', getBus)
    .get('/seat/:id', seatSelection)