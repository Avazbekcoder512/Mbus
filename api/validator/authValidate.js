export const registerValidate = (req) => ({
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
    password: {
        notEmpty: {
            errorMessage: req.__('PASSWORD_EMPTY')
        },
        isString: {
            errorMessage: req.__('PASSWORD_STRING')
        },
        isLength: {
            options: { min: 6 },
            errorMessage: req.__('PASSWORD_LENGTH')
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
        }
    }
})

export const loginValidate = (req) => ({
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
    password: {
        notEmpty: {
            errorMessage: req.__('PASSWORD_EMPTY')
        },
        isString: {
            errorMessage: req.__('PASSWORD_STRING')
        },
        isLength: {
            options: { min: 6 },
            errorMessage: req.__('PASSWORD_LENGTH')
        },
    }
})

export const confirmRegistrationSchema = (req) => ({
    userId: {
        notEmpty: {
            errorMessage: "Foydalanuvchi id si talab qilinadi!"
        }
    },
    register_code: {
        notEmpty: {
            errorMessage: req.__('REGISTERCODE_EMPTY')
        },
        isString: {
            errorMessage: req.__('REGISTERCODE_STRING')
        },
        isLength: {
            options: { min: 6 },
            errorMessage: req.__('REGISTERCODE_LENGTH')
        }
    }
})