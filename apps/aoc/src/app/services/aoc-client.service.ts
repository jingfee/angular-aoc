import { Injectable } from '@angular/core';
import { withCache } from '@ngneat/cashew';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Status } from '../models/status.model';

@Injectable({
  providedIn: 'root',
})
export class AocClientService {
  canSubmit = true;
  delayStart = 0;
  delayAmount = 0;

  constructor(private http: HttpClient) {}

  public getInput(year: number, day: number): Observable<string> {
    const url = `api/${year}/day/${day}/input`;

    return this.http
      .get<{ data: string }>(url, {
        context: withCache(),
      })
      .pipe(map((response) => response.data));
  }

  public postAnswer(
    year: number,
    day: number,
    part: 1 | 2,
    solution: number | string
  ) {
    if (!this.canSubmit) {
      const now = Date.now();
      const remainingMs = this.delayAmount - (now - this.delayStart);

      if (remainingMs <= 0) {
        this.canSubmit = true;
      } else {
        console.log(`You have to wait: ${this.msToReadable(remainingMs)}`);
        return Promise.resolve(Status['ERROR']);
      }
    }

    const url = `api/${year}/day/${day}/answer`;
    const answer = {
      level: part,
      answer: solution,
    };

    return this.http.post<{ data: string }>(url, answer).pipe(
      map((response) => {
        const $main = new DOMParser()
          .parseFromString(response.data, 'text/html')
          .querySelector('main');

        let status = Status['ERROR'];

        const info =
          $main !== null
            ? ($main.textContent as string).replace(/\[.*\]/, '').trim()
            : "Can't find the main element";

        if (info.includes("That's the right answer")) {
          console.log(`Status PART ${part} SOLVED!`);
          return Status['SOLVED'];
        } else if (info.includes("That's not the right answer")) {
          console.log('Status: WRONG ANSWER');
          console.log(`\n${info}\n`);
          status = Status['WRONG'];
        } else if (info.includes('You gave an answer too recently')) {
          console.log('Status: TO SOON');
        } else if (
          info.includes("You don't seem to be solving the right level")
        ) {
          console.log('Status: ALREADY COMPLETED or LOCKED');
        } else {
          console.log('Status: UNKNOWN RESPONSE\n');
          console.log(`\n${info}\n`);
        }

        const waitStr = info.match(
          /(one|two|three|four|five|six|seven|eight|nine|ten) (second|minute|hour|day)/
        );
        const waitNum = info.match(/\d+\s*(s|m|h|d)/g);

        if (waitStr !== null || waitNum !== null) {
          const waitTime: { [key: string]: number } = {
            s: 0,
            m: 0,
            h: 0,
            d: 0,
          };

          if (waitStr !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, time, unit] = waitStr;
            waitTime[unit[0]] = this.strToNum(time);
          } else if (waitNum !== null) {
            waitNum.forEach((x) => {
              waitTime[x.slice(-1)] = Number(x.slice(0, -1));
            });
          }

          this.canSubmit = false;
          this.delayStart = Date.now();
          this.delayAmount =
            (waitTime.d * 24 * 60 * 60 +
              waitTime.h * 60 * 60 +
              waitTime.m * 60 +
              waitTime.s) *
            1000;

          const delayStr = this.timeToReadable(
            waitTime.d,
            waitTime.h,
            waitTime.m,
            waitTime.s
          );

          console.log(`Next request possible in: ${delayStr}`);
        }

        return status;
      })
    );
  }

  private strToNum(time: string) {
    const entries: { [key: string]: number } = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
    };

    return entries[time] || NaN;
  }

  private timeToReadable(d: number, h: number, m: number, s: number) {
    return (
      (d !== 0 ? `${d}d ` : '') +
      (h !== 0 ? `${h}h ` : '') +
      (m !== 0 ? `${m}m ` : '') +
      (s !== 0 ? `${s}s ` : '')
    );
  }

  private msToReadable(ms: number) {
    const msSecond = 1000;
    const msMinute = 60 * msSecond;
    const msHour = 60 * msMinute;
    const msDay = 24 * msHour;

    const d = Math.floor(ms / msDay);
    const h = Math.floor((ms - msDay * d) / msHour);
    const m = Math.floor((ms - msDay * d - msHour * h) / msMinute);
    const s = Math.floor(
      (ms - msDay * d - msHour * h - msMinute * m) / msSecond
    );

    return this.timeToReadable(d, h, m, s);
  }
}
