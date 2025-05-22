export const sendCodeSchema = {
    phoneNumber: {
        notEmpty: {
            errorMessage: 'Telefon raqamni kiriting!'
        },
        isMobilePhone: {
            options: ["uz-UZ"],
            errorMessage: "Telefon raqamini to'g'ri formatda kiriting! (masalan, +998901234567)"
        },
        matches: {
            options: [/^(\+998)(99|98|97|95|93|91|90|33|77|88)\d{7}$/],
            errorMessage: "Telefon raqami noto'g'ri kiritilgan, iltimos, to'g'ri formatda kiriting!"
        }
    }
}

export const resetPasswordSchema = {
    phoneNumber: {
        notEmpty: {
            errorMessage: 'Telefon raqamni kiriting!'
        },
        isMobilePhone: {
            options: ["uz-UZ"],
            errorMessage: "Telefon raqamini to'g'ri formatda kiriting! (masalan, +998901234567)"
        },
        matches: {
            options: [/^(\+998)(99|98|97|95|93|91|90|33|77|88)\d{7}$/],
            errorMessage: "Telefon raqami noto'g'ri kiritilgan, iltimos, to'g'ri formatda kiriting!"
        }
    },
    smsCode: {
        notEmpty: {
            errorMessage: "Parolni kiriting!"
        },
        isString: {
            errorMessage: "Parolni stringda kiriting!"
        },
        isLength: {
            options: { min: 6 },
            errorMessage: "Parol 6 ta raqamdan iborat bo'lishi kerak!"
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
        },
    }
}