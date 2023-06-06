import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

async function handler(req) {
    const { pathname } = new URL(req.url)

    
    const entries = [];
    for await (const entry of Deno.readDir(`./dist`)) {
        entries.push(entry);
    }

    // Return JSON.
    return new Response(JSON.stringify(entries, null, 2), {
        headers: {
            "content-type": "application/json",
        },
    });
}

serve(handler);