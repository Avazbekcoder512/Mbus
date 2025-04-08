import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { validationResult, matchedData } from 'express-validator'
import { userModel } from '../models/user.js'
import bcrypt from 'bcrypt'
dotenv.config()

const generateToken = (id, email, name, gender) => {
    const payload = { id, email, name, gender }
    return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1d' })
}

export const register = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => error.msg)
            })
        }

        const data = matchedData(req)

        const checkUser = await userModel.findOne({ email: data.email })

        if (checkUser) {
            return res.status(400).send({
                error: "Bunday emailga ega foydalanuvchi allaqachon ro'yhatdan o'tgan!"
            })
        }

        const passwordHash = await bcrypt.hash(data.password, 12)
        delete data.password

        const user = await userModel.create({
            name: data.name,
            email: data.email,
            password: passwordHash,
            phoneNumber: data.phoneNumber,
        })

        const userId = user._id
        const email = user.email
        const name = user.name

        const token = generateToken(userId, email, name)

        return res.status(201).send({
            message: "Registratsiya muvaffaqiyatli amalga oshirildi!",
            token
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            errorMessage: "Serverda xatolik!"
        })
    }
}

export const login = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => error.msg)
            })
        }

        const data = matchedData(req)

        const user = await userModel.findOne({ email: data.email })

        if (!user) {
            return res.status(400).send({
                error: "Bunday emailga ega foydalanuvchi mavjud emas!"
            })
        }

        const checkPassword = await bcrypt.compare(data.password, user.password)

        if (!checkPassword) {
            return res.status(400).send({
                error: "Parol xato!"
            })
        }

        const userId = user._id
        const email = user.email
        const name = user.name

        const token = generateToken(userId, email, name)

        return res.status(200).send({
            message: "Login muvaffaqiyatli amalga oshirildi!",
            token
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            errorMessage: "Serverda xatolik!"
        })
    }
}