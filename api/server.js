import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Connect } from './database/connect.js'
import { router } from './router/routes.js'
import QRCode from 'qrcode'

dotenv.config()
Connect()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/', router)

app.get('/qr', async (req, res) => {
    const data = req.query.text || 'https://mbus.onrender.com/ticket/68038544f75a2304f0cfc5d9/download';
    try {
        const qr = await QRCode.toDataURL(data);
        res.send(`<img src="${qr}">`);
    } catch (err) {
        res.status(500).send('Xatolik yuz berdi.');
    }
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server ishga tushdi... PORT: ${PORT}`);
})