const express = require("express");
const { db: prisma } = require("../../lib/prisma");
const {
  createPaypalCheckoutOrder,
  capturePaypalCheckoutOrder,
} = require("../../services/paypalOrderService");

const router = express.Router();

const log = (step, message, data) => {
  const ts = new Date().toISOString();
  if (data !== undefined) {
    console.log(`[PAYPAL][${step}] ${ts} - ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[PAYPAL][${step}] ${ts} - ${message}`);
  }
};

router.post("/create-order", async (req, res) => {
  log("CREATE_ORDER", "Creando orden PayPal desde storefront");

  try {
    const session = await createPaypalCheckoutOrder(prisma, req.body);

    log("CREATE_ORDER", "Orden PayPal creada", {
      orderId: session.order.id,
      orderNumber: session.orderNumber,
      clientTransactionId: session.clientTransactionId,
      paypalOrderId: session.paypalOrderId,
      environment: session.environment,
    });

    return res.status(201).json({
      status: "success",
      data: {
        orderId: session.order.id,
        orderNumber: session.orderNumber,
        clientTransactionId: session.clientTransactionId,
        paypalOrderId: session.paypalOrderId,
        approveUrl: session.approveUrl,
        environment: session.environment,
      },
    });
  } catch (error) {
    log("CREATE_ORDER", "ERROR", { message: error.message, stack: error.stack });
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "No se pudo crear la orden de PayPal.",
      detail: process.env.NODE_ENV === "development" && !error.statusCode ? error.message : undefined,
    });
  }
});

router.post("/capture", async (req, res) => {
  const {
    paypalOrderId,
    token,
    clientTransactionId,
    cancelled,
  } = req.body || {};

  log("CAPTURE", "Capturando orden PayPal", {
    paypalOrderId: paypalOrderId || token,
    clientTransactionId,
    cancelled: Boolean(cancelled),
  });

  try {
    const result = await capturePaypalCheckoutOrder(prisma, {
      paypalOrderId,
      token,
      clientTransactionId,
      cancelled,
    });

    return res.status(200).json({
      status: "success",
      data: {
        orderNumber: result.order.orderNumber,
        paymentStatus: result.paymentStatus,
        approved: result.approved,
        alreadyProcessed: result.alreadyProcessed,
        paypalOrderId: result.paypalOrderId || paypalOrderId || token || null,
        captureId: result.captureId || null,
        payerId: result.payerId || null,
      },
    });
  } catch (error) {
    log("CAPTURE", "ERROR", { message: error.message, stack: error.stack });
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "No se pudo capturar el pago de PayPal.",
      detail: process.env.NODE_ENV === "development" && !error.statusCode ? error.message : undefined,
    });
  }
});

module.exports = router;
