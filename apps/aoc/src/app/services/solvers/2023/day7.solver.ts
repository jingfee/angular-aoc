import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day7Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 7).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.getWinnings(this.parseHands(parsedInput), false);
        return this.aocClient.postAnswer(2023, 7, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 7).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.getWinnings(this.parseHands(parsedInput), true);
        return this.aocClient.postAnswer(2023, 7, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.getWinnings(
        this.parseHands([
          '32T3K 765',
          'T55J5 684',
          'KK677 28',
          'KTJJT 220',
          'QQQJA 483',
        ]),
        false,
      ) === 6440;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.getWinnings(
        this.parseHands([
          '32T3K 765',
          'T55J5 684',
          'KK677 28',
          'KTJJT 220',
          'QQQJA 483',
        ]),
        true,
      ) === 5905;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseHands(input: string[]) {
    const parsedHands = [];
    for (const line of input) {
      const lineSplit = line.split(' ');
      parsedHands.push({
        hand: lineSplit[0].split(''),
        bid: parseInt(lineSplit[1]),
      });
    }
    return parsedHands;
  }

  private getWinnings(
    input: { hand: string[]; bid: number }[],
    useJoker: boolean,
  ) {
    input.sort((a, b) =>
      useJoker
        ? this.compareHandsJoker(a.hand, b.hand)
        : this.compareHands(a.hand, b.hand),
    );
    let winnings = 0;
    for (let i = 0; i < input.length; i++) {
      winnings += input[i].bid * (i + 1);
    }
    return winnings;
  }

  private compareHands(hand1: string[], hand2: string[]) {
    const strength = {
      '2': 0,
      '3': 1,
      '4': 2,
      '5': 3,
      '6': 4,
      '7': 5,
      '8': 6,
      '9': 7,
      T: 8,
      J: 9,
      Q: 10,
      K: 11,
      A: 12,
    };

    const hand1Strength = this.typeStrength(hand1);
    const hand2Strength = this.typeStrength(hand2);

    if (hand1Strength === hand2Strength) {
      for (let i = 0; i < 5; i++) {
        if (strength[hand1[i]] === strength[hand2[i]]) {
          continue;
        }
        return strength[hand1[i]] > strength[hand2[i]] ? 1 : -1;
      }
      return 0;
    } else {
      return hand1Strength > hand2Strength ? 1 : -1;
    }
  }

  private typeStrength(hand: string[]) {
    const arrangedHand = this.arrangeHand(hand);

    if (this.isFiveOfAKind(arrangedHand)) {
      return 6;
    }
    if (this.isFourOfAKind(arrangedHand)) {
      return 5;
    }
    if (this.isFullHouse(arrangedHand)) {
      return 4;
    }
    if (this.isThreeOfAKind(arrangedHand)) {
      return 3;
    }
    if (this.isTwoPair(arrangedHand)) {
      return 2;
    }
    if (this.isOnePair(arrangedHand)) {
      return 1;
    }
    return 0;
  }

  private arrangeHand(hand: string[]) {
    const arrangedHand = new Map<string, number>();
    arrangedHand.set('2', 0);
    arrangedHand.set('3', 0);
    arrangedHand.set('4', 0);
    arrangedHand.set('5', 0);
    arrangedHand.set('6', 0);
    arrangedHand.set('7', 0);
    arrangedHand.set('8', 0);
    arrangedHand.set('9', 0);
    arrangedHand.set('T', 0);
    arrangedHand.set('J', 0);
    arrangedHand.set('Q', 0);
    arrangedHand.set('K', 0);
    arrangedHand.set('A', 0);

    for (const card of hand) {
      arrangedHand.set(card, arrangedHand.get(card) + 1);
    }

    return arrangedHand;
  }

  private isFiveOfAKind(hand: Map<string, number>) {
    return [...hand.values()].includes(5);
  }

  private isFourOfAKind(hand: Map<string, number>) {
    return [...hand.values()].includes(4);
  }

  private isFullHouse(hand: Map<string, number>) {
    return (
      ([...hand.values()].filter((c) => c === 3).length === 1 &&
        [...hand.values()].filter((c) => c === 2).length === 1) ||
      [...hand.values()].filter((c) => c === 3).length === 2
    );
  }

  private isThreeOfAKind(hand: Map<string, number>) {
    return [...hand.values()].includes(3);
  }

  private isTwoPair(hand: Map<string, number>) {
    return [...hand.values()].filter((c) => c === 2).length === 2;
  }

  private isOnePair(hand: Map<string, number>) {
    return [...hand.values()].filter((c) => c === 2).length >= 1;
  }

  /* PART 2*/
  private compareHandsJoker(hand1: string[], hand2: string[]) {
    const strength = {
      '2': 1,
      '3': 2,
      '4': 3,
      '5': 4,
      '6': 5,
      '7': 6,
      '8': 7,
      '9': 8,
      T: 9,
      J: 0,
      Q: 10,
      K: 11,
      A: 12,
    };

    const hand1Strength = this.typeStrengthJoker(hand1);
    const hand2Strength = this.typeStrengthJoker(hand2);

    if (hand1Strength === hand2Strength) {
      for (let i = 0; i < 5; i++) {
        if (strength[hand1[i]] === strength[hand2[i]]) {
          continue;
        }
        return strength[hand1[i]] > strength[hand2[i]] ? 1 : -1;
      }
      return 0;
    } else {
      return hand1Strength > hand2Strength ? 1 : -1;
    }
  }

  private typeStrengthJoker(hand: string[]) {
    const arrangedHand = this.arrangeHandJoker(hand);

    if (this.isFiveOfAKind(arrangedHand)) {
      return 6;
    }
    if (this.isFourOfAKind(arrangedHand)) {
      return 5;
    }
    if (this.isFullHouse(arrangedHand)) {
      return 4;
    }
    if (this.isThreeOfAKind(arrangedHand)) {
      return 3;
    }
    if (this.isTwoPair(arrangedHand)) {
      return 2;
    }
    if (this.isOnePair(arrangedHand)) {
      return 1;
    }
    return 0;
  }

  private arrangeHandJoker(hand: string[]) {
    const arrangedHand = new Map<string, number>();
    arrangedHand.set('2', 0);
    arrangedHand.set('3', 0);
    arrangedHand.set('4', 0);
    arrangedHand.set('5', 0);
    arrangedHand.set('6', 0);
    arrangedHand.set('7', 0);
    arrangedHand.set('8', 0);
    arrangedHand.set('9', 0);
    arrangedHand.set('T', 0);
    arrangedHand.set('Q', 0);
    arrangedHand.set('K', 0);
    arrangedHand.set('A', 0);

    for (const card of hand) {
      if (card === 'J') {
        for (const key of arrangedHand.keys()) {
          arrangedHand.set(key, arrangedHand.get(key) + 1);
        }
      } else {
        arrangedHand.set(card, arrangedHand.get(card) + 1);
      }
    }

    return arrangedHand;
  }
}
