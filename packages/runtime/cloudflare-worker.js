import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

async function handler(req) {
    const { pathname } = new URL(req.url)


    const entries = [];
    for await (const entry of Deno.readDir(`./packages/runtime/dist`)) {
        entries.push(entry);
    }

    const file = entries.find(i => i.name === pathname.slice(1)).name
    console.log(file)

    const FILE_URL = new URL(`./packages/runtime/dist/${file}`, import.meta.url).href;

    const resp = await fetch(FILE_URL);


    // Return JSON.
    return new Response(resp.body, {
        headers: {
            "content-type": "text/html",
        },
    });
}

serve(handler);