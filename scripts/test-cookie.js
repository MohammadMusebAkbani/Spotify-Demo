async function testRedirect() {
  const cartRes = await fetch("https://apparel.mock.shop/api/2026-07/graphql.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation CreateCartWithLines {
          cartCreate(input: { lines: [{ merchandiseId: "gid://shopify/ProductVariant/15858", quantity: 1 }] }) {
            cart {
              id
              checkoutUrl
            }
          }
        }
      `
    })
  });
  const cartData = await cartRes.json();
  const cart = cartData.data.cartCreate.cart;
  console.log("Cart ID:", cart.id);
  console.log("Checkout URL:", cart.checkoutUrl);

  // Extract cart key/token from id: gid://shopify/Cart/c1-xxx?key=yyy
  const match = cart.id.match(/gid:\/\/shopify\/Cart\/(.+)/);
  const rawIdWithKey = match ? match[1] : "";
  const [token, queryPart] = rawIdWithKey.split("?");

  console.log("Token:", token, "Query:", queryPart);

  // Test /cart/c/<rawIdWithKey>
  const targetUrl = `https://apparel.hydrogen.mock.shop/cart/c/${rawIdWithKey}`;
  console.log("Fetching:", targetUrl);
  const res = await fetch(targetUrl, { redirect: "manual" });
  console.log("Status:", res.status);
  console.log("Set-Cookie:", res.headers.get("set-cookie"));
  console.log("Location:", res.headers.get("location"));

  const cookie = res.headers.get("set-cookie");
  if (cookie) {
    // Follow to checkout with that cookie
    const checkoutRes = await fetch("https://apparel.hydrogen.mock.shop/checkout", {
      headers: { Cookie: cookie }
    });
    const text = await checkoutRes.text();
    console.log("Checkout with cookie has 'Your cart is empty':", text.includes("Your cart is empty"));
    console.log("Checkout with cookie has 'Oat linen':", text.includes("Oat linen"));
  }
}

testRedirect().catch(console.error);
