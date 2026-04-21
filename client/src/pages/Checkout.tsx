import React, { useEffect, useRef, useState } from "react";
import {
  ShoppingBag,
  ChevronLeft,
  CreditCard,
  Truck,
  User,
  CheckCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useCompany } from "@/hooks/useCompany";

import { CartDialog } from "@/components/CartDialog";
import { Seo } from "@/components/Seo";

const SECTORS = [
  { name: "Norte (Urdesa, Alborada, Sauces)", price: 0 },
  { name: "Centro / Sur", price: 3 },
  { name: "Ceibos / Los Olivos", price: 4 },
  { name: "Vía a la Costa", price: 5 },
  { name: "Samborondón / Vía a Salitre", price: 5 },
  { name: "Durán", price: 6 },
];

type OrderStatus = "idle" | "loading" | "success" | "error";

export default function Checkout() {
  const { items, cartTotal, clearCart, setIsCartOpen } = useCart();
  const [, setLocation] = useLocation();
  const { data: company } = useCompany();
  const [paymentMethod, setPaymentMethod] = useState("Transferencia");
  const [sector, setSector] = useState(SECTORS[0]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    percent_value: number;
    amount: number | null;
    type: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofMessage, setProofMessage] = useState("");
  const payphoneBoxStorageKey = "pp_box_payload";
  const transferInstructions =
    company?.settings?.paymentSettings?.transferInstructions ||
    "Banco: Banco del Pichincha\nCuenta: 2205748975\nTitular: DIFIORI";

  const receiverNameRef = useRef<HTMLInputElement>(null);
  const senderNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const dateTimeRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cardMessageRef = useRef<HTMLTextAreaElement>(null);

  const abandonmentSent = useRef(false);

  useEffect(() => {
    const handleAbandonment = () => {
      if (abandonmentSent.current || orderStatus === "success" || items.length === 0) return;

      const customerName = senderNameRef.current?.value;
      const phone = phoneRef.current?.value;
      const receiverName = receiverNameRef.current?.value;
      const deliveryDateTime = dateTimeRef.current?.value;
      const exactAddress = addressRef.current?.value;
      const cardMessage = cardMessageRef.current?.value;

      if (customerName || phone) {
        fetch("/api/external/store-orders/abandoned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: customerName || "Cliente anónimo",
            phone: phone || "No proporcionado",
            senderName: customerName || "",
            receiverName: receiverName || "",
            exactAddress: exactAddress || "",
            sector: sector.name,
            paymentMethod,
            deliveryDateTime: deliveryDateTime || "",
            cardMessage: cardMessage || "",
            couponCode: appliedCoupon?.code || "",
            abandonedAt: new Date().toISOString(),
            source: "CHECKOUT_WEB",
            items,
            total:
              cartTotal +
              sector.price -
              (appliedCoupon
                ? appliedCoupon.type === "PERCENTAGE"
                  ? cartTotal * appliedCoupon.percent_value
                  : appliedCoupon.amount || 0
                : 0),
          }),
          keepalive: true,
        });
        abandonmentSent.current = true;
      }
    };

    const timer = setTimeout(handleAbandonment, 120000);
    window.addEventListener("beforeunload", handleAbandonment);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", handleAbandonment);
    };
  }, [items, orderStatus, sector.name, paymentMethod, appliedCoupon, cartTotal]);

  const cartSubtotal = cartTotal;
  const shippingCost = sector.price;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = cartSubtotal * appliedCoupon.percent_value;
    } else if (appliedCoupon.amount) {
      discountAmount = appliedCoupon.amount;
    }
  }

  const finalTotal = cartSubtotal + shippingCost - discountAmount;

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/checkout/get-coupon-discount?code=${couponCode}`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        const coupon = data.data;
        if (coupon.minAmount && cartSubtotal < coupon.minAmount) {
          setErrorMsg(`El cupón requiere una compra mínima de $${coupon.minAmount}`);
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(coupon);
        }
      } else {
        setErrorMsg(data.message || "Cupón no válido");
        setAppliedCoupon(null);
      }
    } catch {
      setErrorMsg("Error al validar el cupón");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleConfirmOrder = async () => {
    const receiverName = receiverNameRef.current?.value || "";
    const senderName = senderNameRef.current?.value || "";
    const phone = phoneRef.current?.value || "";
    const deliveryDateTime = dateTimeRef.current?.value || "";
    const exactAddress = addressRef.current?.value || "";
    const cardMessage = cardMessageRef.current?.value || "";

    if (!receiverName || !senderName || !phone) {
      setErrorMsg("Por favor completa: nombre de quien recibe, quien envía y celular.");
      return;
    }

    setErrorMsg("");
    setOrderStatus("loading");
    abandonmentSent.current = true;

    const firstItem = items[0];
    const orderPayload = {
      productId: firstItem?.product.id,
      productName: firstItem?.product.name,
      productPrice: firstItem?.product.price,
      quantity: firstItem?.quantity || 1,
      receiverName,
      senderName,
      phone,
      deliveryDateTime,
      exactAddress,
      sector: sector.name,
      shippingCost: sector.price,
      cardMessage,
      total: cartSubtotal + shippingCost,
      couponCode: appliedCoupon?.code || null,
    };

    try {
      if (paymentMethod === "Tarjeta") {
        localStorage.setItem(
          payphoneBoxStorageKey,
          JSON.stringify({
            ...orderPayload,
            callbackUrl: `${window.location.origin}/payment-result`,
            cancellationUrl: `${window.location.origin}/checkout`,
          }),
        );
        setLocation("/payment-gateway");
        return;
      }

      const res = await fetch("/api/external/store-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderPayload, paymentMethod }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        setOrderNumber(data.data?.orderNumber || "DIFIORI-OK");
        setOrderStatus("success");
        clearCart();
      } else {
        setErrorMsg(data.message || "Hubo un error al procesar tu orden. Contáctanos por WhatsApp.");
        setOrderStatus("error");
        abandonmentSent.current = false;
      }
    } catch {
      setErrorMsg("No se pudo conectar con el servidor. Contáctanos por WhatsApp.");
      setOrderStatus("error");
      abandonmentSent.current = false;
    }
  };

  const uploadPaymentProof = async () => {
    if (!orderNumber || !selectedProofFile) {
      setProofMessage("Selecciona una imagen del comprobante antes de subir.");
      return;
    }

    setIsUploadingProof(true);
    setProofMessage("");

    try {
      const dataUrl = await readFileAsDataUrl(selectedProofFile);
      const response = await fetch(`/api/external/store-orders/${encodeURIComponent(orderNumber)}/payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedProofFile.name,
          mimeType: selectedProofFile.type,
          dataUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "No se pudo subir el comprobante");
      }

      setProofMessage("Comprobante subido. El equipo lo revisará desde el admin.");
      setSelectedProofFile(null);
    } catch (error) {
      setProofMessage(error instanceof Error ? error.message : "No se pudo subir el comprobante");
    } finally {
      setIsUploadingProof(false);
    }
  };

  if (orderStatus === "success") {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f6eef8_0%,#efe3f3_45%,#e6d6ec_100%)] flex items-center justify-center px-6">
        <Seo
          title="Checkout | DIFIORI"
          description="Proceso de checkout de DIFIORI."
          path="/checkout"
          robots="noindex, nofollow"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#2A1B38]/80 backdrop-blur-3xl p-14 rounded-[3rem] shadow-2xl border-2 border-[#5A3F73]/40 text-center max-w-lg w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-serif font-bold text-[#E6E6E6] mb-3">¡Orden confirmada!</h2>
          <p className="text-[#5A3F73] font-black text-lg mb-2">{orderNumber}</p>
          <p className="text-[#E6E6E6]/60 text-sm mb-8">
            Hemos recibido tu pedido. Nuestro equipo se pondrá en contacto contigo pronto para coordinar la entrega.
          </p>
          {paymentMethod === "Transferencia" && (
            <div className="bg-[#5A3F73]/20 border border-dashed border-[#5A3F73] rounded-2xl p-6 mb-8 text-left">
              <p className="text-[#E6E6E6]/80 text-sm font-bold mb-2">Instrucciones de transferencia:</p>
              <pre className="whitespace-pre-wrap text-[#E6E6E6]/60 text-xs font-sans">{transferInstructions}</pre>
              <p className="text-[#E6E6E6]/60 text-xs mt-4 mb-2">
                Sube aquí tu comprobante para que aparezca en el panel admin:
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedProofFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-[#E6E6E6]/70 file:mr-3 file:rounded-xl file:border-0 file:bg-[#5A3F73] file:px-4 file:py-2 file:text-white"
              />
              <button
                onClick={uploadPaymentProof}
                disabled={!selectedProofFile || isUploadingProof}
                className="mt-4 w-full bg-[#5A3F73] hover:bg-[#4A3362] disabled:opacity-50 text-white py-3 rounded-2xl font-black text-sm transition-all"
              >
                {isUploadingProof ? "Subiendo comprobante..." : "Subir comprobante"}
              </button>
              {proofMessage && <p className="text-[#E6E6E6]/70 text-xs mt-3">{proofMessage}</p>}
            </div>
          )}
          <Link href="/">
            <button className="w-full bg-[#5A3F73] hover:bg-[#4A3362] text-white py-5 rounded-3xl font-black text-base transition-all shadow-xl">
              Volver a la tienda
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-shell min-h-screen bg-[radial-gradient(circle_at_top,#faf3fb_0%,#f3e8f5_42%,#e9dced_100%)] pt-32 pb-20 px-6">
      <Seo
        title="Checkout | DIFIORI"
        description="Proceso de checkout de DIFIORI."
        path="/checkout"
        robots="noindex, nofollow"
      />
      <CartDialog />
      <div className="container relative mx-auto max-w-5xl">
        <div className="mb-16 flex flex-col items-center text-center">
          <Link
            href="/#catalogo"
            className="group mb-6 inline-flex items-center gap-2 font-bold text-[#6B5487] transition-colors hover:text-[#4A3362]"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:translate-x-[-5px]" />
            Seguir comprando
          </Link>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="checkout-panel relative cursor-pointer rounded-[3.5rem] border-2 px-12 py-8 flex flex-col items-center group"
          >
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-[#B58CCC] to-transparent opacity-70" />
            <ShoppingBag className="mb-4 h-12 w-12 text-[#5A3F73] transition-transform group-hover:scale-110" />
            <h2 className="mb-1 text-3xl font-serif font-bold text-[#4A3362]">
              {items.length === 0
                ? "Tu carrito está vacío"
                : `Tienes ${items.length} ${items.length === 1 ? "producto" : "productos"}`}
            </h2>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#7A5B93]">
              Haz clic para ver/cambiar tu pedido <ArrowRight className="h-3 w-3" />
            </p>
            {items.length > 0 && (
              <div className="absolute right-8 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-[#5A3F73] text-[10px] font-black text-white shadow-lg">
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </div>
            )}
          </motion.div>
        </div>

        <div className="flex flex-col gap-16 lg:flex-row">
          <div className="flex-1 space-y-10">
            <div className="checkout-panel rounded-[3rem] p-10 space-y-8">
              <h3 className="flex items-center gap-3 text-xl font-bold text-[#5A3F73]">
                <User className="h-6 w-6" /> DATOS DE ENTREGA
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <input
                  ref={receiverNameRef}
                  className="checkout-input"
                  placeholder="Nombre de quien RECIBE *"
                />
                <input
                  ref={senderNameRef}
                  className="checkout-input"
                  placeholder="Nombre de quien ENVÍA *"
                />
                <input
                  ref={phoneRef}
                  type="tel"
                  className="checkout-input"
                  placeholder="Celular (Para confirmaciones) *"
                />
                <input
                  ref={dateTimeRef}
                  type="datetime-local"
                  className="checkout-input [color-scheme:light]"
                />
                <input
                  ref={addressRef}
                  className="checkout-input md:col-span-2"
                  placeholder="Dirección exacta (Ciudadela, Manzana, Villa)..."
                />
              </div>
              <textarea
                ref={cardMessageRef}
                className="checkout-input h-32 resize-none"
                placeholder="Mensaje para la tarjeta (Opcional)..."
              />
            </div>

            <div className="checkout-panel rounded-[3rem] p-10 space-y-8">
              <h3 className="flex items-center gap-3 text-xl font-bold text-[#5A3F73]">
                <CreditCard className="h-6 w-6" /> MÉTODO DE PAGO
              </h3>
              <div className="flex gap-4">
                {[
                  { label: "Transferencia", icon: "🏦" },
                  { label: "Tarjeta", icon: "💳" },
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPaymentMethod(p.label)}
                    className={cn(
                      "flex-1 rounded-2xl border p-6 text-sm font-bold transition-all flex flex-col items-center gap-2",
                      paymentMethod === p.label
                        ? "scale-105 border-[#5A3F73] bg-[#5A3F73] text-white shadow-lg"
                        : "border-[#CDAFDE]/50 bg-white/55 text-[#6B5487] hover:bg-[#F0E2F7] hover:text-[#4A3362]",
                    )}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {paymentMethod === "Transferencia" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="checkout-subpanel rounded-2xl border border-dashed border-[#B58CCC] p-8">
                      <p className="mb-4 text-sm font-bold text-[#4A3362]">Datos para la transferencia:</p>
                      <pre className="whitespace-pre-wrap font-sans text-sm text-[#6B5487]">{transferInstructions}</pre>
                      <p className="mt-4 text-xs text-[#6B5487]/80">
                        Después de confirmar podrás subir el comprobante y quedará visible en el admin.
                      </p>
                    </div>
                  </motion.div>
                )}
                {paymentMethod === "Tarjeta" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="checkout-subpanel flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#B58CCC] p-8 text-center">
                      <CreditCard className="mb-3 h-8 w-8 text-[#5A3F73]" />
                      <span className="mb-1 text-sm font-bold text-[#4A3362]">Pago seguro con PayPhone</span>
                      <span className="text-xs text-[#6B5487]/80">
                        Al confirmar serás redirigido a la pasarela de pago para ingresar los datos de tu tarjeta
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <aside className="lg:w-[400px]">
            <div className="checkout-panel sticky top-32 rounded-[3rem] border-2 p-10">
              <h3 className="mb-8 flex items-center gap-3 text-2xl font-serif font-bold text-[#4A3362] underline decoration-[#B58CCC] decoration-4">
                <ShoppingBag className="h-6 w-6" /> RESUMEN
              </h3>

              <div className="custom-scrollbar mb-10 max-h-[400px] space-y-6 overflow-auto pr-2">
                {items.length === 0 ? (
                  <p className="py-4 text-center text-sm text-[#6B5487]/70">Tu carrito está vacío.</p>
                ) : (
                  items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-[1.75rem] border border-white/50 bg-white/45 p-3 shadow-[0_12px_28px_rgba(90,63,115,0.08)]"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#DCC5E8] shadow-lg">
                        <img src={item.product.image} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold leading-tight text-[#4A3362]">{item.product.name}</h4>
                        <p className="mt-1 text-sm font-black text-[#5A3F73]">{item.product.price}</p>
                        <p className="mt-1 text-[9px] font-bold uppercase text-[#8D73A6]">Cant: {item.quantity}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="checkout-subpanel relative mb-6 rounded-2xl p-5">
                <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-[#6B5487]">
                  Zona de entrega
                </label>
                <div className="relative">
                  <select
                    value={sector.name}
                    onChange={(e) => setSector(SECTORS.find((s) => s.name === e.target.value) || SECTORS[0])}
                    className="checkout-input cursor-pointer appearance-none pr-12 text-sm font-bold"
                  >
                    {SECTORS.map((s) => (
                      <option key={s.name} value={s.name} className="bg-[#2A1B38] text-white">
                        {s.name} {s.price > 0 ? `(+$${s.price.toFixed(2)})` : "(Gratis)"}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronLeft className="-rotate-90 h-4 w-4 text-[#8D73A6]" />
                  </div>
                </div>
              </div>

              <div className="checkout-subpanel mb-6 rounded-2xl p-5">
                <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-[#6B5487]">
                  ¿Tienes un cupón?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="CÓDIGO"
                    disabled={!!appliedCoupon}
                    className="checkout-input flex-1 px-4 py-3 text-xs font-bold uppercase"
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                      }}
                      className="rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400"
                    >
                      QUITAR
                    </button>
                  ) : (
                    <button
                      onClick={handleValidateCoupon}
                      disabled={isValidatingCoupon || !couponCode}
                      className="rounded-xl bg-[#5A3F73] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#5A3F73]/20 disabled:opacity-50"
                    >
                      {isValidatingCoupon ? "..." : "APLICAR"}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="mt-2 text-[10px] font-bold uppercase text-green-500">Cupón aplicado con éxito</p>
                )}
              </div>

              <div className="space-y-4 border-t border-[#CDAFDE]/50 pt-6">
                <div className="flex justify-between text-sm font-medium text-[#6B5487]">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-[#6B5487]">
                  <span className="max-w-[200px] truncate">Envío ({sector.name.split(" ")[0]})</span>
                  <span className="text-[#5A3F73]">
                    {sector.price === 0 ? "GRATIS" : `+$${sector.price.toFixed(2)}`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-green-500">
                    <span>
                      Descuento {appliedCoupon?.type === "PERCENTAGE" ? `(${appliedCoupon.percent_value * 100}%)` : ""}
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#CDAFDE]/50 pt-4 text-2xl font-black text-[#4A3362]">
                  <span className="font-serif">TOTAL</span>
                  <span className="text-[#5A3F73]">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-xs font-bold text-red-400"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                onClick={handleConfirmOrder}
                disabled={items.length === 0 || orderStatus === "loading"}
                className="mt-10 flex w-full items-center justify-center gap-3 rounded-3xl border border-white/30 bg-[#5A3F73] py-6 text-lg font-black text-white shadow-xl shadow-[#5A3F73]/25 transition-all active:scale-95 hover:bg-[#4A3362] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {orderStatus === "loading" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  `PAGAR $${finalTotal.toFixed(2)}`
                )}
              </button>
              <p className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-[#8D73A6]">
                <Truck className="h-3 w-3" /> Entrega hoy garantizada
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
    reader.readAsDataURL(file);
  });
}
