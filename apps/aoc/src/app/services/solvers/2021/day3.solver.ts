import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day3Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 3).pipe(
      switchMap((input) => {
        const reports = this.utilService.rowInputToStringArray(input);
        const result = this.getPowerConsumption(reports);
        return this.aocClient.postAnswer(2021, 3, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 3).pipe(
      switchMap((input) => {
        const reports = this.utilService.rowInputToStringArray(input);
        const result = this.getLifeSupport(reports);
        return this.aocClient.postAnswer(2021, 3, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.getPowerConsumption([
        '00100',
        '11110',
        '10110',
        '10111',
        '10101',
        '01111',
        '00111',
        '11100',
        '10000',
        '11001',
        '00010',
        '01010',
      ]) === 198;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.getLifeSupport([
        '00100',
        '11110',
        '10110',
        '10111',
        '10101',
        '01111',
        '00111',
        '11100',
        '10000',
        '11001',
        '00010',
        '01010',
      ]) === 230;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private getPowerConsumption(reports: string[]) {
    const reportLength = reports[0].length;

    let gamma = '';
    let epsilon = '';
    for (let i = 0; i < reportLength; i++) {
      const gammaEpsilon = this.findMaxMin(reports, i);
      gamma += gammaEpsilon.max;
      epsilon += gammaEpsilon.min;
    }

    return Number.parseInt(gamma, 2) * Number.parseInt(epsilon, 2);
  }

  private getLifeSupport(reports: string[]) {
    const reportLength = reports[0].length;

    let oxygenGeneratorRating = [...reports];
    let co2RubberRating = [...reports];

    for (let i = 0; i < reportLength; i++) {
      if (oxygenGeneratorRating.length > 1) {
        oxygenGeneratorRating = oxygenGeneratorRating.filter(
          (x) => x[i] === this.findMaxMin(oxygenGeneratorRating, i).max
        );
      }
      if (co2RubberRating.length > 1) {
        co2RubberRating = co2RubberRating.filter(
          (x) => x[i] === this.findMaxMin(co2RubberRating, i).min
        );
      }

      if (oxygenGeneratorRating.length === 1 && co2RubberRating.length === 1) {
        break;
      }
    }

    return (
      Number.parseInt(oxygenGeneratorRating[0], 2) *
      Number.parseInt(co2RubberRating[0], 2)
    );
  }

  private findMaxMin(
    reports: string[],
    index: number
  ): { max: string; min: string } {
    let counter = 0;
    for (const report of reports) {
      if (report[index] === '1') {
        counter++;
      } else {
        counter--;
      }
    }
    if (counter >= 0) {
      return {
        max: '1',
        min: '0',
      };
    } else {
      return {
        max: '0',
        min: '1',
      };
    }
  }
}
