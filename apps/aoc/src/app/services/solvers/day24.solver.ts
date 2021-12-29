import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day24Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 24).pipe(
      switchMap((input) => {
        const pairs = this.findModelNumbers();
        const result = this.findHighestModelNumber(pairs);
        return this.aocClient.postAnswer(2021, 24, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 24).pipe(
      switchMap((input) => {
        const pairs = this.findModelNumbers();
        const result = this.findLowestModelNumber(pairs);
        return this.aocClient.postAnswer(2021, 24, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findModelNumbers(): { l: number; r: number; offset: number }[] {
    const check = [13, 11, 15, -11, 14, 0, 12, 12, 14, -6, -10, -12, -3, -5];
    const offset = [13, 10, 5, 14, 5, 15, 4, 11, 1, 15, 12, 8, 14, 9];
    const stack = [];
    const pairs = [];

    for (const [index, c] of check.entries()) {
      if (c > 0) {
        stack.push({ digit: index, offset: offset[index] });
      } else {
        const popped = stack.pop();
        pairs.push({
          l: index,
          r: popped.digit,
          offset: popped.offset + check[index],
        });
      }
    }
    return pairs;
  }

  private findHighestModelNumber(
    pairs: { l: number; r: number; offset: number }[]
  ): number {
    const highestDigit = [];
    for (const pair of pairs) {
      if (pair.offset > 0) {
        highestDigit[pair.l] = 9;
        highestDigit[pair.r] = 9 - pair.offset;
      } else {
        highestDigit[pair.r] = 9;
        highestDigit[pair.l] = 9 + pair.offset;
      }
    }

    return Number.parseInt(highestDigit.join(''));
  }

  private findLowestModelNumber(
    pairs: { l: number; r: number; offset: number }[]
  ): number {
    const lowestDigit = [];
    for (const pair of pairs) {
      if (pair.offset > 0) {
        lowestDigit[pair.r] = 1;
        lowestDigit[pair.l] = 1 + pair.offset;
      } else {
        lowestDigit[pair.l] = 1;
        lowestDigit[pair.r] = 1 - pair.offset;
      }
    }

    return Number.parseInt(lowestDigit.join(''));
  }
}
