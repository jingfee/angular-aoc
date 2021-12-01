import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day1Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 1).pipe(
      switchMap((input) => {
        const sonarResult = this.utilService.rowInputToNumberArray(input);
        const result = this.findIncrease(sonarResult);
        return this.aocClient.postAnswer(2021, 1, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 1).pipe(
      switchMap((input) => {
        const sonarResult = this.utilService.rowInputToNumberArray(input);
        const result = this.findIncreaseWithSlidingWindow(sonarResult);
        return this.aocClient.postAnswer(2021, 1, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.findIncrease([199, 200, 208, 210, 200, 207, 240, 269, 260, 263]) ===
      7;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.findIncreaseWithSlidingWindow([
        199, 200, 208, 210, 200, 207, 240, 269, 260, 263,
      ]) === 5;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findIncrease(report: number[]) {
    let sum = 0;
    for (let i = 0; i < report.length - 1; i++) {
      if (report[i + 1] > report[i]) {
        sum++;
      }
    }
    return sum;
  }

  private findIncreaseWithSlidingWindow(report: number[]) {
    const windows = [];
    for (let i = 0; i < report.length - 2; i++) {
      windows.push(report[i] + report[i + 1] + report[i + 2]);
    }

    return this.findIncrease(windows);
  }
}
