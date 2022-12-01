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
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 1).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input, true);
        const result = this.findElfWithMostCalories(parsedInput);
        return this.aocClient.postAnswer(2022, 1, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 1).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input, true);
        const result = this.findElfWithMostCalories(parsedInput, 3);
        return this.aocClient.postAnswer(2022, 1, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.findElfWithMostCalories([
        '1000',
        '2000',
        '3000',
        '',
        '4000',
        '',
        '5000',
        '6000',
        '',
        '7000',
        '8000',
        '9000',
        '',
        '10000',
      ]) === 24000;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.findElfWithMostCalories(
        [
          '1000',
          '2000',
          '3000',
          '',
          '4000',
          '',
          '5000',
          '6000',
          '',
          '7000',
          '8000',
          '9000',
          '',
          '10000',
        ],
        3
      ) === 45000;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findElfWithMostCalories(calories: string[], top: number = 1): number {
    const elves = [0];
    let currentElfIndex = 0;
    for (const item of calories) {
      if (item === '') {
        currentElfIndex++;
        elves[currentElfIndex] = 0;
      } else {
        elves[currentElfIndex] += +item;
      }
    }
    const sorted = elves.sort((a, b) => b - a);
    return sorted.slice(0, top).reduce((a, b) => a + b);
  }
}
