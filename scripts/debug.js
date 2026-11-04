async function test() {
  const res = await fetch("https://apparel.mock.shop/api/2026-07/graphql.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "{ products(first: 3) { nodes { id title featuredImage { url } images(first: 3) { nodes { url } } variants(first: 1) { nodes { id } } } } }"
    })
  });
  const data = await res.json();
  console.log("Products:", JSON.stringify(data, null, 2));

  const variantId = data.data.products.nodes[0].variants.nodes[0].id;
  console.log("\nTesting cartCreate with line:", variantId);

  // 1. Create empty cart, then add line
  const cartRes = await fetch("https://apparel.mock.shop/api/2026-07/graphql.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation CreateCart {
          cartCreate(input: { lines: [] }) {
            cart {
              id
              checkoutUrl
              lines(first: 10) { nodes { id } }
            }
          }
        }
      `
    })
  });
  const cartData = await cartRes.json();
  const emptyCart = cartData.data.cartCreate.cart;
  console.log("Empty cart created:", emptyCart.id, "checkoutUrl:", emptyCart.checkoutUrl);

  // Now add lines
  const addRes = await fetch("https://apparel.mock.shop/api/2026-07/graphql.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation AddLines($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id
              checkoutUrl
              totalQuantity
              lines(first: 10) { nodes { id } }
            }
          }
        }
      `,
      variables: {
        cartId: emptyCart.id,
        lines: [{ merchandiseId: variantId, quantity: 1 }]
      }
    })
  });
  const addData = await addRes.json();
  console.log("After addLines:", JSON.stringify(addData, null, 2));

  // Now test direct cartCreate with lines:
  const directCartRes = await fetch("https://apparel.mock.shop/api/2026-07/graphql.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation CreateCartWithLines($lines: [CartLineInput!]) {
          cartCreate(input: { lines: $lines }) {
            cart {
              id
              checkoutUrl
              totalQuantity
              lines(first: 10) { nodes { id } }
            }
          }
        }
      `,
      variables: {
        lines: [{ merchandiseId: variantId, quantity: 1 }]
      }
    })
  });
  const directCartData = await directCartRes.json();
  console.log("Direct cartCreate with lines:", JSON.stringify(directCartData, null, 2));
}

test().catch(console.error);
