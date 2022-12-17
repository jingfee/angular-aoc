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
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 13).pipe(
      switchMap((input) => {
        const result = this.numberOfPairsInOrder(
          this.parsePairs(this.utilService.rowInputToStringArray(input))
        );
        return this.aocClient.postAnswer(2022, 13, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 13).pipe(
      switchMap((input) => {
        const result = this.sort(
          this.parse(this.utilService.rowInputToStringArray(input))
        );
        return this.aocClient.postAnswer(2022, 13, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parsePairs([
      '[1,1,3,1,1]',
      '[1,1,5,1,1]',
      '[[1],[2,3,4]]',
      '[[1],4]',
      '[9]',
      '[[8,7,6]]',
      '[[4,4],4,4]',
      '[[4,4],4,4,4]',
      '[7,7,7,7]',
      '[7,7,7]',
      '[]',
      '[3]',
      '[[[]]]',
      '[[]]',
      '[1,[2,[3,[4,[5,6,7]]]],8,9]',
      '[1,[2,[3,[4,[5,6,0]]]],8,9]',
    ]);
    const test = this.numberOfPairsInOrder(parsed) === 13;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parse([
      '[1,1,3,1,1]',
      '[1,1,5,1,1]',
      '[[1],[2,3,4]]',
      '[[1],4]',
      '[9]',
      '[[8,7,6]]',
      '[[4,4],4,4]',
      '[[4,4],4,4,4]',
      '[7,7,7,7]',
      '[7,7,7]',
      '[]',
      '[3]',
      '[[[]]]',
      '[[]]',
      '[1,[2,[3,[4,[5,6,7]]]],8,9]',
      '[1,[2,[3,[4,[5,6,0]]]],8,9]',
    ]);
    const test = this.sort(parsed) === 140;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parsePairs(input: string[]): { pair1: any[]; pair2: any[] }[] {
    const pairs = [];
    let i = 0;
    while (i < input.length) {
      const pair = {
        pair1: JSON.parse(input[i]),
        pair2: JSON.parse(input[i + 1]),
      };
      pairs.push(pair);
      i += 2;
    }
    return pairs;
  }

  private parse(input: string[]): any[][] {
    const packets = [];
    for (const line of input) {
      packets.push(JSON.parse(line));
    }
    return packets;
  }

  private numberOfPairsInOrder(
    pairs: { pair1: any[]; pair2: any[] }[]
  ): number {
    let sum = 0;
    for (const [index, pair] of pairs.entries()) {
      if (this.inOrder(pair.pair1, pair.pair2)) {
        sum += index + 1;
      }
    }
    return sum;
  }

  private sort(packets: any[]): number {
    packets.push([[2]], [[6]]);
    packets.sort((a, b) => (this.inOrder(a, b) ? -1 : 1));

    const stringified = packets.map((a) => JSON.stringify(a));
    const i1 = stringified.findIndex((a) => a === '[[2]]') + 1;
    const i2 = stringified.findIndex((a) => a === '[[6]]') + 1;

    return i1 * i2;
  }

  private inOrder(pair1: any[] | number, pair2: any[] | number): boolean {
    if (Array.isArray(pair1) && Array.isArray(pair2)) {
      for (let i = 0; i < pair1.length; i++) {
        if (pair2.length <= i) {
          return false;
        }

        if (pair1[i] !== pair2[i]) {
          const inOrder = this.inOrder(pair1[i], pair2[i]);
          if (inOrder !== undefined) {
            return inOrder;
          }
        }
      }
      return pair1.length === pair2.length ? undefined : true;
    } else if (!Array.isArray(pair1) && Array.isArray(pair2)) {
      return this.inOrder([pair1], pair2);
    } else if (Array.isArray(pair1) && !Array.isArray(pair2)) {
      return this.inOrder(pair1, [pair2]);
    } else {
      return pair1 < pair2 ? true : pair1 === pair2 ? undefined : false;
    }
  }
}
