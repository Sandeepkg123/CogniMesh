import crypto from "node:crypto"
import axios from "axios"
import { PLANS } from "../config/Plans.js"
import razorpay from "../config/razorpay.js"
import Payment from "../models/payment.model.js"
import { internalHeaders } from "../../../shared/internalAuth.js"

export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body || {}
        const selectedPlan = PLANS[plan]

        if (!selectedPlan || selectedPlan.amount <= 0) {
            return res.status(400).json({ message: "invalid plan" })
        }

        const order = await razorpay.orders.create({
            amount: selectedPlan.amount * 100,
            currency: "INR",
            receipt: `receipt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`
        })

        await Payment.create({
            userId: req.userId,
            orderId: order.id,
            amount: selectedPlan.amount,
            credits: selectedPlan.credits,
            plan: selectedPlan.id,
            currency: order.currency,
            status: "created"
        })

        return res.status(200).json({ order, plan: selectedPlan })
    } catch (error) {
        console.error("create order error", error.message)
        return res.status(500).json({ message: "failed to create order" })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body || {}

        if (
            typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string"
        ) {
            return res.status(400).json({ message: "invalid payment payload" })
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest()

        const providedSignature = Buffer.from(razorpay_signature, "hex")

        if (
            providedSignature.length !== expectedSignature.length ||
            !crypto.timingSafeEqual(expectedSignature, providedSignature)
        ) {
            return res.status(400).json({ message: "payment verification failed" })
        }

        const payment = await Payment.findOne({
            orderId: razorpay_order_id,
            userId: req.userId
        })

        if (!payment) {
            return res.status(404).json({ message: "payment not found" })
        }

        if (payment.status === "paid") {
            return res.status(200).json({ success: true, duplicate: true })
        }

        if (payment.status === "processing") {
            return res.status(409).json({ message: "payment already processing" })
        }

        if (payment.status !== "created") {
            return res.status(400).json({ message: "payment cannot be verified" })
        }

        const planDefinition = PLANS[payment.plan]
        if (
            !planDefinition ||
            planDefinition.amount <= 0 ||
            planDefinition.amount !== payment.amount
        ) {
            return res.status(400).json({ message: "payment plan mismatch" })
        }

        const paymentAlreadyUsed = await Payment.exists({
            paymentId: razorpay_payment_id,
            orderId: { $ne: razorpay_order_id }
        })

        if (paymentAlreadyUsed) {
            return res.status(400).json({ message: "payment already used" })
        }

        let razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id)

        // Validate the payment against our order before attempting capture so
        // we never capture funds for a mismatched or tampered order.
        if (razorpayPayment.order_id !== razorpay_order_id) {
            return res.status(400).json({ message: "order mismatch" })
        }

        if (razorpayPayment.amount !== payment.amount * 100) {
            return res.status(400).json({ message: "amount mismatch" })
        }

        if (razorpayPayment.currency !== payment.currency) {
            return res.status(400).json({ message: "currency mismatch" })
        }

        if (razorpayPayment.status === "authorized") {
            razorpayPayment = await razorpay.payments.capture(
                razorpay_payment_id,
                razorpayPayment.amount,
                razorpayPayment.currency
            )
        }

        if (razorpayPayment.status !== "captured") {
            return res.status(400).json({ message: "payment not captured" })
        }

        let claimed

        try {
            claimed = await Payment.findOneAndUpdate(
                { _id: payment._id, status: "created" },
                {
                    $set: {
                        status: "processing",
                        paymentId: razorpay_payment_id
                    }
                },
                { new: true }
            )
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: "payment already used" })
            }
            throw error
        }

        if (!claimed) {
            return res.status(409).json({ message: "payment already processed" })
        }

        try {
            await axios.post(
                `${process.env.AUTH_SERVICE}/internal/update-plan`,
                { plan: claimed.plan },
                {
                    headers: internalHeaders({
                        "x-user-id": claimed.userId,
                        "x-idempotency-key": razorpay_payment_id
                    }),
                    timeout: 15000
                }
            )
        } catch (error) {
            if (error.response?.status === 409) {
                return res.status(409).json({ message: "payment already processing" })
            }

            await Payment.updateOne(
                { _id: claimed._id, status: "processing" },
                { $set: { status: "created" } }
            )

            console.error("update plan after payment failed", error.message)
            return res.status(502).json({ message: "payment verification pending" })
        }

        await Payment.updateOne(
            { _id: claimed._id, status: "processing" },
            { $set: { status: "paid" } }
        )

        return res.status(200).json({ message: "Payment Verified" })
    } catch (error) {
        console.error("verify payment error", error.message)
        return res.status(500).json({ message: "payment verification failed" })
    }
}
