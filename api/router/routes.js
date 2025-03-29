import { Router } from 'express'
import { login, register } from '../controller/authController.js'
import { checkSchema } from 'express-validator'
import { loginValidate, registerValidate } from '../validator/authValidate.js'

export const router = Router()

router
    .post('/register', checkSchema(registerValidate), register)
    .post('/login', checkSchema(loginValidate), login)