export const sendCodeSchema = (req) => ({
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

export const resetPasswordSchema = (req) => ({
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
    },
    smsCode: {
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