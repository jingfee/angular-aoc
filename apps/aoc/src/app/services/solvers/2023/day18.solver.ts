import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day18Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 18).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.dig(parsedInput);
        return this.aocClient.postAnswer(2023, 18, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 18).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.digMath(parsedInput);
        return this.aocClient.postAnswer(2023, 18, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.dig([
        'R 6 (#70c710)',
        'D 5 (#0dc571)',
        'L 2 (#5713f0)',
        'D 2 (#d2c081)',
        'R 2 (#59c680)',
        'D 2 (#411b91)',
        'L 5 (#8ceee2)',
        'U 2 (#caa173)',
        'L 1 (#1b58a2)',
        'U 2 (#caa171)',
        'R 2 (#7807d2)',
        'U 3 (#a77fa3)',
        'L 2 (#015232)',
        'U 2 (#7a21e3)',
      ]) === 62;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.digMath([
        'R 6 (#70c710)',
        'D 5 (#0dc571)',
        'L 2 (#5713f0)',
        'D 2 (#d2c081)',
        'R 2 (#59c680)',
        'D 2 (#411b91)',
        'L 5 (#8ceee2)',
        'U 2 (#caa173)',
        'L 1 (#1b58a2)',
        'U 2 (#caa171)',
        'R 2 (#7807d2)',
        'U 3 (#a77fa3)',
        'L 2 (#015232)',
        'U 2 (#7a21e3)',
      ]) === 952408144115;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private dig(instructions: string[]) {
    let positionX = 0;
    let positionY = 0;
    let minY = 0;
    let minX = 0;
    let maxY = 0;
    let maxX = 0;
    const dug = [{ x: 0, y: 0 }];
    for (const instruction of instructions) {
      const split = instruction.split(' ');
      for (let i = 1; i <= parseInt(split[1]); i++) {
        if (split[0] === 'U') {
          dug.push({ x: positionX, y: positionY - i });
        } else if (split[0] === 'R') {
          dug.push({ x: positionX + i, y: positionY });
        } else if (split[0] === 'D') {
          dug.push({ x: positionX, y: positionY + i });
        } else if (split[0] === 'L') {
          dug.push({ x: positionX - i, y: positionY });
        }
      }

      positionX = dug[dug.length - 1].x;
      positionY = dug[dug.length - 1].y;

      if (positionY < minY) {
        minY = positionY;
      }
      if (positionX < minX) {
        minX = positionX;
      }
      if (positionY > maxY) {
        maxY = positionY;
      }
      if (positionX > maxX) {
        maxX = positionX;
      }
    }

    const digMap = [];
    for (let i = 0; i < maxY - minY + 3; i++) {
      const row = [];
      for (let j = 0; j < maxX - minX + 3; j++) {
        if (dug.find((a) => a.x - minX + 1 === j && a.y - minY + 1 === i)) {
          row.push('#');
        } else {
          row.push('.');
        }
      }
      digMap.push(row);
    }

    const queue = [];
    queue.push({ x: 0, y: 0 });
    const visited = new Set<number>();
    while (queue.length > 0) {
      const current = queue.shift();
      const hash = current.y * digMap[0].length + current.x;
      if (visited.has(hash)) {
        continue;
      }
      visited.add(hash);

      if (current.y > 0 && digMap[current.y - 1][current.x] === '.') {
        queue.push({ x: current.x, y: current.y - 1 });
      }
      if (
        current.x < digMap[0].length - 1 &&
        digMap[current.y][current.x + 1] === '.'
      ) {
        queue.push({ x: current.x + 1, y: current.y });
      }
      if (
        current.y < digMap.length - 1 &&
        digMap[current.y + 1][current.x] === '.'
      ) {
        queue.push({ x: current.x, y: current.y + 1 });
      }
      if (current.x > 0 && digMap[current.y][current.x - 1] === '.') {
        queue.push({ x: current.x - 1, y: current.y });
      }
    }

    return digMap.length * digMap[0].length - visited.size;
  }

  private digMath(instructions: string[]) {
    let positionX = 0;
    let positionY = 0;
    let sum = 0;
    let outside = 0;
    for (const instruction of instructions) {
      let newX = positionX;
      let newY = positionY;
      const split = instruction.split(' ');
      const hex = split[2];
      const distance = parseInt(hex.substring(2, 7), 16);
      const dir = hex.substring(7, 8);
      outside += distance;
      if (dir === '3') {
        newY -= distance;
      } else if (dir === '0') {
        newX += distance;
      } else if (dir === '1') {
        newY += distance;
      } else if (dir === '2') {
        newX -= distance;
      }

      sum += positionX * newY - positionY * newX;

      positionX = newX;
      positionY = newY;
    }
    const area = sum / 2;
    const inside = area - outside / 2 + 1;
    return outside + inside;
  }
}
