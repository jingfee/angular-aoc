import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import { ChunkedQueue } from 'lite-fifo';

@Injectable({
  providedIn: 'root',
})
export class Day19Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 19).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input, true);
        const parsed = this.parse(parsedInput);
        const result = this.runWorkflow(parsed.parts, parsed.workflows);
        return this.aocClient.postAnswer(2023, 19, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 19).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input, true);
        const parsed = this.parse(parsedInput);
        const result = this.workFlowRanges(parsed.workflows);
        return this.aocClient.postAnswer(2023, 19, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parse([
      'px{a<2006:qkq,m>2090:A,rfg}',
      'pv{a>1716:R,A}',
      'lnx{m>1548:A,A}',
      'rfg{s<537:gd,x>2440:R,A}',
      'qs{s>3448:A,lnx}',
      'qkq{x<1416:A,crn}',
      'crn{x>2662:A,R}',
      'in{s<1351:px,qqz}',
      'qqz{s>2770:qs,m<1801:hdj,R}',
      'gd{a>3333:R,R}',
      'hdj{m>838:A,pv}',
      '',
      '{x=787,m=2655,a=1222,s=2876}',
      '{x=1679,m=44,a=2067,s=496}',
      '{x=2036,m=264,a=79,s=2244}',
      '{x=2461,m=1339,a=466,s=291}',
      '{x=2127,m=1623,a=2188,s=1013}',
    ]);
    const test = this.runWorkflow(parsed.parts, parsed.workflows) === 19114;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parse([
      'px{a<2006:qkq,m>2090:A,rfg}',
      'pv{a>1716:R,A}',
      'lnx{m>1548:A,A}',
      'rfg{s<537:gd,x>2440:R,A}',
      'qs{s>3448:A,lnx}',
      'qkq{x<1416:A,crn}',
      'crn{x>2662:A,R}',
      'in{s<1351:px,qqz}',
      'qqz{s>2770:qs,m<1801:hdj,R}',
      'gd{a>3333:R,R}',
      'hdj{m>838:A,pv}',
      '',
      '{x=787,m=2655,a=1222,s=2876}',
      '{x=1679,m=44,a=2067,s=496}',
      '{x=2036,m=264,a=79,s=2244}',
      '{x=2461,m=1339,a=466,s=291}',
      '{x=2127,m=1623,a=2188,s=1013}',
    ]);
    const test = this.workFlowRanges(parsed.workflows) === 167409079868000;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parse(input: string[]) {
    const parts = [];
    const workflows = new Map<string, string>();
    let parseWorkflows = true;
    for (const line of input) {
      if (line === '') {
        parseWorkflows = false;
        continue;
      }

      if (parseWorkflows) {
        const index = line.indexOf('{');
        workflows.set(line.substring(0, index), line.substring(index));
      } else {
        const trimmed = line.substring(1, line.length - 1);
        const split = trimmed.split(',');
        const part = {};
        for (const prop of split) {
          const propSplit = prop.split('=');
          part[propSplit[0]] = parseInt(propSplit[1]);
        }
        parts.push(part);
      }
    }
    return { parts, workflows };
  }

  private runWorkflow(parts: Part[], workflows: Map<string, string>) {
    let sum = 0;
    for (const part of parts) {
      let flow = 'in';
      while (flow !== 'A' && flow !== 'R') {
        const workflow = workflows.get(flow);
        flow = this.workflow(part, workflow);
      }
      if (flow === 'A') {
        sum += part.a + part.m + part.s + part.x;
      }
    }
    return sum;
  }

  private workflow(part: Part, workflow: string) {
    const trimmed = workflow.substring(1, workflow.length - 1);
    const split = trimmed.split(',');
    for (const cond of split) {
      if (!cond.includes(':')) {
        return cond;
      }

      const condSplit = cond.split(':');
      if (condSplit[0].includes('>')) {
        const condSplit2 = condSplit[0].split('>');
        if (part[condSplit2[0]] > parseInt(condSplit2[1])) {
          return condSplit[1];
        }
      } else if (condSplit[0].includes('<')) {
        const condSplit2 = condSplit[0].split('<');
        if (part[condSplit2[0]] < parseInt(condSplit2[1])) {
          return condSplit[1];
        }
      }
    }
    return '';
  }

  private workFlowRanges(workflows: Map<string, string>) {
    const queue = new ChunkedQueue();
    queue.enqueue({
      workflow: 'in',
      x: [1, 4000],
      m: [1, 4000],
      a: [1, 4000],
      s: [1, 4000],
    });
    const accepted = [];
    while (queue.size() > 0) {
      const current = queue.dequeue();
      if (current.workflow === 'A') {
        accepted.push(current);
        continue;
      } else if (current.workflow === 'R') {
        continue;
      }

      const workflow = workflows.get(current.workflow);
      const trimmed = workflow.substring(1, workflow.length - 1);
      const ranges = {
        x: current.x,
        m: current.m,
        a: current.a,
        s: current.s,
      };
      const split = trimmed.split(',');
      for (const cond of split) {
        if (!cond.includes(':')) {
          queue.enqueue({
            workflow: cond,
            x: ranges.x,
            m: ranges.m,
            a: ranges.a,
            s: ranges.s,
          });
        }

        const condSplit = cond.split(':');
        if (condSplit[0].includes('>')) {
          const condSplit2 = condSplit[0].split('>');
          const newRanges = JSON.parse(JSON.stringify(ranges));
          newRanges[condSplit2[0]][0] = parseInt(condSplit2[1]) + 1;
          queue.enqueue({
            workflow: condSplit[1],
            x: newRanges.x,
            m: newRanges.m,
            a: newRanges.a,
            s: newRanges.s,
          });
          ranges[condSplit2[0]][1] = parseInt(condSplit2[1]);
        } else if (condSplit[0].includes('<')) {
          const condSplit2 = condSplit[0].split('<');
          const newRanges = JSON.parse(JSON.stringify(ranges));
          newRanges[condSplit2[0]][1] = parseInt(condSplit2[1]) - 1;
          queue.enqueue({
            workflow: condSplit[1],
            x: newRanges.x,
            m: newRanges.m,
            a: newRanges.a,
            s: newRanges.s,
          });
          ranges[condSplit2[0]][0] = parseInt(condSplit2[1]);
        }
      }
    }

    let sum = 0;
    for (const a of accepted) {
      sum +=
        (a.x[1] - a.x[0] + 1) *
        (a.m[1] - a.m[0] + 1) *
        (a.a[1] - a.a[0] + 1) *
        (a.s[1] - a.s[0] + 1);
    }
    return sum;
  }
}

interface Part {
  x: number;
  m: number;
  a: number;
  s: number;
}
