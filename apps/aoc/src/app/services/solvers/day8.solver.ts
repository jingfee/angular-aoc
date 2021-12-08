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
        const signals = this.utilService.rowInputToStringArray(input);
        let result = 0;
        for (const signal of signals) {
          result += this.translateOutput(signal);
        }
        return this.aocClient.postAnswer(2021, 8, 2, result);
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
    const test1 =
      this.translateOutput(
        'acedgfb cdfbe gcdfa fbcad dab cefabd cdfgeb eafb cagedb ab | cdfeb fcadb cdfeb cdbaf'
      ) === 5353;
    const test2 =
      this.translateOutput(
        'be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe'
      ) === 8394;
    const test3 =
      this.translateOutput(
        'edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc'
      ) === 9781;
    const test4 =
      this.translateOutput(
        'fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg'
      ) === 1197;
    const test5 =
      this.translateOutput(
        'fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb'
      ) === 9361;
    const test6 =
      this.translateOutput(
        'aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea'
      ) === 4873;
    const test7 =
      this.translateOutput(
        'fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb'
      ) === 8418;
    const test8 =
      this.translateOutput(
        'dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe'
      ) === 4548;
    const test9 =
      this.translateOutput(
        'bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef'
      ) === 1625;
    const test10 =
      this.translateOutput(
        'egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb'
      ) === 8717;
    const test11 =
      this.translateOutput(
        'gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce'
      ) === 4315;

    return test1 &&
      test2 &&
      test3 &&
      test4 &&
      test5 &&
      test6 &&
      test7 &&
      test8 &&
      test9 &&
      test10 &&
      test11
      ? of(Status.SOLVED)
      : of(Status.ERROR);
  }

  private translateOutput(input: string): number {
    const split = input.split(' | ');
    const translations = [];

    const signalPatterns = split[0].split(' ');
    const one = signalPatterns.filter((a) => a.length === 2);
    const four = signalPatterns.filter((a) => a.length === 4);
    const seven = signalPatterns.filter((a) => a.length === 3);
    const eight = signalPatterns.filter((a) => a.length === 7);
    translations[1] = one[0].split('');
    translations[4] = four[0].split('');
    translations[7] = seven[0].split('');
    translations[8] = eight[0].split('');

    const zero = signalPatterns.filter(
      (a) =>
        a.length === 6 &&
        translations[7].every((b) => a.split('').includes(b)) &&
        !translations[4].every((b) => a.split('').includes(b))
    );
    const two = signalPatterns.filter(
      (a) =>
        a.length === 5 &&
        translations[4].filter((b) => a.split('').includes(b)).length === 2
    );
    const three = signalPatterns.filter(
      (a) =>
        a.length === 5 && translations[1].every((b) => a.split('').includes(b))
    );
    const five = signalPatterns.filter(
      (a) =>
        a.length === 5 &&
        translations[4].filter((b) => a.split('').includes(b)).length === 3 &&
        !translations[1].every((b) => a.split('').includes(b))
    );
    const six = signalPatterns.filter(
      (a) =>
        a.length === 6 &&
        !translations[4].every((b) => a.split('').includes(b)) &&
        !translations[7].every((b) => a.split('').includes(b))
    );
    const nine = signalPatterns.filter(
      (a) =>
        a.length === 6 && translations[4].every((b) => a.split('').includes(b))
    );

    translations[0] = zero[0].split('');
    translations[2] = two[0].split('');
    translations[3] = three[0].split('');
    translations[5] = five[0].split('');
    translations[6] = six[0].split('');
    translations[9] = nine[0].split('');

    let output = '';

    for (const outputNumber of split[1].split(' ')) {
      const match = translations.findIndex(
        (a) =>
          outputNumber.split('').every((b) => a.includes(b)) &&
          a.every((b) => outputNumber.split('').includes(b))
      );
      output += match.toString();
    }

    return Number.parseInt(output);
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
