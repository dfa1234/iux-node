import {NextFunction, Request, Response} from "express";
import * as Mailgun from "mailgun-js";
import {config} from "../config";
import {Observable, of} from "rxjs";
import * as puppeteer from "puppeteer";
import {concatMap} from "rxjs/operators";


const sendMail$ = ({from, to, subject, text, attachment}:
                       { from: string, to: string, subject: string, text: string, attachment: string }) => new Observable(observer => {
    const mailgun = new Mailgun(config.mailgun);

    mailgun.messages().send({from, to, subject, text, attachment}, (error, body) => {
        console.log(body);
        if (error) {
            observer.error({success: false, error: error})
        } else {
            observer.next({success: true});
            observer.complete();
        }
    })
});


const generatePdfFrom = async (url: string, filePath: string) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle2'});
    await page.pdf({path: filePath, format: 'A4'});
    await browser.close();
};


export const sendMail = (req: Request, res: Response, next: NextFunction) => {

    const CACHE_DIR = './cache/';

    // const url = "https://news.ycombinator.com";
    // const fileName = "hn.pdf";
    //
    // const mailDatas = {
    //     from: "iux26000@gmail.com",
    //     to: "dfaure123@gmail.com",
    //     subject: "Nouveau mail",
    //     text: "Ci joint le PDF",
    //     attachment: CACHE_DIR + "/" + fileName
    // };

    const url = req.body.url;
    const fileName = req.body.fileName;

    const mailDatas = {
        from: req.body.from,
        to: req.body.to,
        subject: req.body.text,
        text: req.body.text,
        attachment: CACHE_DIR + "/" + req.body.fileName
    };

    of(generatePdfFrom(url, CACHE_DIR + "/" + fileName))
        .pipe(
            concatMap(result => sendMail$(mailDatas))
        )
        .subscribe(
            result => res.json(result)
        )

};
