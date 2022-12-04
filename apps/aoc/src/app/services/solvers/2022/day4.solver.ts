import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day4Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 4).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.numberOfOverlaps(parsedInput)[0];
        return this.aocClient.postAnswer(2022, 4, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 4).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.numberOfOverlaps(parsedInput)[1];
        return this.aocClient.postAnswer(2022, 4, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.numberOfOverlaps([
        '2-4,6-8',
        '2-3,4-5',
        '5-7,7-9',
        '2-8,3-7',
        '6-6,4-6',
        '2-6,4-8',
      ])[0] === 2;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.numberOfOverlaps([
        '2-4,6-8',
        '2-3,4-5',
        '5-7,7-9',
        '2-8,3-7',
        '6-6,4-6',
        '2-6,4-8',
      ])[1] === 4;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private numberOfOverlaps(pairs: string[]): number[] {
    let overlaps = 0;
    let fullOverlaps = 0;
    for (const pair of pairs) {
      const pairSplit = pair.split(',').map((a) => a.split('-').map((b) => +b));
      if (this.isFullOverlap(pairSplit)) {
        fullOverlaps++;
      }
      if (this.isOverlaps(pairSplit)) {
        overlaps++;
      }
    }
    return [fullOverlaps, overlaps];
  }

  private isFullOverlap(assignment: number[][]): boolean {
    return (
      (assignment[0][0] <= assignment[1][0] &&
        assignment[0][1] >= assignment[1][1]) ||
      (assignment[1][0] <= assignment[0][0] &&
        assignment[1][1] >= assignment[0][1])
    );
  }

  private isOverlaps(assignment: number[][]): boolean {
    return (
      (assignment[1][0] >= assignment[0][0] &&
        assignment[1][0] <= assignment[0][1]) ||
      (assignment[1][1] >= assignment[0][0] &&
        assignment[1][1] <= assignment[0][1]) ||
      (assignment[0][0] >= assignment[1][0] &&
        assignment[0][0] <= assignment[1][1]) ||
      (assignment[0][1] >= assignment[1][0] &&
        assignment[0][1] <= assignment[1][1])
    );
  }
}
