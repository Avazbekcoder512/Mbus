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