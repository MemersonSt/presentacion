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
  CheckCircle,
  CreditCard,
  Home,
  Image,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Truck,
  User,
  XCircle,
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
  onUpdatePaymentProof: (
    id: string,
    paymentProofStatus: string,
    paymentVerificationNotes?: string,
  ) => void;
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
  onUpdatePaymentProof,
  onChangeStatus,
  statusOptions,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  const total = order.total || order.totalAmount || 0;
  const hasDiscounts = Number(order.total_discount_amount || 0) > 0;
  const hasNotes =
    order.description || order.notes || order.deliveryNotes || order.orderNotes;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
        <div className="rounded-t-lg bg-linear-to-r from-gray-900 to-gray-700 px-6 py-5 text-white">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Pedido #{order.orderNumber}
                </DialogTitle>
                <p className="mt-0.5 text-sm text-gray-300">
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
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Badge className={`px-3 py-1 text-sm ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={`border px-2 py-0.5 text-xs ${getPaymentStatusColor(order.paymentStatus)}`}
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

        <div className="space-y-5 p-6">
          {((order.status !== "DELIVERED" && order.status !== "CANCELLED") ||
            (order.paymentStatus !== "PAID" && !order.clientTransactionId)) && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <span className="text-sm font-medium text-blue-800">Acciones:</span>

              {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                <Select onValueChange={(value) => onChangeStatus(order.id, value)}>
                  <SelectTrigger className="h-8 w-44 bg-white text-sm">
                    <SelectValue placeholder="Cambiar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Cambiar a:</SelectLabel>
                      {statusOptions
                        .filter((option) => option.value !== "ALL" && option.value !== order.status)
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              {order.paymentStatus !== "PAID" && !order.clientTransactionId && (
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => onUpdatePaymentStatus(order.id, "PAID")}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Confirmar pago
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-xl bg-gray-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Cliente
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
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

            <div className="space-y-3 rounded-xl bg-gray-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
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

          {order.clientTransactionId && (
            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Pago con tarjeta (PayPhone)</span>
              {order.payPhoneAuthCode && (
                <span className="ml-auto font-mono text-xs text-blue-500">
                  Auth: {order.payPhoneAuthCode}
                </span>
              )}
            </div>
          )}

          {order.paymentProofImageUrl && (
            <div className="space-y-4 rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <Image className="h-4 w-4" />
                    Comprobante de pago
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Estado: <span className="font-medium">{order.paymentProofStatus || "PENDING"}</span>
                    {order.paymentProofUploadedAt && (
                      <span className="ml-2 text-gray-400">
                        · subido {new LocalDate(order.paymentProofUploadedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => onUpdatePaymentProof(order.id, "VERIFIED")}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Verificar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => onUpdatePaymentProof(order.id, "REJECTED")}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              </div>

              <a
                href={order.paymentProofImageUrl}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl border bg-gray-50"
              >
                <img
                  src={order.paymentProofImageUrl}
                  alt={order.paymentProofFileName || "Comprobante"}
                  className="max-h-[420px] w-full object-contain bg-white"
                />
              </a>

              {order.paymentVerificationNotes && (
                <p className="text-sm text-gray-600">
                  Observación: {order.paymentVerificationNotes}
                </p>
              )}
            </div>
          )}

          {hasNotes && (
            <div className="space-y-2 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-700">
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

          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Package className="h-4 w-4" />
              Productos ({order.orderItems.length})
            </h3>
            <div className="space-y-2">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {item.product.name}
                      </span>
                      {item.variantName && (
                        <Badge variant="outline" className="shrink-0 border-blue-200 bg-blue-50 text-xs text-blue-700">
                          {item.variantName}
                        </Badge>
                      )}
                      {item.discounts_percents && (
                        <Badge variant="outline" className="shrink-0 border-orange-200 bg-orange-50 text-xs text-orange-700">
                          -{item.discounts_percents}%
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-green-700">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-gray-50">
            <div className="space-y-2 px-4 py-3 text-sm">
              {hasDiscounts && (
                <>
                  <FinRow
                    label="Precio sin descuentos"
                    value={`$${(order.subtotal + Number(order.total_discount_amount || 0)).toFixed(2)}`}
                    muted
                  />
                  {Number(order.product_discounted_amount || 0) > 0 && (
                    <FinRow
                      label={
                        <span className="flex items-center gap-1.5">
                          <Badge className="bg-green-600 px-1.5 text-xs text-white">Promocion</Badge>
                        </span>
                      }
                      value={`-$${Number(order.product_discounted_amount).toFixed(2)}`}
                      accent="green"
                    />
                  )}
                  {Number(order.coupon_discounted_amount || 0) > 0 && (
                    <FinRow
                      label={
                        <span className="flex items-center gap-1.5">
                          <Badge className="bg-purple-600 px-1.5 text-xs text-white">Cupon</Badge>
                          <span className="text-gray-600">{order.couponDiscountCode}</span>
                        </span>
                      }
                      value={`-$${Number(order.coupon_discounted_amount).toFixed(2)}`}
                      accent="purple"
                    />
                  )}
                  {Number(order.code_discounted_amount || 0) > 0 && (
                    <FinRow
                      label={
                        <span className="flex items-center gap-1.5">
                          <Badge className="bg-blue-600 px-1.5 text-xs text-white">Codigo</Badge>
                        </span>
                      }
                      value={`-$${Number(order.code_discounted_amount).toFixed(2)}`}
                      accent="blue"
                    />
                  )}
                  <div className="mt-1 border-t border-dashed border-gray-200 pt-2" />
                </>
              )}

              <FinRow label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
              <FinRow label="IVA (15%)" value={`$${order.tax.toFixed(2)}`} />
              {Number(order.shipping || 0) > 0 && (
                <FinRow label="Reserva (envio)" value={`$${Number(order.shipping).toFixed(2)}`} />
              )}
            </div>

            <div className="flex items-center justify-between bg-gray-900 px-4 py-4 text-white">
              <span className="text-base font-bold">Total</span>
              <span className="text-2xl font-bold text-green-400">${total.toFixed(2)}</span>
            </div>

            {order.cashOnDelivery && (
              <div className="space-y-1 border-t-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-800">Reserva pagada online</span>
                  <span className="font-semibold text-amber-900">$7.00</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-amber-900">Pendiente al recibir</span>
                  <span className="text-base text-amber-900">${(total - 7).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
      <span className="leading-snug text-gray-700">{value}</span>
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
