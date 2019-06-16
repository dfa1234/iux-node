import {Request, Response} from "express";
import {confServer, startServer} from "./tools/server";
import {sendMail} from "./services/send-mail";

const app = confServer();

app.get('/', (req:Request, res:Response) => res.send('Ok'));
app.get('/version', (req:Request, res:Response) => res.send('1.0.0'));
app.post('/send-mail', sendMail);
app.get('*', (req:Request, res:Response)  => res.send('404'));

startServer(app);
