import {NextFunction, Request, Response} from "express";
import * as Mailgun from "mailgun-js";
import {config} from "../config";
import {from, Observable, of} from "rxjs";
import * as puppeteer from "puppeteer";
import {concatMap, map} from "rxjs/operators";

const sendMail$ = ({from, to, subject, text, attachment}:
                       { from: string, to: string, subject: string, text: string, attachment: string }) => new Observable<any>(observer => {
    const mailgun = new Mailgun(config.mailgun);

    mailgun.messages().send({from, to, subject, text, attachment}, (error, body) => {
        if (error) {
            observer.error({success: false, error: error});
        } else {
            observer.next({success: true, status: body});
            observer.complete();
        }
    });
});

const generatePdfFrom$ = (url: string, filePath: string) => {
    let browser, page, possibleErrors = null;
    return from(puppeteer.launch())
        .pipe(
            concatMap(b => {
                browser = b;
                return from(browser.newPage());
            }),
            concatMap(p => {
                page = p;

                page.on('console', conMess => {
                    debugger;
                    if (conMess && conMess._type === "error") {
                        if (!possibleErrors) {
                            possibleErrors = [];
                        }

                        possibleErrors.push({
                                                location: conMess._location && conMess._location.url,
                                                text: conMess._text
                                            });
                    }
                });

                return from(page.goto(url, {waitUntil: ['domcontentloaded', 'networkidle0']}));
            }),
            concatMap(r => from(page.pdf({path: filePath, format: 'A4', printBackground: true}))),
            concatMap(r => from(browser.close())),
            map(r => possibleErrors)
        );
};

export const sendMail = (req: Request, res: Response, next: NextFunction) => {

    const CACHE_DIR = './cache';

    debugger;

    generatePdfFrom$(req.body.url, CACHE_DIR + "/" + req.body.fileName)
        .pipe(
            concatMap(possibleErrors => {
                if(possibleErrors){
                    return of({success:false, status:'js errors on the page detected',pageErrors:possibleErrors})
                }else{
                    return sendMail$({
                          from: req.body.from,
                          to: req.body.to,
                          subject: req.body.subject,
                          text: req.body.text,
                          attachment: CACHE_DIR + "/" + req.body.fileName
                    })
                }
            })
        )
        .subscribe(
            resultMail => {
                res.json(resultMail);
            },
            resError => {
                res.json(resError);
            }
        );

};
