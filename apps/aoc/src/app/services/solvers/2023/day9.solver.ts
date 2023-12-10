import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day9Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 9).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.sumHistory(this.parseHistories(parsedInput), false);
        return this.aocClient.postAnswer(2023, 9, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 9).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.sumHistory(this.parseHistories(parsedInput), true);
        return this.aocClient.postAnswer(2023, 9, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.sumHistory(
        this.parseHistories([
          '0 3 6 9 12 15',
          '1 3 6 10 15 21',
          '10 13 16 21 30 45',
        ]),
        false,
      ) === 114;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.sumHistory(
        this.parseHistories([
          '0 3 6 9 12 15',
          '1 3 6 10 15 21',
          '10 13 16 21 30 45',
        ]),
        true,
      ) === 2;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseHistories(input: string[]) {
    const histories = [];
    for (const line of input) {
      const lineSplit = line.split(' ');
      histories.push(lineSplit.map((a) => parseInt(a)));
    }
    return histories;
  }

  private sumHistory(histories: number[][], start: boolean) {
    let sum = 0;
    for (const history of histories) {
      sum += this.findNextHistory(history, start);
    }
    return sum;
  }

  private findNextHistory(values: number[], start: boolean) {
    const compareValues = [values];
    let compareIndex = 0;
    while (!compareValues[compareIndex].every((v) => v === 0)) {
      compareValues.push([]);
      for (let i = 0; i < compareValues[compareIndex].length - 1; i++) {
        compareValues[compareIndex + 1].push(
          compareValues[compareIndex][i + 1] - compareValues[compareIndex][i],
        );
      }
      compareIndex++;
    }

    if (start) {
      for (let i = compareValues.length - 2; i >= 0; i--) {
        compareValues[i].unshift(compareValues[i][0] - compareValues[i + 1][0]);
      }
      return compareValues[0][0];
    } else {
      for (let i = compareValues.length - 2; i >= 0; i--) {
        compareValues[i].push(
          compareValues[i + 1][compareValues[i + 1].length - 1] +
            compareValues[i][compareValues[i].length - 1],
        );
      }
      return compareValues[0][compareValues[0].length - 1];
    }
  }
}
