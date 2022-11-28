import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day21Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 21).pipe(
      switchMap((input) => {
        const split = input.split('\n');
        const result = this.play(
          Number.parseInt(split[0].split(' ')[4]),
          Number.parseInt(split[1].split(' ')[4])
        );
        return this.aocClient.postAnswer(2021, 21, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 21).pipe(
      switchMap((input) => {
        const split = input.split('\n');
        const startP1 = Number.parseInt(split[0].split(' ')[4]);
        const startP2 = Number.parseInt(split[1].split(' ')[4]);
        const state = this.playQuantum();
        const win1 = state[0][0][startP1][startP2][0];
        const win2 = state[0][0][startP2][startP1][1];
        return this.aocClient.postAnswer(2021, 21, 2, Math.max(win1, win2));
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test = this.play(4, 8) === 739785;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const states = this.playQuantum();
    const test1 = states[0][0][4][8][0] === 444356092776315;
    const test2 = states[0][0][8][4][1] === 341960390180808;

    return test1 && test2 ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private play(startP1: number, startP2: number): number {
    let posP1 = startP1;
    let posP2 = startP2;
    let pointsP1 = 0;
    let pointsP2 = 0;
    let rolls = 0;
    let turn = 0;
    while (pointsP1 < 1000 && pointsP2 < 1000) {
      let moves = 0;
      for (let i = 0; i < 3; i++) {
        moves += (rolls % 100) + 1;
        rolls++;
      }

      if (turn === 0) {
        posP1 = ((posP1 + moves - 1) % 10) + 1;
        pointsP1 += posP1;
        turn = 1;
      } else {
        posP2 = ((posP2 + moves - 1) % 10) + 1;
        pointsP2 += posP2;
        turn = 0;
      }
    }

    return Math.min(pointsP1, pointsP2) * rolls;
  }

  private playQuantum(): number[][][][] {
    const points = {
      3: 1,
      4: 3,
      5: 6,
      6: 7,
      7: 6,
      8: 3,
      9: 1,
    };

    const states = [];
    for (let pts1 = 20; pts1 >= 0; pts1--) {
      states[pts1] = [];
      for (let pts2 = 20; pts2 >= 0; pts2--) {
        states[pts1][pts2] = [];
        for (let pos1 = 1; pos1 <= 10; pos1++) {
          states[pts1][pts2][pos1] = [];
          for (let pos2 = 1; pos2 <= 10; pos2++) {
            states[pts1][pts2][pos1][pos2] = [];
            for (let turn = 0; turn < 2; turn++) {
              states[pts1][pts2][pos1][pos2][turn] = 0;
              for (let possibleSteps = 3; possibleSteps <= 9; possibleSteps++) {
                if (turn === 0) {
                  const newPos1 = ((pos1 + possibleSteps - 1) % 10) + 1;

                  if (pts1 + newPos1 >= 21) {
                    states[pts1][pts2][pos1][pos2][0] += points[possibleSteps];
                  } else {
                    states[pts1][pts2][pos1][pos2][0] +=
                      points[possibleSteps] *
                      states[pts1 + newPos1][pts2][newPos1][pos2][1];
                  }
                } else {
                  const newPos2 = ((pos2 + possibleSteps - 1) % 10) + 1;

                  if (pts2 + newPos2 < 21) {
                    states[pts1][pts2][pos1][pos2][1] +=
                      points[possibleSteps] *
                      states[pts1][pts2 + newPos2][pos1][newPos2][0];
                  }
                }
              }
            }
          }
        }
      }
    }
    return states;
  }
}
