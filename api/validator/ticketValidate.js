export const pendingTicketSchema = {
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
            errorMessage: 'FIRSTNAME_EMPTY'
        },
        isString: {
            errorMessage: 'FIRSTNAME_STRING'
        }
    },
    'passengers.*.gender': {
        notEmpty: {
            errorMessage: 'GENDER_EMPTY'
        },
        isString: {
            errorMessage: 'GENDER_STRING'
        },
        isIn: {
            options: [["male", "female"]],
            errorMessage: 'GENDER_ENUM'
        }
    },
    'passengers.*.passport': {
        notEmpty: {
            errorMessage: 'PASSPORT_EMPTY'
        },
        isString: {
            errorMessage: 'PASSPORT_STRING'
        }
    },
    'passengers.*.phoneNumber': {
        notEmpty: {
            errorMessage: 'PHONE_EMPTY'
        }
    },
    'passengers.*.seatNumber': {
        notEmpty: {
            errorMessage: 'SEATNUMBER_EMPTY'
        },
        isInt: {
            errorMessage: 'SEATNUMBER_INT'
        }
    },
    from: {
        notEmpty: {
            errorMessage: 'FROM_EMPTY'
        }
    },
    to: {
        notEmpty: {
            errorMessage: 'TO_EMPTY'
        }
    },
    departure_date: {
        notEmpty: {
            errorMessage: 'DEPARTUREDATE_EMPTY'
        }
    },
    departure_time: {
        notEmpty: {
            errorMessage: 'DEPARTURETIME_EMPTY'
        }
    },
    arrival_date: {
        notEmpty: {
            errorMessage: "ARRIVALDATE_EMPTY"
        }
    },
    arrival_time: {
        notEmpty: {
            errorMessage: "ARRIVALTIME_EMPTY"
        }
    }
}


export const confirmOrderSchema = {
    notEmpty: {
        errorMessage: 'REGISTERCODE_EMPTY'
    },
    verificationCode: {
        isInt: {
            errorMessage: 'REGISTERCODE_INT'
        },
    },
    isLength: {
        options: { min: 6 },
        errorMessage: 'REGISTERCODE_LENGTH'
    },
}