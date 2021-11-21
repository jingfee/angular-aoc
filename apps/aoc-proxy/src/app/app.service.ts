import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  public getInput(year: number, day: number) {
    const url = `https://adventofcode.com/${year}/day/${day}/input`;

    return this.httpService
      .get(url, {
        headers: { cookie: `session=${environment.token}` },
      })
      .pipe(
        map((response) => {
          return { data: response.data };
        })
      );
  }

  public sendAnswer(
    year: number,
    day: number,
    part: 1 | 2,
    solution: number | string
  ) {
    const url = `https://adventofcode.com/${year}/day/${day}/answer`;
    const body = `level=${part}&answer=${solution}`;

    return this.httpService
      .post(url, body, {
        headers: {
          cookie: `session=${environment.token}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        map((response) => {
          return { data: response.data };
        })
      );
  }
}
