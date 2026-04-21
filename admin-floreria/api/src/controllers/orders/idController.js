const { db: prisma } = require("../../lib/prisma");
const { orderEvents } = require("../../events/orderEvents");

const orderSelect = {
  id: true,
  orderNumber: true,
  sequentialNumber: true,
  customerName: true,
  customerLastName: true,
  customerProvince: true,
  billingPrincipalAddress: true,
  billingSecondAddress: true,
  customerReference: true,
  subtotal: true,
  tax: true,
  shipping: true,
  total: true,
  paymentStatus: true,
  status: true,
  deliveryNotes: true,
  createdAt: true,
  updatedAt: true,
  paidAt: true,
  updatedBy: true,
  source: true,
  sourceIp: true,
  sourceUserAgent: true,
  verifiedWebhook: true,
  Courier: true,
  billingContactName: true,
  billingCity: true,
  customerEmail: true,
  orderNotes: true,
  customerPhone: true,
  total_discount_amount: true,
  product_discounted_amount: true,
  code_discounted_amount: true,
  coupon_discounted_amount: true,
  discount_coupon_percent: true,
  discount_code_percent: true,
  discount_coupon_id: true,
  discount_code_id: true,
  cashOnDelivery: true,
  clientTransactionId: true,
  couponDiscountCode: true,
  payPhoneAuthCode: true,
  payPhoneTransactionId: true,
  orderItems: {
    select: {
      id: true,
      quantity: true,
      price: true,
      productId: true,
      orderId: true,
      variantName: true,
      discounts_percents: true,
      discounts_ids: true,
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      },
    },
  },
};

function roundMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function serializeOrder(order) {
  const totalAmount = Number(order.total || 0);
  const shipping = Number(order.shipping || 0);
  const subtotal = Number(order.subtotal || 0);
  const tax = Number(order.tax || 0);
  const pendingAmount = shipping > 0 ? Math.max(0, subtotal + tax - shipping) : 0;
  const estimatedDiscountAmount = roundMoney(order.total_discount_amount);

  return {
    ...order,
    description: null,
    notes: null,
    paymentProofImageUrl: null,
    paymentProofFileName: null,
    paymentProofStatus: null,
    paymentProofUploadedAt: null,
    paymentVerifiedAt: null,
    paymentVerifiedBy: null,
    paymentVerificationNotes: null,
    totalAmount,
    estimatedDiscountAmount,
    pendingAmount,
  };
}

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      select: orderSelect,
    });

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    return res.status(200).json({
      status: "success",
      message: "Orden obtenida",
      data: serializeOrder(order),
    });
  } catch (error) {
    console.error("Get order by id error:", error);
    return res.status(500).json({ error: "Error al obtener orden" });
  }
};

exports.updateOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const order = await prisma.order.update({
      where: { id },
      data,
      select: orderSelect,
    });
    return res.status(200).json({ order: serializeOrder(order) });
  } catch (error) {
    console.error("Update order by id error:", error);
    return res.status(500).json({ error: "Error al actualizar orden" });
  }
};

exports.updateStateOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "Status es requerido",
      });
    }

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status invalido",
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      select: orderSelect,
    });

    orderEvents.emit("order.status.updated", {
      id: order.id,
      status: order.status,
      order: order.orderNumber,
      customerName: order.customerName,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      status: "success",
      message: "Estado actualizado correctamente",
      data: { order: serializeOrder(order) },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar estado de la orden",
      details: error.message,
    });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ["PENDING", "PAID", "FAILED", "CANCELLED"];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ status: "error", message: "paymentStatus invalido." });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        paidAt: paymentStatus === "PAID" ? new Date() : undefined,
      },
      select: orderSelect,
    });

    return res.status(200).json({
      status: "success",
      message: "Estado de pago actualizado",
      data: { order: serializeOrder(order) },
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return res.status(500).json({ status: "error", message: "Error al actualizar estado de pago." });
  }
};

exports.updatePaymentProof = async (req, res) => {
  try {
    return res.status(501).json({
      status: "error",
      message: "La base actual no soporta campos de comprobante de pago todavia.",
    });
  } catch (error) {
    console.error("Update payment proof error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar el comprobante.",
    });
  }
};

exports.deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({
      where: { id },
    });
    return res.status(200).json({ message: "Orden eliminada" });
  } catch (error) {
    return res.status(500).json({ error: "Error al eliminar orden" });
  }
};
