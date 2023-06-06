import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

async function handler(req) {
    const { pathname } = new URL(req.url)

    if (pathname === '/default.css') {
        const str = await Deno.readFile(`./packages/runtime/default.css`);
        return new Response(str, {
            headers: {
                "content-type": "text/css",
            }
        });
    }

    const entries = [];
    for await (const entry of Deno.readDir(`./packages/runtime/dist`)) {
        entries.push(entry);
    }

    const entries2 = []

    for await (const entry of Deno.readDir(`./packages/runtime/demo`)) {
        entries2.push(entry);
    }

    const file = entries.find(i => pathname.slice(6) === i.name)

    if (file && file.name) {
        const str = await Deno.readFile(`./packages/runtime/dist/${file.name}`);
        return new Response(str, {
            headers: {
                "content-type": "application/javascript",
            }
        });
    }

    const file2 = entries2.find(i => pathname.slice(6) === i.name)

    if (file2 && file2.name) {
        const str = await Deno.readFile(`./packages/runtime/demo/${file2.name}`);
        return new Response(str, {
            headers: {
                "content-type": file2.name.includes('json') ? 'application/json' : file2.name.includes('css') ? "text/css" : "application/javascript"
            }
        });
    }

    const str = await Deno.readFile(`./packages/runtime/index.html`);
    return new Response(str, {
        headers: {
            "content-type": "text/html",
        }
    });

}

serve(handler);