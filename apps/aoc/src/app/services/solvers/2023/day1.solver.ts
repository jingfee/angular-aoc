import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day1Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 1).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.sumDigits(parsedInput);
        return this.aocClient.postAnswer(2023, 1, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 1).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.sumDigits2(parsedInput);
        return this.aocClient.postAnswer(2023, 1, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.sumDigits(['1abc2', 'pqr3stu8vwx', 'a1b2c3d4e5f', 'treb7uchet']) ===
      142;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.sumDigits2([
        'two1nine',
        'eightwothree',
        'abcone2threexyz',
        'xtwone3four',
        '4nineeightseven2',
        'zoneight234',
        '7pqrstsixteen',
      ]) === 281;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private sumDigits(rows: string[]): number {
    let sum = 0;
    for (const row of rows) {
      const digits = [];
      for (const c of row) {
        if (isNaN(c as unknown as number)) {
          continue;
        }
        digits.push(c);
      }
      const firstLast = digits[0] + digits[digits.length - 1];
      sum += parseInt(firstLast);
    }
    return sum;
  }

  private sumDigits2(rows: string[]): number {
    const stringDigits = {
      one: '1',
      two: '2',
      three: '3',
      four: '4',
      five: '5',
      six: '6',
      seven: '7',
      eight: '8',
      nine: '9',
    };
    let sum = 0;
    for (const row of rows) {
      const digits = [];
      for (let i = 0; i < row.length; i++) {
        if (isNaN(row[i] as unknown as number)) {
          for (const stringDigit of Object.keys(stringDigits)) {
            if (row[i] === stringDigit[0]) {
              let match = true;
              for (let j = 1; j < stringDigit.length; j++) {
                if (row[i + j] !== stringDigit[j]) {
                  match = false;
                  break;
                }
              }
              if (match) {
                digits.push(stringDigits[stringDigit]);
                break;
              }
            }
          }
        } else {
          digits.push(row[i]);
        }
      }
      const firstLast = digits[0] + digits[digits.length - 1];
      sum += parseInt(firstLast);
    }
    return sum;
  }
}
