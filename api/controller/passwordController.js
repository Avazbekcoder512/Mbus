import { matchedData, validationResult } from "express-validator"
import { userModel } from "../models/user.js"
import bcrypt from 'bcrypt'


export const sendCode = async (req, res) => {
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
            return res.status(404).send({
                error: "Bunday telefon raqamga ega foydalanuvchi topilmadi!"
            })
        }

        const generateRandomCode = () =>
            Math.floor(100000 + Math.random() * 900000);

        const resetCode = generateRandomCode();
        console.log(resetCode);


        await userModel.findByIdAndUpdate(user._id, { smsCode: resetCode })

        return res.status(200).send({
            message: "Kod sms orqali yuborildi!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}

export const resetPassword = async (req, res) => {
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
            return res.status(404).send({
                error: "Parol noto'g'ri!"
            })
        }

        const newPassword = await bcrypt.hash(data.password, 12)
        delete data.password

        await userModel.findByIdAndUpdate(user._id, {
            password: newPassword,
            $unset: {smsCode: ''}
        })

        return res.status(201).send({
            message: 'Parol muvaffaqiyatli yangilandi!'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}