import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import { MinQueue } from 'heapify/heapify.js';

@Injectable({
  providedIn: 'root',
})
export class Day15Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 15).pipe(
      switchMap((input) => {
        const map = this.utilService.rowInputToStringArray(input);
        const result = this.findShortestRoute(
          map.map((a) => a.split('').map((b) => Number.parseInt(b))),
          0,
          9999
        );
        return this.aocClient.postAnswer(2021, 15, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 15).pipe(
      switchMap((input) => {
        const map = this.utilService.rowInputToStringArray(input);
        const result = this.findShortestRouteFullMap(
          map.map((a) => a.split('').map((b) => Number.parseInt(b))),
          0,
          249999
        );
        return this.aocClient.postAnswer(2021, 15, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.findShortestRoute(
        [
          [1, 1, 6, 3, 7, 5, 1, 7, 4, 2],
          [1, 3, 8, 1, 3, 7, 3, 6, 7, 2],
          [2, 1, 3, 6, 5, 1, 1, 3, 2, 8],
          [3, 6, 9, 4, 9, 3, 1, 5, 6, 9],
          [7, 4, 6, 3, 4, 1, 7, 1, 1, 1],
          [1, 3, 1, 9, 1, 2, 8, 1, 3, 7],
          [1, 3, 5, 9, 9, 1, 2, 4, 2, 1],
          [3, 1, 2, 5, 4, 2, 1, 6, 3, 9],
          [1, 2, 9, 3, 1, 3, 8, 5, 2, 1],
          [2, 3, 1, 1, 9, 4, 4, 5, 8, 1],
        ],
        0,
        99
      ) === 40;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.findShortestRouteFullMap(
        [
          [1, 1, 6, 3, 7, 5, 1, 7, 4, 2],
          [1, 3, 8, 1, 3, 7, 3, 6, 7, 2],
          [2, 1, 3, 6, 5, 1, 1, 3, 2, 8],
          [3, 6, 9, 4, 9, 3, 1, 5, 6, 9],
          [7, 4, 6, 3, 4, 1, 7, 1, 1, 1],
          [1, 3, 1, 9, 1, 2, 8, 1, 3, 7],
          [1, 3, 5, 9, 9, 1, 2, 4, 2, 1],
          [3, 1, 2, 5, 4, 2, 1, 6, 3, 9],
          [1, 2, 9, 3, 1, 3, 8, 5, 2, 1],
          [2, 3, 1, 1, 9, 4, 4, 5, 8, 1],
        ],
        0,
        2499
      ) === 315;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findShortestRoute(map: number[][], start: number, end: number) {
    const distance = [];
    const queue = new MinQueue(end);
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map.length; x++) {
        const neighbours = [];
        if (y > 0) {
          neighbours.push({ x, y: y - 1 });
        }
        if (x > 0) {
          neighbours.push({ x: x - 1, y });
        }
        if (y < map.length - 1) {
          neighbours.push({ x, y: y + 1 });
        }
        if (x < map.length - 1) {
          neighbours.push({ x: x + 1, y });
        }
        const risk = y * map.length + x === start ? 0 : Number.MAX_VALUE;
        distance[y * map.length + x] = {
          risk,
          neighbours,
        };
      }
    }

    queue.push(start, 0);

    while (queue.size > 0) {
      const minDistance = distance[queue.pop()];

      for (const neighbour of minDistance.neighbours) {
        const alt = minDistance.risk + map[neighbour.y][neighbour.x];
        const neighBourDistance =
          distance[neighbour.y * map.length + neighbour.x];
        if (alt < neighBourDistance.risk) {
          neighBourDistance.risk = alt;
          queue.push(neighbour.y * map.length + neighbour.x, alt);
        }
      }
    }
    return distance[end].risk;
  }

  private findShortestRouteFullMap(
    map: number[][],
    start: number,
    end: number
  ) {
    const distance = [];
    const queue = new MinQueue(end);
    for (let y = 0; y < map.length * 5; y++) {
      for (let x = 0; x < map.length * 5; x++) {
        const neighbours = [];
        if (y > 0) {
          neighbours.push({ x, y: y - 1 });
        }
        if (x > 0) {
          neighbours.push({ x: x - 1, y });
        }
        if (y < map.length * 5 - 1) {
          neighbours.push({ x, y: y + 1 });
        }
        if (x < map.length * 5 - 1) {
          neighbours.push({ x: x + 1, y });
        }
        const risk = y * map.length * 5 + x === start ? 0 : Number.MAX_VALUE;
        distance[y * map.length * 5 + x] = {
          risk,
          neighbours,
        };
      }
    }

    queue.push(start, 0);

    while (queue.size > 0) {
      const minDistance = distance[queue.pop()];

      for (const neighbour of minDistance.neighbours) {
        const alt =
          minDistance.risk +
          this.getRiskFromFullMap(map, neighbour.x, neighbour.y);
        const neighBourDistance =
          distance[neighbour.y * map.length * 5 + neighbour.x];
        if (alt < neighBourDistance.risk) {
          neighBourDistance.risk = alt;
          queue.push(neighbour.y * map.length * 5 + neighbour.x, alt);
        }
      }
    }
    return distance[end].risk;
  }

  private getRiskFromFullMap(map: number[][], x: number, y: number) {
    const distanceX = Math.floor(x / map.length);
    const distanceY = Math.floor(y / map.length);

    const relativeRisk = map[y % map.length][x % map.length];
    const risk = (relativeRisk + distanceX + distanceY) % 9;

    return risk === 0 ? 9 : risk;
  }
}
