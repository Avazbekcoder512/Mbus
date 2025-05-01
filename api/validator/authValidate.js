export const registerValidate = {
    first_Name: {
        isString: {
            errorMessage: "Ismni matnda kiriting!"
        },
        notEmpty: {
            errorMessage: "Ismni kiriting!"
        }
    },
    last_Name: {
        isString: {
            errorMessage: "Familiyani matnda kiriting!"
        },
        notEmpty: {
            errorMessage: "Familiyani kiriting!"
        }
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
            errorMessage: "Telefon raqamini to'g'ri formatda kiriting! (masalan: +998901234567)"
        },
        matches: {
            options: [/^(\+998)(99|98|97|95|93|91|90|33|77|88)\d{7}$/],
            errorMessage: "Telefon raqami noto'g'ri kiritilgan, iltimos, to'g'ri formatda kiriting!"
        },
        notEmpty: {
            errorMessage: 'Telefon raqamni kiriting!'
        }
    }
}

export const loginValidate = {
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

export const confirmRegistrationSchema = {
    userId: {
        notEmpty: {
            errorMessage: "Foydalanuvchi id si talab qilinadi!"
        }
    },
    register_code: {
        isString: {
            errorMessage: "Tasdiqlash kodi matn bo'lishi kerak!"
        },
        notEmpty: {
            errorMessage: "Tasdiqlash kodini kiritish shart!"
        },
        isLength: {
            options: { min: 6 },
            errorMessage: "Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi kaerak"
        }
    }
}