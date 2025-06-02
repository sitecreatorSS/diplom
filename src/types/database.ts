export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER';

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string | null;
  password: string;
  role: UserRole;
  image: string | null;
  emailVerified: Date | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
}

export interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string | null;
  sellerId: string;
  specifications: Record<string, any>;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isArchived?: boolean;
  tags?: string[];
  sku?: string | null;
  weight?: number | null;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
}

export interface CartItem extends BaseEntity {
  userId: string;
  productId: string;
  quantity: number;
  priceAtAddition: number;
}

export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PAYMENT_RECEIVED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order extends BaseEntity {
  userId: string;
  total: number;
  status: OrderStatus;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    address2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
    email: string;
  };
  billingAddress?: {
    sameAsShipping: boolean;
    firstName?: string;
    lastName?: string;
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  paymentMethod: string;
  paymentId?: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentDetails?: Record<string, any>;
  shippingMethod?: string;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  customerNote?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface OrderItem extends BaseEntity {
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  variantId?: string;
  variantName?: string;
  sku?: string;
}

export interface Review extends BaseEntity {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  isFeatured: boolean;
  helpfulCount: number;
  response?: string;
  responseDate?: Date;
}

export interface WishlistItem extends BaseEntity {
  userId: string;
  productId: string;
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string;
  isFeatured: boolean;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface Tag extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductTag {
  productId: string;
  tagId: string;
  createdAt: Date;
}

export interface SellerApplication extends BaseEntity {
  userId: string;
  companyName: string;
  companyDescription: string;
  taxId?: string;
  website?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  processedById?: string | null;
  processedAt?: Date | null;
  metadata?: Record<string, any>;
}

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
  readAt?: Date | null;
}

export interface AuditLog extends BaseEntity {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
