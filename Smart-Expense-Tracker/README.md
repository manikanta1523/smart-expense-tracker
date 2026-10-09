# Smart Expense Tracker – Personal Finance Management System

SDC Project Review-1 friendly expense tracker built with **HTML, CSS and Vanilla JavaScript only**.

## Features
- Admin and User modules
- LocalStorage authentication and data storage
- User signup/login and role-based redirects
- Expense and income CRUD
- Categories
- Monthly/category budgets with progress warnings
- Multiple accounts
- Reports and CSS/JavaScript charts
- Recurring expense storage
- CSV export
- Responsive sidebar/dashboard
- No backend or database

## Demo Admin
- Email: admin@gmail.com
- Password: admin123

## Run
Open `index.html` directly in a browser.

## Project structure
```text
Smart-Expense-Tracker/
├── index.html
├── login.html
├── signup.html
├── admin.html
├── admin-users.html
├── admin-categories.html
├── dashboard.html
├── expenses.html
├── income.html
├── budget.html
├── accounts.html
├── reports.html
├── css/
│   └── style.css
└── js/
    ├── auth.js
    ├── dashboard.js
    ├── expenses.js
    ├── income.js
    ├── budget.js
    ├── accounts.js
    ├── reports.js
    └── admin.js
```

## Viva explanation
**Frontend:** HTML creates pages/forms/tables, CSS provides responsive design, JavaScript handles validation, navigation, calculations and CRUD operations.

**Storage:** LocalStorage stores users, currentUser, transactions, budgets, accounts, categories and recurringExpenses. Every user-owned record contains a `userId`, which keeps user data separated in the browser.

**Authentication flow:** Login checks LocalStorage users, reads the role, stores a safe current-user object, then redirects Admin to `admin.html` or User to `dashboard.html`. Protected pages check the current user and role before rendering.
