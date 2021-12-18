import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { Status } from '../../models/status.model';
import { Day1Solver } from './day1.solver';
import { Day10Solver } from './day10.solver';
import { Day11Solver } from './day11.solver';
import { Day12Solver } from './day12.solver';
import { Day13Solver } from './day13.solver';
import { Day14Solver } from './day14.solver';
import { Day15Solver } from './day15.solver';
import { Day2Solver } from './day2.solver';
import { Day3Solver } from './day3.solver';
import { Day4Solver } from './day4.solver';
import { Day5Solver } from './day5.solver';
import { Day6Solver } from './day6.solver';
import { Day7Solver } from './day7.solver';
import { Day8Solver } from './day8.solver';
import { Day9Solver } from './day9.solver';

@Injectable({
  providedIn: 'root',
})
export class SolverService {
  constructor(private injector: Injector) {}

  solve(day: number, part: 1 | 2): Observable<Status> {
    const solver = this.getSolver(day);

    if (part === 1) {
      return solver.solve_part_one();
    } else if (part === 2) {
      return solver.solve_part_two();
    }

    throw `Invalid part: ${part}`;
  }

  test(day: number, part: 1 | 2): Observable<Status> {
    const solver = this.getSolver(day);
    if (part === 1) {
      return solver.test_part_one();
    } else if (part === 2) {
      return solver.test_part_two();
    }

    throw `Invalid part: ${part}`;
  }

  private getSolver(day: number): IDaySolver {
    let service: IDaySolver;

    switch (day) {
      case 1: {
        service = this.injector.get(Day1Solver);
        break;
      }
      case 2: {
        service = this.injector.get(Day2Solver);
        break;
      }
      case 3: {
        service = this.injector.get(Day3Solver);
        break;
      }
      case 4: {
        service = this.injector.get(Day4Solver);
        break;
      }
      case 5: {
        service = this.injector.get(Day5Solver);
        break;
      }
      case 6: {
        service = this.injector.get(Day6Solver);
        break;
      }
      case 7: {
        service = this.injector.get(Day7Solver);
        break;
      }
      case 8: {
        service = this.injector.get(Day8Solver);
        break;
      }
      case 9: {
        service = this.injector.get(Day9Solver);
        break;
      }
      case 10: {
        service = this.injector.get(Day10Solver);
        break;
      }
      case 11: {
        service = this.injector.get(Day11Solver);
        break;
      }
      case 12: {
        service = this.injector.get(Day12Solver);
        break;
      }
      case 13: {
        service = this.injector.get(Day13Solver);
        break;
      }
      case 14: {
        service = this.injector.get(Day14Solver);
        break;
      }
      case 15: {
        service = this.injector.get(Day15Solver);
        break;
      }
      default: {
        throw `No solver implemented for day: ${day}`;
      }
    }

    return service;
  }
}

export interface IDaySolver {
  solve_part_one(): Observable<Status>;
  solve_part_two(): Observable<Status>;
  test_part_one(): Observable<Status>;
  test_part_two(): Observable<Status>;
}
