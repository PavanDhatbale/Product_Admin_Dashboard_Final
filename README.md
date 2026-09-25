# Product Admin Dashboard — Nexgenesis Technologies Frontend Assignment

A modern, production-grade Product Admin Dashboard built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

---

## Technical Implementations

### 1. Category Filtering Implementation
* Categories are dynamically fetched from `GET https://dummyjson.com/products/categories` upon component mount using `productService.getCategories()`.
* Category lists are normalized to handle both string array and object array data structures (`{ slug, name }`).
* Selecting a category updates the URL query string (`?category=beauty`) and immediately resets pagination to `page=1`.
* Selecting "All Categories" cleanly deletes the `category` query parameter from the URL.

### 2. Sorting Implementation
* Supports 6 sorting permutations across 3 fields:
  * **Price**: Low to High (`sortBy=price&order=asc`), High to Low (`sortBy=price&order=desc`)
  * **Rating**: Low to High (`sortBy=rating&order=asc`), High to Low (`sortBy=rating&order=desc`)
  * **Title**: A to Z (`sortBy=title&order=asc`), Z to A (`sortBy=title&order=desc`)
* Selecting "Default Sorting" deletes both `sortBy` and `order` parameters from the URL.
* Sorting works across all modes: normal catalog, category filtered results, and global search results.

### 3. URL State Management
* The browser URL is the **authoritative single source of truth** for all dashboard view states:
  * `page`, `limit`, `search`, `category`, `sortBy`, `order`
* Built via the custom hook `useUrlParams()`, which performs defensive sanitization:
  * Malformed values such as `?page=abc`, `?sortBy=unknown`, or `?order=invalid` automatically fall back to safe defaults without crashing.
  * Preserves unrelated query parameters when any filter, sorting, or pagination parameter is changed.
  * Uses `router.replace(url, { scroll: false })` to avoid layout jumping.

### 4. DummyJSON Search + Category Limitation & Resolution
* **The Limitation**: DummyJSON provides independent endpoints for search (`/products/search?q={query}`) and category filtering (`/products/category/{category}`), but **does not support combining search and category filtering on the server** (e.g., `/products/category/smartphones?q=iphone` does not exist).
* **Application Behavior**:
  1. If `search` is present, the app calls `GET /products/search?q={search}` and conducts a global search.
  2. If both `search` and `category` are present in the URL, global search executes and an explicit, informative notice banner is displayed:
     > *"DummyJSON API Scope Notice: DummyJSON does not support simultaneous search and category filtering on the server. Showing global search results for '...'. The category filter will automatically apply when search is cleared."*
  3. When `search` is cleared, the active `category` filter automatically re-applies without requiring the user to re-select it.
  4. Both search and category results seamlessly support DummyJSON's server-side `sortBy` and `order` sorting parameters.

### 5. Product Details Implementation (Phase 7)
* **Dynamic Route**: Implemented at `/products/[id]` via Next.js App Router dynamic segments.
* **API Service**: Uses `productService.getProductById(id)` with pre-validation to guard against malformed ID requests (e.g., `/products/abc` or `/products/null`).
* **Image Gallery**: Interactive gallery component (`ProductImageGallery`) featuring a main viewport and selectable image thumbnails. Handles single-image products and fallback graphics gracefully.
* **Metadata & Reviews**: Showcases category, brand, SKU, tags, warranty, shipping information, return policy, and user reviews (`ProductReviews`) with star ratings and reviewer details.
* **Back Navigation & List State Preservation**: Preserves the user's originating catalog search, filter, and pagination parameters via a `from` query parameter (e.g. `/products/1?from=/products%3Fpage%3D2%26search%3Dphone`), with fallbacks to `router.back()` or `/products`.
* **Not-Found & Error Handling**: Invalid IDs or 404 responses render a dedicated "Product Not Found" screen with a direct link back to the catalog, while network failures offer a retry mechanism.

### 6. CRUD Operations & Session Overlay Architecture (Phase 8)

#### 1. Add Product Flow
* **Dedicated Route**: Implemented at `/products/new` with header breadcrumbs and preserve-back link.
* **Service Method**: `productService.createProduct(formData)` sends a simulated `POST /products/add` request to DummyJSON.
* **Session Persistence**: Newly created products receive a stable, collision-free numeric identifier (`1001, 1002, ...`) and are prepended to the session collection.
* **Instant Visibility**: Newly added products appear immediately at the top of Page 1 in the catalog and participate in client-side search, category filtering, and sorting.

#### 2. Edit Product Flow
* **Dedicated Route**: Accessible at `/products/[id]/edit` from both the Product Table/Cards and the Product Details page.
* **Pre-population**: Form dynamically loads and prefills current product values (merging remote data with any prior session updates).
* **Service Method**: `productService.updateProduct(id, formData)` sends `PUT /products/{id}` for remote products or handles session products locally.
* **Immediate Reflection**: Edits immediately reflect across the entire application (table, cards, and details page) for the current session.

#### 3. Delete Product Flow & Confirmation Dialog
* **Accessible Dialog**: Destructive actions require explicit confirmation via `DeleteProductDialog`.
* **Safety & Accessibility**:
  * Keyboard navigation with `Escape` key dismissal.
  * Explicit product title displayed in confirmation prompt.
  * Disables cancel and delete buttons with a loading spinner while deletion is in flight.
* **Service Method**: `productService.deleteProduct(id)` executes `DELETE /products/{id}`.
* **Eviction**: The deleted ID is stored in the session deleted registry (`admin_session_deleted_ids`) and purged from all views and totals immediately.

#### 4. Form Validation & UX
* **Client-Side Validation**: Implemented via custom validation in `ProductForm.jsx`:
  * **Title**: Required, trimmed non-empty.
  * **Description**: Required, trimmed non-empty.
  * **Category**: Required, must select a valid category from dynamic category list.
  * **Price**: Required, numeric, strictly greater than 0 (`> 0`).
  * **Stock**: Required, whole non-negative integer (`>= 0`).
  * **Rating**: Optional, clamped between `0` and `5`.
* **Field-Specific Errors**: Clear, accessible inline error messages displayed directly beneath invalidated inputs.
* **Input Preservation**: Preserves user input when submission is blocked due to validation errors.

#### 5. Duplicate-Submit Protection
* Forms and dialogs maintain an `isSubmitting` flag.
* Once submitted, Save/Delete buttons are disabled, display loading spinners (`Saving...` / `Deleting...`), and block any subsequent clicks until the request completes.

#### 6. DummyJSON Mutation Limitation & Client-Side Session CRUD Overlay
* **The Limitation**: DummyJSON is a read-only mock API. `POST /products/add`, `PUT /products/{id}`, and `DELETE /products/{id}` return simulated success responses, but DummyJSON **never alters its database**. Subsequent GET requests return original, unchanged mock data.
* **The Architectural Solution**:
  * Built a **Client-Side Session CRUD Overlay** via `ProductContext` backed by `sessionStorage`.
  * Tracks `addedProducts`, `updatedProducts`, and `deletedIds`.
  * **Merging Formula**:
    $$\text{Visible Products} = (\text{Remote Products} + \text{Matching Session Added Products} \text{ with local updates applied}) - \text{Deleted IDs}$$
  * **Session Persistence**: Page reloads, browser navigation, and route switches within the browser session consistently retain all additions, modifications, and deletions.
  * **Stable ID Generation**: Avoids DummyJSON's static mock `id: 195` return value by assigning stable sequential IDs (`1001+`) that never collide with DummyJSON's 194 native products.

### 7. Known API Limitations
* **Non-Persistent Backend**: DummyJSON simulates mutations without backend database updates (resolved in-app via the Session CRUD Overlay).
* **Mutual Exclusivity of Server-Side Search and Category**: Explained in Section 4 and handled with informative banner feedback.

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run linter
npm run lint

# Build production bundle
npm run build
```
