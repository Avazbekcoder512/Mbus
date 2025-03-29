import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Connect } from './database/connect.js'
import { router } from './router/routes.js'

dotenv.config()
Connect()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/', router)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server ishga tushdi... PORT: ${PORT}`);
})