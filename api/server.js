import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Connect } from './database/connect.js'
import { router } from './router/routes.js'
import { create } from 'express-handlebars'
import Handlebars from 'handlebars'
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access'
import cookieParser from 'cookie-parser'

dotenv.config()
Connect()
const app = express()

const hbs = create({
    defaultLayout: "main",
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static("public"));
app.use(express.static("frontend"));

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./frontend/views");

app.use('/', router)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server ishga tushdi... PORT: ${PORT}`);
})