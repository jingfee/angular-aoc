import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day13Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 13).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input, true);
        const result = this.sumMirror(parsedInput);
        return this.aocClient.postAnswer(2023, 13, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 13).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input, true);
        const result = this.sumMirrorSmudge(parsedInput);
        return this.aocClient.postAnswer(2023, 13, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.sumMirror([
        '#.##..##.',
        '..#.##.#.',
        '##......#',
        '##......#',
        '..#.##.#.',
        '..##..##.',
        '#.#.##.#.',
        '',
        '#...##..#',
        '#....#..#',
        '..##..###',
        '#####.##.',
        '#####.##.',
        '..##..###',
        '#....#..#',
        '',
      ]) === 405;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.sumMirrorSmudge([
        '#.##..##.',
        '..#.##.#.',
        '##......#',
        '##......#',
        '..#.##.#.',
        '..##..##.',
        '#.#.##.#.',
        '',
        '#...##..#',
        '#....#..#',
        '..##..###',
        '#####.##.',
        '#####.##.',
        '..##..###',
        '#....#..#',
        '',
      ]) === 400;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private sumMirror(input: string[]) {
    let sum = 0;
    let a = [];
    for (const i of input) {
      if (i !== '') {
        a.push(i);
      } else {
        sum += this.sum(a);
        a = [];
      }
    }
    return sum;
  }

  private sum(a: string[], exclude?: number) {
    const v = this.testVerticalLine(a, exclude);
    if (v > -1) {
      return v;
    } else {
      const h = this.testHorizontalLine(a, exclude);
      if (h > -1) {
        return 100 * h;
      }
    }
    return -1;
  }

  private sumMirrorSmudge(input: string[]) {
    let sum = 0;
    let a = [];
    for (const i of input) {
      if (i !== '') {
        a.push(i);
      } else {
        const original = this.sum(a);
        let foundSmudge = false;
        for (let j = 0; j < a.length; j++) {
          for (let k = 0; k < a[0].length; k++) {
            if (a[j][k] === '.') {
              a[j] = a[j].substring(0, k) + '#' + a[j].substring(k + 1);
            } else {
              a[j] = a[j].substring(0, k) + '.' + a[j].substring(k + 1);
            }

            const v = this.sum(a, original);
            if (v > -1) {
              foundSmudge = true;
              sum += v;
              break;
            }

            if (a[j][k] === '.') {
              a[j] = a[j].substring(0, k) + '#' + a[j].substring(k + 1);
            } else {
              a[j] = a[j].substring(0, k) + '.' + a[j].substring(k + 1);
            }
          }
          if (foundSmudge) {
            break;
          }
        }

        a = [];
      }
    }
    return sum;
  }

  private testVerticalLine(input: string[], exclude?: number) {
    for (let i = 1; i < input[0].length; i++) {
      if (i === exclude) {
        continue;
      }
      let isMirror = true;
      for (let j = 1; j <= i && j + i < input[0].length + 1; j++) {
        for (const row of input) {
          if (row[i - j] !== row[i + j - 1]) {
            isMirror = false;
            break;
          }
        }
        if (!isMirror) {
          break;
        }
      }
      if (isMirror) {
        return i;
      }
    }
    return -1;
  }

  private testHorizontalLine(input: string[], exclude?: number) {
    for (let i = 1; i < input.length; i++) {
      if (i * 100 === exclude) {
        continue;
      }
      let isMirror = true;
      for (let j = 1; j <= i && j + i < input.length + 1; j++) {
        if (input[i - j] !== input[i + j - 1]) {
          isMirror = false;
          break;
        }
      }
      if (isMirror) {
        return i;
      }
    }
    return -1;
  }
}
