export const profileUpdateSchema = (req) => ({
    first_Name: {
        notEmpty: {
            errorMessage: req.__('FIRSTNAME_EMPTY')
        },
        isString: {
            errorMessage: req.__('FIRSTNAME_STRING')
        }
    },
    last_Name: {
        notEmpty: {
            errorMessage: req.__('LASTNAME_EMPTY')
        },
        isString: {
            errorMessage: req.__('LASTNAME_STRING')
        }
    },
    phoneNumber: {
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
        },
    },
    gender: {
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
    passport: {
        notEmpty: {
            errorMessage: req.__('PASSPORT_EMPTY')
        },
        isString: {
            errorMessage: req.__('PASSPORT_STRING')
        }
    },
    bank_card: {
        notEmpty: {
            errorMessage: req.__('BANKCARD_EMPTY')
        },
        custom: {
            options: (value) => {
                const cleanCard = value.replace(/\s+/g, '');
                if (!/^8600\d{12}$/.test(cleanCard) && !/^9860\d{12}$/.test(cleanCard)) {
                    throw new Error(req.__('BANKCARD_REGEX'));
                }
                if (!/^\d{16}$/.test(cleanCard)) {
                    throw new Error(req.__('BANKCARD_INVALID'));
                }
                return true;
            },
        },
    },
    expiryDate: {
        notEmpty: {
            errorMessage: req.__('EXPIRYDATE_EMPTY')
        },
        matches: {
            options: [/^(0[1-9]|1[0-2])\/\d{2}$/],
            errorMessage: req.__('EXPIRYDATE_REGEX')
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
                    throw new Error(req.__('EXPIRYDATE_INVALID'));
                }
                return true;
            },
        },
    },
})