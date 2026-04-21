const express = require('express');
const { db: prisma } = require('../../lib/prisma');
const cloudinary = require('../../lib/cloudinary');
const router = express.Router();

/**
 * POST /api/external/store-orders
 * Crear una orden desde la tienda pública (sin auth de admin).
 * Los datos de la tienda son: producto, datos de entrega, método de pago, sector.
 */
router.post('/', async (req, res) => {
  try {
    const {
      productId,
      productName,
      productPrice,
      quantity = 1,
      receiverName,
      senderName,
      phone,
      deliveryDateTime,
      exactAddress,
      sector,
      shippingCost,
      cardMessage,
      paymentMethod,
      total,
      couponCode,
    } = req.body;

    // Validación mínima
    if (!receiverName || !senderName || !phone || !total) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan datos obligatorios: nombre del receptor, emisor, teléfono y total.',
      });
    }

    // 1. Validar Cupón si existe
    let couponDiscountAmount = 0;
    let couponId = null;
    let appliedCouponCode = null;

    if (couponCode) {
      const now = new Date();
      const coupon = await prisma.coupons.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: now },
          validUntil: { gte: now },
        },
      });

      if (coupon) {
        // Validar monto mínimo
        const subtotal = Number(total) - Number(shippingCost || 0);
        if (coupon.minAmount && subtotal < coupon.minAmount) {
          return res.status(400).json({
            status: 'error',
            message: `El cupón requiere una compra mínima de $${coupon.minAmount}`,
          });
        }
        
        // Calcular de nuevo el descuento por seguridad
        if (coupon.type === 'PERCENTAGE') {
          couponDiscountAmount = subtotal * (coupon.value / 100);
        } else {
          couponDiscountAmount = coupon.value;
        }

        couponId = coupon.id;
        appliedCouponCode = coupon.code;
      }
    }

    // Generar número de orden único
    const ts = Date.now();
    const orderNumber = `DIFIORI-${ts}`;

    // Buscar producto si se proporcionó ID
    let resolvedProductId = productId;
    if (!resolvedProductId && productName) {
      const product = await prisma.product.findFirst({
        where: { name: { contains: productName, mode: 'insensitive' }, isActive: true },
      });
      resolvedProductId = product?.id;
    }

    // Crear la orden con transacción
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: senderName.split(' ')[0] || senderName,
          customerLastName: senderName.split(' ').slice(1).join(' ') || '',
          billingPrincipalAddress: exactAddress || sector || 'No especificado',
          billingSecondAddress: sector,
          subtotal: Number(total) - Number(shippingCost || 0) - couponDiscountAmount,
          tax: 0,
          shipping: Number(shippingCost || 0),
          total: Number(total) - couponDiscountAmount,
          paymentStatus: 'PENDING',
          status: 'PENDING',
          deliveryNotes: cardMessage || null,
          customerPhone: phone,
          source: 'TIENDA_WEB',
          billingContactName: receiverName,
          discount_coupon_id: couponId,
          couponDiscountCode: appliedCouponCode,
          coupon_discounted_amount: couponDiscountAmount,
          total_discount_amount: couponDiscountAmount,
          orderNotes: `Recibe: ${receiverName} | Envía: ${senderName} | Sector: ${sector || 'N/A'} | Método pago: ${paymentMethod || 'No especificado'} | Fecha entrega: ${deliveryDateTime || 'No especificada'}${appliedCouponCode ? ` | Cupón: ${appliedCouponCode} (-$${couponDiscountAmount.toFixed(2)})` : ''}`,
        },
      });

      // Incrementar uso del cupón si aplica
      if (couponId) {
        await tx.coupons.update({
          where: { id: couponId },
          data: { usesTotal: { increment: 1 } },
        });
      }

      // Crear item de la orden si tenemos un producto
      if (resolvedProductId) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: resolvedProductId,
            quantity: quantity,
            price: Number(productPrice?.replace('$', '') || 0),
          },
        });
      }

      return newOrder;
    });

    return res.status(201).json({
      status: 'success',
      message: 'Orden creada exitosamente',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error('Store order error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al crear la orden',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/:orderNumber/payment-proof', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { dataUrl, fileName, mimeType } = req.body || {};

    if (!orderNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'El número de orden es obligatorio.',
      });
    }

    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return res.status(400).json({
        status: 'error',
        message: 'Debes enviar una imagen válida del comprobante.',
      });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Orden no encontrada.',
      });
    }

    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      folder: 'difiori/payment-proofs',
      resource_type: 'image',
      public_id: `${order.orderNumber}-${Date.now()}`,
      overwrite: true,
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProofImageUrl: uploadResult.secure_url,
        paymentProofFileName: String(fileName || 'comprobante'),
        paymentProofStatus: 'UPLOADED',
        paymentProofUploadedAt: new Date(),
        paymentVerificationNotes: null,
      },
      select: {
        id: true,
        orderNumber: true,
        paymentProofImageUrl: true,
        paymentProofStatus: true,
        paymentProofUploadedAt: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Comprobante subido correctamente.',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Payment proof upload error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'No se pudo subir el comprobante.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
