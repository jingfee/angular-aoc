import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day6Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 6).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.race(this.parseInput(parsedInput));
        return this.aocClient.postAnswer(2023, 6, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 6).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.race(this.parseInput2(parsedInput));
        return this.aocClient.postAnswer(2023, 6, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.race(
        this.parseInput(['Time:      7  15   30', 'Distance:  9  40  200']),
      ) === 288;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.race(
        this.parseInput2(['Time:      7  15   30', 'Distance:  9  40  200']),
      ) === 71503;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseInput(input: string[]) {
    const races = [];
    const timeSplit = input[0]
      .split('Time:')[1]
      .split(' ')
      .filter((t) => t !== '');
    const distanceSplit = input[1]
      .split('Distance:')[1]
      .split(' ')
      .filter((t) => t !== '');

    for (let i = 0; i < timeSplit.length; i++) {
      races.push({
        time: parseInt(timeSplit[i]),
        distance: parseInt(distanceSplit[i]),
      });
    }
    return races;
  }

  private parseInput2(input: string[]) {
    const timeSplit = input[0]
      .split('Time:')[1]
      .split(' ')
      .filter((t) => t !== '');
    const distanceSplit = input[1]
      .split('Distance:')[1]
      .split(' ')
      .filter((t) => t !== '');

    let timeString = '';
    let distanceString = '';
    for (let i = 0; i < timeSplit.length; i++) {
      timeString += timeSplit[i];
      distanceString += distanceSplit[i];
    }
    return [
      {
        time: parseInt(timeString),
        distance: parseInt(distanceString),
      },
    ];
  }

  private race(races: { time: number; distance: number }[]) {
    let prod = 1;
    for (const race of races) {
      const c1 = Math.floor(
        (race.time +
          Math.sqrt(Math.pow(-1 * race.time, 2) - 4 * (race.distance + 1))) /
          2,
      );
      const c2 = Math.ceil(
        (race.time -
          Math.sqrt(Math.pow(-1 * race.time, 2) - 4 * (race.distance + 1))) /
          2,
      );

      const waysToWin = c1 - c2 + 1;
      prod *= waysToWin;
    }
    return prod;
  }
}
