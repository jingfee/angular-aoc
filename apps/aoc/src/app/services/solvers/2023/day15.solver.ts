import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day15Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 15).pipe(
      switchMap((input) => {
        const result = this.sumHashSeq(input.replace('\n', ''));
        return this.aocClient.postAnswer(2023, 15, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 15).pipe(
      switchMap((input) => {
        const result = this.runHashmap(input.replace('\n', ''));
        return this.aocClient.postAnswer(2023, 15, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.sumHashSeq('rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7') ===
      1320;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.runHashmap('rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7') ===
      145;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private sumHashSeq(input: string) {
    const split = input.split(',');
    let sum = 0;
    for (const input of split) {
      sum += this.runHash(input);
    }
    return sum;
  }

  private runHash(input: string) {
    let value = 0;
    for (const c of input) {
      value += c.charCodeAt(0);
      value *= 17;
      value %= 256;
    }
    return value;
  }

  private runHashmap(input: string) {
    const boxes: { label: string; focalLength: number }[][] = [];
    for (let i = 0; i < 256; i++) {
      boxes.push([]);
    }
    const split = input.split(',');
    for (const step of split) {
      if (step.includes('=')) {
        const stepSplit = step.split('=');
        const label = stepSplit[0];
        const focalLength = parseInt(stepSplit[1]);

        const boxNumber = this.runHash(label);
        const box = boxes[boxNumber];

        const existing = box.find((b) => b.label === label);
        if (existing) {
          existing.focalLength = focalLength;
        } else {
          box.push({ label, focalLength });
        }
      } else if (step.includes('-')) {
        const stepSplit = step.split('-');
        const label = stepSplit[0];

        const boxNumber = this.runHash(label);
        const box = boxes[boxNumber];

        const existingIndex = box.findIndex((b) => b.label === label);
        if (existingIndex > -1) {
          box.splice(existingIndex, 1);
        }
      }
    }

    let focusingPower = 0;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = 0; j < boxes[i].length; j++) {
        focusingPower += (i + 1) * (j + 1) * boxes[i][j].focalLength;
      }
    }
    return focusingPower;
  }
}
