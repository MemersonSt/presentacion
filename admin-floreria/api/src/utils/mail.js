const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendAbandonedCartEmail({
  customerName,
  phone,
  items,
  total,
  recipientEmail,
  ownerName,
  senderName,
  receiverName,
  exactAddress,
  sector,
  paymentMethod,
  deliveryDateTime,
  cardMessage,
  couponCode,
  abandonedAt,
  source,
}) {
  const adminEmail = recipientEmail || process.env.COMPANY_EMAIL || process.env.ADMIN_EMAIL || "admin@difiori.com.ec";
  const safeTotal = Number(total) || 0;

  const itemsHtml = items
    .map((item) => `
      <li>
        <strong>${item.name}</strong> - ${item.quantity} x ${item.price}
      </li>
    `)
    .join("");

  const waLink = `https://wa.me/${String(phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hola ${customerName}, vimos que te interesaste en nuestros productos en DIFIORI. Podemos ayudarte con tu pedido?`
  )}`;

  const formattedAbandonedAt = abandonedAt
    ? new Date(abandonedAt).toLocaleString("es-EC", { hour12: false })
    : new Date().toLocaleString("es-EC", { hour12: false });

  const details = [
    ["Cliente", customerName],
    ["Telefono", phone],
    ["Quien envia", senderName],
    ["Quien recibe", receiverName],
    ["Direccion", exactAddress],
    ["Sector", sector],
    ["Metodo de pago", paymentMethod],
    ["Fecha de entrega", deliveryDateTime],
    ["Mensaje de tarjeta", cardMessage],
    ["Cupon", couponCode],
    ["Origen", source],
    ["Fecha de abandono", formattedAbandonedAt],
  ].filter(([, value]) => value && String(value).trim() !== "");

  const detailsHtml = details
    .map(([label, value]) => `<p><strong>${label}:</strong> ${value}</p>`)
    .join("");

  const detailsText = details.map(([label, value]) => `${label}: ${value}`).join("\n");

  const mailOptions = {
    from: process.env.EMAIL_FROM || "\"DIFIORI Notificaciones\" <noreply@difiori.com.ec>",
    to: adminEmail,
    subject: `Carrito Abandonado - ${customerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #5A3F73;">Posible Cliente Perdido</h2>
        <p>Alguien comenzo el proceso de compra pero no lo finalizo:</p>
        <hr />
        <p><strong>Responsable:</strong> ${ownerName || "Equipo comercial"}</p>
        ${detailsHtml}
        <p><strong>Total estimado:</strong> $${safeTotal.toFixed(2)}</p>
        <h3>Productos en el carrito:</h3>
        <ul>${itemsHtml}</ul>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${waLink}" style="background-color: #25D366; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Contactar por WhatsApp ahora
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">
          Este es un aviso automatico del sistema de recuperacion de carritos de DIFIORI.
        </p>
      </div>
    `,
    text: `Carrito abandonado detectado\n\nResponsable: ${ownerName || "Equipo comercial"}\n${detailsText}\n\nTotal estimado: $${safeTotal.toFixed(2)}\n\nProductos:\n${items.map((item) => `- ${item.name} | Cant: ${item.quantity} | Precio: ${item.price}`).join("\n")}\n\nWhatsApp: ${waLink}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
}

module.exports = {
  sendAbandonedCartEmail,
};
