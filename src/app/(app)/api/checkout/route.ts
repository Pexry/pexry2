import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  
  // Get user from session
  const session = await payload.auth({ headers: req.headers });
  
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const product = await payload.findByID({
    collection: "products",
    id: productId,
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // ✅ Fix for Bun + TronWeb
  const TronWebModule = await import("tronweb");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TronWeb: any = TronWebModule?.default || TronWebModule;

  const tronWeb = new TronWeb.constructor({
    fullHost: "https://api.trongrid.io",
  });

  // 🔐 Generate TRON wallet
  const account = await tronWeb.createAccount();
  const walletAddress = account.address.base58;
  const privateKey = account.privateKey;

  // 🧾 Create the order
  const order = await payload.create({
    collection: "orders",
    data: {
      user: session.user.id,
      product: productId,
      status: "pending",
      walletAddress,
      transactionId: "",
      amount: product.price,
      deliveryStatus: "auto", // Always automatic delivery
    },
  });

  return NextResponse.json({
    orderId: order.id,
    walletAddress,
    privateKey, // ⚠️ only include this in dev/testing
    amount: product.price,
  });
}
