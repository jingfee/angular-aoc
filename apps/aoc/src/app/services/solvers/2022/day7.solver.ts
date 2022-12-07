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
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 7).pipe(
      switchMap((input) => {
        const result = this.getDirectoriesSizeAtMost100000(
          this.utilService.rowInputToStringArray(input)
        );
        return this.aocClient.postAnswer(2022, 7, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 7).pipe(
      switchMap((input) => {
        const result = this.getDirectoryToDelete(
          this.utilService.rowInputToStringArray(input)
        );
        return this.aocClient.postAnswer(2022, 7, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.getDirectoriesSizeAtMost100000([
        '$ cd /',
        '$ ls',
        'dir a',
        '14848514 b.txt',
        '8504156 c.dat',
        'dir d',
        '$ cd a',
        '$ ls',
        'dir e',
        '29116 f',
        '2557 g',
        '62596 h.lst',
        '$ cd e',
        '$ ls',
        '584 i',
        '$ cd ..',
        '$ cd ..',
        '$ cd d',
        '$ ls',
        '4060174 j',
        '8033020 d.log',
        '5626152 d.ext',
        '7214296 k',
      ]) === 95437;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.getDirectoryToDelete([
        '$ cd /',
        '$ ls',
        'dir a',
        '14848514 b.txt',
        '8504156 c.dat',
        'dir d',
        '$ cd a',
        '$ ls',
        'dir e',
        '29116 f',
        '2557 g',
        '62596 h.lst',
        '$ cd e',
        '$ ls',
        '584 i',
        '$ cd ..',
        '$ cd ..',
        '$ cd d',
        '$ ls',
        '4060174 j',
        '8033020 d.log',
        '5626152 d.ext',
        '7214296 k',
      ]) === 24933642;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private getDirectoriesSizeAtMost100000(commands: string[]) {
    const directories = this.runCommands(commands);
    let sum = 0;
    for (const directory of directories) {
      if (directory.size <= 100000) {
        sum += directory.size;
      }
    }
    return sum;
  }

  private getDirectoryToDelete(commands: string[]) {
    const directories = this.runCommands(commands);
    const spaceNeeded = 30000000 - (70000000 - directories[0].size);
    let smallestSize = 70000000;
    for (const directory of directories) {
      const directorySize = directory.size;
      if (directorySize >= spaceNeeded && directorySize < smallestSize) {
        smallestSize = directorySize;
      }
    }
    return smallestSize;
  }

  private runCommands(commands: string[]): Directory[] {
    const directories = [];
    let currentDirectory: Directory;
    for (let commandIndex = 0; commandIndex < commands.length; commandIndex++) {
      const command = commands[commandIndex];
      if (command.startsWith('$ cd')) {
        const folder = command.substring(5);
        if (folder === '..') {
          currentDirectory = currentDirectory.parentDirectory;
        } else if (folder === '/') {
          currentDirectory = this.createNewDirectory(folder);
          directories.push(currentDirectory);
        } else {
          currentDirectory = currentDirectory.subDirectories.find(
            (d) => d.name === folder
          );
        }
      } else if (command.startsWith('$ ls')) {
        let nextLine = commands[commandIndex + 1];
        while (nextLine && !nextLine.startsWith('$')) {
          if (nextLine.startsWith('dir')) {
            const name = nextLine.substring(4);
            const newDirectory = this.createNewDirectory(name);
            newDirectory.parentDirectory = currentDirectory;
            currentDirectory.subDirectories.push(newDirectory);
            directories.push(newDirectory);
          } else {
            const fileSplit = nextLine.split(' ');
            const newFile = new File();
            newFile.size = +fileSplit[0];
            newFile.name = fileSplit[1];
            currentDirectory.files.push(newFile);
          }
          commandIndex++;
          nextLine = commands[commandIndex + 1];
        }
        commandIndex--;
      }
    }
    return directories;
  }

  private createNewDirectory(name: string) {
    const newDirectory = new Directory();
    newDirectory.name = name;
    newDirectory.files = [];
    newDirectory.subDirectories = [];
    return newDirectory;
  }
}

class Directory {
  public name: string;
  public files: File[];
  public subDirectories: Directory[];
  public parentDirectory: Directory;

  get size() {
    let sum = 0;
    for (const file of this.files) {
      sum += file.size;
    }
    for (const directory of this.subDirectories) {
      sum += directory.size;
    }
    return sum;
  }
}

class File {
  public name: string;
  public size: number;
}
