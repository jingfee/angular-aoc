import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day9Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 9).pipe(
      switchMap((input) => {
        const result = this.simulate(
          this.utilService.rowInputToStringArray(input),
          2
        );
        return this.aocClient.postAnswer(2022, 9, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 9).pipe(
      switchMap((input) => {
        const result = this.simulate(
          this.utilService.rowInputToStringArray(input),
          10
        );
        return this.aocClient.postAnswer(2022, 9, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.simulate(
        ['R 4', 'U 4', 'L 3', 'D 1', 'R 4', 'D 1', 'L 5', 'R 2'],
        2
      ) === 13;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.simulate(
        ['R 4', 'U 4', 'L 3', 'D 1', 'R 4', 'D 1', 'L 5', 'R 2'],
        10
      ) === 1 &&
      this.simulate(
        ['R 5', 'U 8', 'L 8', 'D 3', 'R 17', 'D 10', 'L 25', 'U 20'],
        10
      ) === 36;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private simulate(motions: string[], length: number): number {
    const rope = [];
    for (let i = 0; i < length; i++) {
      rope.push({ x: 0, y: 0 });
    }
    const tailVisited = new Set<number>([0]);
    for (const motion of motions) {
      const split = motion.split(' ');
      for (let i = 0; i < +split[1]; i++) {
        switch (split[0]) {
          case 'U':
            rope[0].y--;
            break;
          case 'R':
            rope[0].x++;
            break;
          case 'D':
            rope[0].y++;
            break;
          case 'L':
            rope[0].x--;
            break;
        }
        for (let j = 0; j < length - 1; j++) {
          this.moveTail(rope[j], rope[j + 1]);
        }
        tailVisited.add(rope[length - 1].x * 10000 + rope[length - 1].y);
      }
    }

    return tailVisited.size;
  }

  private moveTail(
    head: { x: number; y: number },
    tail: { x: number; y: number }
  ) {
    if (this.headTailTouching(head, tail)) {
      return;
    }

    if (head.y < tail.y) {
      tail.y--;
    } else if (head.y > tail.y) {
      tail.y++;
    }

    if (head.x < tail.x) {
      tail.x--;
    } else if (head.x > tail.x) {
      tail.x++;
    }
  }

  private headTailTouching(
    head: { x: number; y: number },
    tail: { x: number; y: number }
  ) {
    if (
      (head.y === tail.y || head.y === tail.y - 1 || head.y === tail.y + 1) &&
      (head.x === tail.x || head.x === tail.x - 1 || head.x === tail.x + 1)
    ) {
      return true;
    }
    return false;
  }
}
