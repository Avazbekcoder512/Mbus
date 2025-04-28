import axios from "axios"
import { config } from 'dotenv'
config()

export async function getNewToken() {
    const response = await axios.post('https://notify.eskiz.uz/api/auth/login', {
        email: process.env.Eskiz_Email,
        password: process.env.Eskiz_Password
    }, {
        headers: {
            'Content-Type': "application/json"
        }
    })
    return response.data.data.token
}