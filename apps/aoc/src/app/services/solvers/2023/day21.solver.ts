import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import { ChunkedQueue } from 'lite-fifo';

@Injectable({
  providedIn: 'root',
})
export class Day21Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 21).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input),
        );
        const result = this.walk(
          parsed.map,
          parsed.start,
          64,
          parsed.yMax,
          parsed.xMax,
        );
        return this.aocClient.postAnswer(2023, 21, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 21).pipe(
      switchMap((input) => {
        return this.aocClient.postAnswer(2023, 21, 2, undefined);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parse([
      '...........',
      '.....###.#.',
      '.###.##..#.',
      '..#.#...#..',
      '....#.#....',
      '.##..S####.',
      '.##..#...#.',
      '.......##..',
      '.##.#.####.',
      '.##..##.##.',
      '...........',
    ]);
    const test =
      this.walk(parsed.map, parsed.start, 6, parsed.yMax, parsed.xMax) === 16;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parse(input: string[]) {
    const map = new Map<number, string>();
    let start;
    const yMax = input.length;
    const xMax = input[0].length;

    let counter = 0;
    for (const line of input) {
      for (const c of line) {
        map.set(counter, c);
        if (c === 'S') {
          start = counter;
        }
        counter++;
      }
    }

    return { map, start, yMax, xMax };
  }

  private walk(
    map: Map<number, string>,
    start: number,
    steps: number,
    yMax: number,
    xMax: number,
  ) {
    const visited = new Set<number>();
    const queue = new ChunkedQueue();
    queue.enqueue(start);
    let positions = 0;
    while (queue.size() > 0) {
      const current = queue.dequeue();
      if (visited.has(current)) {
        continue;
      }
      visited.add(current);
      const currSteps = Math.floor(current / (xMax * yMax));
      if (currSteps === steps) {
        positions++;
        continue;
      }

      const pos = current % (xMax * yMax);
      const y = Math.floor(pos / xMax);
      const x = pos % xMax;

      if (y > 0 && map.get((y - 1) * xMax + x) !== '#') {
        queue.enqueue((currSteps + 1) * yMax * xMax + (y - 1) * xMax + x);
      }
      if (x < xMax - 1 && map.get(y * xMax + x + 1) !== '#') {
        queue.enqueue((currSteps + 1) * yMax * xMax + y * xMax + x + 1);
      }
      if (y < yMax - 1 && map.get((y + 1) * xMax + x) !== '#') {
        queue.enqueue((currSteps + 1) * yMax * xMax + (y + 1) * xMax + x);
      }
      if (x > 0 && map.get(y * xMax + x - 1) !== '#') {
        queue.enqueue((currSteps + 1) * yMax * xMax + y * xMax + x - 1);
      }
    }
    console.log(positions);
    return positions;
  }
}
