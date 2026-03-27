import { readdirSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const migrations = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

console.log("\nMigration Inventory");
console.log("-------------------");
migrations.forEach((name, index) => {
  console.log(`${String(index + 1).padStart(2, "0")}. ${name}`);
});

console.log("\nLatest additions");
console.log("----------------");
console.log("- 20260328110000_ecommerce_productization_foundation.sql");
console.log("- 20260328123000_admin_bootstrap_helpers.sql");
console.log("- 20260328143000_admin_signup_automation.sql");
console.log("- 20260328150000_bootstrap_admin_promotion.sql");
console.log("- 20260328159000_add_super_admin_to_app_role.sql");
console.log("- 20260328160000_super_admin_roles_and_design_briefs.sql");
console.log("- 20260328170000_access_seed_accounts.sql");
console.log("- 20260328180000_seed_catalog_products.sql");
