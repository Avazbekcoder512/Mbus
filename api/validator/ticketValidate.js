export const pendingTicketSchema = (req) => ({
    passengers: {
        isArray: {
            errorMessage: "Yo‘lovchilar ro‘yxati array bo‘lishi kerak!"
        },
        notEmpty: {
            errorMessage: "Kamida bitta yo‘lovchi bo‘lishi shart!"
        }
    },
    'passengers.*.fullName': {
        notEmpty: {
            errorMessage: req.__('FIRSTNAME_EMPTY')
        },
        isString: {
            errorMessage: req.__('FIRSTNAME_STRING')
        }
    },
    'passengers.*.gender': {
        notEmpty: {
            errorMessage: req.__('GENDER_EMPTY')
        },
        isString: {
            errorMessage: req.__('GENDER_STRING')
        },
        isIn: {
            options: [["male", "female"]],
            errorMessage: req.__('GENDER_ENUM')
        }
    },
    'passengers.*.passport': {
        notEmpty: {
            errorMessage: req.__('PASSPORT_EMPTY')
        },
        isString: {
            errorMessage: req.__('PASSPORT_STRING')
        }
    },
    'passengers.*.phoneNumber': {
        notEmpty: {
            errorMessage: req.__('PHONE_EMPTY')
        },
        isMobilePhone: {
            options: ["uz-UZ"],
            errorMessage: req.__('PHONE_INVALID')
        },
        matches: {
            options: [/^(\+998)(99|98|97|95|93|91|90|33|77|88)\d{7}$/],
            errorMessage: req.__('PHONE_REGEX')
        }
    },
    'passengers.*.seatNumber': {
        notEmpty: {
            errorMessage: req.__('SEATNUMBER_EMPTY')
        },
        isInt: {
            errorMessage: req.__('SEATNUMBER_INT')
        }
    },
    from: {
        notEmpty: {
            errorMessage: req.__('FROM_EMPTY')
        }
    },
    to: {
        notEmpty: {
            errorMessage: req.__('TO_EMPTY')
        }
    },
    departure_date: {
        notEmpty: req.__('DEPARTUREDATE_EMPTY')
    },
    departure_time: {
        notEmpty: req.__('DEPARTURETIME_EMPTY')
    }
})


export const confirmOrderSchema = (req) => ({
    notEmpty: {
        errorMessage: req.__('REGISTERCODE_EMPTY')  
    },
    verificationCode: {
        isInt: {
            errorMessage: req.__('REGISTERCODE_INT')
        },
    },
    isLength: {
        options: { min: 6 },
        errorMessage: req.__('REGISTERCODE_LENGTH')
    },
})