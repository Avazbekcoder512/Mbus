export const page404 = async (req, res) => {
    return res.render('404', {
        layout: false
    })
}

export const page429 = async (req, res) => {
    return res.render('429', {
        layout: false
    })
}

export const page500 = async (req, res) => {
    return res.render('500', {
        layout: false
    })
}