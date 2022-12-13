import { Injectable } from '@angular/core';
import { MinQueue } from 'heapify';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day12Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 12).pipe(
      switchMap((input) => {
        const parsed = this.parseMap(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.findShortestRoute(
          parsed.map,
          parsed.start,
          parsed.end
        );
        return this.aocClient.postAnswer(2022, 12, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 12).pipe(
      switchMap((input) => {
        const parsed = this.parseMap(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.findShortestHikingRoute(
          parsed.map,
          parsed.start,
          parsed.altStarts,
          parsed.end
        );
        return this.aocClient.postAnswer(2022, 12, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parseMap([
      'Sabqponm',
      'abcryxxl',
      'accszExk',
      'acctuvwj',
      'abdefghi',
    ]);
    const test =
      this.findShortestRoute(parsed.map, parsed.start, parsed.end) === 31;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parseMap([
      'Sabqponm',
      'abcryxxl',
      'accszExk',
      'acctuvwj',
      'abdefghi',
    ]);
    const test =
      this.findShortestHikingRoute(
        parsed.map,
        parsed.start,
        parsed.altStarts,
        parsed.end
      ) === 29;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseMap(input: string[]): {
    map: number[][];
    start: number;
    altStarts: number[];
    end: number;
  } {
    const map = [];
    const altStarts = [];
    let start;
    let end;

    let count = 0;
    for (const line of input) {
      const row = [];
      for (const char of line) {
        if (char === 'S') {
          row.push(96);
          start = count;
        } else if (char === 'E') {
          row.push(123);
          end = count;
        } else if (char === 'a') {
          row.push(char.charCodeAt(0));
          altStarts.push(count);
        } else {
          row.push(char.charCodeAt(0));
        }

        count++;
      }
      map.push(row);
    }

    return { map, start, altStarts, end };
  }

  private findShortestHikingRoute(
    map: number[][],
    start: number,
    altStarts: number[],
    end: number
  ): number {
    let shortestPath = Number.MAX_VALUE;
    const allStarts = [...altStarts, start];
    for (const s of allStarts) {
      const route = this.findShortestRoute(map, s, end);
      if (route < shortestPath) {
        shortestPath = route;
      }
    }
    return shortestPath;
  }

  private findShortestRoute(
    map: number[][],
    start: number,
    end: number
  ): number {
    const distance = [];
    const queue = new MinQueue(map.length * map[0].length);
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const neighbours = [];
        if (y > 0 && map[y - 1][x] <= map[y][x] + 1) {
          neighbours.push({ x, y: y - 1 });
        }
        if (x > 0 && map[y][x - 1] <= map[y][x] + 1) {
          neighbours.push({ x: x - 1, y });
        }
        if (y < map.length - 1 && map[y + 1][x] <= map[y][x] + 1) {
          neighbours.push({ x, y: y + 1 });
        }
        if (x < map[y].length - 1 && map[y][x + 1] <= map[y][x] + 1) {
          neighbours.push({ x: x + 1, y });
        }
        const normalizedCoordinate = y * map[0].length + x;
        distance[normalizedCoordinate] = {
          risk: normalizedCoordinate === start ? 0 : Number.MAX_VALUE,
          neighbours,
        };
      }
    }

    queue.push(start, 0);

    while (queue.size > 0) {
      const minDistance = distance[queue.pop()];

      for (const neighbour of minDistance.neighbours) {
        const alt = minDistance.risk + 1;
        const neighBourDistance =
          distance[neighbour.y * map[0].length + neighbour.x];
        if (alt < neighBourDistance.risk) {
          neighBourDistance.risk = alt;
          queue.push(neighbour.y * map[0].length + neighbour.x, alt);
        }
      }
    }
    return distance[end].risk;
  }
}
