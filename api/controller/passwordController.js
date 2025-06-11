import { matchedData, validationResult } from "express-validator"
import { userModel } from "../models/user.js"
import bcrypt from 'bcrypt'
import { config } from 'dotenv'
import axios from "axios"
config()


export const sendCode = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => req.__(error.msg))
            })
        }

        const data = matchedData(req)

        const user = await userModel.findOne({ phoneNumber: data.phoneNumber })

        if (!user) {
            return res.status(404).send({
                error: req.__('LOGIN_CHECUSER')
            })
        }

        const generateRandomCode = () =>
            Math.floor(100000 + Math.random() * 900000);

        const resetCode = generateRandomCode();
        console.log(resetCode);

        // const Token = await getNewToken()
        // const Phone = user.phoneNumber
        // const Message = `Limon.uz saytidagi telefon raqamingizni tasdiqlash kodi ${resetCode}`

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

        await userModel.findByIdAndUpdate(user._id, { smsCode: resetCode })

        return res.status(200).send({
            message: "Kod sms orqali yuborildi!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: req.__('SERVER_ERROR')
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array().map(error => req.__(error.msg))
            })
        }

        const data = matchedData(req)

        const user = await userModel.findOne({ phoneNumber: data.phoneNumber })

        if (!user) {
            return res.status(404).send({
                error: req.__('USER_NOT_FOUND')
            })
        }

        if (user.smsCode != data.smsCode) {
            return res.status(400).send({
                error: req.__('REGISTERCODE_ERROR')
            })
        }

        const newPassword = await bcrypt.hash(data.password, 12)
        delete data.password

        await userModel.findByIdAndUpdate(user._id, {
            password: newPassword,
            $unset: { smsCode: '' }
        })

        return res.status(201).send({
            message: req.__('PASSWORD_SUCCESS')
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: req.__('SERVER_ERROR')
        })
    }
}