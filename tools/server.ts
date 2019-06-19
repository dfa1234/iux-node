import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as express from 'express';
import * as  bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
const sslRootCas = require('ssl-root-cas');


import {config} from "../config";

export const confServer = () => {
    const app = express();
    app.use(bodyParser.json({limit: '1mb'}));
    app.use(cookieParser());
    app.use(logger('[:date[clf]] - :remote-addr - :method - :url - :status - :response-time ms'));
    app.use((req, res, next) => {
        const origin = req.get('origin') || '*';
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers',
            'X-Requested-With, ' +
            'X-HTTP-Method-Override, ' +
            'Content-Type, ' +
            'Accept,' +
            'Access-Control-Allow-Credentials,' +
            'Authorization');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });
    return app;
}

export const startServer = (app) => {
    http.createServer(app).listen(config.server.port, () => {
        console.log('server started');
    });

    if (fs.existsSync('./tls/privkey.pem') && fs.existsSync('./tls/fullchain.pem')) {
        sslRootCas.inject();

        const serverHttps = https.createServer({
            cert: fs.readFileSync('./tls/fullchain.pem'),
            key: fs.readFileSync('./tls/privkey.pem'),
        }, app);

        serverHttps.listen(config.server.portSSL, () => {
            console.log('server ssl started');
        });
    }
};
