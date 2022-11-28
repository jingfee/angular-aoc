import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day25Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 25).pipe(
      switchMap((input) => {
        const map = this.parseMap(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.simulate(map);
        return this.aocClient.postAnswer(2021, 25, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 25).pipe(
      switchMap(() => {
        return this.aocClient.postAnswer(2021, 25, 2, '');
      })
    );
  }

  test_part_one(): Observable<Status> {
    const map = this.parseMap([
      'v...>>.vv>',
      '.vv>>.vv..',
      '>>.>v>...v',
      '>>v>>.>.v.',
      'v>v.vv.v..',
      '>.>>..v...',
      '.vv..>.>v.',
      'v.v..>>v.v',
      '....v..v.>',
    ]);
    const test = this.simulate(map) === 58;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseMap(mapString: string[]): string[][] {
    const map = [];
    for (const stringRow of mapString) {
      if (stringRow === '') {
        continue;
      }

      map.push(Array.from(stringRow));
    }
    return map;
  }

  private simulate(map: string[][]): number {
    let steps = 0;
    let hasMoved = true;
    while (hasMoved) {
      hasMoved = false;
      const afterEastMoveMap = [];
      for (let i = 0; i < map.length; i++) {
        const newRow = [];
        for (let j = 0; j < map[0].length; j++) {
          if (newRow[j] !== undefined) {
            continue;
          }

          if (j > 0 && map[i][j] === '.' && map[i][j - 1] === '>') {
            newRow[j] = '>';
            newRow[j - 1] = '.';
            hasMoved = true;
          } else if (
            j === 0 &&
            map[i][0] === '.' &&
            map[i][map[0].length - 1] === '>'
          ) {
            newRow[0] = '>';
            newRow[map[0].length - 1] = '.';
            hasMoved = true;
          } else {
            newRow[j] = map[i][j];
          }
        }
        afterEastMoveMap.push(newRow);
      }
      const afterSouthMoveMap = [];
      for (let i = 0; i < afterEastMoveMap.length; i++) {
        if (afterSouthMoveMap[i] === undefined) {
          afterSouthMoveMap[i] = [];
        }
        for (let j = 0; j < afterEastMoveMap[0].length; j++) {
          if (afterSouthMoveMap[i][j] !== undefined) {
            continue;
          }
          if (
            i > 0 &&
            afterEastMoveMap[i][j] === '.' &&
            afterEastMoveMap[i - 1][j] === 'v'
          ) {
            afterSouthMoveMap[i - 1][j] = '.';
            afterSouthMoveMap[i][j] = 'v';
            hasMoved = true;
          } else if (
            i === 0 &&
            afterEastMoveMap[map.length - 1][j] === 'v' &&
            afterEastMoveMap[0][j] === '.'
          ) {
            afterSouthMoveMap[0][j] = 'v';
            if (afterSouthMoveMap[map.length - 1] === undefined) {
              afterSouthMoveMap[map.length - 1] = [];
            }
            afterSouthMoveMap[map.length - 1][j] = '.';
            hasMoved = true;
          } else {
            afterSouthMoveMap[i][j] = afterEastMoveMap[i][j];
          }
        }
      }
      map = afterSouthMoveMap;
      steps++;
    }
    return steps;
  }
}
