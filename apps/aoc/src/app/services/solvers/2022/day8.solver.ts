import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day8Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 8).pipe(
      switchMap((input) => {
        const result = this.countTrees(
          this.utilService.rowInputToNumberMatrix(input)
        );
        return this.aocClient.postAnswer(2022, 8, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 8).pipe(
      switchMap((input) => {
        const result = this.getHighestScenicScore(
          this.utilService.rowInputToNumberMatrix(input)
        );
        return this.aocClient.postAnswer(2022, 8, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.countTrees([
        [3, 0, 3, 7, 3],
        [2, 5, 5, 1, 2],
        [6, 5, 3, 3, 2],
        [3, 3, 5, 4, 9],
        [3, 5, 3, 9, 0],
      ]) === 21;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.getScenicScore(
        [
          [3, 0, 3, 7, 3],
          [2, 5, 5, 1, 2],
          [6, 5, 3, 3, 2],
          [3, 3, 5, 4, 9],
          [3, 5, 3, 9, 0],
        ],
        1,
        2
      ) === 4 &&
      this.getScenicScore(
        [
          [3, 0, 3, 7, 3],
          [2, 5, 5, 1, 2],
          [6, 5, 3, 3, 2],
          [3, 3, 5, 4, 9],
          [3, 5, 3, 9, 0],
        ],
        3,
        2
      ) === 8 &&
      this.getHighestScenicScore([
        [3, 0, 3, 7, 3],
        [2, 5, 5, 1, 2],
        [6, 5, 3, 3, 2],
        [3, 3, 5, 4, 9],
        [3, 5, 3, 9, 0],
      ]) === 8;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private countTrees(treeMap: number[][]) {
    let trees = 0;
    for (let i = 0; i < treeMap.length; i++) {
      for (let j = 0; j < treeMap[i].length; j++) {
        let canSee = true;

        for (let direction = 0; direction < 4; direction++) {
          switch (direction) {
            case 0: {
              let k = i - 1;
              while (k >= 0) {
                if (treeMap[k][j] >= treeMap[i][j]) {
                  canSee = false;
                  break;
                }
                k--;
              }
              break;
            }
            case 1: {
              let k = j + 1;
              while (k < treeMap[i].length) {
                if (treeMap[i][k] >= treeMap[i][j]) {
                  canSee = false;
                  break;
                }
                k++;
              }
              break;
            }
            case 2: {
              let k = i + 1;
              while (k < treeMap.length) {
                if (treeMap[k][j] >= treeMap[i][j]) {
                  canSee = false;
                  break;
                }
                k++;
              }
              break;
            }
            case 3: {
              let k = j - 1;
              while (k >= 0) {
                if (treeMap[i][k] >= treeMap[i][j]) {
                  canSee = false;
                  break;
                }
                k--;
              }
              break;
            }
          }

          if (canSee) {
            trees = canSee ? trees + 1 : trees;
            break;
          } else {
            canSee = true;
          }
        }
      }
    }
    return trees;
  }

  private getHighestScenicScore(treeMap: number[][]): number {
    let highestScore = 0;
    for (let i = 1; i < treeMap.length - 1; i++) {
      for (let j = 1; j < treeMap[i].length - 1; j++) {
        const score = this.getScenicScore(treeMap, i, j);
        if (score > highestScore) {
          highestScore = score;
        }
      }
    }
    return highestScore;
  }

  private getScenicScore(treeMap: number[][], i: number, j: number): number {
    let score = 1;
    for (let direction = 0; direction < 4; direction++) {
      let count = 0;
      switch (direction) {
        case 0: {
          let k = i - 1;
          while (k >= 0) {
            count++;
            if (treeMap[k][j] >= treeMap[i][j]) {
              break;
            }
            k--;
          }
          break;
        }
        case 1: {
          let k = j + 1;
          while (k < treeMap[i].length) {
            count++;
            if (treeMap[i][k] >= treeMap[i][j]) {
              break;
            }
            k++;
          }
          break;
        }
        case 2: {
          let k = i + 1;
          while (k < treeMap.length) {
            count++;
            if (treeMap[k][j] >= treeMap[i][j]) {
              break;
            }
            k++;
          }
          break;
        }
        case 3: {
          let k = j - 1;
          while (k >= 0) {
            count++;
            if (treeMap[i][k] >= treeMap[i][j]) {
              break;
            }
            k--;
          }
          break;
        }
      }
      score *= count;
    }
    return score;
  }
}
