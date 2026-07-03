<?php

$merchantId    = "2547916";
$apiKey        = "1946";
$serviceTypeId = "4430731";

$amount      = "5000";
$orderId     = uniqid("ORD_");
$payerName   = "John Doe";
$payerEmail  = "doe@gmail.com";
$payerPhone  = "09062067384";
$description = "Payment for September Fees";

// Generate hash
$hashString = $merchantId . $serviceTypeId . $orderId . $amount . $apiKey;
$hash = hash('sha512', $hashString);

// Prepare payload
$payload = [
    "serviceTypeId" => $serviceTypeId,
    "amount"        => $amount,
    "orderId"       => $orderId,
    "payerName"     => $payerName,
    "payerEmail"    => $payerEmail,
    "payerPhone"    => $payerPhone,
    "description"   => $description
];

$jsonData = json_encode($payload, JSON_UNESCAPED_SLASHES);

$url = "https://demo.remita.net/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit";

// Initialize cURL
$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $jsonData,
    CURLOPT_HTTPHEADER     => [
        "Content-Type: application/json",
        "Accept: application/json",
        "Authorization: remitaConsumerKey={$merchantId},remitaConsumerToken={$hash}"
    ],
    CURLOPT_SSL_VERIFYPEER => false, // true in production
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Parse response
$result = json_decode($response, true);

if ($httpCode == 200) {
    if (isset($result['RRR'])) {
        echo "Success! RRR: " . $result['RRR'];
    } elseif (isset($result['responseData'])) {
        $innerData = is_string($result['responseData']) 
            ? json_decode($result['responseData'], true) 
            : $result['responseData'];
        echo "RRR: " . ($innerData['RRR'] ?? 'Not found');
    } else {
        echo "No RRR found.";
    }
} else {
    echo "Error (Status $httpCode).";

    // pages/api/remita/initPayment.js
import crypto from "crypto";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Remita credentials
    const merchantId = "2547916";
    const apiKey = "1946";
    const serviceTypeId = "4430731";

    // Payment details (you can also get these from req.body)
    const amount = "5000";
    const orderId = `ORD_${Date.now()}`;
    const payerName = "John Doe";
    const payerEmail = "doe@gmail.com";
    const payerPhone = "09062067384";
    const description = "Payment for September Fees";

    // Generate SHA512 hash
    const hashString = merchantId + serviceTypeId + orderId + amount + apiKey;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // Payload
    const payload = {
      serviceTypeId,
      amount,
      orderId,
      payerName,
      payerEmail,
      payerPhone,
      description,
    };

    // Remita API URL
    const url =
      "https://demo.remita.net/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit";

    // Call Remita API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `remitaConsumerKey=${merchantId},remitaConsumerToken=${hash}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Parse RRR
    let rrr = null;
    if (data.RRR) {
      rrr = data.RRR;
    } else if (data.responseData) {
      const innerData =
        typeof data.responseData === "string"
          ? JSON.parse(data.responseData)
          : data.responseData;
      rrr = innerData.RRR || null;
    }

    if (rrr) {
      return res.status(200).json({ success: true, RRR: rrr });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "RRR not found", data });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
}