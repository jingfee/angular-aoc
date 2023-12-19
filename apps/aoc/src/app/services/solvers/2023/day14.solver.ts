import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day14Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 14).pipe(
      switchMap((input) => {
        const parsedInput = this.parseInput(
          this.utilService.rowInputToStringArray(input),
        );
        this.tiltPlatformNorth(parsedInput);
        const result = this.calcSum(parsedInput);
        return this.aocClient.postAnswer(2023, 14, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 14).pipe(
      switchMap((input) => {
        const parsedInput = this.parseInput(
          this.utilService.rowInputToStringArray(input),
        );
        const result = this.runCycles(parsedInput);
        return this.aocClient.postAnswer(2023, 14, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const map = [
      ['O', '.', '.', '.', '.', '#', '.', '.', '.', '.'],
      ['O', '.', 'O', 'O', '#', '.', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.', '#', '#', '.', '.', '.'],
      ['O', 'O', '.', '#', 'O', '.', '.', '.', '.', 'O'],
      ['.', 'O', '.', '.', '.', '.', '.', 'O', '#', '.'],
      ['O', '.', '#', '.', '.', 'O', '.', '#', '.', '#'],
      ['.', '.', 'O', '.', '.', '#', 'O', '.', '.', 'O'],
      ['.', '.', '.', '.', '.', '.', '.', 'O', '.', '.'],
      ['#', '.', '.', '.', '.', '#', '#', '#', '.', '.'],
      ['#', 'O', 'O', '.', '.', '#', '.', '.', '.', '.'],
    ];
    this.tiltPlatformNorth(map);
    const test = this.calcSum(map) === 136;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const map = [
      ['O', '.', '.', '.', '.', '#', '.', '.', '.', '.'],
      ['O', '.', 'O', 'O', '#', '.', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.', '#', '#', '.', '.', '.'],
      ['O', 'O', '.', '#', 'O', '.', '.', '.', '.', 'O'],
      ['.', 'O', '.', '.', '.', '.', '.', 'O', '#', '.'],
      ['O', '.', '#', '.', '.', 'O', '.', '#', '.', '#'],
      ['.', '.', 'O', '.', '.', '#', 'O', '.', '.', 'O'],
      ['.', '.', '.', '.', '.', '.', '.', 'O', '.', '.'],
      ['#', '.', '.', '.', '.', '#', '#', '#', '.', '.'],
      ['#', 'O', 'O', '.', '.', '#', '.', '.', '.', '.'],
    ];
    const test = this.runCycles(map) === 64;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseInput(input: string[]) {
    return input.map((a) => [...a]);
  }

  private tiltPlatformNorth(map: string[][]) {
    for (let i = 1; i < map.length; i++) {
      for (let j = 0; j < map[0].length; j++) {
        if (map[i][j] === 'O') {
          let stopped = false;
          let moved = 0;
          while (!stopped) {
            if (i - moved === 0 || map[i - moved - 1][j] !== '.') {
              stopped = true;
              break;
            }
            moved++;
          }
          map[i][j] = '.';
          map[i - moved][j] = 'O';
        }
      }
    }
  }

  private tiltPlatformEast(map: string[][]) {
    for (let i = map[0].length - 2; i >= 0; i--) {
      for (let j = 0; j < map.length; j++) {
        if (map[j][i] === 'O') {
          let stopped = false;
          let moved = 0;
          while (!stopped) {
            if (
              i + moved === map[0].length - 1 ||
              map[j][i + moved + 1] !== '.'
            ) {
              stopped = true;
              break;
            }
            moved++;
          }
          map[j][i] = '.';
          map[j][i + moved] = 'O';
        }
      }
    }
  }

  private tiltPlatformSouth(map: string[][]) {
    for (let i = map.length - 2; i >= 0; i--) {
      for (let j = 0; j < map[0].length; j++) {
        if (map[i][j] === 'O') {
          let stopped = false;
          let moved = 0;
          while (!stopped) {
            if (i + moved === map.length - 1 || map[i + moved + 1][j] !== '.') {
              stopped = true;
              break;
            }
            moved++;
          }
          map[i][j] = '.';
          map[i + moved][j] = 'O';
        }
      }
    }
  }

  private tiltPlatformWest(map: string[][]) {
    for (let i = 1; i < map[0].length; i++) {
      for (let j = 0; j < map.length; j++) {
        if (map[j][i] === 'O') {
          let stopped = false;
          let moved = 0;
          while (!stopped) {
            if (i - moved === 0 || map[j][i - moved - 1] !== '.') {
              stopped = true;
              break;
            }
            moved++;
          }
          map[j][i] = '.';
          map[j][i - moved] = 'O';
        }
      }
    }
  }

  private calcSum(map: string[][]) {
    let sum = 0;
    for (let i = 0; i < map.length; i++) {
      const n = map[i].filter((a) => a === 'O').length;
      sum += (map.length - i) * n;
    }
    return sum;
  }

  private runCycles(map: string[][]) {
    const initialSum = this.calcSum(map);
    let newSum;
    const sums = [];
    sums.push(initialSum);
    for (let i = 0; i < 1000; i++) {
      this.tiltPlatformNorth(map);
      this.tiltPlatformWest(map);
      this.tiltPlatformSouth(map);
      this.tiltPlatformEast(map);
      newSum = this.calcSum(map);

      sums.push(newSum);
    }

    const sumNumbers = sums.filter((a, index) => sums.indexOf(a) === index);

    let loopStart: number;
    let loopLength: number;
    for (let i = 0; i < 1000; i++) {
      const nextIndex = sums.indexOf(sums[i], i + 1);
      if (nextIndex === -1) {
        continue;
      }

      const potentialLoop = sums.slice(i, nextIndex);
      const checkLoop = sums.slice(nextIndex, nextIndex + potentialLoop.length);
      if (
        potentialLoop.toString() === checkLoop.toString() &&
        sumNumbers.every((a) => sums.slice(0, nextIndex).includes(a))
      ) {
        loopStart = i;
        loopLength = potentialLoop.length;
        break;
      }
    }

    return sums[(1000000000 % loopLength) + loopStart];
  }
}
