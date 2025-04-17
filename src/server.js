import http from "node:http";

import { json } from "./middlewares/json.js";
import { routes } from "./routes.js";

const server = http.createServer(async (req, res) => {
    const { method, url } = req;

    const route = routes.find((route) => {
        return route.method === method && route.path.test(url);
    });

    if (route) {
        if (['POST', 'PUT'].includes(method)) {
            await json(req, res);
        }

        return route.handler(req, res);
    }

    return res.writeHead(404).end();
});

server.listen(3334, () => {
    console.log('Server running at http://localhost:3334');
});
