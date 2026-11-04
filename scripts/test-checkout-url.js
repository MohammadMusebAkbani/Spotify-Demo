async function testUrls() {
  const cartId = "c1-735a602cbcad4c05ad597f1f03a71019";
  const fullCartId = "gid://shopify/Cart/c1-735a602cbcad4c05ad597f1f03a71019?key=257fd7bac325476f665f24f20310d63f";
  const key = "257fd7bac325476f665f24f20310d63f";

  // Let's test what checkoutUrl mock.shop hydrogen expects or how mock.shop checkout works
  const urlsToTest = [
    `https://apparel.hydrogen.mock.shop/checkout`,
    `https://apparel.hydrogen.mock.shop/checkout?cart=${cartId}`,
    `https://apparel.hydrogen.mock.shop/checkout?cartId=${cartId}`,
    `https://apparel.hydrogen.mock.shop/checkout?key=${key}`,
    `https://apparel.hydrogen.mock.shop/cart/${cartId}`,
    `https://apparel.hydrogen.mock.shop/cart/c/${cartId}`,
    `https://apparel.hydrogen.mock.shop/cart`,
    `https://apparel.mock.shop/cart/${cartId}`,
  ];

  for (const url of urlsToTest) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      console.log(`URL: ${url} -> Status: ${res.status}`);
      if (res.headers.get("location")) {
        console.log(`  Location: ${res.headers.get("location")}`);
      }
      const text = await res.text();
      const hasEmpty = text.includes("Your cart is empty");
      const hasOat = text.includes("Oat linen");
      console.log(`  Includes 'Your cart is empty': ${hasEmpty}, Includes 'Oat linen': ${hasOat}, length: ${text.length}`);
    } catch (e) {
      console.log(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}

testUrls().catch(console.error);
