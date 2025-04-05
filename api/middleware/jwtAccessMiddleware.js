import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const jwtAccessMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']

        if (!authHeader) {
            return res.status(404).send({
                error: 'Token not found'
            })
        }

        const token = authHeader.split(' ')[1]

        if (!token) {
            return res.status(404).send({
                error: 'Token not provided'
            })
        }

        const user = jwt.verify(token, process.env.JWT_KEY);

        next()
    } catch (error) {
        console.log(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                error: 'Token muddati tugagan. Iltimos, qayta kirish qiling!',
            });
        }
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}