export const registerValidate = (req) => ({
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
    password: {
        notEmpty: {
            errorMessage: "Parolni kiriting!"
        },
        isString: {
            errorMessage: "Parol harf va raqamlardan iborat bo'lishi kerak!"
        },
        isLength: {
            options: { min: 6 },
            errorMessage: "Parol kamida 6 ta belgidan iborat bo'lishi kerak!"
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
        }
    }
})

export const loginValidate = {
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
    password: {
        notEmpty: {
            errorMessage: "Parolni kiriting!"
        },
        isString: {
            errorMessage: "Parol harf va raqamlardan iborat bo'lishi kerak!"
        },
        isLength: {
            options: { min: 6 },
            errorMessage: "Parol kamida 6 ta belgidan iborat bo'lishi kerak!"
        },
    }
}

export const confirmRegistrationSchema = {
    userId: {
        notEmpty: {
            errorMessage: "Foydalanuvchi id si talab qilinadi!"
        }
    },
    register_code: {
        notEmpty: {
            errorMessage: "Tasdiqlash kodini kiritish shart!"
        },
        isString: {
            errorMessage: "Tasdiqlash kodi matn bo'lishi kerak!"
        },
        isLength: {
            options: { min: 6 },
            errorMessage: "Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi kaerak"
        }
    }
}