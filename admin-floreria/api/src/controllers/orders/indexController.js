const { db: prisma } = require("../../lib/prisma");

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
  const itemsAmount = order.orderItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  const estimatedDiscountAmount = roundMoney(order.total_discount_amount);
  const shipping = Number(order.shipping || 0);
  const subtotal = Number(order.subtotal || 0);
  const tax = Number(order.tax || 0);
  const pendingAmount = shipping > 0 ? Math.max(0, subtotal + tax - shipping) : 0;

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
    itemsAmount: roundMoney(itemsAmount + Number(order.product_discounted_amount || 0)),
    estimatedDiscountAmount,
    pendingAmount,
  };
}

exports.getAllOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const status = req.query.status;
    const search = req.query.search;
    const range = req.query.range;
    const dateStart = req.query.dateStart;
    const dateEnd = req.query.dateEnd;

    const where = {};
    let take;

    if (!isNaN(limit) && limit > 0) {
      take = limit;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        {
          customerEmail: {
            not: null,
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (dateStart || dateEnd) {
      const dateFilter = {};

      if (dateStart) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStart)) {
          return res.status(400).json({
            status: "error",
            message: "Formato de 'dateStart' invalido. Use YYYY-MM-DD",
          });
        }
        dateFilter.gte = new Date(`${dateStart}T00:00:00.000Z`);
      }

      if (dateEnd) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateEnd)) {
          return res.status(400).json({
            status: "error",
            message: "Formato de 'dateEnd' invalido. Use YYYY-MM-DD",
          });
        }
        const endDate = new Date(`${dateEnd}T00:00:00.000Z`);
        endDate.setUTCDate(endDate.getUTCDate() + 1);
        dateFilter.lt = endDate;
      }

      where.createdAt = dateFilter;
    } else if (range) {
      switch (range) {
        case "today": {
          const start = new Date();
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setUTCDate(end.getUTCDate() + 1);
          where.createdAt = { gte: start, lt: end };
          break;
        }
        case "this_week": {
          const start = new Date();
          const dayOfWeek = start.getUTCDay();
          start.setUTCDate(start.getUTCDate() - dayOfWeek);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setUTCDate(end.getUTCDate() + 7);
          where.createdAt = { gte: start, lt: end };
          break;
        }
        case "this_month": {
          const start = new Date();
          start.setUTCDate(1);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setUTCMonth(end.getUTCMonth() + 1);
          where.createdAt = { gte: start, lt: end };
          break;
        }
        case "this_year": {
          const start = new Date();
          start.setUTCMonth(0, 1);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setUTCFullYear(end.getUTCFullYear() + 1);
          where.createdAt = { gte: start, lt: end };
          break;
        }
      }
    }

    const ordersData = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: orderSelect,
    });

    return res.status(200).json({
      status: "success",
      data: ordersData.map(serializeOrder),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const data = req.body;
    const order = await prisma.order.create({ data });
    return res.status(201).json({ order });
  } catch (error) {
    return res.status(500).json({ error: "Error al crear orden" });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "orderIds es requerido y debe ser un array no vacio.",
      });
    }

    const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ status: "error", message: "Status invalido." });
    }

    const result = await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status },
    });

    return res.status(200).json({
      status: "success",
      message: `${result.count} ordenes actualizadas correctamente`,
      count: result.count,
    });
  } catch (error) {
    console.error("Bulk update status error:", error);
    return res.status(500).json({ status: "error", message: "Error al actualizar ordenes en masa." });
  }
};
