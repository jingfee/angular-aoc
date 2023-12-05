import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day5Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 5).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input, true);
        const seedsAndMaps = this.parseMap(parsedInput);
        const result = this.findLowestLocation(
          seedsAndMaps.seeds,
          seedsAndMaps.maps,
        );
        return this.aocClient.postAnswer(2023, 5, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 5).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input, true);
        const seedsAndMaps = this.parseMap(parsedInput);
        const result = this.findLowestLocationSeedRange(
          seedsAndMaps.seeds,
          seedsAndMaps.maps,
        );
        return this.aocClient.postAnswer(2023, 5, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const seedAndMap = this.parseMap([
      'seeds: 79 14 55 13',
      '',
      'seed-to-soil map:',
      '50 98 2',
      '52 50 48',
      '',
      'soil-to-fertilizer map:',
      '0 15 37',
      '37 52 2',
      '39 0 15',
      '',
      'fertilizer-to-water map:',
      '49 53 8',
      '0 11 42',
      '42 0 7',
      '57 7 4',
      '',
      'water-to-light map:',
      '88 18 7',
      '18 25 70',
      '',
      'light-to-temperature map:',
      '45 77 23',
      '81 45 19',
      '68 64 13',
      '',
      'temperature-to-humidity map:',
      '0 69 1',
      '1 0 69',
      '',
      'humidity-to-location map:',
      '60 56 37',
      '56 93 4',
      '',
    ]);
    const test =
      this.findLowestLocation(seedAndMap.seeds, seedAndMap.maps) === 35;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const seedAndMap = this.parseMap([
      'seeds: 79 14 55 13',
      '',
      'seed-to-soil map:',
      '50 98 2',
      '52 50 48',
      '',
      'soil-to-fertilizer map:',
      '0 15 37',
      '37 52 2',
      '39 0 15',
      '',
      'fertilizer-to-water map:',
      '49 53 8',
      '0 11 42',
      '42 0 7',
      '57 7 4',
      '',
      'water-to-light map:',
      '88 18 7',
      '18 25 70',
      '',
      'light-to-temperature map:',
      '45 77 23',
      '81 45 19',
      '68 64 13',
      '',
      'temperature-to-humidity map:',
      '0 69 1',
      '1 0 69',
      '',
      'humidity-to-location map:',
      '60 56 37',
      '56 93 4',
      '',
    ]);
    const test =
      this.findLowestLocationSeedRange(seedAndMap.seeds, seedAndMap.maps) ===
      46;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseMap(input: string[]) {
    const seeds = input[0]
      .split('seeds: ')[1]
      .split(' ')
      .map((s) => parseInt(s));
    const maps = [];
    for (let i = 2; i < input.length; i++) {
      const nameSplit = input[i].split(' ')[0].split('-');
      const map = {
        source: nameSplit[0],
        destination: nameSplit[2],
        ranges: [],
      } as FertilizerMap;
      let j = i + 1;
      let mapping = input[j];
      while (mapping !== '' && j < input.length) {
        const mappingSplit = mapping.split(' ').map((m) => parseInt(m));
        map.ranges.push({
          destinationStart: mappingSplit[0],
          sourceStart: mappingSplit[1],
          length: mappingSplit[2],
        });
        j++;
        mapping = input[j];
        if (mapping === '') {
          break;
        }
      }
      i = j;
      maps.push(map);
    }
    return { seeds, maps };
  }

  private findLowestLocation(seeds: number[], map: FertilizerMap[]) {
    let source = seeds;
    for (const mapPart of map) {
      const destination = [];
      for (const s of source) {
        let rangeFound = false;
        for (const range of mapPart.ranges) {
          if (s >= range.sourceStart && s <= range.sourceStart + range.length) {
            destination.push(range.destinationStart + (s - range.sourceStart));
            rangeFound = true;
            break;
          }
        }
        if (!rangeFound) {
          destination.push(s);
        }
      }
      source = destination;
    }
    return Math.min(...source);
  }

  private findLowestLocationSeedRange(seeds: number[], map: FertilizerMap[]) {
    let source = [];
    for (let i = 0; i < seeds.length; i = i + 2) {
      source.push({ start: seeds[i], length: seeds[i + 1] });
    }
    for (const mapPart of map) {
      const destination = [];
      for (const s of source) {
        let rangeFound = false;
        for (const range of mapPart.ranges) {
          if (
            s.start >= range.sourceStart &&
            s.start + (s.length - 1) <= range.sourceStart + (range.length - 1)
          ) {
            const diffStart = s.start - range.sourceStart;
            destination.push({
              start: range.destinationStart + diffStart,
              length: s.length,
            });
            rangeFound = true;
            break;
          } else if (
            s.start >= range.sourceStart &&
            s.start <= range.sourceStart + (range.length - 1)
          ) {
            const diffStart = s.start - range.sourceStart;
            const end = range.sourceStart + range.length;
            destination.push({
              start: range.destinationStart + diffStart,
              length: end - s.start,
            });
            source.push({
              start: end,
              length: s.start + s.length - end,
            });
            rangeFound = true;
            break;
          } else if (
            s.start + (s.length - 1) >= range.sourceStart &&
            s.start + (s.length - 1) <= range.sourceStart + (range.length - 1)
          ) {
            const length = s.length - (range.sourceStart - s.start);
            destination.push({
              start: range.destinationStart,
              length: length,
            });
            source.push({
              start: s.start,
              length: range.sourceStart - s.start,
            });
            rangeFound = true;
            break;
          }
        }
        if (!rangeFound) {
          destination.push({
            start: s.start,
            length: s.length,
          });
        }
      }
      source = destination;
    }
    return Math.min(...source.map((s) => s.start));
  }
}

interface FertilizerMap {
  source: string;
  destination: string;
  ranges: FertilizerMapRange[];
}

interface FertilizerMapRange {
  destinationStart: number;
  sourceStart: number;
  length: number;
}
