export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  | "REVIEW";

export type PaymentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REFUNDED"
  | "CANCELLED"
  | "REVIEW";

export interface ProductMediaDto {
  url: string;
  alt: string;
  provisional: boolean;
}

export interface ProductVariantDto {
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  available: boolean;
  availableQuantity: number;
}

export interface ProductDto {
  id: string;
  slug: string;
  baseSku: string;
  name: string;
  subtitle: string;
  description: string;
  priceClp: number;
  compareAtClp: number | null;
  featured: boolean;
  collection: { slug: string; name: string } | null;
  media: ProductMediaDto[];
  variants: ProductVariantDto[];
}

export interface CheckoutLineInput {
  sku: string;
  quantity: number;
}

export interface CheckoutCustomerInput {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CheckoutShippingInput {
  zoneCode: string;
  addressLine1: string;
  addressLine2?: string;
  commune: string;
  region: string;
  postalCode?: string;
  instructions?: string;
}

export interface CheckoutInput {
  items: CheckoutLineInput[];
  customer: CheckoutCustomerInput;
  shipping: CheckoutShippingInput;
}

export interface CheckoutResult {
  orderId: string;
  orderToken: string;
  checkoutUrl: string;
  expiresAt: string;
  totals: {
    subtotalClp: number;
    shippingClp: number;
    totalClp: number;
    currency: "CLP";
  };
}

export interface OrderStatusDto {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalClp: number;
  currency: "CLP";
  createdAt: string;
  updatedAt: string;
}

export interface MercadoPagoPayment {
  id: string;
  externalReference: string;
  status: string;
  amountClp: number;
  currency: string;
}
