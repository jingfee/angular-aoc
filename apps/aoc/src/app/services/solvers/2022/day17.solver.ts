import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class Day17Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 17).pipe(
      switchMap((input) => {
        const result = this.rockFall(
          2022,
          input.substring(0, input.length - 1)
        );
        return this.aocClient.postAnswer(2022, 17, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 17).pipe(
      switchMap((input) => {
        const result = this.rockFall2(
          1000000000000,
          input.substring(0, input.length - 1)
        );
        //return of(Status.ERROR);
        return this.aocClient.postAnswer(2022, 17, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.rockFall(2022, '>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>') === 3068;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.rockFall2(
        1000000000000,
        '>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>'
      ) === 1514285714288;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private rockFall(numberOfRocks: number, jetStream: string): number {
    let map = [];
    const rockFormations = ['-', '+', 'L', '|', '#'];
    let streamIndex = 0;
    let coordinates;

    for (let i = 0; i < numberOfRocks; i++) {
      const currentFormation = rockFormations[i % rockFormations.length];
      [map, coordinates] = this.createRock(currentFormation, map);
      let end;

      while (true) {
        const jet = jetStream[streamIndex % jetStream.length];
        streamIndex++;
        [coordinates, map] = this.jetPush(jet, coordinates, map);
        [end, coordinates, map] = this.rockDown(coordinates, map);
        if (end) {
          for (const c of coordinates) {
            map[c[0]][c[1]] = '#';
          }
          break;
        }
      }
    }
    return map.filter((y) => y.some((x) => x === '#')).length;
  }

  private rockFall2(numberOfRocks: number, jetStream: string): number {
    let map = [];
    const rockFormations = ['-', '+', 'L', '|', '#'];
    let streamIndex = 0;
    let coordinates;
    let heightBeforePattern;
    let patternLength;
    let patternHeight;
    let patternStart;
    const streamIndexes = [];
    const heightArray = [];

    for (let i = 0; i < numberOfRocks; i++) {
      const currentFormation = rockFormations[i % rockFormations.length];
      [map, coordinates] = this.createRock(currentFormation, map);
      let end;

      const si = streamIndex % jetStream.length;
      const prev =
        i > 5
          ? streamIndexes.findIndex(
              (a, i2) =>
                a === streamIndexes[i - 5] &&
                streamIndexes[i2 + 1] === streamIndexes[i - 4] &&
                streamIndexes[i2 + 2] === streamIndexes[i - 3] &&
                streamIndexes[i2 + 3] === streamIndexes[i - 2] &&
                streamIndexes[i2 + 4] === streamIndexes[i - 1] &&
                i2 + 5 !== i
            )
          : -1;
      if (prev > -1) {
        patternStart = prev;
        heightBeforePattern = heightArray[prev];
        patternLength = i - 5 - prev;
        patternHeight = heightArray[i - 5] - heightBeforePattern;
        break;
      } else {
        streamIndexes.push(si);
      }
      heightArray.push(map.filter((y) => y.some((x) => x === '#')).length);

      while (true) {
        const jet = jetStream[streamIndex % jetStream.length];
        streamIndex++;
        [coordinates, map] = this.jetPush(jet, coordinates, map);
        [end, coordinates, map] = this.rockDown(coordinates, map);
        if (end) {
          for (const c of coordinates) {
            map[c[0]][c[1]] = '#';
          }
          break;
        }
      }
    }
    const numberOfPatterns = Math.floor(numberOfRocks / patternLength);
    const rest =
      numberOfRocks - numberOfPatterns * patternLength - patternStart;
    const heightStartPattern = heightArray[patternStart];
    const heightEnd = heightArray[patternStart + rest];
    return (
      heightBeforePattern +
      numberOfPatterns * patternHeight +
      (heightEnd - heightStartPattern)
    );
  }

  private createRock(rock: string, map: string[][]): [string[][], number[][]] {
    map = map.filter((m) => m.some((a) => a === '#'));
    map.push(
      ['.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.']
    );
    switch (rock) {
      case '-': {
        map.push(['.', '.', '@', '@', '@', '@', '.']);
        return [
          map,
          [
            [map.length - 1, 2],
            [map.length - 1, 3],
            [map.length - 1, 4],
            [map.length - 1, 5],
          ],
        ];
      }
      case '+': {
        map.push(
          ['.', '.', '.', '@', '.', '.', '.'],
          ['.', '.', '@', '@', '@', '.', '.'],
          ['.', '.', '.', '@', '.', '.', '.']
        );
        return [
          map,
          [
            [map.length - 3, 3],
            [map.length - 2, 2],
            [map.length - 2, 3],
            [map.length - 2, 4],
            [map.length - 1, 3],
          ],
        ];
      }
      case 'L': {
        map.push(
          ['.', '.', '@', '@', '@', '.', '.'],
          ['.', '.', '.', '.', '@', '.', '.'],
          ['.', '.', '.', '.', '@', '.', '.']
        );
        return [
          map,
          [
            [map.length - 3, 2],
            [map.length - 3, 3],
            [map.length - 3, 4],
            [map.length - 2, 4],
            [map.length - 1, 4],
          ],
        ];
      }
      case '|': {
        map.push(
          ['.', '.', '@', '.', '.', '.', '.'],
          ['.', '.', '@', '.', '.', '.', '.'],
          ['.', '.', '@', '.', '.', '.', '.'],
          ['.', '.', '@', '.', '.', '.', '.']
        );
        return [
          map,
          [
            [map.length - 4, 2],
            [map.length - 3, 2],
            [map.length - 2, 2],
            [map.length - 1, 2],
          ],
        ];
      }
      case '#': {
        map.push(
          ['.', '.', '@', '@', '.', '.', '.'],
          ['.', '.', '@', '@', '.', '.', '.']
        );
        return [
          map,
          [
            [map.length - 2, 2],
            [map.length - 2, 3],
            [map.length - 1, 2],
            [map.length - 1, 3],
          ],
        ];
      }
    }
    return undefined;
  }

  private jetPush(
    jet: string,
    coordinates: number[][],
    map: string[][]
  ): [coordinates: number[][], map: string[][]] {
    const newCoordinates = [];
    const newMap = _.cloneDeep(map);
    for (const c of coordinates) {
      const newX = jet === '>' ? c[1] + 1 : c[1] - 1;

      if (newX < 0 || newX === 7 || map[c[0]][newX] === '#') {
        return [coordinates, map];
      }
      newMap[c[0]][c[1]] = '.';
      newCoordinates.push([c[0], newX]);
    }
    for (const nc of newCoordinates) {
      newMap[nc[0]][nc[1]] = '@';
    }
    return [newCoordinates, newMap];
  }

  private rockDown(
    coordinates: number[][],
    map: string[][]
  ): [end: boolean, coordinates: number[][], map: string[][]] {
    const newCoordinates = [];
    const newMap = _.cloneDeep(map);
    for (const c of coordinates) {
      const newY = c[0] - 1;

      if (newY === -1 || map[newY][c[1]] === '#') {
        return [true, coordinates, map];
      }
      newMap[c[0]][c[1]] = '.';
      newCoordinates.push([newY, c[1]]);
    }
    for (const nc of newCoordinates) {
      newMap[nc[0]][nc[1]] = '@';
    }
    return [false, newCoordinates, newMap];
  }
}
