import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day12Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 12).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.sumArrangements(parsedInput);
        return this.aocClient.postAnswer(2023, 12, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 12).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.sumArrangementsUnfolded(parsedInput);
        return this.aocClient.postAnswer(2023, 12, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.sumArrangements([
        '???.### 1,1,3',
        '.??..??...?##. 1,1,3',
        '?#?#?#?#?#?#?#? 1,3,1,6',
        '????.#...#... 4,1,1',
        '????.######..#####. 1,6,5',
        '?###???????? 3,2,1',
      ]) === 21;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.sumArrangementsUnfolded([
        '???.### 1,1,3',
        '.??..??...?##. 1,1,3',
        '?#?#?#?#?#?#?#? 1,3,1,6',
        '????.#...#... 4,1,1',
        '????.######..#####. 1,6,5',
        '?###???????? 3,2,1',
      ]) === 525152;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private sumArrangements(input: string[]) {
    let sum = 0;
    for (const line of input) {
      const split = line.split(' ');
      sum += this.recursive(
        split[0],
        split[1].split(',').map((a) => parseInt(a)),
        new Map<string, number>(),
      );
    }
    return sum;
  }

  private sumArrangementsUnfolded(input: string[]) {
    let sum = 0;
    for (const line of input) {
      const split = line.split(' ');
      const patternBase = split[0];
      const springsBase = split[1].split(',').map((a) => parseInt(a));
      let patternUnfolded = patternBase;
      const springsUnfolded = [...springsBase];
      for (let i = 0; i < 4; i++) {
        patternUnfolded += '?' + patternBase;
        springsUnfolded.push(...springsBase);
      }
      sum += this.recursive(
        patternUnfolded,
        springsUnfolded,
        new Map<string, number>(),
      );
    }
    return sum;
  }

  /*private recursive2(
    pattern: string,
    springs: number[],
    cache: Map<string, number>,
  ) {
    const cacheKey = pattern + ' ' + springs.toString();
    const cacheHit = cache.get(cacheKey);
    if (cacheHit) {
      return cacheHit;
    }

    if([...pattern].filter(a => a !== '.').length < springs.reduce((a,b) => a+b)) {
      cache.set(cacheKey, 0);
      return 0;
    }

    if (pattern[0] === '?') {
      let sum = 0;
      sum += this.recursive('.' + pattern.substring(1), [...springs], cache);
      sum += this.recursive('#' + pattern.substring(1), [...springs], cache);
      return sum;
    } else {
      const nextWorkingIndex = pattern[0] === '.' ? pattern.substring(1).indexOf('.') + 1 : pattern.indexOf('.');
      const block = pattern.substring(0, nextWorkingIndex);
      if(block.includes('?')) {
        
      } else {
        const blocksSplit = block.split('.').filter(a => a !== '');
        if(blocksSplit.length > springs.length) {
          cache.set(cacheKey, 0);
          return 0;
        }
        for(let i = 0; i < blocksSplit.length; i++) {
          if(blocksSplit[i].length !== springs[i]) {
            cache.set(cacheKey, 0);
            return 0;
          }
          return this.recursive2(pattern.substring(block.length), springs.slice(blocksSplit.length), cache)
        }
      }
    }
  }*/

  private recursive(
    pattern: string,
    springs: number[],
    cache: Map<string, number>,
  ) {
    const cacheKey = pattern + ' ' + springs.toString();
    const cacheHit = cache.get(cacheKey);
    if (cacheHit) {
      return cacheHit;
    }

    if (pattern.length === 0) {
      return 0;
    }

    if (
      [...pattern].filter((a) => a !== '.').length <
      springs.reduce((a, b) => a + b)
    ) {
      cache.set(cacheKey, 0);
      return 0;
    }

    if (pattern[0] === '.') {
      const i = [...pattern].findIndex((a) => a !== '.');
      const key = pattern.substring(i) + ' ' + springs.toString();
      const hit = cache.get(key);
      if (hit) {
        return hit;
      } else {
        const a = this.recursive(pattern.substring(i), [...springs], cache);
        cache.set(key, a);
        return a;
      }
    } else if (pattern[0] === '?') {
      const aKey = '.' + pattern.substring(1) + ' ' + springs.toString();
      const bKey = '#' + pattern.substring(1) + ' ' + springs.toString();
      const aHit = cache.get(aKey);
      const bHit = cache.get(bKey);

      const a =
        aHit ?? this.recursive('.' + pattern.substring(1), [...springs], cache);
      const b =
        bHit ?? this.recursive('#' + pattern.substring(1), [...springs], cache);
      if (!aHit) {
        cache.set('.' + pattern.substring(1) + ' ' + springs.toString(), a);
      }
      if (!bHit) {
        cache.set('#' + pattern.substring(1) + ' ' + springs.toString(), b);
      }

      return a + b;
    } else if (pattern[0] === '#') {
      if (springs[0] > pattern.length) {
        cache.set(cacheKey, 0);
        return 0;
      }

      for (let i = 1; i < springs[0]; i++) {
        if (pattern[i] === '.') {
          cache.set(cacheKey, 0);
          return 0;
        }
      }

      const newPattern = pattern.substring(springs[0]);
      if (
        newPattern.length === 0 ||
        newPattern[0] === '.' ||
        newPattern[0] === '?'
      ) {
        springs.shift();

        if (springs.length === 0) {
          if (newPattern.includes('#')) {
            cache.set(cacheKey, 0);
            return 0;
          } else {
            cache.set(cacheKey, 1);
            return 1;
          }
        }

        const key = newPattern.substring(1) + ' ' + springs.toString();
        const hit = cache.get(key);
        if (hit) {
          return hit;
        } else {
          const a = this.recursive(
            newPattern.substring(1),
            [...springs],
            cache,
          );
          cache.set(key, a);
          return a;
        }
      } else {
        cache.set(cacheKey, 0);
        return 0;
      }
    }
  }
}
