# Route Checklist

## Public

- `/` - home page
- `/auth` - customer sign in / sign up
- `/admin/login` - admin sign in / sign up
- `/superadmin` - super admin sign in / sign up
- `/shop` - product listing
- `/product/:slug` - product detail
- `*` - 404 fallback

## Protected

- `/checkout` - authenticated checkout
- `/dashboard` - authenticated customer dashboard

### Customer Dashboard Tabs

- `orders`
- `addresses`
- `wishlist`
- `reviews`
- `custom`
- `notifications`
- `profile`

## Admin

- `/admin` - admin dashboard
- `/super-admin` - super admin dashboard

### Admin Tabs

- `overview`
- `products`
- `inventory`
- `orders`
- `coupons`
- `custom-designs`
- `reviews`
- `customers`
- `settings`
- `team-access` - super admin only

## Useful Commands

- `npm run routes:check`
- `npm run admin:bootstrap`
- `npm run demo:bootstrap`
