import { v } from "convex/values";
import OpenAI from "openai";
import { action } from "./_generated/server";

// Action: Extract ID Card Data
export const extractIdCardData = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const openai = new OpenAI({
      baseURL: "http://ai-gateway.hercules.app/v1",
      apiKey: process.env.HERCULES_API_KEY,
    });

    const imageBlob = await ctx.storage.get(storageId);
    if (!imageBlob) throw new Error("Image not found");

    const buffer = await imageBlob.arrayBuffer();
    
    // Konverzia obrázka do Base64 pomocou natívnych webových API (V8 runtime kompatibilné)
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Image = btoa(binary);

    const response = await openai.chat.completions.create({
      model: "openai/gpt-5",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all personal data from this ID card / citizen ID document. 
Return a JSON object with these fields (use null if not found):
{
  "academicDegree": "academic degrees (e.g. Bc., Mgr., Ing.) / titul (ak je uvedený)",
  "firstName": "first name / meno",
  "lastName": "last name / priezvisko",
  "dateOfBirth": "date of birth as YYYY-MM-DD or original format",
  "placeOfBirth": "place of birth / miesto narodenia",
  "nationality": "nationality / štátna príslušnosť",
  "address": "full address / adresa trvalého pobytu",
  "idNumber": "ID card number / číslo dokladu",
  "idExpiryDate": "expiry date / platnosť dokladu",
  "gender": "M or F / pohlavie"
}
Only return the JSON, no other text.`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${imageBlob.type};base64,${base64Image}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(content) as {
      academicDegree: string | null;
      firstName: string | null;
      lastName: string | null;
      dateOfBirth: string | null;
      placeOfBirth: string | null;
      nationality: string | null;
      address: string | null;
      idNumber: string | null;
      idExpiryDate: string | null;
      gender: string | null;
    };
  },
});

// Action: Lookup Postal Code
export const lookupPostalCode = action({
  args: { address: v.string() },
  handler: async (_ctx, { address }): Promise<{ postalCode: string | null; formattedAddress: string | null }> => {
    const encoded = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=1&countrycodes=sk`;

    const res = await fetch(url, {
      headers: { "User-Agent": "IDScanSK/1.0" },
    });

    if (!res.ok) return { postalCode: null, formattedAddress: null };

    const data = await res.json() as Array<{
      address?: { postcode?: string };
      display_name?: string;
    }>;

    if (!data.length) return { postalCode: null, formattedAddress: null };

    const result = data[0];
    const postalCode = result.address?.postcode?.replace(/\s/g, "") ?? null;
    const formattedAddress = result.display_name ?? null;

    return { postalCode, formattedAddress };
  },
});
