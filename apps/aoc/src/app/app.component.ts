import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Status } from './models/status.model';
import { Day1Service } from './services/2016/day1.service';

@Component({
  selector: 'angular-aoc-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent {
  result$: Observable<Status>;

  constructor(private day1Service: Day1Service) {}

  sendAnswer() {
    this.result$ = this.day1Service.solve_part_two();
  }
}
