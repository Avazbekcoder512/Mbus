export const registerValidate = {
    first_Name: {
        notEmpty: {
            errorMessage: 'FIRSTNAME_EMPTY'
        },
        isString: {
            errorMessage: 'FIRSTNAME_STRING'
        }
    },
    last_Name: {
        notEmpty: {
            errorMessage: 'LASTNAME_EMPTY'
        },
        isString: {
            errorMessage: 'LASTNAME_STRING'
        }
    },
    password: {
        notEmpty: {
            errorMessage: 'PASSWORD_EMPTY'
        },
        isString: {
            errorMessage: 'PASSWORD_STRING'
        },
        isLength: {
            options: { min: 6 },
            errorMessage: 'PASSWORD_LENGTH'
        }
    },
    phoneNumber: {
        notEmpty: {
            errorMessage: 'PHONE_EMPTY'
        },
        isMobilePhone: {
            options: ["uz-UZ"],
            errorMessage: 'PHONE_INVALID'
        },
        matches: {
            options: [/^(\+998)(99|98|97|95|93|91|90|33|77|88)\d{7}$/],
            errorMessage: 'PHONE_REGEX'
        }
    }
}

export const loginValidate = {
    phoneNumber: {
        notEmpty: {
            errorMessage: 'PHONE_EMPTY'
        },
        isMobilePhone: {
            options: ["uz-UZ"],
            errorMessage: 'PHONE_INVALID'
        },
        matches: {
            options: [/^(\+998)(99|98|97|95|93|91|90|33|77|88)\d{7}$/],
            errorMessage: 'PHONE_REGEX'
        },
    },
    password: {
        notEmpty: {
            errorMessage: 'PASSWORD_EMPTY'
        },
        isString: {
            errorMessage: 'PASSWORD_STRING'
        },
        isLength: {
            options: { min: 6 },
            errorMessage: 'PASSWORD_LENGTH'
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
            errorMessage: 'REGISTERCODE_EMPTY'
        },
        isString: {
            errorMessage: 'REGISTERCODE_STRING'
        },
        isLength: {
            options: { min: 6 },
            errorMessage: 'REGISTERCODE_LENGTH'
        }
    }
}