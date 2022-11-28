import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day5Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 5).pipe(
      switchMap((input) => {
        const instruction = this.utilService.rowInputToStringArray(input);
        const result = this.findOverlap(instruction, false);
        return this.aocClient.postAnswer(2021, 5, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 5).pipe(
      switchMap((input) => {
        const instruction = this.utilService.rowInputToStringArray(input);
        const result = this.findOverlap(instruction, true);
        return this.aocClient.postAnswer(2021, 5, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.findOverlap(
        [
          '0,9 -> 5,9',
          '8,0 -> 0,8',
          '9,4 -> 3,4',
          '2,2 -> 2,1',
          '7,0 -> 7,4',
          '6,4 -> 2,0',
          '0,9 -> 2,9',
          '3,4 -> 1,4',
          '0,0 -> 8,8',
          '5,5 -> 8,2',
        ],
        false
      ) === 5;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.findOverlap(
        [
          '0,9 -> 5,9',
          '8,0 -> 0,8',
          '9,4 -> 3,4',
          '2,2 -> 2,1',
          '7,0 -> 7,4',
          '6,4 -> 2,0',
          '0,9 -> 2,9',
          '3,4 -> 1,4',
          '0,0 -> 8,8',
          '5,5 -> 8,2',
        ],
        true
      ) === 12;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findOverlap(instruction: string[], includeDiagonal: boolean) {
    const ventLines = instruction.map((x) => new VentLine(x));

    const diagram = [];

    for (const ventLine of ventLines) {
      if (ventLine.isHorizontal()) {
        const from = Math.min(ventLine.x1, ventLine.x2);
        const to = Math.max(ventLine.x1, ventLine.x2);

        for (let i = from; i <= to; i++) {
          if (diagram[i * 1000 + ventLine.y1]) {
            diagram[i * 1000 + ventLine.y1]++;
          } else {
            diagram[i * 1000 + ventLine.y1] = 1;
          }
        }
      } else if (ventLine.isVertical()) {
        const from = Math.min(ventLine.y1, ventLine.y2);
        const to = Math.max(ventLine.y1, ventLine.y2);

        for (let i = from; i <= to; i++) {
          if (diagram[ventLine.x1 * 1000 + i]) {
            diagram[ventLine.x1 * 1000 + i]++;
          } else {
            diagram[ventLine.x1 * 1000 + i] = 1;
          }
        }
      } else if (includeDiagonal) {
        const fromX = Math.min(ventLine.x1, ventLine.x2);
        const toX = Math.max(ventLine.x1, ventLine.x2);
        const fromY = ventLine.x1 < ventLine.x2 ? ventLine.y1 : ventLine.y2;
        const increaseY =
          fromY === ventLine.y1
            ? ventLine.y1 > ventLine.y2
            : ventLine.y2 > ventLine.y1;
        let deltaY = 0;

        for (let i = 0; i <= toX - fromX; i++) {
          if (diagram[(fromX + i) * 1000 + (fromY + deltaY)]) {
            diagram[(fromX + i) * 1000 + (fromY + deltaY)]++;
          } else {
            diagram[(fromX + i) * 1000 + (fromY + deltaY)] = 1;
          }

          if (increaseY) {
            deltaY--;
          } else {
            deltaY++;
          }
        }
      }
    }

    return diagram.filter((x) => x > 1).length;
  }
}

class VentLine {
  x1: number;
  x2: number;
  y1: number;
  y2: number;

  constructor(instruction: string) {
    const split = instruction.split(' -> ');
    const fromSplit = split[0].split(',').map((x) => Number.parseInt(x));
    const toSplit = split[1].split(',').map((x) => Number.parseInt(x));

    this.x1 = fromSplit[0];
    this.y1 = fromSplit[1];
    this.x2 = toSplit[0];
    this.y2 = toSplit[1];
  }

  isHorizontal() {
    return this.y1 === this.y2;
  }

  isVertical() {
    return this.x1 === this.x2;
  }
}
