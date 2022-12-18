/* eslint-disable no-constant-condition */
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
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 14).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.produceSand(parsed.cave, parsed.endY);
        return this.aocClient.postAnswer(2022, 14, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 14).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.produceSandWithFloor(parsed.cave, parsed.endY);
        return this.aocClient.postAnswer(2022, 14, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parse([
      '498,4 -> 498,6 -> 496,6',
      '503,4 -> 502,4 -> 502,9 -> 494,9',
    ]);
    const test = this.produceSand(parsed.cave, parsed.endY) === 24;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parse([
      '498,4 -> 498,6 -> 496,6',
      '503,4 -> 502,4 -> 502,9 -> 494,9',
    ]);
    const test = this.produceSandWithFloor(parsed.cave, parsed.endY) === 93;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  parse(input: string[]): { cave: string[][]; endY: number } {
    const cave = [];

    const paths = [];
    let maxX = 0;
    let maxY = 0;
    for (const line of input) {
      const split = line.split(' -> ');
      const path = [];
      for (const rockLine of split) {
        const coords = rockLine.split(',').map((a) => +a);
        path.push({ x: coords[0], y: coords[1] });

        if (coords[0] > maxX) {
          maxX = coords[0];
        }
        if (coords[1] > maxY) {
          maxY = coords[1];
        }
      }
      paths.push(path);
    }

    for (let i = 0; i <= maxY + 1; i++) {
      const row = [];
      for (let j = 0; j <= maxX + 1; j++) {
        row.push('.');
      }
      cave.push(row);
    }

    for (const path of paths) {
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];

        const diffX = from.x - to.x;
        const diffY = from.y - to.y;

        if (diffX > 0) {
          for (let j = to.x; j <= from.x; j++) {
            cave[from.y][j] = '#';
          }
        } else if (diffX < 0) {
          for (let j = from.x; j <= to.x; j++) {
            cave[from.y][j] = '#';
          }
        } else if (diffY > 0) {
          for (let j = to.y; j <= from.y; j++) {
            cave[j][from.x] = '#';
          }
        } else if (diffY < 0) {
          for (let j = from.y; j <= to.y; j++) {
            cave[j][from.x] = '#';
          }
        }
      }
    }

    return { cave, endY: maxY + 1 };
  }

  produceSand(cave: string[][], endY: number): number {
    let i = 0;
    while (true) {
      const newSand = { x: 500, y: 0 };
      let noStop = false;
      while (true) {
        if (cave[newSand.y + 1][newSand.x] === '.') {
          newSand.y++;
        } else if (cave[newSand.y + 1][newSand.x - 1] === '.') {
          newSand.y++;
          newSand.x--;
        } else if (cave[newSand.y + 1][newSand.x + 1] === '.') {
          newSand.y++;
          newSand.x++;
        } else {
          break;
        }

        if (newSand.y === endY) {
          noStop = true;
          break;
        }
      }

      if (noStop) {
        break;
      } else {
        cave[newSand.y][newSand.x] = 'o';
      }

      i++;
    }
    return i;
  }

  produceSandWithFloor(cave: string[][], endY: number): number {
    let i = 0;
    while (true) {
      const newSand = { x: 500, y: 0 };
      while (true) {
        if (cave[newSand.y + 1][newSand.x] === '.') {
          newSand.y++;
        } else if (cave[newSand.y + 1][newSand.x - 1] === '.') {
          newSand.y++;
          newSand.x--;
        } else if (
          cave[newSand.y + 1][newSand.x + 1] === '.' ||
          cave[newSand.y + 1].length === newSand.x + 1
        ) {
          newSand.y++;
          newSand.x++;
        } else {
          break;
        }

        if (newSand.y === endY) {
          break;
        }
      }

      if (cave[newSand.y].length === newSand.x) {
        cave[newSand.y].push('o');
      } else {
        cave[newSand.y][newSand.x] = 'o';
      }

      if (newSand.y === 0 && newSand.x === 500) {
        break;
      }

      i++;
    }
    return i + 1;
  }
}
