import { cityModel } from '../models/city.js'


export const cityFind = async (req, res) => {
    try {
        const cities = await cityModel.find()

        if (!cities) {
            return res.status(404).send({
                error: "Shaharlar topilmadi!"
            })
        }

        return res.status(200).send({
            cities
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Serverda xatolik!"
        })
    }
}