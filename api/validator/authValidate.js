export const registerValidate = {
    name: {
        isString: {
            errorMessage: "Ism Familiyani stringda kiriting!"
        },
        notEmpty: {
            errorMessage: "Ism Familiyani kiriting!"
        }
    },
    email: {
        isEmail: {
            errorMessage: 'Elektron pochta manzili yaroqsiz! Iltimos qayta kiriting!'
        },
        notEmpty: 'Elektron pochta manzilini kiriting!'
    },
    password: {
        isString: {
            errorMessage: "Parol harf va raqamlardan iborat bo'lishi kerak!"
        },
        isLength: {
            options: { min: 6 },
            errorMessage: "Parol kamida 6 ta belgidan iborat bo'lishi kerak!"
        },
        notEmpty: {
            errorMessage: "Parolni kiriting!"
        }
    },
    phoneNumber: {
        isMobilePhone: {
            options: ["uz-UZ"],
            errorMessage: "Telefon raqamini to'g'ri formatda kiriting! (masalan, +998901234567)"
        },
        notEmpty: {
            errorMessage: 'Telefon raqamni kiriting!'
        }
    },
    gender: {
        notEmpty: { errorMessage: "Jinsingizni kiritng!" },
        isIn: {
            options: [["Erkak", "Ayol"]],
            errorMessage: "Faqat Erkak yoki Ayol kiritish mumkin",
        },
    }
    // bank_card: {
    //     isCreditCard: {
    //         errorMessage: 'Karta raqami yaroqsiz! Iltimos qayta kiriting!'
    //     },
    //     matches: {
    //         options: [/^8600\d{12}$|^9860\d{12}$/],
    //         errorMessage: "Faqat UzCard yoki Humo kartalariga ruxsat beriladi!"
    //     }
    // }
}

export const loginValidate = {
    email: {
        isEmail: {
            errorMessage: 'Elektron pochta manzili yaroqsiz! Iltimos qayta kiriting!'
        },
        notEmpty: 'Elektron pochta manzilini kiriting!'
    },
    password: {
        isString: {
            errorMessage: "Parol harf va raqamlardan iborat bo'lishi kerak!"
        },
        isLength: {
            options: { min: 6 },
            errorMessage: "Parol kamida 6 ta belgidan iborat bo'lishi kerak!"
        },
        notEmpty: {
            errorMessage: "Parolni kiriting!"
        }
    }
}