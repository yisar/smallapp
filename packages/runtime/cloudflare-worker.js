import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

async function handler(req) {
    const { pathname } = new URL(req.url)

    if (pathname === '/default.css') {
        const str = await Deno.readFile(`./packages/runtime/default.css`);
        return new Response(str);
    }


    const entries = [];
    for await (const entry of Deno.readDir(`./packages/runtime/dist`)) {
        entries.push(entry);
    }

    const entries2 = []

    for await (const entry of Deno.readDir(`./packages/runtime/demo`)) {
        entries2.push(entry);
    }

    const file = entries.find(i => {
        return i.name === pathname.slice(1)
    })



    if (file && file.name) {
        const str = await Deno.readFile(`./packages/runtime/dist/${file.name}`);
        return new Response(str);
    }

    const file2 = entries.find(i => {
        return i.name === pathname.slice(1)
    })

    if (file2 && file2.name) {
        const str = await Deno.readFile(`./packages/runtime/demo/${file.name}`);
        return new Response(str);
    }

    return new Response('404', {
        headers: {
            "content-type": "text/html",
        },
    })

}

serve(handler);