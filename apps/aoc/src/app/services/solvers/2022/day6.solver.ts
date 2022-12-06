import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day6Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 6).pipe(
      switchMap((input) => {
        const result = this.findProcessed(input, 4);
        return this.aocClient.postAnswer(2022, 6, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 6).pipe(
      switchMap((input) => {
        const result = this.findProcessed(input, 14);
        return this.aocClient.postAnswer(2022, 6, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.findProcessed('mjqjpqmgbljsphdztnvjfqwrcgsmlb', 4) === 7 &&
      this.findProcessed('bvwbjplbgvbhsrlpgdmjqwftvncz', 4) === 5 &&
      this.findProcessed('nppdvjthqldpwncqszvftbrmjlhg', 4) === 6 &&
      this.findProcessed('nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg', 4) === 10 &&
      this.findProcessed('zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw', 4) === 11;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.findProcessed('mjqjpqmgbljsphdztnvjfqwrcgsmlb', 14) === 19 &&
      this.findProcessed('bvwbjplbgvbhsrlpgdmjqwftvncz', 14) === 23 &&
      this.findProcessed('nppdvjthqldpwncqszvftbrmjlhg', 14) === 23 &&
      this.findProcessed('nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg', 14) === 29 &&
      this.findProcessed('zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw', 14) === 26;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findProcessed(buffer: string, distinct: number): number {
    let marker = [];
    for (let index = 0; index < buffer.length; index++) {
      marker.push(buffer[index]);
      if (marker.length > distinct) {
        marker = marker.slice(1);
      }
      if (marker.length === distinct) {
        const distinctMarker = [...new Set(marker)];
        if (distinctMarker.length === distinct) {
          return index + 1;
        }
      }
    }

    return 0;
  }
}
