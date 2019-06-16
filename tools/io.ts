import {from, Observable} from 'rxjs';
import * as fs from 'fs-extra';

export const readFile$ = (path: string) => from(fs.readFile(path, 'utf8'));

export const writeFile$ = (content: string, path: string) => from(fs.writeFile(path, content, 'utf8'));

export const readDir$ = (path: string): Observable<string[]> => from(fs.readdir(path, 'utf8')) as any;
