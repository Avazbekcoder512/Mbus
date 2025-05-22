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
        notEmpty: {
            errorMessage: 'Telefon raqamni kiriting!'
        },
        isMobilePhone: {
            options: ["uz-UZ"],
            errorMessage: "Telefon raqamini to'g'ri formatda kiriting! (masalan: +998901234567)"
        },
        matches: {
            options: [/^(\+998)(99|98|97|95|93|91|90|33|77|88)\d{7}$/],
            errorMessage: "Telefon raqami noto'g'ri kiritilgan, iltimos, to'g'ri formatda kiriting!"
        },
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
            errorMessage: "Karta raqamini kiriting!",
        },
        custom: {
            options: (value) => {
                const cleanCard = value.replace(/\s+/g, '');
                if (!/^8600\d{12}$/.test(cleanCard) && !/^9860\d{12}$/.test(cleanCard)) {
                    throw new Error("Faqat UzCard yoki Humo kartalariga ruxsat beriladi!");
                }
                if (!/^\d{16}$/.test(cleanCard)) {
                    throw new Error("Karta raqami noto‘g‘ri formatda!");
                }
                return true;
            },
        },
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

                // E'tibor bering: bu yerda `new Date(year, month)` keyingi oyning 1-kunini bildiradi,
                // shuning uchun bu oyning oxirigacha amal qiladi
                const expiryDate = new Date(year, month, 1);
                const now = new Date();
                now.setDate(1); // faqat oy va yilni solishtirish uchun

                if (expiryDate <= now) {
                    throw new Error("Karta muddati allaqachon o‘tgan!");
                }
                return true;
            },
        },
    },
}