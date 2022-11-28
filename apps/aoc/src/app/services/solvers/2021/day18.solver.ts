import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import { plainToClass, Type } from 'class-transformer';

@Injectable({
  providedIn: 'root',
})
export class Day18Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 18).pipe(
      switchMap((input) => {
        const numbersString = this.utilService
          .rowInputToStringArray(input)
          .filter((r) => r !== '');
        const parsedNumbers = numbersString.map((n) =>
          this.parseStringToSnailNumber(n)
        );
        const added = this.add(parsedNumbers);
        const result =
          this.snailNumberToSnailNumberNested(added).getMagnitude();
        return this.aocClient.postAnswer(2021, 18, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 18).pipe(
      switchMap((input) => {
        const numbersString = this.utilService
          .rowInputToStringArray(input)
          .filter((r) => r !== '');
        const parsedNumbers = numbersString.map((n) =>
          this.parseStringToSnailNumber(n)
        );
        const result = this.getLargestMagnitude(parsedNumbers);
        return this.aocClient.postAnswer(2021, 18, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const number1 = this.parseStringToSnailNumber(
      '[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]'
    );
    const number2 = this.parseStringToSnailNumber(
      '[[[5,[2,8]],4],[5,[[9,9],0]]]'
    );
    const number3 = this.parseStringToSnailNumber(
      '[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]'
    );
    const number4 = this.parseStringToSnailNumber(
      '[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]'
    );
    const number5 = this.parseStringToSnailNumber(
      '[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]'
    );
    const number6 = this.parseStringToSnailNumber(
      '[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]'
    );
    const number7 = this.parseStringToSnailNumber(
      '[[[[5,4],[7,7]],8],[[8,3],8]]'
    );
    const number8 = this.parseStringToSnailNumber('[[9,3],[[9,9],[6,[4,9]]]]');
    const number9 = this.parseStringToSnailNumber(
      '[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]'
    );
    const number10 = this.parseStringToSnailNumber(
      '[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]'
    );
    const added = this.add([
      number1,
      number2,
      number3,
      number4,
      number5,
      number6,
      number7,
      number8,
      number9,
      number10,
    ]);
    const test =
      this.snailNumberToSnailNumberNested(added).getMagnitude() === 4140;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const number1 = this.parseStringToSnailNumber(
      '[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]'
    );
    const number2 = this.parseStringToSnailNumber(
      '[[[5,[2,8]],4],[5,[[9,9],0]]]'
    );
    const number3 = this.parseStringToSnailNumber(
      '[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]'
    );
    const number4 = this.parseStringToSnailNumber(
      '[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]'
    );
    const number5 = this.parseStringToSnailNumber(
      '[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]'
    );
    const number6 = this.parseStringToSnailNumber(
      '[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]'
    );
    const number7 = this.parseStringToSnailNumber(
      '[[[[5,4],[7,7]],8],[[8,3],8]]'
    );
    const number8 = this.parseStringToSnailNumber('[[9,3],[[9,9],[6,[4,9]]]]');
    const number9 = this.parseStringToSnailNumber(
      '[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]'
    );
    const number10 = this.parseStringToSnailNumber(
      '[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]'
    );
    const test =
      this.getLargestMagnitude([
        number1,
        number2,
        number3,
        number4,
        number5,
        number6,
        number7,
        number8,
        number9,
        number10,
      ]) === 3993;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseStringToSnailNumber(input: string): SnailNumber[] {
    const numbers = [];

    let depthCount = -1;
    for (const char of input) {
      if (char === '[') {
        depthCount++;
      } else if (char === ']') {
        depthCount--;
      } else if (isNaN(Number.parseInt(char))) {
        continue;
      } else {
        numbers.push({
          value: Number.parseInt(char),
          depth: depthCount,
        });
      }
    }

    return numbers;
  }

  private snailNumberToSnailNumberNested(
    numbers: SnailNumber[]
  ): SnailNumberNested {
    const numberJson = `{"a":{"a":{"a":{"a":${numbers[0].value},"b":${numbers[1].value}},"b":{"a":${numbers[2].value},"b":${numbers[3].value}}},"b":{"a":{"a":${numbers[4].value},"b":${numbers[5].value}},"b":{"a":${numbers[6].value},"b":${numbers[7].value}}}},"b":{"a":{"a":{"a":${numbers[8].value},"b":${numbers[9].value}},"b":{"a":${numbers[10].value},"b":${numbers[11].value}}},"b":{"a":{"a":${numbers[12].value},"b":${numbers[13].value}},"b":{"a":${numbers[14].value},"b":${numbers[15].value}}}}}`;
    return plainToClass(SnailNumberNested, JSON.parse(numberJson));
  }

  private reduce(numbers: SnailNumber[]): SnailNumber[] {
    let reduced = false;
    while (!reduced) {
      const explode = this.explode(numbers);
      if (explode[1]) {
        numbers = explode[0];
        continue;
      }
      const split = this.split(numbers);
      if (split[1]) {
        numbers = split[0];
        continue;
      }
      reduced = true;
    }
    return numbers;
  }

  private explode(numbers: SnailNumber[]): [SnailNumber[], boolean] {
    const pairToExplodeIndex = numbers.findIndex((n) => n.depth > 3);
    if (pairToExplodeIndex === -1) {
      return [numbers, false];
    }

    if (pairToExplodeIndex > 0) {
      numbers[pairToExplodeIndex - 1].value +=
        numbers[pairToExplodeIndex].value;
    }

    if (numbers.length - 1 > pairToExplodeIndex + 1) {
      numbers[pairToExplodeIndex + 2].value +=
        numbers[pairToExplodeIndex + 1].value;
    }

    numbers[pairToExplodeIndex].value = 0;
    numbers[pairToExplodeIndex].depth--;

    numbers.splice(pairToExplodeIndex + 1, 1);

    return [numbers, true];
  }

  private split(numbers: SnailNumber[]): [SnailNumber[], boolean] {
    const pairToSplitIndex = numbers.findIndex((n) => n.value > 9);

    if (pairToSplitIndex === -1) {
      return [numbers, false];
    }

    const splitValue = numbers[pairToSplitIndex].value / 2;
    numbers[pairToSplitIndex].value = Math.floor(splitValue);
    numbers[pairToSplitIndex].depth++;

    numbers.splice(pairToSplitIndex + 1, 0, {
      value: Math.ceil(splitValue),
      depth: numbers[pairToSplitIndex].depth,
    });

    return [numbers, true];
  }

  private add(numbers: SnailNumber[][]): SnailNumber[] {
    let addedNumbers = [];
    // eslint-disable-next-line prefer-const
    for (let [index, number] of numbers.entries()) {
      number = this.reduce(number);
      addedNumbers = [...addedNumbers, ...number];

      if (index > 0) {
        for (const number of addedNumbers) {
          number.depth++;
        }
        number = this.reduce(addedNumbers);
      }
    }

    return addedNumbers;
  }

  private getLargestMagnitude(numbers: SnailNumber[][]): number {
    let largestMagnitude = 0;

    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < numbers.length; j++) {
        if (i === j) {
          continue;
        }

        const added = this.add(
          JSON.parse(JSON.stringify([numbers[i], numbers[j]]))
        );
        if (added.length < 16) {
          continue;
        }
        const magnitude =
          this.snailNumberToSnailNumberNested(added).getMagnitude();
        if (magnitude > largestMagnitude) {
          largestMagnitude = magnitude;
        }
      }
    }

    return largestMagnitude;
  }
}

class SnailNumber {
  depth: number;
  value: number;
}

class SnailNumberNested {
  @Type(() => SnailNumberNested)
  a: SnailNumberNested | number;
  @Type(() => SnailNumberNested)
  b: SnailNumberNested | number;

  constructor(a: SnailNumberNested | number, b: SnailNumberNested | number) {
    this.a = a;
    this.b = b;
  }

  getMagnitude(): number {
    const magnituteA = isNaN(this.a as number)
      ? 3 * (this.a as SnailNumberNested).getMagnitude()
      : 3 * (this.a as number);

    const magnitudeB = isNaN(this.b as number)
      ? 2 * (this.b as SnailNumberNested).getMagnitude()
      : 2 * (this.b as number);

    return magnituteA + magnitudeB;
  }
}
