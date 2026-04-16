import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Mail,
  Phone,
  MapPin,
  Home,
  Truck,
  User,
  MessageSquare,
  Package,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import type { Order } from "../types";
import { LocalDate } from "@/core/utils/date";

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  getStatusColor: (s: string) => string;
  getStatusText: (s: string) => string;
  getPaymentStatusColor: (s: string) => string;
  getPaymentStatusText: (s: string) => string;
  onUpdatePaymentStatus: (id: string, paymentStatus: string) => void;
  onChangeStatus: (id: string, status: string) => void;
  statusOptions: { value: string; label: string }[];
}

export function OrderDetailsDialog({
  order,
  open,
  onClose,
  getStatusColor,
  getStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
  onUpdatePaymentStatus,
  onChangeStatus,
  statusOptions,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  const total = order.total || order.totalAmount || 0;
  const hasDiscounts = Number(order.total_discount_amount || 0) > 0;
  const hasNotes =
    order.description || order.notes || order.deliveryNotes || order.orderNotes;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="bg-linear-to-r from-gray-900 to-gray-700 text-white px-6 py-5 rounded-t-lg">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Pedido #{order.orderNumber}
                </DialogTitle>
                <p className="text-gray-300 text-sm mt-0.5">
                  {new LocalDate(order.createdAt).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge className={`text-sm px-3 py-1 ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-0.5 border ${getPaymentStatusColor(order.paymentStatus)}`}
                >
                  {getPaymentStatusText(order.paymentStatus)}
                  {order.paidAt && (
                    <span className="ml-1 opacity-70">
                      · {new LocalDate(order.paidAt).toLocaleDateString()}
                    </span>
                  )}
                </Badge>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* ── Acciones operativas ──────────────────────── */}
          {(order.status !== "DELIVERED" && order.status !== "CANCELLED") || (order.paymentStatus !== "PAID" && !order.clientTransactionId) ? (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <span className="text-sm font-medium text-blue-800">Acciones:</span>

              {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                <Select onValueChange={(v) => onChangeStatus(order.id, v)}>
                  <SelectTrigger className="w-44 h-8 text-sm bg-white">
                    <SelectValue placeholder="Cambiar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Cambiar a:</SelectLabel>
                      {statusOptions
                        .filter((o) => o.value !== "ALL" && o.value !== order.status)
                        .map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              {order.paymentStatus !== "PAID" && !order.clientTransactionId && (
                <Button
                  size="sm"
                  className="h-8 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                  onClick={() => onUpdatePaymentStatus(order.id, "PAID")}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Confirmar pago
                </Button>
              )}
            </div>
          ) : null}

          {/* ── Cliente + Entrega ────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Cliente
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {order.customerName} {order.customerLastName}
                  </p>
                  {order.billingContactName &&
                    order.billingContactName !== `${order.customerName} ${order.customerLastName}` && (
                      <p className="text-xs text-gray-500">
                        Contacto: {order.billingContactName}
                      </p>
                    )}
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <InfoRow icon={<Mail className="h-4 w-4" />} value={order.customerEmail} />
                {order.customerPhone && (
                  <InfoRow icon={<Phone className="h-4 w-4" />} value={order.customerPhone} />
                )}
              </div>
            </div>

            {/* Entrega */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Entrega
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                {(order.customerProvince || order.billingCity) && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    value={[order.customerProvince, order.billingCity].filter(Boolean).join(" · ")}
                  />
                )}
                {order.billingPrincipalAddress && (
                  <InfoRow icon={<Home className="h-4 w-4" />} value={order.billingPrincipalAddress} />
                )}
                {order.billingSecondAddress && (
                  <InfoRow icon={<Home className="h-4 w-4 opacity-40" />} value={order.billingSecondAddress} />
                )}
                {order.customerReference && (
                  <InfoRow
                    icon={<span className="text-xs font-bold text-gray-400">Ref</span>}
                    value={order.customerReference}
                  />
                )}
                {order.Courier && (
                  <InfoRow icon={<Truck className="h-4 w-4" />} value={order.Courier} />
                )}
              </div>
            </div>
          </div>

          {/* ── Método de pago ───────────────────────────── */}
          {order.clientTransactionId && (
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Pago con tarjeta (PayPhone)</span>
              {order.payPhoneAuthCode && (
                <span className="ml-auto text-xs text-blue-500 font-mono">
                  Auth: {order.payPhoneAuthCode}
                </span>
              )}
            </div>
          )}

          {/* ── Notas ────────────────────────────────────── */}
          {hasNotes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-yellow-700 uppercase tracking-wider">
                <MessageSquare className="h-4 w-4" />
                Notas
              </h3>
              {order.description && <p className="text-sm text-yellow-900">{order.description}</p>}
              {order.notes && <p className="text-sm text-yellow-900">{order.notes}</p>}
              {order.orderNotes && order.orderNotes !== order.notes && (
                <p className="text-sm text-yellow-900">{order.orderNotes}</p>
              )}
              {order.deliveryNotes && (
                <p className="text-sm text-yellow-900">
                  <span className="font-medium">Entrega: </span>
                  {order.deliveryNotes}
                </p>
              )}
            </div>
          )}

          {/* ── Productos ────────────────────────────────── */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <Package className="h-4 w-4" />
              Productos ({order.orderItems.length})
            </h3>
            <div className="space-y-2">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-white border rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {item.product.name}
                      </span>
                      {item.variantName && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs shrink-0">
                          {item.variantName}
                        </Badge>
                      )}
                      {item.discounts_percents && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs shrink-0">
                          -{item.discounts_percents}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-green-700 text-sm shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Resumen financiero ───────────────────────── */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 space-y-2 text-sm">
              {hasDiscounts && (
                <>
                  <FinRow
                    label="Precio sin descuentos"
                    value={`$${(order.subtotal + Number(order.total_discount_amount || 0)).toFixed(2)}`}
                    muted
                  />
                  {Number(order.product_discounted_amount || 0) > 0 && (
                    <FinRow
                      label={<span className="flex items-center gap-1.5"><Badge className="bg-green-600 text-white text-xs px-1.5">Promoción</Badge></span>}
                      value={`-$${Number(order.product_discounted_amount).toFixed(2)}`}
                      accent="green"
                    />
                  )}
                  {Number(order.coupon_discounted_amount || 0) > 0 && (
                    <FinRow
                      label={
                        <span className="flex items-center gap-1.5">
                          <Badge className="bg-purple-600 text-white text-xs px-1.5">Cupón</Badge>
                          <span className="text-gray-600">{order.couponDiscountCode}</span>
                        </span>
                      }
                      value={`-$${Number(order.coupon_discounted_amount).toFixed(2)}`}
                      accent="purple"
                    />
                  )}
                  {Number(order.code_discounted_amount || 0) > 0 && (
                    <FinRow
                      label={<span className="flex items-center gap-1.5"><Badge className="bg-blue-600 text-white text-xs px-1.5">Código</Badge></span>}
                      value={`-$${Number(order.code_discounted_amount).toFixed(2)}`}
                      accent="blue"
                    />
                  )}
                  <div className="border-t border-dashed border-gray-200 pt-2 mt-1" />
                </>
              )}

              <FinRow label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
              <FinRow label="IVA (15%)" value={`$${order.tax.toFixed(2)}`} />
              {Number(order.shipping || 0) > 0 && (
                <FinRow label="Reserva (envío)" value={`$${Number(order.shipping).toFixed(2)}`} />
              )}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between px-4 py-4 bg-gray-900 text-white">
              <span className="font-bold text-base">Total</span>
              <span className="font-bold text-2xl text-green-400">${total.toFixed(2)}</span>
            </div>

            {/* Contraentrega */}
            {order.cashOnDelivery && (
              <div className="px-4 py-3 bg-amber-50 border-t-2 border-amber-300 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-800">Reserva pagada online</span>
                  <span className="font-semibold text-amber-900">$7.00</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-amber-900">Pendiente al recibir</span>
                  <span className="text-amber-900 text-base">${(total - 7).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Helpers internos ──────────────────────────────────────── */

function InfoRow({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <span className="text-gray-700 leading-snug">{value}</span>
    </div>
  );
}

function FinRow({
  label,
  value,
  muted,
  accent,
}: {
  label: React.ReactNode;
  value: string;
  muted?: boolean;
  accent?: "green" | "purple" | "blue";
}) {
  const valueColor =
    accent === "green"
      ? "text-green-700 font-semibold"
      : accent === "purple"
      ? "text-purple-700 font-semibold"
      : accent === "blue"
      ? "text-blue-700 font-semibold"
      : muted
      ? "text-gray-400 line-through"
      : "text-gray-800";

  return (
    <div className="flex items-center justify-between gap-4">
      <span className={muted ? "text-gray-400" : "text-gray-600"}>{label}</span>
      <span className={valueColor}>{value}</span>
    </div>
  );
}
