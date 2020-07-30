const e = require("express")
const session = require("express-session")


const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "https://worldplugs.net/checkout",
                "cancel_url": "https://worldplugs.net/cart"
            },
            "transactions": [{
                "item_list": {
                    "items": []
                },
                "amount": {
                    "currency": "GBP",
                    "total": ""
                },
                "description": "This is the payment description."
            }]
        };

module.exports = create_payment_json