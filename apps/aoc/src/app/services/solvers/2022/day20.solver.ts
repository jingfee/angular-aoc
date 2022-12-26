import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day20Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 20).pipe(
      switchMap((input) => {
        const result = this.mixEncrypted(
          this.parse(this.utilService.rowInputToNumberArray(input), 1),
          1
        );
        return this.aocClient.postAnswer(2022, 20, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 20).pipe(
      switchMap((input) => {
        const result = this.mixEncrypted(
          this.parse(this.utilService.rowInputToNumberArray(input), 811589153),
          10
        );
        return this.aocClient.postAnswer(2022, 20, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.mixEncrypted(this.parse([1, 2, -3, 3, -2, 0, 4], 1), 1) === 3;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.mixEncrypted(this.parse([1, 2, -3, 3, -2, 0, 4], 811589153), 10) ===
      1623178306;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parse(input: number[], decryptionKey: number): ListItem[] {
    const listItems = [];
    for (const [index, number] of input.entries()) {
      if (isNaN(number)) {
        continue;
      }
      listItems.push({ value: number * decryptionKey, originalIndex: index });
    }
    return listItems;
  }

  private mixEncrypted(list: ListItem[], numberOfMixes: number): number {
    for (let m = 0; m < numberOfMixes; m++) {
      for (let i = 0; i < list.length; i++) {
        this.mixNumber(list, i);
      }
    }

    const zeroIndex = list.findIndex((l) => l.value === 0);
    const first = list[(zeroIndex + 1000) % list.length].value;
    const second = list[(zeroIndex + 2000) % list.length].value;
    const third = list[(zeroIndex + 3000) % list.length].value;

    return first + second + third;
  }

  private mixNumber(list: ListItem[], originalIndex: number) {
    const itemIndex = list.findIndex((l) => l.originalIndex === originalIndex);
    const item = list[itemIndex];
    let newIndex = ((itemIndex + item.value - 1) % (list.length - 1)) + 1;
    if (newIndex < 0) {
      newIndex = list.length - 1 + newIndex;
    } else if (item.value === 0) {
      return;
    }

    list.splice(itemIndex, 1);
    list.splice(newIndex, 0, item);
  }
}

class ListItem {
  originalIndex: number;
  value: number;
}
