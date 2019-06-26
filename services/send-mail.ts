import {NextFunction, Request, Response} from "express";
import * as Mailgun from "mailgun-js";
import {config} from "../config";
import {from, Observable} from "rxjs";
import * as puppeteer from "puppeteer";
import {concatMap, map} from "rxjs/operators";

const sendMail$ = ({from, to, subject, text, attachment}:
                       { from: string, to: string, subject: string, text: string, attachment: string }) => new Observable<any>(observer => {
    const mailgun = new Mailgun(config.mailgun);

    mailgun.messages().send({from, to, subject, text, attachment}, (error, body) => {
        console.log(body);
        if (error) {
            observer.error({success: false, error: error});
        } else {
            observer.next({success: true});
            observer.complete();
        }
    });
});

const generatePdfFrom$ = (url: string, filePath: string) => {
    let browser, page, possibleError;
    return from(puppeteer.launch())
        .pipe(
            concatMap(b => {
                browser = b;
                return from(browser.newPage());
            }),
            concatMap(p => {
                page = p;
                page.on("pageerror", (err) => {
                    possibleError = "Page error: " + err.toString();
                    console.log(possibleError);
                });
                return from(page.goto(url, {waitUntil: ['domcontentloaded', 'networkidle0']}));
            }),
            concatMap(r => from(page.pdf({path: filePath, format: 'A4', printBackground: true}))),
            concatMap(r => from(browser.close())),
            map(r => possibleError)
        );
};

export const sendMail = (req: Request, res: Response, next: NextFunction) => {

    const CACHE_DIR = './cache';

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

    debugger;

    const url = req.body.url;
    const fileName = req.body.fileName;

    const mailDatas = {
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.text,
        attachment: CACHE_DIR + "/" + req.body.fileName
    };

    let possibleError = null;

    generatePdfFrom$(url, CACHE_DIR + "/" + fileName)
        .pipe(
            concatMap(err => {
                possibleError = err;
                return sendMail$(mailDatas);
            })
        )
        .subscribe(
            result => {

                if (possibleError) {
                    result.pageErrors = possibleError;
                    console.log(possibleError);
                }

                res.json(result);
            }
        );

};
