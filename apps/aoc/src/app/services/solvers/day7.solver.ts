import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day7Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 7).pipe(
      switchMap((input) => {
        const positions = this.utilService.commaInputToNumberArray(input);
        const result = this.getBestAlignemnt(positions, false);
        return this.aocClient.postAnswer(2021, 7, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 7).pipe(
      switchMap((input) => {
        const positions = this.utilService.commaInputToNumberArray(input);
        const result = this.getBestAlignemnt(positions, true);
        return this.aocClient.postAnswer(2021, 7, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test1 =
      this.getFuelForAlignment([16, 1, 2, 0, 4, 2, 7, 1, 2, 14], 2) === 37;
    const test2 =
      this.getFuelForAlignment([16, 1, 2, 0, 4, 2, 7, 1, 2, 14], 1) === 41;
    const test3 =
      this.getFuelForAlignment([16, 1, 2, 0, 4, 2, 7, 1, 2, 14], 3) === 39;
    const test4 =
      this.getFuelForAlignment([16, 1, 2, 0, 4, 2, 7, 1, 2, 14], 10) === 71;
    const test5 =
      this.getBestAlignemnt([16, 1, 2, 0, 4, 2, 7, 1, 2, 14], false) === 37;

    return test1 && test2 && test3 && test4 && test5
      ? of(Status.SOLVED)
      : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test1 =
      this.getRealFuelForAlignment([16, 1, 2, 0, 4, 2, 7, 1, 2, 14], 5) === 168;
    const test2 =
      this.getRealFuelForAlignment([16, 1, 2, 0, 4, 2, 7, 1, 2, 14], 2) === 206;
    const test3 =
      this.getBestAlignemnt([16, 1, 2, 0, 4, 2, 7, 1, 2, 14], true) === 168;

    return test1 && test2 && test3 ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private getBestAlignemnt(
    positions: number[],
    realFuelUsage: boolean
  ): number {
    let bestAlignment = Number.MAX_VALUE;

    const minBound = Math.min(...positions);
    const maxBound = Math.max(...positions);

    for (let i = minBound; i <= maxBound; i++) {
      const fuelUsage = realFuelUsage
        ? this.getRealFuelForAlignment(positions, i)
        : this.getFuelForAlignment(positions, i);
      if (fuelUsage < bestAlignment) {
        bestAlignment = fuelUsage;
      }
    }

    return bestAlignment;
  }

  private getFuelForAlignment(positions: number[], position: number): number {
    let fuel = 0;
    for (const crabPosition of positions) {
      fuel += Math.abs(crabPosition - position);
    }
    return fuel;
  }

  private getRealFuelForAlignment(
    positions: number[],
    position: number
  ): number {
    let fuel = 0;
    for (const crabPosition of positions) {
      const steps = Math.abs(crabPosition - position);
      fuel += (steps * (steps + 1)) / 2;
    }
    return fuel;
  }
}
