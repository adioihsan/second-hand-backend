const { app } = require("../../config/firebaseConfig")
const { product, product_to_category, image, category, wishlist, negotiation, notification } = require("../models");
const { PENDING, REJECTED, ACCEPTED, DONE } = require("../../utils/constant");

const sendReleaseProductPushNotification = async (
    fcmToken, productId
) => {
    try {
        const product = await product.findById(productId)
        if (!product) return;

        await app.messaging().send({
            notification: {
                title: "New Product Release",
                body: `${product.name} is now available`,
                icon: "https://goo.gl/Fz9nrQ",
                click_action: "https://www.google.com/",
            },
            token: fcmToken,
        })          
    } catch (error) {
        console.log(error, "Error in sendReleaseProductNotification : ", error)
    }
}

const sendNegotiationPushNotification = async (
    fcmToken, negotiationId, status
) => {
    try {
        const negotiation = await negotiation.findOne({
            where: { id: negotiationId },
            include: [
                { model: product, as: "product" },
                { model: category, as: "category" }
            ]
        })
        if (!negotiation) return;

        let notificationBody = {};
        
        switch (status) {
            case PENDING:
                notificationBody = {
                    title: "Penawaran Produk",
                    body: `${negotiation.product.name} terdapat penawaran baru`,
                }
                break;
            case REJECTED:
                notificationBody = {
                    title: "Penawaran Produk",
                    body: `Penawaran barang ${negotiation.product.name} ditolak`,
                }
                break;
            case ACCEPTED:
                notificationBody = {
                    title: "Penawaran Produk",
                    body: `Penawaran barang ${negotiation.product.name} diterima`,
                }
                break;
            case DONE:
                notificationBody = {
                    title: "Penawaran Produk",
                    body: `Penawaran barang ${negotiation.product.name} selesai`,
                }
                break;
            default:
                break;
        }
        await app.messaging().send({
            notification: notificationBody,
            token: fcmToken
        })
    } catch (error) {
        console.log("Error :", error);
    }
}

module.exports = {
    sendReleaseProductPushNotification,
    sendNegotiationPushNotification
}