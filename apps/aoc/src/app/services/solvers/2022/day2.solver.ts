import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day2Solver implements IDaySolver {
  private POINTS_FOR_SHAPE = {
    X: 1,
    Y: 2,
    Z: 3,
  };

  private POINTS_FOR_OUTCOME = {
    A: {
      X: 3,
      Y: 6,
      Z: 0,
    },
    B: {
      X: 0,
      Y: 3,
      Z: 6,
    },
    C: {
      X: 6,
      Y: 0,
      Z: 3,
    },
  };

  private SHAPE_FOR_OUTCOME = {
    A: {
      X: 'Z',
      Y: 'X',
      Z: 'Y',
    },
    B: {
      X: 'X',
      Y: 'Y',
      Z: 'Z',
    },
    C: {
      X: 'Y',
      Y: 'Z',
      Z: 'X',
    },
  };

  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 2).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService
          .rowInputToStringArray(input)
          .map((a) => a.split(' '));
        const result = this.calculateGameScore1(parsedInput);
        return this.aocClient.postAnswer(2022, 2, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 2).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService
          .rowInputToStringArray(input)
          .map((a) => a.split(' '));
        const result = this.calculateGameScore2(parsedInput);
        return this.aocClient.postAnswer(2022, 2, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.calculateGameScore1([
        ['A', 'Y'],
        ['B', 'X'],
        ['C', 'Z'],
      ]) === 15;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.calculateGameScore2([
        ['A', 'Y'],
        ['B', 'X'],
        ['C', 'Z'],
      ]) === 12;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private calculateGameScore1(games: string[][]): number {
    let gamePoints = 0;
    for (const game of games) {
      gamePoints += this.POINTS_FOR_SHAPE[game[1]];
      gamePoints += this.POINTS_FOR_OUTCOME[game[0]][game[1]];
    }
    return gamePoints;
  }

  private calculateGameScore2(games: string[][]): number {
    let gamePoints = 0;
    for (const game of games) {
      const myShape = this.SHAPE_FOR_OUTCOME[game[0]][game[1]];
      gamePoints += this.POINTS_FOR_SHAPE[myShape];
      gamePoints += this.POINTS_FOR_OUTCOME[game[0]][myShape];
    }
    return gamePoints;
  }
}
