import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day11Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 11).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.findDistances(parsedInput);
        return this.aocClient.postAnswer(2023, 11, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 11).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.findDistancesOld(parsedInput, 1000000);
        return this.aocClient.postAnswer(2023, 11, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.findDistances([
        '...#......',
        '.......#..',
        '#.........',
        '..........',
        '......#...',
        '.#........',
        '.........#',
        '..........',
        '.......#..',
        '#...#.....',
      ]) === 374;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.findDistancesOld(
        [
          '...#......',
          '.......#..',
          '#.........',
          '..........',
          '......#...',
          '.#........',
          '.........#',
          '..........',
          '.......#..',
          '#...#.....',
        ],
        10,
      ) === 1030 &&
      this.findDistancesOld(
        [
          '...#......',
          '.......#..',
          '#.........',
          '..........',
          '......#...',
          '.#........',
          '.........#',
          '..........',
          '.......#..',
          '#...#.....',
        ],
        100,
      ) === 8410;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findDistances(map: string[]) {
    const expandCols = [];
    const expandRows = [];
    for (let i = 0; i < map.length; i++) {
      if ([...map[i]].every((a) => a === '.')) {
        expandRows.push(i);
      }
    }
    for (let i = 0; i < map[0].length; i++) {
      if (map.every((a) => a[i] === '.')) {
        expandCols.push(i);
      }
    }

    for (const [index, row] of expandRows.entries()) {
      map.splice(row + index, 0, '.'.repeat(map[0].length));
    }
    for (const [index, col] of expandCols.entries()) {
      for (let i = 0; i < map.length; i++) {
        map[i] =
          map[i].substring(0, col + index + 1) +
          '.' +
          map[i].substring(col + index + 1);
      }
    }

    const galaxies = [];
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[0].length; j++) {
        if (map[i][j] === '#') {
          galaxies.push({ x: j, y: i });
        }
      }
    }

    let sum = 0;
    for (let i = 0; i < galaxies.length; i++) {
      for (let j = i + 1; j < galaxies.length; j++) {
        const d =
          Math.abs(galaxies[i].x - galaxies[j].x) +
          Math.abs(galaxies[i].y - galaxies[j].y);
        sum += d;
      }
    }

    return sum;
  }

  private findDistancesOld(map: string[], times: number) {
    const expandCols = [];
    const expandRows = [];
    for (let i = 0; i < map.length; i++) {
      if ([...map[i]].every((a) => a === '.')) {
        expandRows.push(i);
      }
    }
    for (let i = 0; i < map[0].length; i++) {
      if (map.every((a) => a[i] === '.')) {
        expandCols.push(i);
      }
    }

    const galaxies = [];
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[0].length; j++) {
        if (map[i][j] === '#') {
          galaxies.push({ x: j, y: i });
        }
      }
    }

    let sum = 0;
    for (let i = 0; i < galaxies.length; i++) {
      for (let j = i + 1; j < galaxies.length; j++) {
        let expandedColsBetween = 0;
        let expandedRowsBetween = 0;
        for (const col of expandCols) {
          if (
            (galaxies[i].x > col && galaxies[j].x < col) ||
            (galaxies[i].x < col && galaxies[j].x > col)
          ) {
            expandedColsBetween++;
          }
        }
        for (const row of expandRows) {
          if (
            (galaxies[i].y > row && galaxies[j].y < row) ||
            (galaxies[i].y < row && galaxies[j].y > row)
          ) {
            expandedRowsBetween++;
          }
        }

        const d =
          Math.abs(galaxies[i].x - galaxies[j].x) +
          Math.abs(galaxies[i].y - galaxies[j].y) +
          (expandedColsBetween + expandedRowsBetween) * (times - 1);
        sum += d;
      }
    }

    return sum;
  }
}
