export const seatSelectionSchema = {
    bank_card: {
        isCreditCard: {
            errorMessage: 'Karta raqami yaroqsiz! Iltimos qayta kiriting!'
        },
        matches: {
            options: [/^8600\d{12}$|^9860\d{12}$/],
            errorMessage: "Faqat UzCard yoki Humo kartalariga ruxsat beriladi!"
        }
    },
    price: {
        isInt: {
            errorMessage: "Chipta narxini raqamda kiriting!"
        },
        notEmpty: {
            errorMessage: 'Chipta narxini kiriting!'
        }
    }
}