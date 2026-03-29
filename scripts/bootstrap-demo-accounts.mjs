import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD || process.env.TEST_ADMIN_PASSWORD || "ChangeMe123!";

const fallbackAccounts = [
  { email: process.env.DEMO_USER_1_EMAIL || "customer1@example.com", full_name: "Demo Customer 1", intended_role: "user", portal_path: "/auth" },
  { email: process.env.DEMO_USER_2_EMAIL || "customer2@example.com", full_name: "Demo Customer 2", intended_role: "user", portal_path: "/auth" },
  { email: process.env.DEMO_USER_3_EMAIL || "customer3@example.com", full_name: "Demo Customer 3", intended_role: "user", portal_path: "/auth" },
  { email: process.env.DEMO_USER_4_EMAIL || "customer4@example.com", full_name: "Demo Customer 4", intended_role: "user", portal_path: "/auth" },
  { email: process.env.DEMO_USER_5_EMAIL || "customer5@example.com", full_name: "Demo Customer 5", intended_role: "user", portal_path: "/auth" },
  { email: process.env.DEMO_ADMIN_1_EMAIL || "admin@example.com", full_name: "Demo Admin 1", intended_role: "admin", portal_path: "/admin/login" },
  { email: process.env.DEMO_ADMIN_2_EMAIL || "ops@example.com", full_name: "Demo Admin 2", intended_role: "admin", portal_path: "/admin/login" },
  { email: process.env.DEMO_SUPER_ADMIN_EMAIL || "owner@example.com", full_name: "Demo Super Admin", intended_role: "super_admin", portal_path: "/superadmin" },
];

const missing = [
  !supabaseUrl && "SUPABASE_URL or VITE_SUPABASE_URL",
  !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
].filter(Boolean);

if (missing.length > 0) {
  console.error("Missing env vars:");
  missing.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const allRoles = ["user", "admin", "super_admin"];

const isMissingRelationError = (error) => {
  const message = error?.message || "";
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("Could not find the table")
  );
};

const isMissingColumnError = (error, columnName) => {
  const message = error?.message || "";
  return message.includes(`Could not find the '${columnName}' column`) || message.includes(`column "${columnName}" does not exist`);
};

const fetchSeedAccounts = async () => {
  const { data, error } = await supabase
    .from("access_seed_accounts")
    .select("email, full_name, intended_role, portal_path, is_active")
    .eq("is_active", true)
    .order("email");

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn("access_seed_accounts table not found. Falling back to local demo defaults.");
      return fallbackAccounts;
    }

    throw error;
  }

  if (!data?.length) {
    return fallbackAccounts;
  }

  return data.map((account) => ({
    email: account.email,
    full_name: account.full_name,
    intended_role: account.intended_role,
    portal_path: account.portal_path || "/auth",
  }));
};

const findUserByEmail = async (email) => {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const matchedUser = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (matchedUser) return matchedUser;
    if (data.users.length < 200) return null;

    page += 1;
  }
};

const ensureBootstrapSettings = async (accounts) => {
  const firstAdmin = accounts.find((account) => account.intended_role === "admin")?.email || null;
  const firstSuperAdmin = accounts.find((account) => account.intended_role === "super_admin")?.email || null;

  const { error } = await supabase.from("admin_bootstrap_settings").upsert(
    {
      id: true,
      bootstrap_admin_email: firstAdmin,
      bootstrap_super_admin_email: firstSuperAdmin,
      auto_assign_on_signup: true,
    },
    { onConflict: "id" }
  );

  if (!error || isMissingRelationError(error)) {
    return;
  }

  if (isMissingColumnError(error, "bootstrap_super_admin_email")) {
    const { error: legacyError } = await supabase.from("admin_bootstrap_settings").upsert(
      {
        id: true,
        bootstrap_admin_email: firstAdmin,
        auto_assign_on_signup: true,
      },
      { onConflict: "id" }
    );

    if (!legacyError || isMissingRelationError(legacyError)) {
      return;
    }

    throw legacyError;
  }

  throw error;
};

const ensureProfile = async (userId, fullName) => {
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      full_name: fullName,
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
};

const ensureRoles = async (userId, intendedRole) => {
  const rolesToRemove = allRoles.filter((role) => role !== intendedRole);

  const { error: insertError } = await supabase
    .from("user_roles")
    .upsert(
      [{ user_id: userId, role: intendedRole }],
      { onConflict: "user_id,role" }
    );

  if (insertError) throw insertError;

  if (rolesToRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .in("role", rolesToRemove);

    if (deleteError) throw deleteError;
  }
};

const validateRoleSupport = async (accounts) => {
  if (!accounts.some((account) => account.intended_role === "super_admin")) {
    return;
  }

  const { error } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin")
    .limit(1);

  if (!error) {
    return;
  }

  const message = error.message || "";

  if (message.includes('invalid input value for enum app_role: "super_admin"')) {
    throw new Error(
      "Remote database abhi super_admin role support par migrated nahi hai. Pehle 20260328159000_add_super_admin_to_app_role.sql, 20260328160000_super_admin_roles_and_design_briefs.sql, aur 20260328170000_access_seed_accounts.sql apply karo, phir npm run demo:bootstrap chalao."
    );
  }

  throw error;
};

const ensureAccount = async (account) => {
  const existingUser = await findUserByEmail(account.email);

  if (!existingUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        full_name: account.full_name,
      },
    });

    if (error || !data.user) throw error || new Error(`Failed to create ${account.email}`);

    await ensureProfile(data.user.id, account.full_name);
    await ensureRoles(data.user.id, account.intended_role);

    return {
      action: "created",
      userId: data.user.id,
    };
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      ...(existingUser.user_metadata || {}),
      full_name: account.full_name,
    },
  });

  if (updateError) throw updateError;

  await ensureProfile(existingUser.id, account.full_name);
  await ensureRoles(existingUser.id, account.intended_role);

  return {
    action: "updated",
    userId: existingUser.id,
  };
};

const main = async () => {
  const accounts = await fetchSeedAccounts();
  await validateRoleSupport(accounts);
  await ensureBootstrapSettings(accounts);

  console.log(`Bootstrapping ${accounts.length} demo accounts...`);

  for (const account of accounts) {
    const result = await ensureAccount(account);
    console.log(`[${result.action}] ${account.email} -> ${account.intended_role} (${account.portal_path})`);
  }

  console.log("");
  console.log("Demo credentials");
  console.log("----------------");
  console.log(`Password for all demo accounts: ${demoPassword}`);
  accounts.forEach((account) => {
    console.log(`${account.email} -> ${account.intended_role} -> ${account.portal_path}`);
  });
};

main().catch((error) => {
  console.error("Demo bootstrap failed.");
  console.error(error.message || error);
  process.exit(1);
});
