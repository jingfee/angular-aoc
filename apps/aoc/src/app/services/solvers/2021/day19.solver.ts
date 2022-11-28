import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day19Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 19).pipe(
      switchMap((input) => {
        const scanners = this.parseScanners(input);
        const result = this.mapBeacons(scanners).length;
        return this.aocClient.postAnswer(2021, 19, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 19).pipe(
      switchMap((input) => {
        const scanners = this.parseScanners(input);
        const result = this.getGreatestDistance(this.mapBeacons(scanners)[1]);
        return this.aocClient.postAnswer(2021, 19, 2, result);
      })
    );
  }

  private getTestScanners(): Scanner[] {
    return [
      new Scanner([
        '404,-588,-901',
        '528,-643,409',
        '-838,591,734',
        '390,-675,-793',
        '-537,-823,-458',
        '-485,-357,347',
        '-345,-311,381',
        '-661,-816,-575',
        '-876,649,763',
        '-618,-824,-621',
        '553,345,-567',
        '474,580,667',
        '-447,-329,318',
        '-584,868,-557',
        '544,-627,-890',
        '564,392,-477',
        '455,729,728',
        '-892,524,684',
        '-689,845,-530',
        '423,-701,434',
        '7,-33,-71',
        '630,319,-379',
        '443,580,662',
        '-789,900,-551',
        '459,-707,401',
      ]),
      new Scanner([
        '686,422,578',
        '605,423,415',
        '515,917,-361',
        '-336,658,858',
        '95,138,22',
        '-476,619,847',
        '-340,-569,-846',
        '567,-361,727',
        '-460,603,-452',
        '669,-402,600',
        '729,430,532',
        '-500,-761,534',
        '-322,571,750',
        '-466,-666,-811',
        '-429,-592,574',
        '-355,545,-477',
        '703,-491,-529',
        '-328,-685,520',
        '413,935,-424',
        '-391,539,-444',
        '586,-435,557',
        '-364,-763,-893',
        '807,-499,-711',
        '755,-354,-619',
        '553,889,-390',
      ]),
      new Scanner([
        '649,640,665',
        '682,-795,504',
        '-784,533,-524',
        '-644,584,-595',
        '-588,-843,648',
        '-30,6,44',
        '-674,560,763',
        '500,723,-460',
        '609,671,-379',
        '-555,-800,653',
        '-675,-892,-343',
        '697,-426,-610',
        '578,704,681',
        '493,664,-388',
        '-671,-858,530',
        '-667,343,800',
        '571,-461,-707',
        '-138,-166,112',
        '-889,563,-600',
        '646,-828,498',
        '640,759,510',
        '-630,509,768',
        '-681,-892,-333',
        '673,-379,-804',
        '-742,-814,-386',
        '577,-820,562',
      ]),
      new Scanner([
        '-589,542,597',
        '605,-692,669',
        '-500,565,-823',
        '-660,373,557',
        '-458,-679,-417',
        '-488,449,543',
        '-626,468,-788',
        '338,-750,-386',
        '528,-832,-391',
        '562,-778,733',
        '-938,-730,414',
        '543,643,-506',
        '-524,371,-870',
        '407,773,750',
        '-104,29,83',
        '378,-903,-323',
        '-778,-728,485',
        '426,699,580',
        '-438,-605,-362',
        '-469,-447,-387',
        '509,732,623',
        '647,635,-688',
        '-868,-804,481',
        '614,-800,639',
        '595,780,-596',
      ]),
      new Scanner([
        '727,592,562',
        '-293,-554,779',
        '441,611,-461',
        '-714,465,-776',
        '-743,427,-804',
        '-660,-479,-426',
        '832,-632,460',
        '927,-485,-438',
        '408,393,-506',
        '466,436,-512',
        '110,16,151',
        '-258,-428,682',
        '-393,719,612',
        '-211,-452,876',
        '808,-476,-593',
        '-575,615,604',
        '-485,667,467',
        '-680,325,-822',
        '-627,-443,-432',
        '872,-547,-609',
        '833,512,582',
        '807,604,487',
        '839,-516,451',
        '891,-625,532',
        '-652,-548,-490',
        '30,-46,-14',
      ]),
    ];
  }

  test_part_one(): Observable<Status> {
    const test = this.mapBeacons(this.getTestScanners())[0].length === 79;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.getGreatestDistance(this.mapBeacons(this.getTestScanners())[1]) ===
      3621;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseScanners(input: string): Scanner[] {
    const scanners = [];
    const scannerSplit = input.split('\n\n');
    for (const scanner of scannerSplit) {
      if (scanner === '') {
        continue;
      }

      const beacons = scanner.split('\n');
      beacons.splice(0, 1);
      scanners.push(new Scanner(beacons));
    }

    return scanners;
  }

  private mapBeacons(scanners: Scanner[]): [number[][], number[][]] {
    const map = [];
    const scannersMap = [[0, 0, 0]];
    for (const beacon of scanners[0].beacons) {
      map.push([beacon.x, beacon.y, beacon.z]);
    }
    const inputScanner = scanners.splice(0, 1)[0];
    const matchBeacons = [this.rotateBeacons(inputScanner.beacons, 0)];
    while (scanners.length > 0) {
      let found = false;
      let foundScannerIndex = -1;
      for (const [index, scanner] of scanners.entries()) {
        for (let r = 0; r < 24; r++) {
          const rotatedInputBeacons = this.rotateBeacons(scanner.beacons, r);
          let deltaX = 0;
          let deltaY = 0;
          let deltaZ = 0;

          for (const scannerPair of matchBeacons) {
            for (const matchBeacon of scannerPair) {
              for (const rotatedBeacon of rotatedInputBeacons) {
                deltaX = matchBeacon[0] - rotatedBeacon[0];
                deltaY = matchBeacon[1] - rotatedBeacon[1];
                deltaZ = matchBeacon[2] - rotatedBeacon[2];

                if (
                  scannerPair.filter(
                    (m) =>
                      rotatedInputBeacons.findIndex(
                        (r) =>
                          r[0] + deltaX === m[0] &&
                          r[1] + deltaY === m[1] &&
                          r[2] + deltaZ === m[2]
                      ) > -1
                  ).length >= 12
                ) {
                  found = true;
                  break;
                }
              }
              if (found) {
                break;
              }
            }
            if (found) {
              break;
            }
          }
          if (found) {
            for (const rotatedBeacon of rotatedInputBeacons) {
              rotatedBeacon[0] += deltaX;
              rotatedBeacon[1] += deltaY;
              rotatedBeacon[2] += deltaZ;
              if (
                map.findIndex(
                  (m) =>
                    m[0] === rotatedBeacon[0] &&
                    m[1] === rotatedBeacon[1] &&
                    m[2] === rotatedBeacon[2]
                ) === -1
              ) {
                map.push(rotatedBeacon);
              }
            }
            matchBeacons.push(rotatedInputBeacons);
            scannersMap.push([deltaX, deltaY, deltaZ]);
            break;
          }
        }
        if (found) {
          foundScannerIndex = index;
          break;
        }
      }
      if (foundScannerIndex === -1) {
        throw 'Couldnt find scanner';
      }
      scanners.splice(foundScannerIndex, 1);
    }

    return [map, scannersMap];
  }

  private getGreatestDistance(scanners: number[][]): number {
    let greatestDistance = 0;

    for (let i = 0; i < scanners.length; i++) {
      for (let j = 0; j < scanners.length; j++) {
        if (i <= j) {
          continue;
        }

        const distance =
          Math.abs(scanners[i][0] - scanners[j][0]) +
          Math.abs(scanners[i][1] - scanners[j][1]) +
          Math.abs(scanners[i][2] - scanners[j][2]);

        if (distance > greatestDistance) {
          greatestDistance = distance;
        }
      }
    }

    return greatestDistance;
  }

  private rotateBeacons(beacons: Beacon[], rotation: number): number[][] {
    return beacons.map((b) => this.rotateCoordinate([b.x, b.y, b.z], rotation));
  }

  private rotateCoordinate(coordinate: number[], rotation: number): number[] {
    switch (rotation) {
      case 0:
        return [coordinate[0], coordinate[1], coordinate[2]];
      case 1:
        return [-1 * coordinate[2], coordinate[1], coordinate[0]];
      case 2:
        return [-1 * coordinate[0], coordinate[1], -1 * coordinate[2]];
      case 3:
        return [coordinate[2], coordinate[1], -1 * coordinate[0]];

      case 4:
        return [coordinate[1], -1 * coordinate[0], coordinate[2]];
      case 5:
        return [-1 * coordinate[2], -1 * coordinate[0], coordinate[1]];
      case 6:
        return [-1 * coordinate[1], -1 * coordinate[0], -1 * coordinate[2]];
      case 7:
        return [coordinate[2], -1 * coordinate[0], -1 * coordinate[1]];

      case 8:
        return [-1 * coordinate[1], coordinate[0], coordinate[2]];
      case 9:
        return [-1 * coordinate[2], coordinate[0], -1 * coordinate[1]];
      case 10:
        return [coordinate[1], coordinate[0], -1 * coordinate[2]];
      case 11:
        return [coordinate[2], coordinate[0], coordinate[1]];

      case 12:
        return [coordinate[0], -1 * coordinate[2], coordinate[1]];
      case 13:
        return [-1 * coordinate[1], -1 * coordinate[2], coordinate[0]];
      case 14:
        return [-1 * coordinate[0], -1 * coordinate[2], -1 * coordinate[1]];
      case 15:
        return [coordinate[1], -1 * coordinate[2], -1 * coordinate[0]];

      case 16:
        return [coordinate[0], coordinate[2], -1 * coordinate[1]];
      case 17:
        return [coordinate[1], coordinate[2], coordinate[0]];
      case 18:
        return [-1 * coordinate[0], coordinate[2], coordinate[1]];
      case 19:
        return [-1 * coordinate[1], coordinate[2], -1 * coordinate[0]];

      case 20:
        return [coordinate[0], -1 * coordinate[1], -1 * coordinate[2]];
      case 21:
        return [coordinate[2], -1 * coordinate[1], coordinate[0]];
      case 22:
        return [-1 * coordinate[0], -1 * coordinate[1], coordinate[2]];
      case 23:
        return [-1 * coordinate[2], -1 * coordinate[1], -1 * coordinate[0]];
      default:
        return undefined;
    }
  }
}

class Scanner {
  public beacons: Beacon[];

  constructor(beaconCoordinates: string[]) {
    this.beacons = [];
    for (const coordinate of beaconCoordinates) {
      if (coordinate === '') {
        continue;
      }
      this.beacons.push(new Beacon(coordinate));
    }
  }
}

class Beacon {
  public x: number;
  public y: number;
  public z: number;

  constructor(coordinate: string) {
    const split = coordinate.split(',');
    this.x = Number.parseInt(split[0]);
    this.y = Number.parseInt(split[1]);
    this.z = Number.parseInt(split[2]);
  }
}
