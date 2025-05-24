export const sendCodeSchema = {
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

export const resetPasswordSchema = {
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
    },
    smsCode: {
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