import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day2Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 2).pipe(
      switchMap((input) => {
        return this.aocClient.postAnswer(2023, 2, 1, undefined);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 2).pipe(
      switchMap((input) => {
        return this.aocClient.postAnswer(2023, 2, 2, undefined);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test = false;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }
}
