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
    'passengers.*.birthday': {
        notEmpty: {
            errorMessage: "Yo‘lovchi tu'gilgan yili bo‘lishi shart!"
        },
        isString: {
            errorMessage: "Yo‘lovchi tu'gilgan yili sana ko'rinishida bo‘lishi kerak!"
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
        isString: {
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

export const seatBookingSchema = {
    bank_card: {
        isCreditCard: {
            errorMessage: 'Karta raqami yaroqsiz! Iltimos qayta kiriting!'
        },
        matches: {
            options: [/^8600\d{12}$|^9860\d{12}$/],
            errorMessage: "Faqat UzCard yoki Humo kartalariga ruxsat beriladi!"
        },
        notEmpty: {
            errorMessage: "Karta raqamini kiritng!"
        }
    },
    expiryDate: {
        notEmpty: {
            errorMessage: "Kartaning yaroqlilik muddati bo‘sh bo‘lmasligi kerak!",
        },
        matches: {
            options: [/^(0[1-9]|1[0-2])\/\d{2}$/],
            errorMessage: "Yaroqlilik muddati noto‘g‘ri formatda! To‘g‘ri format: MM/YY",
        },
        custom: {
            options: (value) => {
                const [monthStr, yearStr] = value.split('/');
                const month = parseInt(monthStr);
                const year = parseInt('20' + yearStr);

                const expiryDate = new Date(year, month);
                const now = new Date();

                if (expiryDate <= now) {
                    throw new Error("Karta muddati allaqachon o‘tgan!");
                }
                return true;
            }
        }
    }
}

export const confirmOrderSchema = {
    verificationCode: {
        isInt: {
            errorMessage: "Tasdiqlash kodi raqam ko'rinishida bo'lishi kerak!"
        },
        notEmpty: {
            errorMessage: "Tasdiqlash kodi bo'sh bo'lmasligi kerak!"
        }
    }
}