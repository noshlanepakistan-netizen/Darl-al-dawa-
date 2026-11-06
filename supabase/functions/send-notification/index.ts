// Supabase Edge Function: send-notification
// Sends push notifications via OneSignal REST API using the ONESIGNAL_REST_API_KEY secret.
// Deploy via: supabase functions deploy send-notification
// Set secret via: supabase secrets set ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key ONESIGNAL_APP_ID=your_onesignal_app_id

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  title: string;
  message: string;
  role?: "admin" | "patient" | "all";
  user_id?: string;
  external_id?: string;
  token?: string;
  link?: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_APP_ID =
      Deno.env.get("ONESIGNAL_APP_ID") || "PASTE_APP_ID_HERE";
    const ONESIGNAL_REST_API_KEY =
      Deno.env.get("ONESIGNAL_REST_API_KEY") || "PASTE_REST_API_KEY_HERE";

    if (!ONESIGNAL_REST_API_KEY || ONESIGNAL_REST_API_KEY === "PASTE_REST_API_KEY_HERE") {
      return new Response(
        JSON.stringify({
          error: "ONESIGNAL_REST_API_KEY is not configured in Supabase secrets.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload: NotificationPayload = await req.json();
    const { title, message, role, user_id, external_id, token, link, data } = payload;

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title and message." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build OneSignal notification request body
    const body: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title, ur: title },
      contents: { en: message, ur: message },
      url: link || "https://daraldawa.netlify.app",
      data: data || {},
    };

    // Target by specific user_id / external_id, role tag, or all subscribers
    const targetUserId = user_id || external_id;
    if (targetUserId) {
      body.include_aliases = {
        external_id: [targetUserId],
      };
      body.target_channel = "push";
    } else if (role === "admin") {
      body.filters = [
        { field: "tag", key: "role", relation: "=", value: "admin" },
      ];
    } else if (role === "patient") {
      body.filters = [
        { field: "tag", key: "role", relation: "=", value: "patient" },
      ];
    } else if (token) {
      body.filters = [
        { field: "tag", key: "appointment_token", relation: "=", value: token },
      ];
    } else {
      body.included_segments = ["Subscribed Users"];
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
