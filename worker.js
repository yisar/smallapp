import { serve } from "https://deno.land/std@0.140.0/http/server.ts"

async function handleXingtie(req) {
    const { search } = new URL(req.url)

    const api = 'https://api-takumi.mihoyo.com/common/gacha_record/api/getGachaLog' + search

    const data = await fetch(api, {
        headers: {
            "Host": "api-takumi.mihoyo.com",
            "User-Agent":
                "Mozilla/ 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 114.0.0.0 Safari / 537.36"
        }

    }).then(res => res.json())


    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    })
}


async function getJs(url) {
    const data = await fetch(url, {

    }).then(res => res.text())


    return new Response(data, {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    })
}

async function handler(req) {
    const { pathname } = new URL(req.url)

    if (pathname.includes('xingtie_chouka')) {
        return handleXingtie(req)
    }

    const entries = []

    if (pathname === '/slave.js' || pathname === '/master.js') {
        return getJs("https://npm.elemecdn.com/smallapp@latest/runtime/dist/" + pathname)
    }

    for await (const entry of Deno.readDir(`./dist`)) {
        entries.push(entry)
    }

    const file2 = entries.find(i => {
        console.log(pathname, i.name)
        return pathname.slice(1) === i.name
    })

    if (file2 && file2.name) {
        const str = await Deno.readFile(`./dist/${file2.name}`)
        return new Response(str, {
            headers: {
                "content-type": file2.name.includes('json') ? 'application/json' : file2.name.includes('css') ? "text/css" : "application/javascript"
            }
        })
    }

    const str = ` 
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fre miniapp</title>
    <link rel="stylesheet" href="https://miniapp.deno.dev/default.css">
</head>
<body>
    <script src="/slave.js"></script>
    <script>
        const worker = new Worker('/master.js')
        fakedom({ worker })
    </script>
</body>

</html>`
    return new Response(str, {
        headers: {
            "content-type": "text/html",
        }
    })

}

serve(handler)