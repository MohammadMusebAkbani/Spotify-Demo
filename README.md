# Multi-Tenant White-Label Shopify Shopping App (Expo & React Native)

A production-grade, multi-tenant white-label React Native application built with Expo SDK 58 and TypeScript. A single codebase powers independently branded iOS and Android apps for multiple Shopify merchants (`Elysian Thread` apparel and `StridePulse` sneakers), with all merchant differences configured declaratively.

---

## 1. Architecture Overview

### Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  Metro / EAS Build                                |
|                                                                                   |
|        MERCHANT=clothes                        MERCHANT=shoes                     |
|                |                                      |                           |
|                v                                      v                           |
|     +----------------------+              +----------------------+                |
|     |   merchants/clothes/ |              |    merchants/shoes/  |                |
|     |   - config.json      |              |    - config.json     |                |
|     |   - assets/          |              |    - assets/         |                |
|     +----------------------+              +----------------------+                |
|                \                                      /                           |
|                 +------------------+-----------------+                            |
|                                    |                                              |
|                                    v                                              |
|                           merchants/index.ts                                      |
|                       (Static Registry & Assets)                                  |
|                                    |                                              |
|                    +---------------+---------------+                              |
|                    |                               |                              |
|                    v                               v                              |
|              app.config.ts                   src/config/                          |
|         (Build Identity, App ID,          merchant.ts & Provider                  |
|          Icons, Package Name)             (Context: Theme + Config)               |
+--------------------+-------------------------------+-------------------------------+
                     |                               |
                     v                               v
+-----------------------------------------------------------------------------------+
|                                 App Runtime Layer                                 |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | Navigation & Screens:                                                     |   |
|   | - Shop Tab (ProductListScreen -> ProductDetailScreen)                     |   |
|   | - Cart Tab (CartScreen with badge & checkout validation)                  |   |
|   | - Orders Tab (OrdersScreen with LocalOrdersAdapter & demo orders)         |   |
|   +---------------------------------------------------------------------------+   |
|                                    |                                              |
|   +--------------------------------+------------------------------------------+   |
|   |                                |                                          |   |
|   v                                v                                          v   |
| Hooks (src/hooks/)        Zustand (src/store/)            Adapters (src/adapters/)|
| - useProducts             - cartStore                     - ReviewsAdapter        |
| - useProduct              - filter state                    (mock vs off)         |
| - useCollections          - persistence                   - OrdersAdapter         |
| - useCart                                                   (LocalOrdersAdapter)  |
| - useOrders                                                                       |
| - useReviews                                                                      |
|   +--------------------------------+------------------------------------------+   |
|                                    |                                              |
|                                    v                                              |
|                    Shopify Service (src/services/shopify/)                        |
|                    - client.ts (shopifyFetch, typed errors, timeout)              |
|                    - queries.ts (GraphQL Storefront API 2026-07)                  |
|                    - api.ts (fetchProducts, cartCreate, etc.)                     |
|                                    |                                              |
|                                    v                                              |
|                  https://<shopDomain>/api/2026-07/graphql.json                    |
|             (apparel.mock.shop  OR  apparel-sneakers.mock.shop)                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Configured Merchants

| Merchant ID | Brand Name | Mock Store Domain | App ID / Bundle ID | Reviews Feature | Primary Color | Accent Color |
|---|---|---|---|---|---|---|
| `clothes` | **Elysian Thread** | `apparel.mock.shop` | `com.fashon.app` | `"mock"` (Enabled) | `#8B5A2B` (Linen Brown) | `#D4A373` |
| `shoes` | **StridePulse** | `apparel-sneakers.mock.shop` | `com.shoes.app` | `"off"` (Hidden) | `#0F172A` (Slate Navy) | `#0284C7` (Electric Cyan) |

---

## 3. How to Run Each Merchant

Use the prepared scripts in `package.json` (powered by `cross-env` for cross-platform Windows / macOS / Linux compatibility):

### Clothing Store (`Elysian Thread`)
```bash
npm run start:clothes
# Or manually:
# cross-env MERCHANT=clothes npx expo start
```
- **Android Dev Client / Emulator:** `npm run android:clothes`
- **iOS Simulator:** `npm run ios:clothes`

### Shoes Store (`StridePulse`)
```bash
npm run start:shoes
# Or manually:
# cross-env MERCHANT=shoes npx expo start
```
- **Android Dev Client / Emulator:** `npm run android:shoes`
- **iOS Simulator:** `npm run ios:shoes`

> **Note on Expo Go vs Native Builds**:
> Expo Go can only preview a single active app identity at a time because its package/bundle identity is fixed to Expo Go itself. To run both independently branded merchant apps simultaneously on a device or emulator, generate native builds via `eas build --profile <merchant>-dev` or `npx expo prebuild`.

---

## 4. How to Add a Third Merchant

Adding a new merchant requires **zero changes to any screen or component**:

1. **Create Merchant Directory & Config**:
   Create `merchants/<new_merchant>/config.json`:
   ```json
   {
     "id": "watches",
     "brandName": "Chronos Luxury",
     "shopDomain": "chronos.mock.shop",
     "storefrontToken": "",
     "apiVersion": "2026-07",
     "appId": "com.chronos.app",
     "scheme": "chronos",
     "theme": {
       "primary": "#1E293B",
       "background": "#F8FAFC",
       "text": "#0F172A",
       "accent": "#EAB308",
       "card": "#FFFFFF",
       "border": "#CBD5E1",
       "muted": "#64748B",
       "error": "#DC2626",
       "success": "#16A34A"
     },
     "features": {
       "reviews": "mock",
       "orders": true
     }
   }
   ```
2. **Add Merchant Assets**:
   Place placeholder or branded PNGs in `merchants/<new_merchant>/assets/`:
   - `icon.png` (app icon)
   - `splash.png` (splash screen image)
   - `logo.png` (header brand logo)

3. **Register in `merchants/index.ts`**:
   ```typescript
   import watchesConfig from './watches/config.json';

   export const merchantRegistry: Record<string, MerchantConfig> = {
     clothes: clothesConfig as MerchantConfig,
     shoes: shoesConfig as MerchantConfig,
     watches: watchesConfig as MerchantConfig, // <- Add here
   };

   export const merchantAssets: Record<string, any> = {
     // ...
     watches: {
       logo: require('./watches/assets/logo.png'),
       icon: require('./watches/assets/icon.png'),
       splash: require('./watches/assets/splash.png'),
     },
   };
   ```

4. **Add EAS Build Profiles in `eas.json`**:
   ```json
   "watches-dev": {
     "developmentClient": true,
     "distribution": "internal",
     "env": { "MERCHANT": "watches" }
   },
   "watches-prod": {
     "distribution": "store",
     "env": { "MERCHANT": "watches" }
   }
   ```

5. **Run the New Merchant**:
   ```bash
   cross-env MERCHANT=watches npx expo start
   ```

---

## 5. Per-Merchant Signing, Firebase, and Push Notifications

When compiling separate production binaries per merchant:
1. **Keystores & Provisioning Profiles**:
   - Android requires a unique signing keystore and package name per merchant (`com.fashon.app` vs `com.shoes.app`).
   - iOS requires separate Apple Developer provisioning profiles, bundle IDs, and distribution certificates.
   - EAS Build handles this automatically when configured with distinct build profiles and Apple/Android credentials.
2. **Firebase Configuration**:
   - Each merchant has its own Firebase project.
   - Configure dynamic Google Services file resolution in `app.config.ts`:
     - Android: `googleServicesFile: `./merchants/${merchant.id}/google-services.json``
     - iOS: `googleServicesFile: `./merchants/${merchant.id}/GoogleService-Info.plist``
3. **Push Notifications**:
   - APNs and FCM credentials must be registered separately per bundle identifier in EAS and Firebase consoles.

---

## 6. What Ships in the App vs What Stays on a Server

| Component | Ships in Mobile Client App | Stays on Secure Server / Backend |
|---|---|---|
| **Shopify Storefront API Token** | ✅ Yes (Public by design, rate-limited to public storefront data) | ❌ |
| **Merchant Config & Theme** | ✅ Yes (`config.json`, styling, feature flags) | ❌ |
| **Shopify Admin API Access Tokens** | ❌ **NEVER** | ✅ Must stay on backend. Admin tokens grant read/write access to customer PII, inventory, and financial reports. |
| **Payment Gateway Secrets (Stripe, etc.)** | ❌ **NEVER** | ✅ Handled via Shopify Checkout web redirection or a backend PCI-compliant microservice. |
| **Webhook Signing Secrets** | ❌ **NEVER** | ✅ Stored on backend servers receiving Shopify webhooks. |
| **Third-Party Review Provider Private Keys** | ❌ **NEVER** | ✅ Public API keys only, or proxied through your server adapter. |

---

## 7. Known Limitations & Architecture Decisions

1. **Mock Checkout**:
   - `mock.shop` provides a simulated checkout URL (`https://<domain>.hydrogen.mock.shop/checkout`).
   - The mock checkout does not process live credit cards or create permanent orders on Shopify.
2. **Local Demo Orders (`LocalOrdersAdapter`)**:
   - Since `mock.shop` does not implement the Shopify Customer Account API, orders are recorded locally when a user initiates checkout.
   - Orders are stored in `@react-native-async-storage/async-storage` prefixed by merchant ID (`@shopify_${merchantId}_orders`).
   - The adapter implements the `OrdersAdapter` interface: when connecting a real Shopify dev store, a `CustomerAccountOrdersAdapter` can be dropped in without changing a single line of screen code.
3. **Customer Accounts & Login**:
   - Customer login is intentionally omitted per requirements.
   - A documented TODO is provided in `src/screens/OrdersScreen.tsx` outlining how to connect OAuth 2.0 PKCE headless customer accounts.

---

## 8. Robustness & Accessibility

- **Network & Error Recovery**:
  - Typed errors: `ShopifyNetworkError`, `ShopifyHttpError`, `ShopifyGraphQLError`, and `ShopifyTimeoutError`.
  - Every screen includes an `ErrorState` with an actionable `Try Again` button; no screen ever remains blank on network failure.
  - Skeletons displayed during initial fetch.
- **Cart & Pre-Checkout Price Verification**:
  - Before launching checkout in `expo-web-browser`, the cart is freshly re-fetched from Shopify.
  - If any product price or total changed, the user is presented with a review alert showing previous and updated amounts.
  - If a variant in the cart sold out (`availableForSale === false`), the user is alerted to remove it before proceeding.
- **Accessibility & Touch Targets**:
  - Minimum 44x44px touch targets on buttons, quantity steppers, chips, and cards.
  - Meaningful `accessibilityLabel`, `accessibilityRole`, and `accessibilityState` attributes.
  - High-contrast color combinations tailored for each merchant theme.
- **Performance**:
  - `FlatList` with `keyExtractor` and `React.memo` for product cards.
  - TanStack Query 5-minute `staleTime` with cached data shown during background refetches.

#   S p o t i f y - D e m o  
 