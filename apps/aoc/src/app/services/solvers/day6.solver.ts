import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day6Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 6).pipe(
      switchMap((input) => {
        const initialState = this.utilService.commaInputToNumberArray(input);
        const result = this.simulateFish(initialState, 80);
        return this.aocClient.postAnswer(2021, 6, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 6).pipe(
      switchMap((input) => {
        const initialState = this.utilService.commaInputToNumberArray(input);
        const result = this.simulateFish(initialState, 256);
        return this.aocClient.postAnswer(2021, 6, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test1 = this.simulateFish([3, 4, 3, 1, 2], 18) === 26;
    const test2 = this.simulateFish([3, 4, 3, 1, 2], 80) === 5934;

    return test1 && test2 ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test = this.simulateFish([3, 4, 3, 1, 2], 256) === 26984457539;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private simulateFish(initialState: number[], days: number): number {
    let state = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const fish of initialState) {
      state[fish]++;
    }

    for (let i = 0; i < days; i++) {
      const newState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < state.length; i++) {
        if (i === 0) {
          newState[8] = state[i];
          newState[6] = state[i];
        } else {
          newState[i - 1] += state[i];
        }
      }
      state = newState;
    }

    return state.reduce((a, b) => a + b, 0);
  }
}
