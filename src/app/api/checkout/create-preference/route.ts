// src/app/api/checkout/create-preference/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from 'mercadopago';
// TODO: Add proper error handling and validation

// IMPORTANT: Replace with your actual Mercado Pago Access Token from environment variables
// It's crucial to keep this token secure and not hardcode it directly.
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "YOUR_MERCADO_PAGO_ACCESS_TOKEN";

if (MERCADO_PAGO_ACCESS_TOKEN === "YOUR_MERCADO_PAGO_ACCESS_TOKEN") {
  console.warn("Mercado Pago Access Token is not configured. Please set MP_ACCESS_TOKEN environment variable.");
  // In a real application, you might want to throw an error or prevent startup
}

const client = new MercadoPagoConfig({ accessToken: MERCADO_PAGO_ACCESS_TOKEN });
const preference = new Preference(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, payer, back_urls, notification_url } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 });
    }

    // Basic validation for item structure (add more as needed)
    const validItems = items.map(item => ({
      id: item.id?.toString(), // Ensure ID is string
      title: item.title,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      currency_id: 'ARS', // Or your country's currency code
    }));

    // Basic validation for payer (add more as needed)
    const validPayer = payer ? {
        name: payer.name,
        surname: payer.surname || '', // Optional
        email: payer.email,
        // Add phone, address etc. if needed by Mercado Pago
    } : undefined;

    // Define back URLs (replace with your actual frontend URLs)
    const default_back_urls = {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/order-confirmation?status=success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/order-confirmation?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/order-confirmation?status=pending`,
    };

    // Define notification URL (webhook endpoint on your backend)
    const default_notification_url = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/api/webhooks/mercadopago`;

    console.log("Creating preference with items:", JSON.stringify(validItems, null, 2));
    console.log("Payer:", JSON.stringify(validPayer, null, 2));
    console.log("Back URLs:", JSON.stringify(back_urls || default_back_urls, null, 2));
    console.log("Notification URL:", notification_url || default_notification_url);


    const result = await preference.create({
      body: {
        items: validItems,
        payer: validPayer,
        back_urls: back_urls || default_back_urls,
        auto_return: 'approved', // Automatically return to success URL on approval
        notification_url: notification_url || default_notification_url, // Your webhook endpoint
        // external_reference: 'YOUR_ORDER_ID', // Optional: Link to your internal order ID
      }
    });

    console.log("Mercado Pago Preference Result:", result);

    return NextResponse.json({ 
        preferenceId: result.id, 
        init_point: result.init_point // URL for redirecting the user
    });

  } catch (error: any) {
    console.error("Error creating Mercado Pago preference:", error);
    // Try to provide a more specific error message if possible
    const message = error?.cause?.message || error?.message || "Failed to create payment preference";
    const status = error?.status || 500;
    return NextResponse.json({ error: message }, { status });
  }
}

