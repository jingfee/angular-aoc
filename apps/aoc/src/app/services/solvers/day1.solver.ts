import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Status } from '../../models/status.model';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day1Solver implements IDaySolver {
  solve_part_one(): Observable<Status> {
    return of(Status.SOLVED);
  }

  solve_part_two(): Observable<Status> {
    return of(Status.SOLVED);
  }

  test_part_one(): Observable<Status> {
    const test1 = this.findCaptcha('1122') === 3;
    const test2 = this.findCaptcha('1111') === 4;
    const test3 = this.findCaptcha('1234') === 0;
    const test4 = this.findCaptcha('91212129') === 9;

    return test1 && test2 && test3 && test4
      ? of(Status.SOLVED).pipe(delay(5000))
      : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    return of(Status.SOLVED);
  }

  private findCaptcha(list: string) {
    let sum = 0;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      const b = i === list.length - 1 ? list[0] : list[i + 1];

      if (a === b) {
        sum += Number.parseInt(a);
      }
    }
    return sum;
  }
}
