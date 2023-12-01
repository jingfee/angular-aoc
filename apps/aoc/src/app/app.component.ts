import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { Status } from './models/status.model';
import { Solver2021Service } from './services/solvers/2021/solver.service';
import { Solver2022Service } from './services/solvers/2022/solver.service';
import { Solver2023Service } from './services/solvers/2023/solver.service';

@UntilDestroy()
@Component({
  selector: 'angular-aoc-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit {
  currentSolvers = {
    2021: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25,
    ],
    2022: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25,
    ],
    2023: [1],
  };
  selectedDay: string;
  selectedPart: string;
  testStatus: Status;
  solveStatus: Status;
  isTesting: boolean;
  isSolving: boolean;
  runningTime: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runningInterval: any;
  currentYear = 2023;

  Status = Status;

  get solver() {
    switch (this.currentYear) {
      case 2023:
        return this.solver2023;
      case 2022:
        return this.solver2022;
      case 2021:
        return this.solver2021;
      default:
        return undefined;
    }
  }

  constructor(
    private solver2021: Solver2021Service,
    private solver2022: Solver2022Service,
    private solver2023: Solver2023Service,
  ) {}

  ngOnInit() {
    this.selectedDay =
      this.currentSolvers[this.currentYear][
        this.currentSolvers[this.currentYear].length - 1
      ].toString();
    this.selectedPart = '1';
  }

  solve() {
    this.isSolving = true;
    this.runningTime = 0;
    this.runningInterval = setInterval(() => {
      this.runningTime += 0.01;
    }, 10);
    this.solver
      .solve(
        Number.parseInt(this.selectedDay),
        Number.parseInt(this.selectedPart) as 1 | 2,
      )
      .pipe(
        finalize(() => {
          this.isSolving = false;
          clearInterval(this.runningInterval);
        }),
        untilDestroyed(this),
      )
      .subscribe((result) => (this.solveStatus = result));
  }

  test() {
    this.isTesting = true;
    this.solver
      .test(
        Number.parseInt(this.selectedDay),
        Number.parseInt(this.selectedPart) as 1 | 2,
      )
      .pipe(
        finalize(() => (this.isTesting = false)),
        untilDestroyed(this),
      )
      .subscribe((result) => (this.testStatus = result));
  }
}
