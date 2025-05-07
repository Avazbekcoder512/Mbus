export const profileUpdateSchema = {
    first_Name: {
        notEmpty: {
            errorMessage: "Ismni kiriting!"
        },
        isString: {
            errorMessage: "Ismni matnda kiriting!"
        }
    },
    last_Name: {
        notEmpty: {
            errorMessage: "Familiyani kiriting!"
        },
        isString: {
            errorMessage: "Familiyani matnda kiriting!"
        }
    },
    phoneNumber: {
        isMobilePhone: {
            options: ["uz-UZ"],
            errorMessage: "Telefon raqamini to'g'ri formatda kiriting! (masalan: +998901234567)"
        },
        matches: {
            options: [/^(\+998)(99|98|97|95|93|91|90|33|77|88)\d{7}$/],
            errorMessage: "Telefon raqami noto'g'ri kiritilgan, iltimos, to'g'ri formatda kiriting!"
        },
        notEmpty: {
            errorMessage: 'Telefon raqamni kiriting!'
        }
    },
    gender: {
        notEmpty: {
            errorMessage: 'Jinsni kiriting!'
        },
        isString: {
            errorMessage: "Jinsni matn ko'rinishida kiritng!"
        },
        isIn: {
            options: [["male", "female"]],
            errorMessage: "Faqat Erkak yoki Ayol kiritish mumkin",
        }
    },
    passport: {
        notEmpty: {
            errorMessage: "Passport raqamini kiriting!"
        },
        isString: {
            errorMessage: "Passport raqamini matnda kiriting!"
        }
    },
    bank_card: {
        notEmpty: {
            errorMessage: "Bank karta raqamini kiriting!"
        },
        isString: {
            errorMessage: "Bank karta raqamini matnda kiriting!"
        }
    },
    expiryDate: {
        notEmpty: {
            errorMessage: "Kartani amal qilish muddatini kiriting!"
        },
        isString: {
            errorMessage: "Kartani amal qilish muddatini matnda kiriting!"
        }
    }
}