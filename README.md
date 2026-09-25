# Product Admin Dashboard

A modern, responsive Product Admin Dashboard developed for the **Nexgenesis Technologies Frontend Assignment** using Next.js, React, Tailwind CSS, Axios, and the DummyJSON API.

## 🔗 Links

* **Live Demo:** `ADD_YOUR_VERCEL_URL_HERE`
* **GitHub Repository:** `ADD_YOUR_GITHUB_URL_HERE`

---

## 🛠️ Tech Stack

* **Next.js** — App Router
* **React**
* **Tailwind CSS**
* **Axios**
* **DummyJSON API**
* **JavaScript**
* **Lucide React**

---

## ✅ Completed Features

### Authentication

* Login using DummyJSON authentication
* Protected product routes
* Logout functionality
* Invalid credential handling
* Authentication persistence across refresh

### Product Management

* Product listing with image, title, category, price, rating, and stock
* Responsive desktop table
* Responsive mobile product cards
* Product details page
* Product image gallery
* Product reviews
* Add product
* Edit product
* Delete product with confirmation dialog
* Form validation
* Duplicate-submit protection

### Search, Filter & Sort

* Debounced product search
* Category filtering
* Price sorting
* Rating sorting
* Title sorting
* Search/category limitation handling according to DummyJSON API capabilities

### Pagination

* API-based pagination using `limit` and `skip`
* Page numbers
* Previous/Next navigation
* Page sizes: **10, 20, 50**
* Range information such as:
  `Showing 21–40 of 194`
* Pagination state synchronized with the URL

### URL State Management

The following values are maintained through URL query parameters:

* `page`
* `limit`
* `search`
* `category`
* `sortBy`
* `order`

Invalid URL values are safely handled without breaking the application.

### Error & Loading Handling

* Loading states
* Empty states
* API error states
* Retry functionality
* Invalid product handling
* Responsive error and empty-state UI

### Responsive Design

The application was tested for:

* Desktop: **1280px**
* Mobile: **375px**

---

## 🔐 Demo Credentials

```text
Username: emilys
Password: emilyspass
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project

```bash
cd Product_Admin_Dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 5. Run lint

```bash
npm run lint
```

### 6. Create a production build

```bash
npm run build
```

---

## 💡 Implementation Choices

* Used **Next.js App Router** for routing and application structure.
* Used a **shared Axios configuration** for centralized API communication and authentication handling.
* Used URL query parameters as the source of truth for pagination, search, filtering, and sorting.
* Implemented pagination manually using DummyJSON's `limit` and `skip` parameters instead of using a ready-made pagination library.
* Implemented debounced search with stale-request protection so older API responses cannot overwrite newer search results.
* Used responsive table and card layouts to provide an appropriate experience across desktop and mobile devices.
* Because DummyJSON does not permanently persist CRUD mutations, a **session-based CRUD overlay** was implemented so additions, updates, and deletions remain visible during the browser session.

---

## 🐛 Problem Faced & Solution

### Pagination Total Showing Incorrectly

During development, the product list was displaying correctly, but the pagination footer sometimes showed:

```text
Showing 0–0 of 0
```

and page navigation was not displayed correctly.

The issue was traced to a mismatch in how the merged product catalog returned the total count and how the products page read that value.

The data flow was corrected so the pagination component receives the correct total count. Additional safeguards were also added for invalid and out-of-range page values.

The fix was then tested with normal products, categories, search results, different page sizes, invalid URLs, and responsive layouts.

---

## 🤖 AI Assistance

AI tools were used as a development and debugging assistant during this assignment.

AI helped with:

* Initial project structure and component planning
* API integration guidance
* Debugging implementation issues
* Identifying edge cases
* Reviewing pagination, search, filtering, and sorting behavior
* Troubleshooting responsive UI issues
* Debugging pagination and state-management problems
* Reviewing the project against the assignment requirements

All AI-assisted code and suggestions were reviewed, tested, and modified where necessary. The final implementation was manually verified through browser testing, and the functionality is understood and explainable.

---

## 🧪 Testing

The application was tested through browser-based functional and responsive testing.

Tested areas include:

* Authentication
* Protected routes
* Product listing
* Search and debounce
* Stale search requests
* Category filtering
* Sorting
* Pagination
* Page sizes 10, 20, and 50
* URL state
* Product details
* Add/Edit/Delete
* Form validation
* Loading, empty, and error states
* Invalid product IDs
* Invalid URL parameters
* Desktop responsive layout
* Mobile responsive layout

### Validation

```text
ESLint: Passed
Production Build: Passed
Browser Testing: Passed
Responsive Testing: Passed
Edge Case Testing: Passed
Stale Request Testing: Passed
```

---

## 📌 API Limitations

### Search + Category

DummyJSON does not provide server-side support for combining product search and category filtering.

The application therefore gives search precedence when both values are present and displays an informative notice to the user. When the search is cleared, the selected category is applied again.

### CRUD Persistence

DummyJSON CRUD endpoints simulate successful mutations but do not permanently modify the underlying dataset.

The application uses a session-based CRUD overlay to keep added, edited, and deleted products reflected throughout the current browser session.
