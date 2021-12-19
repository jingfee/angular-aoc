import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day16Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 16).pipe(
      switchMap((input) => {
        const result = this.countVersion(input);
        return this.aocClient.postAnswer(2021, 16, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 16).pipe(
      switchMap((input) => {
        const result = this.getValue(input);
        return this.aocClient.postAnswer(2021, 16, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test1 = this.countVersion('38006F45291200') === 9;
    const test2 = this.countVersion('EE00D40C823060') === 14;
    const test3 = this.countVersion('8A004A801A8002F478') === 16;
    const test4 = this.countVersion('620080001611562C8802118E34') === 12;
    const test5 = this.countVersion('C0015000016115A2E0802F182340') === 23;
    const test6 = this.countVersion('A0016C880162017C3686B18A3D4780') === 31;

    return test1 && test2 && test3 && test4 && test5 && test6
      ? of(Status.SOLVED)
      : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test1 = this.getValue('C200B40A82') === 3;
    const test2 = this.getValue('04005AC33890') === 54;
    const test3 = this.getValue('880086C3E88112') === 7;
    const test4 = this.getValue('CE00C43D881120') === 9;
    const test5 = this.getValue('D8005AC2A8F0') === 1;
    const test6 = this.getValue('F600BC2D8F') === 0;
    const test7 = this.getValue('9C005AC2F8F0') === 0;
    const test8 = this.getValue('9C0141080250320F1802104A08') === 1;

    return test1 && test2 && test3 && test4 && test5 && test6 && test7 && test8
      ? of(Status.SOLVED)
      : of(Status.ERROR);
  }

  private getValue(hex: string) {
    const binary = this.hexToBinary(hex);
    const packet = this.parsePacket(binary, 0);
    return packet.getValue();
  }

  private countVersion(hex: string) {
    const binary = this.hexToBinary(hex);
    const packet = this.parsePacket(binary, 0);
    return packet.getSumVersion();
  }

  private parsePacket(binary: string, pointer: number): Packet {
    const packet = new Packet();
    let packetLength = 0;
    packet.version = Number.parseInt(binary.slice(pointer, pointer + 3), 2);
    packet.type = Number.parseInt(binary.slice(pointer + 3, pointer + 6), 2);

    packetLength += 6;

    if (packet.type === 4) {
      let value = '';
      let firstBit = '1';
      while (firstBit !== '0') {
        firstBit = binary.slice(
          pointer + packetLength,
          pointer + packetLength + 1
        );
        value += binary.slice(
          pointer + packetLength + 1,
          pointer + packetLength + 5
        );
        packetLength += 5;
      }
      packet.value = Number.parseInt(value, 2);
    } else {
      const lenghtType = binary.slice(
        pointer + packetLength,
        pointer + packetLength + 1
      );

      if (lenghtType === '1') {
        const numberOfSubPackets = Number.parseInt(
          binary.slice(pointer + packetLength + 1, pointer + packetLength + 12),
          2
        );
        packetLength += 12;
        for (let i = 0; i < numberOfSubPackets; i++) {
          const subPacket = this.parsePacket(binary, pointer + packetLength);
          packet.subpackets.push(subPacket);
          packetLength += subPacket.packetLength;
        }
      } else {
        const lengthOfSubPackets = Number.parseInt(
          binary.slice(pointer + packetLength + 1, pointer + packetLength + 16),
          2
        );
        packetLength += 16;
        let subPacketsLength = 0;
        while (subPacketsLength < lengthOfSubPackets) {
          const subPacket = this.parsePacket(
            binary,
            pointer + packetLength + subPacketsLength
          );
          packet.subpackets.push(subPacket);
          subPacketsLength += subPacket.packetLength;
        }
        packetLength += subPacketsLength;
      }
    }

    packet.packetLength = packetLength;
    return packet;
  }

  private hexToBinary(hex: string): string {
    let binary = '';
    for (const c of hex) {
      switch (c) {
        case '0':
          binary += '0000';
          break;
        case '1':
          binary += '0001';
          break;
        case '2':
          binary += '0010';
          break;
        case '3':
          binary += '0011';
          break;
        case '4':
          binary += '0100';
          break;
        case '5':
          binary += '0101';
          break;
        case '6':
          binary += '0110';
          break;
        case '7':
          binary += '0111';
          break;
        case '8':
          binary += '1000';
          break;
        case '9':
          binary += '1001';
          break;
        case 'A':
          binary += '1010';
          break;
        case 'B':
          binary += '1011';
          break;
        case 'C':
          binary += '1100';
          break;
        case 'D':
          binary += '1101';
          break;
        case 'E':
          binary += '1110';
          break;
        case 'F':
          binary += '1111';
          break;
      }
    }
    return binary;
  }
}

class Packet {
  version: number;
  type: number;
  value?: number;
  subpackets: Packet[];
  packetLength: number;

  constructor() {
    this.subpackets = [];
  }

  public getSumVersion() {
    return (
      this.version +
      this.subpackets.map((p) => p.getSumVersion()).reduce((a, b) => a + b, 0)
    );
  }

  public getValue() {
    let value;
    switch (this.type) {
      case 0:
        value = this.subpackets
          .map((p) => p.getValue())
          .reduce((a, b) => a + b, 0);
        break;
      case 1:
        value = this.subpackets
          .map((p) => p.getValue())
          .reduce((a, b) => a * b, 1);
        break;
      case 2:
        value = Math.min(...this.subpackets.map((p) => p.getValue()));
        break;
      case 3:
        value = Math.max(...this.subpackets.map((p) => p.getValue()));
        break;
      case 4:
        value = this.value;
        break;
      case 5:
        value =
          this.subpackets[0].getValue() > this.subpackets[1].getValue() ? 1 : 0;
        break;
      case 6:
        value =
          this.subpackets[0].getValue() < this.subpackets[1].getValue() ? 1 : 0;
        break;
      case 7:
        value =
          this.subpackets[0].getValue() === this.subpackets[1].getValue()
            ? 1
            : 0;
        break;
      default:
        value = -1;
    }
    return value;
  }
}
