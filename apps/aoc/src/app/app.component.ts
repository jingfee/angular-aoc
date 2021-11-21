import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Status } from './models/status.model';
import { SolverService } from './services/solvers/solver.service';

@Component({
  selector: 'angular-aoc-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent {
  currentSolvers = [];
  selectedDay: string;
  result$: Observable<Status>;

  constructor(private solver: SolverService) {}

  solve(part: 1 | 2) {
    this.result$ = this.solver.solve(Number.parseInt(this.selectedDay), part);
  }
}
