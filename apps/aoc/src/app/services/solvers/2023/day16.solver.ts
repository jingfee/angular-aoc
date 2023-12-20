import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day16Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 16).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService
          .rowInputToStringArray(input)
          .map((a) => a.split(''));
        const result = this.numberOfEnergized(parsedInput);
        return this.aocClient.postAnswer(2023, 16, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 16).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService
          .rowInputToStringArray(input)
          .map((a) => a.split(''));
        const result = this.findBestStart(parsedInput);
        return this.aocClient.postAnswer(2023, 16, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const map = [
      '.|...\\....',
      '|.-.\\.....',
      '.....|-...',
      '........|.',
      '..........',
      '.........\\',
      '..../.\\\\..',
      '.-.-/..|..',
      '.|....-|.\\',
      '..//.|....',
    ];
    const parsed = map.map((a) => a.split(''));
    const test = this.numberOfEnergized(parsed) === 46;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const map = [
      '.|...\\....',
      '|.-.\\.....',
      '.....|-...',
      '........|.',
      '..........',
      '.........\\',
      '..../.\\\\..',
      '.-.-/..|..',
      '.|....-|.\\',
      '..//.|....',
    ];
    const parsed = map.map((a) => a.split(''));
    const test = this.findBestStart(parsed) === 51;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private numberOfEnergized(map: string[][]) {
    return this.energize(map, { x: 0, y: 0, direction: 1 });
  }

  private findBestStart(map: string[][]) {
    let best = 0;
    for (let i = 0; i < map[0].length; i++) {
      const en = this.energize(map, { x: i, y: map.length - 1, direction: 0 });
      if (en > best) {
        best = en;
      }
    }
    for (let i = 0; i < map.length; i++) {
      const en = this.energize(map, {
        x: 0,
        y: i,
        direction: 1,
      });
      if (en > best) {
        best = en;
      }
    }
    for (let i = 0; i < map[0].length; i++) {
      const en = this.energize(map, {
        x: i,
        y: 0,
        direction: 2,
      });
      if (en > best) {
        best = en;
      }
    }
    for (let i = 0; i < map[0].length; i++) {
      const en = this.energize(map, {
        x: map[0].length - 1,
        y: i,
        direction: 3,
      });
      if (en > best) {
        best = en;
      }
    }
    return best;
  }

  private energize(
    map: string[][],
    start: { x: number; y: number; direction: number },
  ) {
    const queue = [];
    if (map[start.y][start.x] === '/') {
      const newDirection =
        start.direction === 0
          ? 1
          : start.direction === 1
            ? 0
            : start.direction === 2
              ? 3
              : 2;
      queue.push({ x: start.x, y: start.y, direction: newDirection });
    } else if (map[start.y][start.x] === '\\') {
      const newDirection =
        start.direction === 0
          ? 3
          : start.direction === 1
            ? 2
            : start.direction === 2
              ? 1
              : 0;
      queue.push({ x: start.x, y: start.y, direction: newDirection });
    } else if (map[start.y][start.x] === '-') {
      if (start.direction === 1 || start.direction === 3) {
        queue.push({
          x: start.x,
          y: start.y,
          direction: start.direction,
        });
      } else {
        queue.push({ x: start.x, y: start.y, direction: 1 });
        queue.push({ x: start.x, y: start.y, direction: 3 });
      }
    } else if (map[start.y][start.x] === '|') {
      if (start.direction === 0 || start.direction === 2) {
        queue.push({
          x: start.x,
          y: start.y,
          direction: start.direction,
        });
      } else {
        queue.push({ x: start.x, y: start.y, direction: 0 });
        queue.push({ x: start.x, y: start.y, direction: 2 });
      }
    } else {
      queue.push({ x: start.x, y: start.y, direction: start.direction });
    }

    const visited = new Set<number>();
    const energized = new Set<number>();

    while (queue.length > 0) {
      const state = queue.shift();

      const hash =
        state.direction * map.length * map[0].length +
        state.y * map[0].length +
        state.x;
      if (visited.has(hash)) {
        continue;
      }
      visited.add(hash);

      energized.add(state.y * map[0].length + state.x);

      let nextC;
      if (state.direction === 0 && state.y > 0) {
        nextC = { x: state.x, y: state.y - 1 };
      } else if (state.direction === 1 && state.x < map[0].length - 1) {
        nextC = { x: state.x + 1, y: state.y };
      } else if (state.direction === 2 && state.y < map.length - 1) {
        nextC = { x: state.x, y: state.y + 1 };
      } else if (state.direction === 3 && state.x > 0) {
        nextC = { x: state.x - 1, y: state.y };
      }

      if (!nextC) {
        continue;
      }
      const next = map[nextC.y][nextC.x];

      if (next === '.') {
        queue.push({ x: nextC.x, y: nextC.y, direction: state.direction });
      } else if (next === '/') {
        const newDirection =
          state.direction === 0
            ? 1
            : state.direction === 1
              ? 0
              : state.direction === 2
                ? 3
                : 2;
        queue.push({ x: nextC.x, y: nextC.y, direction: newDirection });
      } else if (next === '\\') {
        const newDirection =
          state.direction === 0
            ? 3
            : state.direction === 1
              ? 2
              : state.direction === 2
                ? 1
                : 0;
        queue.push({ x: nextC.x, y: nextC.y, direction: newDirection });
      } else if (next === '-') {
        if (state.direction === 1 || state.direction === 3) {
          queue.push({ x: nextC.x, y: nextC.y, direction: state.direction });
        } else {
          queue.push({ x: nextC.x, y: nextC.y, direction: 1 });
          queue.push({ x: nextC.x, y: nextC.y, direction: 3 });
        }
      } else if (next === '|') {
        if (state.direction === 0 || state.direction === 2) {
          queue.push({ x: nextC.x, y: nextC.y, direction: state.direction });
        } else {
          queue.push({ x: nextC.x, y: nextC.y, direction: 0 });
          queue.push({ x: nextC.x, y: nextC.y, direction: 2 });
        }
      }
    }

    return energized.size;
  }
}
