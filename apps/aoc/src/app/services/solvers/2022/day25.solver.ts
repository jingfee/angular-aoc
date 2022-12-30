import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day25Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 25).pipe(
      switchMap((input) => {
        const result = this.toSnafu(
          this.getFuelSum(this.utilService.rowInputToStringArray(input))
        );
        return this.aocClient.postAnswer(2022, 25, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 25).pipe(
      switchMap((input) => {
        return of(Status.ERROR);
        //return this.aocClient.postAnswer(2022, 25, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.toSnafu(
        this.getFuelSum([
          '1=-0-2',
          '12111',
          '2=0=',
          '21',
          '2=01',
          '111',
          '20012',
          '112',
          '1=-1=',
          '1-12',
          '12',
          '1=',
          '122',
        ])
      ) === '2=-1=0';

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private getFuelSum(input: string[]): number {
    let sum = 0;
    for (const line of input) {
      sum += this.toDecimal(line);
    }
    return sum;
  }

  private toDecimal(snafu: string): number {
    let decimal = 0;
    for (let i = snafu.length - 1; i >= 0; i--) {
      const c = snafu[i];
      let n;
      if (c === '-') {
        n = -1;
      } else if (c === '=') {
        n = -2;
      } else {
        n = +c;
      }
      const multiplier = Math.pow(5, snafu.length - 1 - i);
      decimal += multiplier * n;
    }
    return decimal;
  }

  private toSnafu(decimal: number): string {
    const snafu = [];
    let quotient = decimal;
    while (quotient > 0) {
      snafu.splice(0, 0, '0');
      const rest = quotient % 5;
      quotient = Math.floor(quotient / 5);

      if (rest === 3) {
        quotient++;
        snafu[0] = '=';
      } else if (rest === 4) {
        quotient++;
        snafu[0] = '-';
      } else {
        snafu[0] = rest.toString();
      }
    }
    return snafu.join('');
  }
}
