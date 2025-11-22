# 📦 Multi-Tenant Vendor Store & Invoice Management SaaS — Requirements

## 1. Project Overview

Build a **multi-tenant SaaS platform** where vendors ("Stores") can manage:

- Physical, digital, and service products
- Stock-tracked SKUs
- Customers (unique within a store)
- Invoices with line items, taxes, discounts, and totals
- HTML & PDF invoice printing

Architecture must support **many stores** using one shared backend (full tenant isolation).

Frontend must include dashboards and CRUD pages for all entities.

---

## 2. Core Features

### 2.1 Stores (Vendors)

Each vendor is a **store** (tenant).

Each store has:
- Products & SKUs
- Customers
- Invoices
- Users (staff/admin/owner)

### 2.2 Customers

- Unique per store, but the same real user may appear across multiple stores
- Basic fields: `name`, `email`, `phone`, `address`, `meta`

### 2.3 Products & SKUs

Products can be:
- `physical`
- `digital`
- `service`

Must support:
- SKUs (variants)
- SKU codes unique per store
- Prices, stock, attributes
- Stored in one shared DB but tenant-filtered

### 2.4 Invoices

Invoice includes:
- **Line items** → SKU snapshot
- Subtotal
- Tax
- Discounts
- Total

Invoice statuses:
- `draft`, `issued`, `paid`, `void`, `refunded`

Must **snapshot** product/SKU details, not use live product references.

### 2.5 Invoice Printing

- Downloadable **PDF**
- Displayable **HTML**

Should include:
- Store header
- Customer details
- Line items
- Summary totals
- Invoice metadata
- Optional QR code

---

## 3. Tech Stack

### Backend

- **Node.js** (latest LTS)
- **Express.js**
- **TypeScript**
- **Mongoose** (MongoDB)
- **pino** or **winston** logger
- **zod** / **yup** for validation
- **JWT** authentication
- **mongoose-paginate-v2** or **aggregatePaginate**
- **puppeteer** or **wkhtmltopdf** (PDF generation)

### Frontend

- **Next.js** (latest)
- **Redux Toolkit**
- **Axios** client wrapper
- **Material UI (MUI)**
- **React Hook Form** + **Yup**

### Infrastructure

- **Docker**
- **MongoDB** (replica set recommended for transactions)
- Optional: **Sentry** for error traces

---

## 4. Backend Architecture

```
/backend
  /src
    /config
    /models
    /repositories
    /services
    /controllers
    /routes
    /middlewares
    /utils
    /types
    server.ts
```

### Layer responsibilities

| Layer | Purpose |
|-------|---------|
| **Models** | Mongoose schemas (typed) |
| **Repositories** | DB access only |
| **Services** | Business logic |
| **Controllers** | HTTP parsing + response |
| **Routes** | Express routing |
| **Middlewares** | auth, error handler, tenant validation |
| **Utils** | logging, pagination, response wrapper |

---

## 5. Multi-Tenant Handling

### 5.1 Tenant Identification

Each request must include:
- `X-Store-Id` header
- **OR**
- JWT containing `storeId`

### 5.2 Tenant Isolation

- Every query must filter by `store: storeId`

### 5.3 Per-store indexing

Use compound indexes like:
```javascript
{ store: 1, sku: 1 }
```

---

## 6. Mongoose Schemas (TypeScript)

### 6.1 Store

```typescript
import { Schema, model, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  slug: string;
  timezone?: string;
  currency: string;
  billing?: { plan: string; limits: any };
  createdAt: Date;
  updatedAt: Date;
  meta?: Record<string, any>;
}

const StoreSchema = new Schema<IStore>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  timezone: { type: String, default: 'UTC' },
  currency: { type: String, default: 'USD' },
  billing: { type: Object, default: {} },
  meta: { type: Object, default: {} }
}, { timestamps: true });

export default model<IStore>('Store', StoreSchema);
```

### 6.2 User

```typescript
export interface IUser extends Document {
  store: Schema.Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'owner'|'admin'|'staff';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['owner','admin','staff'], default: 'admin' }
}, { timestamps: true });

export default model<IUser>('User', UserSchema);
```

### 6.3 Customer

```typescript
export interface ICustomer extends Document {
  store: Schema.Types.ObjectId;
  externalId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: any;
  meta?: any;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  externalId: { type: String, index: true },
  name: { type: String, required: true },
  email: { type: String, index: true },
  phone: { type: String },
  address: { type: Object, default: {} },
  meta: { type: Object, default: {} }
}, { timestamps: true });

export default model<ICustomer>('Customer', CustomerSchema);
```

### 6.4 Product

```typescript
export interface IProduct extends Document {
  store: Schema.Types.ObjectId;
  name: string;
  description?: string;
  type: 'physical'|'digital'|'service';
  taxRate?: number;
  status: 'active'|'inactive';
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['physical','digital','service'], default: 'physical' },
  taxRate: { type: Number, default: 0 },
  status: { type: String, default: 'active' }
}, { timestamps: true });

export default model<IProduct>('Product', ProductSchema);
```

### 6.5 SKU

```typescript
export interface ISKU extends Document {
  product: Schema.Types.ObjectId;
  store: Schema.Types.ObjectId;
  sku: string;
  price: number;
  currency?: string;
  stock?: number;
  attributes?: Record<string,string>;
  createdAt: Date;
}

const SKUSchema = new Schema<ISKU>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  stock: { type: Number, default: null },
  attributes: { type: Object, default: {} }
}, { timestamps: true });

SKUSchema.index({ store: 1, sku: 1 }, { unique: true });

export default model<ISKU>('SKU', SKUSchema);
```

### 6.6 Invoice

```typescript
export interface ILineItem {
  sku: Schema.Types.ObjectId | ISKU;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount?: number;
  total: number;
  meta?: any;
}

export interface IInvoice extends Document {
  store: Schema.Types.ObjectId;
  invoiceNumber: string;
  customer: Schema.Types.ObjectId;
  billingAddress?: any;
  shippingAddress?: any;
  currency: string;
  status: 'draft'|'issued'|'paid'|'void'|'refunded';
  lineItems: ILineItem[];
  subTotal: number;
  totalTax: number;
  totalDiscount: number;
  shippingAmount?: number;
  adjustments?: number;
  total: number;
  payments?: any[];
  issuedAt?: Date;
  dueAt?: Date;
  createdBy?: Schema.Types.ObjectId;
  meta?: any;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  invoiceNumber: { type: String, required: true, index: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  billingAddress: { type: Object, default: {} },
  shippingAddress: { type: Object, default: {} },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['draft','issued','paid','void','refunded'], default: 'draft' },
  lineItems: { type: Array, default: [] },
  subTotal: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  shippingAmount: { type: Number, default: 0 },
  adjustments: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payments: { type: Array, default: [] },
  issuedAt: { type: Date },
  dueAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  meta: { type: Object, default: {} }
}, { timestamps: true });

InvoiceSchema.index({ store: 1, invoiceNumber: 1 }, { unique: true });

export default model<IInvoice>('Invoice', InvoiceSchema);
```

---

## 7. Invoice Financial Rules

### 7.1 Snapshot model

On invoice creation:
- Fetch SKU
- Snapshot price, product title, attributes
- Do **NOT** read live values later

### 7.2 Calculations

```javascript
// Line item calculations
lineSubtotal = qty * unitPrice
taxAmount = lineSubtotal * (taxRate/100)
lineTotal = lineSubtotal + taxAmount - discountAmount

// Invoice totals
invoice.subTotal = sum(lineSubtotal)
invoice.totalTax = sum(taxAmount)
invoice.totalDiscount = sum(discountAmount)
invoice.total = subTotal + totalTax + shipping + adjustments - totalDiscount
```

### 7.3 Stock Handling

- **Digital products**: no stock change
- **Physical**: decrement stock on `issue` → `paid`

---

## 8. API Design

### 8.1 Response Format (consistent everywhere)

#### Success (non-paginated)

```json
{
  "success": true,
  "code": "S200",
  "data": {...},
  "meta": null,
  "errors": null
}
```

#### Success (paginated)

```json
{
  "success": true,
  "code": "S200",
  "data": [...],
  "meta": {
    "pagination": {
      "totalDocs": 120,
      "limit": 25,
      "page": 1,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "query": {...}
  },
  "errors": null
}
```

#### Error

```json
{
  "success": false,
  "code": "E400",
  "data": null,
  "meta": null,
  "errors": [
    { "field": "email", "message": "Email already exists" }
  ]
}
```

### 8.2 Pagination Params

```
?page=1
&limit=25
&sort=-createdAt
&q=searchTerm
&status=active
```

### 8.3 Key Endpoints

#### Stores

- `POST /api/stores`
- `GET /api/stores/:id`
- `GET /api/stores`

#### Products / SKUs

- `POST /api/stores/:storeId/products`
- `GET /api/stores/:storeId/products`
- `POST /api/stores/:storeId/products/:id/skus`
- `GET /api/stores/:storeId/skus/:skuId`

#### Customers

- `POST /api/stores/:storeId/customers`
- `GET /api/stores/:storeId/customers`

#### Invoices

- `POST /api/stores/:storeId/invoices`
- `GET /api/stores/:storeId/invoices`
- `GET /api/stores/:storeId/invoices/:id`
- `POST /api/stores/:storeId/invoices/:id/issue`
- `POST /api/stores/:storeId/invoices/:id/pay`
- `GET /api/stores/:storeId/invoices/:id/print?format=html|pdf`

#### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`

---

## 9. Middlewares

Required middlewares:

1. **Auth (JWT)**
2. **Tenant validation** (`storeId` required)
3. **Request logger** (pino)
4. **Error handler** → convert to `E400`, `E401`, etc.

---

## 10. Logging

Use **pino** with fields:

- `requestId`
- `userId`
- `storeId`
- `route`
- `method`
- `durationMs`

---

## 11. Invoice Print Requirements

### HTML Template Must Include:

- Store header (logo optional)
- Invoice metadata (number, date, status)
- Customer billing / shipping
- Item table
- Totals summary
- Footer (terms/notes)

### PDF Generation

- Use **puppeteer** (recommended)
- A4 layout
- Download filename: `invoice-<invoiceNumber>.pdf`

---

## 12. Frontend Requirements

### Framework

- **Next.js** (latest, App Router)
- **Redux Toolkit**
- **Axios** client wrapper
- **MUI** components

### Pages Needed

- Store Dashboard
- Product List / Create / Edit
- SKU Manager
- Customer List / Create
- Invoice Builder
- Invoice View / Print HTML Preview

### Tables

- Use **MUI DataGrid** with server-side pagination

### Forms

- **React Hook Form** + **Yup**

---

## 13. Security Requirements

- JWT-based authentication
- Each request must validate `storeId`
- Must **not** allow cross-store queries
- Input validation on all endpoints
- Rate-limiting for auth endpoints

---

## 14. Testing Requirements

### Backend:

- **Jest** unit tests for services
- **Supertest** integration tests for endpoints

### Frontend:

- Component tests (**React Testing Library**)
- API call mocks

---

## 15. Deployment Requirements

- **Dockerfile** for backend
- **Dockerfile** for frontend
- **docker-compose** for local dev (backend + frontend + mongodb)

### Env files:

- Database URL
- JWT secret
- CORS origin
- PDF engine settings

---

## 16. Sample Data Seeder

Seeder must:

1. Create 1 demo store
2. Create 2 users
3. Create 3 products + SKUs
4. Create 5 customers
5. Create 2 invoices

---

## 17. Acceptance Criteria

### Functionality

- ✅ Multi-tenant working correctly
- ✅ Users cannot see other stores' data
- ✅ Invoice snapshot logic correct
- ✅ Stock decrements for physical products
- ✅ Invoice totals math is correct
- ✅ PDF downloads properly
- ✅ CRUD works for all entities

### Code Quality

- ✅ Strict TypeScript
- ✅ Folder structure matches spec
- ✅ Repositories isolate DB logic
- ✅ Services contain complex logic
- ✅ Controllers are thin

### Frontend

- ✅ All pages implemented
- ✅ Tables show pagination properly
- ✅ Invoice builder works with live calculations

---

## 18. Invoice Creation Flow (Pseudocode)

```javascript
// 1. Validate payload
// 2. For each line: fetch SKU, snapshot unitPrice, taxRate, title
// 3. Compute line totals:
//    taxAmount = (unitPrice * qty) * taxRate/100
//    discountAmount = compute from percent/absolute
//    lineTotal = unitPrice*qty + taxAmount - discountAmount
// 4. subTotal = sum(unitPrice*qty)
//    totalTax = sum(taxAmount)
//    totalDiscount = sum(discountAmount)
//    total = subTotal + totalTax + shipping + adjustments - totalDiscount
// 5. Save invoice document (transactions if physical stock changes)
// 6. Return created invoice with 201 + standardized response
```

---

## 19. Developer Commands

```bash
# Backend
cd backend
pnpm install
pnpm dev            # ts-node-dev server
pnpm build
pnpm start

# Frontend
cd frontend
pnpm install
pnpm dev
pnpm build
pnpm start

# Docker local
docker-compose up --build
```

---

## 20. Deliverables

The agent must produce:

1. ✅ Full backend scaffold (models/services/repositories/controllers/routes)
2. ✅ Standardized response util, logger, and error middleware
3. ✅ Invoice print HTML template + PDF generation code
4. ✅ Frontend scaffold (Next app with example pages and RTK slices)
5. ✅ Seeder script + OpenAPI / Postman collection
6. ✅ README with developer run steps and env variables

---

## 21. Implementation Notes

- Use **TypeScript** everywhere; export typed DTOs for controllers
- Keep repository layer thin; business logic belongs to services
- Avoid using `populate` for calculation-critical fields — use snapshots
- Use **transactions** for multi-document operations (e.g., decrementing stock + creating invoice) — require MongoDB replica set in prod
- Provide migration scripts for schema changes (use `migrate-mongo` or similar)

---

**End of Requirements Document**

This file is ready to be used with Antigravity or any AI agent for full implementation of the multi-tenant SaaS platform.