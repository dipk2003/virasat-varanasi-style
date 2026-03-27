const routeGroups = [
  {
    group: "Public Routes",
    routes: [
      { path: "/", access: "public", note: "Home page" },
      { path: "/auth", access: "public", note: "Customer login / signup" },
      { path: "/admin/login", access: "public", note: "Admin login / signup" },
      { path: "/superadmin", access: "public", note: "Super admin login / signup" },
      { path: "/shop", access: "public", note: "Product listing" },
      { path: "/product/:slug", access: "public", note: "Product detail" },
      { path: "*", access: "public", note: "404 fallback" },
    ],
  },
  {
    group: "Protected Routes",
    routes: [
      { path: "/checkout", access: "signed-in user", note: "Checkout with saved-address support" },
      { path: "/dashboard", access: "signed-in user", note: "Customer dashboard shell" },
    ],
  },
  {
    group: "Admin Routes",
    routes: [
      { path: "/admin", access: "admin only", note: "Admin dashboard shell" },
      { path: "/super-admin", access: "super admin only", note: "Platform owner console" },
    ],
  },
];

const dashboardTabs = [
  "orders",
  "addresses",
  "wishlist",
  "reviews",
  "custom",
  "notifications",
  "profile",
];

const adminTabs = [
  "overview",
  "products",
  "inventory",
  "orders",
  "coupons",
  "custom-designs",
  "reviews",
  "customers",
  "settings",
  "team-access (super admin)",
];

for (const group of routeGroups) {
  console.log(`\n${group.group}`);
  console.log("-".repeat(group.group.length));

  for (const route of group.routes) {
    console.log(`${route.path}  [${route.access}]  -> ${route.note}`);
  }
}

console.log("\nDashboard Tabs");
console.log("--------------");
dashboardTabs.forEach((tab) => console.log(`/dashboard -> ${tab}`));

console.log("\nAdmin Tabs");
console.log("----------");
adminTabs.forEach((tab) => console.log(`/admin -> ${tab}`));

console.log("\nQuick Check");
console.log("-----------");
console.log("1. Open /");
console.log("2. Open /shop");
console.log("3. Open /product/<slug>");
console.log("4. Sign in at /auth");
console.log("5. Open /dashboard");
console.log("6. Open /admin with an admin user");
console.log("7. Open /super-admin with a super admin user");
