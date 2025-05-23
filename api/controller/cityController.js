import { cityModel } from '../models/city.js'

export const get = async (req, res) => {
    return res.render('index', {
        layout: false
    })
}

export const getRu = async (req, res) => {
    return res.render('indexRu', {
        layout: false
    })
}

export const getEn = async (req, res) => {
    return res.render('indexEn', {
        layout: false
    })
}

export const cityFind = async (req, res) => {
    try {
        const cities = await cityModel.find()

        if (!cities) {
            return res.status(404).send({
                error: req.__('CITY_NOT_FOUND')
            })
        }

        return res.status(200).send({
            cities
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: req.__("SERVER_ERROR")
        })
    }
}