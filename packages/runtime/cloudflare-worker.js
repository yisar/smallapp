import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

async function handler(req) {
    const { pathname } = new URL(req.url)


    const entries = [];
    for await (const entry of Deno.readDir(`./packages/runtime/dist`)) {
        entries.push(entry);
    }

    const file = entries.find(i => {
        return i.name === pathname.slice(1)
    })


    if (file) {
        const FILE_URL = new URL(`./packages/runtime/dist/${file.name}`, import.meta.url).href;
        const resp = await fetch(FILE_URL);
        return new Response(resp.body, {
            headers: {
                "content-type": "text/html",
            },
        });
    } else {
        return new Response('404', {
            headers: {
                "content-type": "text/html",
            },
        })
    }
}

serve(handler);