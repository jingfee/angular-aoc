import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import { MinQueue } from 'heapify';
import { ChunkedQueue } from 'lite-fifo';

@Injectable({
  providedIn: 'root',
})
export class Day10Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 10).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.findFarthestPos(parsedInput);
        return this.aocClient.postAnswer(2023, 10, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 10).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.findEnclosed(parsedInput);
        return this.aocClient.postAnswer(2023, 10, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.findFarthestPos(['..F7.', '.FJ|.', 'SJ.L7', '|F--J', 'LJ...']) === 8;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.findEnclosed([
        '..........',
        '.S------7.',
        '.|F----7|.',
        '.||....||.',
        '.||....||.',
        '.|L-7F-J|.',
        '.|..||..|.',
        '.L--JL--J.',
        '..........',
      ]) === 4 &&
      this.findEnclosed([
        '.F----7F7F7F7F-7....',
        '.|F--7||||||||FJ....',
        '.||.FJ||||||||L7....',
        'FJL7L7LJLJ||LJ.L-7..',
        'L--J.L7...LJS7F-7L7.',
        '....F-J..F7FJ|L7L7L7',
        '....L7.F7||L7|.L7L7|',
        '.....|FJLJ|FJ|F7|.LJ',
        '....FJL-7.||.||||...',
        '....L---J.LJ.LJLJ...',
      ]) === 8 &&
      this.findEnclosed([
        'FF7FSF7F7F7F7F7F---7',
        'L|LJ||||||||||||F--J',
        'FL-7LJLJ||||||LJL-77',
        'F--JF--7||LJLJIF7FJ-',
        'L---JF-JLJIIIIFJLJJ7',
        '|F|F-JF---7IIIL7L|7|',
        '|FFJF7L7F-JF7IIL---7',
        '7-L-JL7||F7|L7F-7F7|',
        'L.L7LFJ|||||FJL7||LJ',
        'L7JLJL-JLJLJL--JLJ.L',
      ]) === 10;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findFarthestPos(map: string[]) {
    const start = this.findStartPosAndTile(map);
    const visited = new Set<number>();
    const queue = new MinQueue();
    const nextStart = this.next(start.tile, start.x, start.y);
    visited.add(start.y * map[0].length + start.x);
    for (const next of nextStart) {
      queue.push(next.y * map[0].length + next.x, 1);
    }
    let furthest = 1;
    while (queue.size > 0) {
      const distance = queue.peekPriority();
      if (distance > furthest) {
        furthest = distance;
      }

      const coordinates = queue.pop();
      visited.add(coordinates);
      const x = coordinates % map[0].length;
      const y = Math.floor(coordinates / map[0].length);
      const tile = map[y][x];
      const nextTiles = this.next(tile, x, y);
      for (const next of nextTiles) {
        const nextCoordinates = next.y * map[0].length + next.x;
        if (visited.has(nextCoordinates)) {
          continue;
        }
        queue.push(nextCoordinates, distance + 1);
      }
    }
    return furthest;
  }

  private next(tile: string, x: number, y: number) {
    switch (tile) {
      case '|':
        return [
          { x: x, y: y - 1 },
          { x: x, y: y + 1 },
        ];
      case '-':
        return [
          { x: x - 1, y: y },
          { x: x + 1, y: y },
        ];
      case 'L':
        return [
          { x: x, y: y - 1 },
          { x: x + 1, y: y },
        ];
      case 'J':
        return [
          { x: x, y: y - 1 },
          { x: x - 1, y: y },
        ];
      case '7':
        return [
          { x: x - 1, y: y },
          { x: x, y: y + 1 },
        ];
      case 'F':
        return [
          { x: x + 1, y: y },
          { x: x, y: y + 1 },
        ];
      default:
        return undefined;
    }
  }

  private findStartPosAndTile(map: string[]) {
    let x,
      y = 0;
    let tile;
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (map[i][j] === 'S') {
          x = j;
          y = i;

          if (
            i > 0 &&
            i < map.length &&
            ['|', '7', 'F'].includes(map[i - 1][j]) &&
            ['|', 'L', 'J'].includes(map[i + 1][j])
          ) {
            tile = '|';
          } else if (
            j > 0 &&
            j < map[i].length &&
            ['-', 'L', 'F'].includes(map[i][j - 1]) &&
            ['-', 'J', '7'].includes(map[i][j + 1])
          ) {
            tile = '-';
          } else if (
            i > 0 &&
            j < map[i].length &&
            ['|', '7', 'F'].includes(map[i - 1][j]) &&
            ['-', 'J', '7'].includes(map[i][j + 1])
          ) {
            tile = 'L';
          } else if (
            i > 0 &&
            j > 0 &&
            ['|', '7', 'F'].includes(map[i - 1][j]) &&
            ['-', 'L', 'F'].includes(map[i][j - 1])
          ) {
            tile = 'J';
          } else if (
            j > 0 &&
            i < map.length &&
            ['-', 'L', 'F'].includes(map[i][j - 1]) &&
            ['|', 'L', 'J'].includes(map[i + 1][j])
          ) {
            tile = '7';
          } else if (
            i < map.length &&
            j < map[i].length &&
            ['|', 'L', 'J'].includes(map[i + 1][j]) &&
            ['-', 'J', '7'].includes(map[i][j + 1])
          ) {
            tile = 'F';
          }
        }
      }
    }
    return { x, y, tile };
  }

  private findEnclosed(map: string[]) {
    const start = this.findStartPosAndTile(map);
    const mainLoop = new Set<number>();
    const queue = new ChunkedQueue();
    const nextStart = this.next(start.tile, start.x, start.y);
    mainLoop.add(start.y * map[0].length + start.x);
    for (const next of nextStart) {
      queue.enqueue(next.y * map[0].length + next.x);
    }
    while (queue.size() > 0) {
      const coordinates = queue.dequeue();
      mainLoop.add(coordinates);
      const x = coordinates % map[0].length;
      const y = Math.floor(coordinates / map[0].length);
      const tile = map[y][x];
      const nextTiles = this.next(tile, x, y);
      for (const next of nextTiles) {
        const nextCoordinates = next.y * map[0].length + next.x;
        if (mainLoop.has(nextCoordinates)) {
          continue;
        }
        queue.enqueue(nextCoordinates);
      }
    }

    map[start.y] =
      map[start.y].substring(0, start.x) +
      start.tile +
      map[start.y].substring(start.x + 1);

    const animalMap = [];
    for (let i = 0; i < map.length; i++) {
      animalMap.push([]);
      for (let j = 0; j < map[i].length; j++) {
        const c = i * map[0].length + j;
        animalMap[i * 2].push(mainLoop.has(c) ? map[i][j] : '.');

        if (
          j < map[0].length - 1 &&
          mainLoop.has(c) &&
          mainLoop.has(c + 1) &&
          ['-', 'L', 'F'].includes(map[i][j]) &&
          ['-', 'J', '7'].includes(map[i][j + 1])
        ) {
          animalMap[i * 2].push('-');
        } else {
          animalMap[i * 2].push('.');
        }
      }
      animalMap.push([]);
      for (let j = 0; j < map[i].length; j++) {
        const c = i * map[0].length + j;
        if (
          i < map.length - 1 &&
          mainLoop.has(c) &&
          mainLoop.has(c + map[0].length) &&
          ['|', '7', 'F'].includes(map[i][j]) &&
          ['|', 'J', 'L'].includes(map[i + 1][j])
        ) {
          animalMap[i * 2 + 1].push('|');
        } else {
          animalMap[i * 2 + 1].push('.');
        }
        animalMap[i * 2 + 1].push('.');
      }
    }

    const grounds = this.findGrounds(animalMap);
    const enclosedVisited = new Set<number>();
    const notEnclosedVisited = new Set<number>();
    for (const ground of grounds) {
      if (
        enclosedVisited.has(ground.y * animalMap[0].length + ground.x) ||
        notEnclosedVisited.has(ground.y * animalMap[0].length + ground.x)
      ) {
        continue;
      }

      const queue = new ChunkedQueue();
      const visited = new Set<number>();
      queue.enqueue(ground.y * animalMap[0].length + ground.x);
      let isEnclosed = true;
      while (queue.size() > 0) {
        const c = queue.dequeue();
        if (visited.has(c)) {
          continue;
        }
        visited.add(c);
        const x = c % animalMap[0].length;
        const y = Math.floor(c / animalMap[0].length);

        if (
          x === 0 ||
          y === 0 ||
          x === animalMap[0].length - 1 ||
          y === animalMap.length - 1
        ) {
          isEnclosed = false;
        }

        if (
          y > 0 &&
          animalMap[y - 1][x] === '.' &&
          !visited.has((y - 1) * animalMap[0].length + x)
        ) {
          queue.enqueue((y - 1) * animalMap[0].length + x);
        }
        if (
          y < animalMap.length - 1 &&
          animalMap[y + 1][x] === '.' &&
          !visited.has((y + 1) * animalMap[0].length + x)
        ) {
          queue.enqueue((y + 1) * animalMap[0].length + x);
        }
        if (
          x > 0 &&
          animalMap[y][x - 1] === '.' &&
          !visited.has(y * animalMap[0].length + (x - 1))
        ) {
          queue.enqueue(y * animalMap[0].length + (x - 1));
        }
        if (
          x < animalMap[0].length - 1 &&
          animalMap[y][x + 1] === '.' &&
          !visited.has(y * animalMap[0].length + (x + 1))
        ) {
          queue.enqueue(y * animalMap[0].length + (x + 1));
        }
      }

      if (isEnclosed) {
        for (const v of visited) {
          enclosedVisited.add(v);
        }
      } else {
        for (const v of visited) {
          notEnclosedVisited.add(v);
        }
      }
    }
    let enclosed = 0;
    for (const c of enclosedVisited) {
      const x = c % animalMap[0].length;
      const y = Math.floor(c / animalMap[0].length);
      if (x % 2 === 0 && y % 2 === 0) {
        enclosed++;
      }
    }
    return enclosed;
  }

  findGrounds(map: string[]) {
    const grounds = [];
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (map[i][j] === '.') {
          grounds.push({ x: j, y: i });
        }
      }
    }
    return grounds;
  }
}
