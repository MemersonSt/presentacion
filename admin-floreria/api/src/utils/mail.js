const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Enviar correo de notificación de carrito abandonado
 */
async function sendAbandonedCartEmail({ customerName, phone, items, total }) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@difiori.com.ec';
  
  const itemsHtml = items.map(item => `
    <li>
      <strong>${item.name}</strong> - ${item.quantity} x ${item.price}
    </li>
  `).join('');

  const waLink = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${customerName}, vimos que te interesaste en nuestros productos en DIFIORI. ¿Podemos ayudarte con tu pedido?`)}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"DIFIORI Notificaciones" <noreply@difiori.com.ec>',
    to: adminEmail,
    subject: `🚨 Carrito Abandonado - ${customerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #5A3F73;">Posible Cliente Perdido</h2>
        <p>Alguien comenzó el proceso de compra pero no lo finalizó:</p>
        <hr />
        <p><strong>Cliente:</strong> ${customerName}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Total estimado:</strong> $${total.toFixed(2)}</p>
        <h3>Productos en el carrito:</h3>
        <ul>${itemsHtml}</ul>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${waLink}" style="background-color: #25D366; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Contactar por WhatsApp ahora
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">
          Este es un aviso automático del sistema de recuperación de carritos de DIFIORI.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
}

module.exports = {
  sendAbandonedCartEmail,
};
