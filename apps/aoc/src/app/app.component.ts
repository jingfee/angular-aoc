import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { Status } from './models/status.model';
import { SolverService } from './services/solvers/solver.service';

@UntilDestroy()
@Component({
  selector: 'angular-aoc-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit {
  currentSolvers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  selectedDay: string;
  selectedPart: string;
  testStatus: Status;
  solveStatus: Status;
  isTesting: boolean;
  isSolving: boolean;
  runningTime: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runningInterval: any;

  Status = Status;

  constructor(private solver: SolverService) {}

  ngOnInit() {
    this.selectedDay =
      this.currentSolvers[this.currentSolvers.length - 1].toString();
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
        Number.parseInt(this.selectedPart) as 1 | 2
      )
      .pipe(
        finalize(() => {
          this.isSolving = false;
          clearInterval(this.runningInterval);
        }),
        untilDestroyed(this)
      )
      .subscribe((result) => (this.solveStatus = result));
  }

  test() {
    this.isTesting = true;
    this.solver
      .test(
        Number.parseInt(this.selectedDay),
        Number.parseInt(this.selectedPart) as 1 | 2
      )
      .pipe(
        finalize(() => (this.isTesting = false)),
        untilDestroyed(this)
      )
      .subscribe((result) => (this.testStatus = result));
  }
}
