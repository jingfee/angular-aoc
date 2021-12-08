import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day8Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 8).pipe(
      switchMap((input) => {
        const signal = this.utilService.rowInputToStringArray(input);
        const result = this.countEasyDigitsInOutput(signal);
        return this.aocClient.postAnswer(2021, 8, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 8).pipe(
      switchMap((input) => {
        const sonarResult = this.utilService.rowInputToNumberArray(input);
        return this.aocClient.postAnswer(2021, 8, 2, '');
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.countEasyDigitsInOutput([
        'be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe',
        'edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc',
        'fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg',
        'fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb',
        'aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea',
        'fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb',
        'dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe',
        'bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef',
        'egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb',
        'gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce',
      ]) === 26;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private countEasyDigitsInOutput(input: string[]): number {
    let easyDigitsCount = 0;

    for (const inputRow of input) {
      const split = inputRow.split(' | ');
      const outputSplit = split[1].split(' ');
      easyDigitsCount += outputSplit.filter(
        (x) =>
          x.length === 2 || x.length === 3 || x.length === 4 || x.length === 7
      ).length;
    }

    return easyDigitsCount;
  }
}
