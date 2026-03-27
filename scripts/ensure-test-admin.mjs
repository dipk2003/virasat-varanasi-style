import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD;
const adminFullName = process.env.TEST_ADMIN_FULL_NAME || "Test Admin";

const missing = [
  !supabaseUrl && "SUPABASE_URL or VITE_SUPABASE_URL",
  !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
  !adminEmail && "TEST_ADMIN_EMAIL",
  !adminPassword && "TEST_ADMIN_PASSWORD",
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

const ensureBootstrapAdminConfig = async (email) => {
  const { error } = await supabase.from("admin_bootstrap_settings").upsert(
    {
      id: true,
      bootstrap_admin_email: email,
      auto_assign_on_signup: true,
    },
    { onConflict: "id" }
  );

  if (!error) return;

  const message = error.message || "";
  if (
    message.includes('relation "public.admin_bootstrap_settings" does not exist') ||
    message.includes("Could not find the table 'public.admin_bootstrap_settings' in the schema cache")
  ) {
    console.warn("Admin signup automation migration is not applied yet. Continuing with direct admin creation.");
    return;
  }

  throw error;
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

const ensureAdminRole = async (userId) => {
  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });

  if (error) throw error;
};

const main = async () => {
  await ensureBootstrapAdminConfig(adminEmail);

  const existingUser = await findUserByEmail(adminEmail);

  if (!existingUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminFullName,
      },
    });

    if (error || !data.user) throw error || new Error("Failed to create test admin user.");

    await ensureProfile(data.user.id, adminFullName);
    await ensureAdminRole(data.user.id);

    console.log("Test admin created.");
    console.log(`Email: ${adminEmail}`);
    console.log(`User ID: ${data.user.id}`);
    return;
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      ...(existingUser.user_metadata || {}),
      full_name: adminFullName,
    },
  });

  if (updateError) throw updateError;

  await ensureProfile(existingUser.id, adminFullName);
  await ensureAdminRole(existingUser.id);

  console.log("Test admin already existed. Credentials refreshed and admin role ensured.");
  console.log(`Email: ${adminEmail}`);
  console.log(`User ID: ${existingUser.id}`);
};

main().catch((error) => {
  console.error("Admin bootstrap failed.");
  console.error(error.message || error);
  process.exit(1);
});
