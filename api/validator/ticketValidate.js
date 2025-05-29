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
        isString: {
            errorMessage: 'FIRSTNAME_STRING'
        }
    },
    'passengers.*.gender': {
        isString: {
            errorMessage: 'GENDER_STRING'
        },
    },
    'passengers.*.passport': {
        isString: {
            errorMessage: 'PASSPORT_STRING'
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