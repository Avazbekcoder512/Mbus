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
            errorMessage: "Yo‘lovchi ismi bo‘lishi shart!"
        },
        isString: {
            errorMessage: "Yo‘lovchi ismi matn ko‘rinishida bo‘lishi kerak!"
        }
    },
    'passengers.*.gender': {
        notEmpty: {
            errorMessage: "Yo‘lovchi jinsini kiritishi shart!"
        },
        isString: {
            errorMessage: "Yo‘lovchi jinsini matn ko'rinishida kiritishi shart!"
        },
        isIn: {
            options: [["male", "female"]],
            errorMessage: "Faqat Erkak yoki Ayol kiritish mumkin",
        }
    },
    'passengers.*.passport': {
        notEmpty: {
            errorMessage: "Yo‘lovchi passport raqami bo‘lishi shart!"
        },
        isString: {
            errorMessage: "Yo‘lovchi passport raqami matn ko'rinishida bo‘lishi kerak!"
        }
    },
    'passengers.*.phoneNumber': {
        notEmpty: {
            errorMessage: "Yo‘lovchi telefon raqami bo‘lishi shart!"
        },
        isString: {
            errorMessage: "Yo‘lovchi telefon raqami raqam ko'rinishida bo‘lishi kerak!"
        }
    },
    'passengers.*.seatNumber': {
        notEmpty: {
            errorMessage: "Yo‘lovchi o'rindiq raqami bo‘lishi shart!"
        },
        isInt: {
            errorMessage: "Yo‘lovchi o'rindiq raqami raqam ko'rinishida bo‘lishi kerak!"
        }
    },
    from: {
        notEmpty: {
            errorMessage: "Qayerdan ekanlgi bo'lishi shart!"
        }
    },
    to: {
        notEmpty: {
            errorMessage: "Qayerga ekanligi bo'lishi shart!"
        }
    },
    departure_date: {
        notEmpty: "Jo'nash kuni bo'lishi shart!"
    },
    departure_time: {
        notEmpty: "Jo'nash vaqti bo'lishi shart!"
    }
}


export const confirmOrderSchema = {
    notEmpty: {
        errorMessage: "Tasdiqlash kodi bo'sh bo'lmasligi kerak!"
    },
    verificationCode: {
        isInt: {
            errorMessage: "Tasdiqlash kodi raqam ko'rinishida bo'lishi kerak!"
        },
    },
    isLength: {
        options: { min: 6 },
        errorMessage: "Parol 6 ta raqamdan iborat bo'lishi kerak!"
    },
}