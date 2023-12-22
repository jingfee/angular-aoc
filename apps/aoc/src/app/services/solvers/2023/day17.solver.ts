import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import { MinQueue } from 'heapify';

@Injectable({
  providedIn: 'root',
})
export class Day17Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 17).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService
          .rowInputToStringArray(input)
          .map((a) => a.split('').map((b) => parseInt(b)));
        const result = this.findBestRoute(parsedInput);
        return this.aocClient.postAnswer(2023, 17, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 17).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService
          .rowInputToStringArray(input)
          .map((a) => a.split('').map((b) => parseInt(b)));
        const result = this.findBestRouteUltra(parsedInput);
        return this.aocClient.postAnswer(2023, 17, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const map = [
      '2413432311323',
      '3215453535623',
      '3255245654254',
      '3446585845452',
      '4546657867536',
      '1438598798454',
      '4457876987766',
      '3637877979653',
      '4654967986887',
      '4564679986453',
      '1224686865563',
      '2546548887735',
      '4322674655533',
    ];
    const parsed = map.map((a) => a.split('').map((b) => parseInt(b)));
    const test = this.findBestRoute(parsed) === 102;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const map = [
      '2413432311323',
      '3215453535623',
      '3255245654254',
      '3446585845452',
      '4546657867536',
      '1438598798454',
      '4457876987766',
      '3637877979653',
      '4654967986887',
      '4564679986453',
      '1224686865563',
      '2546548887735',
      '4322674655533',
    ];
    const parsed = map.map((a) => a.split('').map((b) => parseInt(b)));
    const map2 = [
      '1111199999999999',
      '9999199999999999',
      '9999199999999999',
      '9999199999999999',
      '9999111111111111',
    ];
    const parsed2 = map2.map((a) => a.split('').map((b) => parseInt(b)));

    const test =
      this.findBestRouteUltra(parsed) === 94 &&
      this.findBestRouteUltra(parsed2) === 51;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findBestRoute(map: number[][]) {
    const distances = new Map<number, number>();
    const visited = new Set<number>();

    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[0].length; j++) {
        for (let dir = 0; dir < 4; dir++) {
          for (let same = 0; same < 3; same++) {
            distances.set(
              this.toHash(same, dir, i, j, map.length, map[0].length),
              Number.MAX_VALUE,
            );
          }
        }
      }
    }

    const queue = new MinQueue(1000000);
    queue.push(1 * map.length * map[0].length, 0);
    queue.push(2 * map.length * map[0].length, 0);
    distances.set(1 * map.length * map[0].length, 0);
    distances.set(2 * map.length * map[0].length, 0);
    while (queue.size > 0) {
      const current = queue.pop();
      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      const c = this.toCoord(current, map.length, map[0].length);
      for (let dir = 0; dir < 4; dir++) {
        if (c.same === 2 && dir == c.dir) {
          continue;
        }

        if (Math.abs(c.dir - dir) === 2) {
          continue;
        }

        if (
          (dir === 0 && c.y === 0) ||
          (dir === 1 && c.x === map[0].length - 1) ||
          (dir === 2 && c.y === map.length - 1) ||
          (dir === 3 && c.x === 0)
        ) {
          continue;
        }

        const nextX = dir === 1 ? c.x + 1 : dir === 3 ? c.x - 1 : c.x;
        const nextY = dir === 0 ? c.y - 1 : dir === 2 ? c.y + 1 : c.y;
        const nextHash = this.toHash(
          c.dir === dir ? c.same + 1 : 0,
          dir,
          nextY,
          nextX,
          map.length,
          map[0].length,
        );

        const alt = distances.get(current) + map[nextY][nextX];
        if (alt < distances.get(nextHash)) {
          distances.set(nextHash, alt);
          queue.push(nextHash, alt);
        }
      }
    }

    let best = Number.MAX_VALUE;
    for (let dir = 0; dir < 4; dir++) {
      for (let same = 0; same < 3; same++) {
        const a = distances.get(
          this.toHash(
            same,
            dir,
            map.length - 1,
            map[0].length - 1,
            map.length,
            map[0].length,
          ),
        );
        if (a < best) {
          best = a;
        }
      }
    }
    return best;
  }

  private findBestRouteUltra(map: number[][]) {
    const distances = new Map<number, number>();
    const visited = new Set<number>();

    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[0].length; j++) {
        for (let dir = 0; dir < 4; dir++) {
          for (let same = 0; same < 7; same++) {
            distances.set(
              this.toHash(same, dir, i, j, map.length, map[0].length),
              Number.MAX_VALUE,
            );
          }
        }
      }
    }

    const queue = new MinQueue(1000000);
    queue.push(
      1 * map.length * map[0].length + 4,
      map[0][1] + map[0][2] + map[0][3] + map[0][4],
    );
    queue.push(
      2 * map.length * map[0].length + 4 * map[0].length,
      map[1][0] + map[2][0] + map[3][0] + map[4][0],
    );
    distances.set(
      1 * map.length * map[0].length + 4,
      map[0][1] + map[0][2] + map[0][3] + map[0][4],
    );
    distances.set(
      2 * map.length * map[0].length + 4 * map[0].length,
      map[1][0] + map[2][0] + map[3][0] + map[4][0],
    );
    visited.add(1 * map.length * map[0].length);
    visited.add(2 * map.length * map[0].length);
    while (queue.size > 0) {
      const current = queue.pop();
      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      const c = this.toCoord(current, map.length, map[0].length);
      for (let dir = 0; dir < 4; dir++) {
        if (c.same === 6 && dir === c.dir) {
          continue;
        }

        if (Math.abs(c.dir - dir) === 2) {
          continue;
        }

        let nextX;
        let nextY;
        let alt = distances.get(current);
        if (c.dir !== dir) {
          if (
            (dir === 0 && c.y <= 3) ||
            (dir === 1 && c.x >= map[0].length - 4) ||
            (dir === 2 && c.y >= map.length - 4) ||
            (dir === 3 && c.x <= 3)
          ) {
            continue;
          }

          const nextXArr =
            dir === 1
              ? [c.x + 1, c.x + 2, c.x + 3, c.x + 4]
              : dir === 3
                ? [c.x - 1, c.x - 2, c.x - 3, c.x - 4]
                : [c.x, c.x, c.x, c.x];
          const nextYArr =
            dir === 0
              ? [c.y - 1, c.y - 2, c.y - 3, c.y - 4]
              : dir === 2
                ? [c.y + 1, c.y + 2, c.y + 3, c.y + 4]
                : [c.y, c.y, c.y, c.y];

          for (let i = 0; i < 4; i++) {
            alt += map[nextYArr[i]][nextXArr[i]];
          }
          nextX = nextXArr[3];
          nextY = nextYArr[3];
        } else {
          if (
            (dir === 0 && c.y === 0) ||
            (dir === 1 && c.x === map[0].length - 1) ||
            (dir === 2 && c.y === map.length - 1) ||
            (dir === 3 && c.x === 0)
          ) {
            continue;
          }

          nextX = dir === 1 ? c.x + 1 : dir === 3 ? c.x - 1 : c.x;
          nextY = dir === 0 ? c.y - 1 : dir === 2 ? c.y + 1 : c.y;
          alt += map[nextY][nextX];
        }

        const nextHash = this.toHash(
          c.dir === dir ? c.same + 1 : 0,
          dir,
          nextY,
          nextX,
          map.length,
          map[0].length,
        );

        if (alt < distances.get(nextHash)) {
          distances.set(nextHash, alt);
          queue.push(nextHash, alt);
        }
      }
    }

    let best = Number.MAX_VALUE;
    for (let dir = 0; dir < 4; dir++) {
      for (let same = 0; same < 7; same++) {
        const a = distances.get(
          this.toHash(
            same,
            dir,
            map.length - 1,
            map[0].length - 1,
            map.length,
            map[0].length,
          ),
        );
        if (a < best) {
          best = a;
        }
      }
    }
    return best;
  }

  private toCoord(val: number, maxY: number, maxX: number) {
    const same = Math.floor(val / (4 * maxX * maxY));
    const rest1 = val % (4 * maxX * maxY);
    const dir = Math.floor(rest1 / (maxX * maxY));
    const rest2 = rest1 % (maxX * maxY);
    const y = Math.floor(rest2 / maxX);
    const x = rest2 % maxX;

    return { same, dir, y, x };
  }

  private toHash(
    same: number,
    dir: number,
    y: number,
    x: number,
    maxY: number,
    maxX: number,
  ) {
    return same * 4 * maxY * maxX + dir * maxY * maxX + y * maxX + x;
  }
}
