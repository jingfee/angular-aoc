/* eslint-disable no-constant-condition */
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
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 15).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.freeSlotsInRow(
          parsed.sensors,
          parsed.beacons,
          2000000
        );
        return this.aocClient.postAnswer(2022, 15, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 15).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.getFreeSlot(parsed.sensors, 4000000);

        return this.aocClient.postAnswer(2022, 15, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parse([
      'Sensor at x=2, y=18: closest beacon is at x=-2, y=15',
      'Sensor at x=9, y=16: closest beacon is at x=10, y=16',
      'Sensor at x=13, y=2: closest beacon is at x=15, y=3',
      'Sensor at x=12, y=14: closest beacon is at x=10, y=16',
      'Sensor at x=10, y=20: closest beacon is at x=10, y=16',
      'Sensor at x=14, y=17: closest beacon is at x=10, y=16',
      'Sensor at x=8, y=7: closest beacon is at x=2, y=10',
      'Sensor at x=2, y=0: closest beacon is at x=2, y=10',
      'Sensor at x=0, y=11: closest beacon is at x=2, y=10',
      'Sensor at x=20, y=14: closest beacon is at x=25, y=17',
      'Sensor at x=17, y=20: closest beacon is at x=21, y=22',
      'Sensor at x=16, y=7: closest beacon is at x=15, y=3',
      'Sensor at x=14, y=3: closest beacon is at x=15, y=3',
      'Sensor at x=20, y=1: closest beacon is at x=15, y=3',
    ]);
    const test = this.freeSlotsInRow(parsed.sensors, parsed.beacons, 10) === 26;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parse([
      'Sensor at x=2, y=18: closest beacon is at x=-2, y=15',
      'Sensor at x=9, y=16: closest beacon is at x=10, y=16',
      'Sensor at x=13, y=2: closest beacon is at x=15, y=3',
      'Sensor at x=12, y=14: closest beacon is at x=10, y=16',
      'Sensor at x=10, y=20: closest beacon is at x=10, y=16',
      'Sensor at x=14, y=17: closest beacon is at x=10, y=16',
      'Sensor at x=8, y=7: closest beacon is at x=2, y=10',
      'Sensor at x=2, y=0: closest beacon is at x=2, y=10',
      'Sensor at x=0, y=11: closest beacon is at x=2, y=10',
      'Sensor at x=20, y=14: closest beacon is at x=25, y=17',
      'Sensor at x=17, y=20: closest beacon is at x=21, y=22',
      'Sensor at x=16, y=7: closest beacon is at x=15, y=3',
      'Sensor at x=14, y=3: closest beacon is at x=15, y=3',
      'Sensor at x=20, y=1: closest beacon is at x=15, y=3',
    ]);
    const test = this.getFreeSlot(parsed.sensors, 20) === 56000011;
    console.log('hej');

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  parse(input: string[]): {
    sensors: { x: number; y: number; distanceToBeacon: number }[];
    beacons: { x: number; y: number }[];
  } {
    const sensors = [];
    const beacons = [];

    for (const line of input) {
      const split = line.split(' ');
      const x = +split[2].substring(2, split[2].length - 1);
      const y = +split[3].substring(2, split[3].length - 1);
      const bx = +split[8].substring(2, split[8].length - 1);
      const by = +split[9].substring(2);
      const sensor = {
        x,
        y,
        distanceToBeacon: Math.abs(x - bx) + Math.abs(y - by),
      };
      const beacon = {
        x: bx,
        y: by,
      };
      sensors.push(sensor);
      if (!beacons.find((b) => b.x === bx && b.y === by)) {
        beacons.push(beacon);
      }
    }

    return { sensors, beacons };
  }

  freeSlotsInRow(
    sensors: { x: number; y: number; distanceToBeacon: number }[],
    beacons: { x: number; y: number }[],
    rowIndex: number
  ) {
    const row = [];
    for (const sensor of sensors) {
      if (sensor.y === rowIndex) {
        row.push({
          min: sensor.x - sensor.distanceToBeacon,
          max: sensor.x + sensor.distanceToBeacon,
        });
      } else if (
        sensor.y < rowIndex &&
        sensor.y + sensor.distanceToBeacon >= rowIndex
      ) {
        // raden ligger under inom gränsen
        const diff = rowIndex - sensor.y;
        row.push({
          min: sensor.x - (sensor.distanceToBeacon - diff),
          max: sensor.x + (sensor.distanceToBeacon - diff),
        });
      } else if (
        sensor.y > rowIndex &&
        sensor.y - sensor.distanceToBeacon <= rowIndex
      ) {
        // raden ligger ovanför inom gränsen
        const diff = sensor.y - rowIndex;
        row.push({
          min: sensor.x - (sensor.distanceToBeacon - diff),
          max: sensor.x + (sensor.distanceToBeacon - diff),
        });
      }
    }

    const rowFiltered = [];
    let count = 0;
    row.sort((a, b) => (a.min < b.min ? -1 : 1));
    for (const r of row) {
      if (rowFiltered.some((rf) => rf.max >= r.max)) {
        continue;
      }

      const overlap = rowFiltered.find((rf) => rf.max >= r.min);
      if (overlap) {
        count += r.max - overlap.max;
        const beaconsInRange = beacons.filter(
          (b) => overlap.max < b.x && r.max >= b.x && b.y === rowIndex
        ).length;
        count -= beaconsInRange;

        overlap.max = r.max;
      } else {
        count += r.max - r.min + 1;
        rowFiltered.push(r);

        const beaconsInRange = beacons.filter(
          (b) => r.min <= b.x && r.max >= b.x && b.y === rowIndex
        ).length;
        count -= beaconsInRange;
      }
    }
    return count;
  }

  getFreeSlot(
    sensors: { x: number; y: number; distanceToBeacon: number }[],
    maxRows: number
  ): number {
    let xIndex;
    let yIndex;
    for (let i = 0; i <= maxRows; i++) {
      const row = [];
      for (const sensor of sensors) {
        if (sensor.y === i) {
          row.push({
            min: sensor.x - sensor.distanceToBeacon,
            max: sensor.x + sensor.distanceToBeacon,
          });
        } else if (sensor.y < i && sensor.y + sensor.distanceToBeacon >= i) {
          // raden ligger under inom gränsen
          const diff = i - sensor.y;
          row.push({
            min: sensor.x - (sensor.distanceToBeacon - diff),
            max: sensor.x + (sensor.distanceToBeacon - diff),
          });
        } else if (sensor.y > i && sensor.y - sensor.distanceToBeacon <= i) {
          // raden ligger ovanför inom gränsen
          const diff = sensor.y - i;
          row.push({
            min: sensor.x - (sensor.distanceToBeacon - diff),
            max: sensor.x + (sensor.distanceToBeacon - diff),
          });
        }
      }

      row.sort((a, b) => (a.min < b.min ? -1 : 1));
      let max = row[0].max;
      let foundX = false;
      for (const r of row) {
        if (max >= r.max) {
          continue;
        }

        if (max >= r.min) {
          max = r.max;
        } else {
          xIndex = r.min - 1;
          foundX = true;
          break;
        }
      }
      if (foundX) {
        yIndex = i;
        break;
      }
    }
    return xIndex * 4000000 + yIndex;
  }
}
