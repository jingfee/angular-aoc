import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day3Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 3).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.findNumbers(parsedInput);
        return this.aocClient.postAnswer(2023, 3, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 3).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.findGears(parsedInput);
        return this.aocClient.postAnswer(2023, 3, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.findNumbers([
        '467..114..',
        '...*......',
        '..35..633.',
        '......#...',
        '617*......',
        '.....+.58.',
        '..592.....',
        '......755.',
        '...$.*....',
        '.664.598..',
      ]) === 4361;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.findGears([
        '467..114..',
        '...*......',
        '..35..633.',
        '......#...',
        '617*......',
        '.....+.58.',
        '..592.....',
        '......755.',
        '...$.*....',
        '.664.598..',
      ]) === 467835;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findNumbers(engineSchematic: string[]) {
    let sum = 0;
    for (let i = 0; i < engineSchematic.length; i++) {
      const row = engineSchematic[i];
      for (let j = 0; j < row.length; j++) {
        if (!isNaN(row[j] as unknown as number)) {
          let number = row[j];
          let k = j + 1;
          while (!isNaN(row[k] as unknown as number) && k < row.length) {
            number += row[k];
            k++;
          }
          if (this.checkAdjacent(engineSchematic, i, j, k - 1)) {
            sum += parseInt(number);
          }
          j = k;
        }
      }
    }
    return sum;
  }

  private checkAdjacent(
    engineSchematic: string[],
    row: number,
    start: number,
    end: number,
  ) {
    if (row > 0) {
      for (
        let i = start === 0 ? 0 : start - 1;
        i < (end === engineSchematic[0].length - 1 ? end + 1 : end + 2);
        i++
      ) {
        const check = engineSchematic[row - 1][i];
        if (isNaN(check as unknown as number) && check !== '.') {
          return true;
        }
      }
    }
    if (row < engineSchematic.length - 1) {
      for (
        let i = start === 0 ? 0 : start - 1;
        i < (end === engineSchematic[0].length - 1 ? end + 1 : end + 2);
        i++
      ) {
        const check = engineSchematic[row + 1][i];
        if (isNaN(check as unknown as number) && check !== '.') {
          return true;
        }
      }
    }
    if (start > 0) {
      const check = engineSchematic[row][start - 1];
      if (isNaN(check as unknown as number) && check !== '.') {
        return true;
      }
    }
    if (end < engineSchematic[0].length - 1) {
      const check = engineSchematic[row][end + 1];
      if (isNaN(check as unknown as number) && check !== '.') {
        return true;
      }
    }
    return false;
  }

  private findGears(engineSchematic: string[]) {
    const possibleGears = new Map<number, number[]>();
    for (let i = 0; i < engineSchematic.length; i++) {
      const row = engineSchematic[i];
      for (let j = 0; j < row.length; j++) {
        if (!isNaN(row[j] as unknown as number)) {
          let number = row[j];
          let k = j + 1;
          while (!isNaN(row[k] as unknown as number) && k < row.length) {
            number += row[k];
            k++;
          }
          const gearId = this.checkAdjacentGear(engineSchematic, i, j, k - 1);
          if (gearId > -1) {
            if (!possibleGears.has(gearId)) {
              possibleGears.set(gearId, []);
            }
            const gears = possibleGears.get(gearId);
            gears.push(parseInt(number));
            possibleGears.set(gearId, gears);
          }
          j = k;
        }
      }
    }

    let gearRatios = 0;
    for (const possibleGear of possibleGears.values()) {
      if (possibleGear.length === 2) {
        gearRatios += possibleGear[0] * possibleGear[1];
      }
    }

    return gearRatios;
  }

  private checkAdjacentGear(
    engineSchematic: string[],
    row: number,
    start: number,
    end: number,
  ) {
    if (row > 0) {
      for (
        let i = start === 0 ? 0 : start - 1;
        i < (end === engineSchematic[0].length - 1 ? end + 1 : end + 2);
        i++
      ) {
        const check = engineSchematic[row - 1][i];
        if (check === '*') {
          return (row - 1) * engineSchematic[0].length + i;
        }
      }
    }
    if (row < engineSchematic.length - 1) {
      for (
        let i = start === 0 ? 0 : start - 1;
        i < (end === engineSchematic[0].length - 1 ? end + 1 : end + 2);
        i++
      ) {
        const check = engineSchematic[row + 1][i];
        if (check === '*') {
          return (row + 1) * engineSchematic[0].length + i;
        }
      }
    }
    if (start > 0) {
      const check = engineSchematic[row][start - 1];
      if (check === '*') {
        return row * engineSchematic[0].length + start - 1;
      }
    }
    if (end < engineSchematic[0].length - 1) {
      const check = engineSchematic[row][end + 1];
      if (check === '*') {
        return row * engineSchematic[0].length + end + 1;
      }
    }
    return -1;
  }
}
