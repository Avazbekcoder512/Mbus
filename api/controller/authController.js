import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { validationResult, matchedData } from 'express-validator'
import { userModel } from '../models/user.js'
import bcrypt from 'bcrypt'
dotenv.config()

const generateToken = (id, phoneNumber, first_Name, last_Name) => {
    const payload = { id, phoneNumber, first_Name, last_Name }
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

        const checkUser = await userModel.findOne({ phoneNumber: data.phoneNumber })

        if (checkUser) {
            return res.status(400).send({
                error: "Bunday telefon raqamga ega foydalanuvchi allaqachon ro'yhatdan o'tgan!"
            })
        }

        const passwordHash = await bcrypt.hash(data.password, 12)
        delete data.password

        const generateRandomCode = () =>
            Math.floor(100000 + Math.random() * 900000);

        const verificationCode = generateRandomCode();
        console.log(verificationCode);

        const user = await userModel.create({
            first_Name: data.first_Name,
            last_Name: data.last_Name,
            password: passwordHash,
            phoneNumber: data.phoneNumber,
            last_Login: new Date(),
            register_code: verificationCode
        })

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

        return res.status(201).send({
            message: "Tasdiqlash kodi foydalanuvchiga yuborildi!",
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            errorMessage: "Serverda xatolik!"
        })
    }
}

export const confirmRegistration = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => error.msg)
            })
        }

        const data = matchedData(req)
        const id = data.userId

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({
                error: "Id noto'g'ri!"
            })
        }

        const user = await userModel.findById(id)

        if (!user) {
            return res.status(404).send({
                error: "Foydalanuvchi topilmadi!"
            })
        }

        if (user.register_code !== data.register_code) {

            await userModel.findByIdAndDelete(user._id)

            return res.status(400).send({
                error: "Tasdiqlash kodi xato!"
            })
        }

        const userId = user._id
        const phoneNumber = user.phoneNumber
        const first_Name = user.first_Name
        const last_Name = user.last_Name

        const token = generateToken(userId, phoneNumber, first_Name, last_Name)

        res.cookie('token', token)

        return res.status(201).send({
            message: "Ro'yhatdan o'tish muvaffaqiyatli amalga oshirildi!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            errorMessage: "Serverda xatolik!"
        })
    }
}

export const loginPage = async (req, res) => {
    return res.render('login.hbs', {
        layout: false
    })
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

        const user = await userModel.findOne({ phoneNumber: data.phoneNumber })

        if (!user) {
            return res.status(400).send({
                error: "Bunday telefon raqamga ega foydalanuvchi mavjud emas!"
            })
        }

        const checkPassword = await bcrypt.compare(data.password, user.password)

        if (!checkPassword) {
            return res.status(400).send({
                error: "Parol xato!"
            })
        }

        await userModel.findById(user._id, { last_Login: new Date() })

        const userId = user._id
        const phoneNumber = user.phoneNumber
        const first_Name = user.first_Name
        const last_Name = user.last_Name

        const token = generateToken(userId, phoneNumber, first_Name, last_Name)

        res.cookie('token', token)

        return res.status(200).send({
            message: "Login muvaffaqiyatli amalga oshirildi!",
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            errorMessage: "Serverda xatolik!"
        })
    }
}

export const logout = async (req, res) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.redirect('/login')
        }

        res.clearCookie('token')
        return res.redirect('/login')
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            errorMessage: "Serverda xatolik!"
        })
    }
}