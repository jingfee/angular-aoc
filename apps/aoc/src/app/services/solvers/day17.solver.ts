import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day17Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 17).pipe(
      switchMap((input) => {
        const target = this.parseInput(input);
        const result = this.findHighestPoint(target[3], target[2]);
        return this.aocClient.postAnswer(2021, 17, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 17).pipe(
      switchMap((input) => {
        const target = this.parseInput(input);
        const result = this.findAllInitialVelocities(target);
        return this.aocClient.postAnswer(2021, 17, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const target = this.parseInput('target area: x=20..30, y=-10..-5');
    const test = this.findHighestPoint(target[3], target[2]) === 45;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const target = this.parseInput('target area: x=20..30, y=-10..-5');
    const test = this.findAllInitialVelocities(target) === 112;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseInput(input: string) {
    const split = input.split(' ');

    const xRange = split[2]
      .slice(2, split[2].length - 1)
      .split('..')
      .map((x) => Number.parseInt(x));
    const yRange = split[3]
      .slice(2)
      .split('..')
      .map((x) => Number.parseInt(x));

    return [...xRange, ...yRange];
  }

  private findAllInitialVelocities(target: number[]) {
    const minInitalX = this.findMinX(target[0]);
    const maxInitialX = target[1];
    const minInitialY = target[2];
    const maxInitialY = -1 * target[2];

    let initialVelocity = 0;
    for (let y = minInitialY; y <= maxInitialY; y++) {
      for (let x = minInitalX; x <= maxInitialX; x++) {
        if (this.isInTarget(y, x, target)) {
          initialVelocity++;
        }
      }
    }
    return initialVelocity;
  }

  private isInTarget(y: number, x: number, target: number[]) {
    if ((x * (x + 1)) / 2 > target[1]) {
      let positionX = 0;
      let positionY = 0;
      let deltaX = x;
      let deltaY = y;
      while (positionX < target[1]) {
        positionX += deltaX;
        positionY += deltaY;
        if (
          positionX >= target[0] &&
          positionX <= target[1] &&
          positionY >= target[2] &&
          positionY <= target[3]
        ) {
          return true;
        }
        deltaX--;
        deltaY--;
      }
      return false;
    } else {
      let positionY = 0;
      let positionX = 0;
      let deltaY = y;
      let deltaX = x;
      while (positionY > target[2]) {
        positionX += deltaX;
        positionY += deltaY;
        if (
          positionX >= target[0] &&
          positionX <= target[1] &&
          positionY >= target[2] &&
          positionY <= target[3]
        ) {
          return true;
        }
        deltaX -= deltaX > 0 ? 1 : 0;
        deltaY--;
      }
      return false;
    }
  }

  private findMinX(targetXMin: number): number {
    return Math.ceil((-1 + Math.sqrt(1 + 8 * targetXMin)) / 2);
  }

  private findHighestPoint(targetYMin: number, targetYMax: number): number {
    let testVelocity = 0;
    let highestPoint = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentHighPoint = (testVelocity * (testVelocity + 1)) / 2;

      const diffToTarget = currentHighPoint - targetYMin;

      const stepsBeforeTarget = Math.floor(
        (-1 + Math.sqrt(1 + 8 * diffToTarget)) / 2
      );

      const positionBeforeTarget =
        (stepsBeforeTarget * (stepsBeforeTarget + 1)) / 2;
      if (
        positionBeforeTarget !== diffToTarget &&
        positionBeforeTarget + (stepsBeforeTarget + 1) >
          diffToTarget + Math.abs(targetYMax - targetYMin)
      ) {
        if (testVelocity > Math.abs(targetYMax)) {
          return highestPoint;
        }
      } else {
        highestPoint = currentHighPoint;
      }
      testVelocity++;
    }
  }
}
