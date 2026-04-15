const express = require('express');
const { sendAbandonedCartEmail } = require('../../utils/mail');
const router = express.Router();

/**
 * POST /api/external/store-orders/abandoned
 * Recibir datos de carrito abandonado y notificar por email
 */
router.post('/', async (req, res) => {
  try {
    const { customerName, phone, items, total } = req.body;

    if (!customerName || !phone || !items || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Datos incompletos para notificación de abandono' });
    }

    console.log(`🔔 Notificando carrito abandonado de: ${customerName} (${phone})`);
    
    // Formatear items para el email
    const formattedItems = items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    const sent = await sendAbandonedCartEmail({
      customerName,
      phone,
      items: formattedItems,
      total: Number(total)
    });

    if (sent) {
      return res.json({ status: 'success', message: 'Notificación de abandono enviada' });
    } else {
      return res.status(500).json({ status: 'error', message: 'Error enviando notificación' });
    }
  } catch (error) {
    console.error('Abandoned order route error:', error);
    res.status(500).json({ status: 'error', message: 'Error interno' });
  }
});

module.exports = router;
