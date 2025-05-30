import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const jwtAccessMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(404).send({
                error: req.__('LOGIN_ERROR')
            })
        }

        const user = jwt.verify(token, process.env.JWT_KEY)

        next()
    } catch (error) {  
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                error: req.__('LOGIN_ERROR')
            })
        } else if (error.name === 'JsonWebTokenError' && error.message === 'jwt malformed') {
            return res.status(401).send({
                error: req.__('LOGIN_ERROR')
            })
        }   
        console.log(error)
        return res.status(500).send({
            error: req.__('SERVER_ERROR'),
        })
    }
}