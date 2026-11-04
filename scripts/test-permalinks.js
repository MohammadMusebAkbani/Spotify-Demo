async function testCartPermalinks() {
  const variantNumericId = "15858";
  const urls = [
    `https://apparel.hydrogen.mock.shop/cart/${variantNumericId}:1`,
    `https://apparel.hydrogen.mock.shop/cart?lines=${variantNumericId}:1`,
    `https://apparel.hydrogen.mock.shop/checkout?lines=${variantNumericId}:1`,
    `https://apparel.mock.shop/cart/${variantNumericId}:1`,
    `https://apparel.hydrogen.mock.shop/cart/add?id=${variantNumericId}&quantity=1`,
  ];

  for (const url of urls) {
    const res = await fetch(url, { redirect: "manual" });
    console.log(url, "->", res.status, res.headers.get("location"));
    const text = await res.text();
    console.log("  has 'Your cart is empty':", text.includes("Your cart is empty"), "has 'Oat linen':", text.includes("Oat linen"));
  }
}

testCartPermalinks().catch(console.error);
