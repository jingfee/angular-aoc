import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { Status } from '../../models/status.model';

@Injectable({
  providedIn: 'root',
})
export class SolverService {
  constructor(private injector: Injector) {}

  solve(day: number, part: 1 | 2): Observable<Status> {
    let service: IDaySolver;

    switch (day) {
      default: {
        throw `No solver implemented for day: ${day}`;
      }
    }

    if (part === 1) {
      return service.solve_part_one();
    } else if (part === 2) {
      return service.solve_part_two();
    }

    throw `Invalid part: ${part}`;
  }
}

export interface IDaySolver {
  solve_part_one(): Observable<Status>;
  solve_part_two(): Observable<Status>;
}
