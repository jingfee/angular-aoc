import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day11Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 11).pipe(
      switchMap((input) => {
        return this.aocClient.postAnswer(2021, 11, 1, '');
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 11).pipe(
      switchMap((input) => {
        return this.aocClient.postAnswer(2021, 11, 2, '');
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
