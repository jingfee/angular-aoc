import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Day1Service } from './day1.service';

describe('Day1Service', () => {
  let spectator: SpectatorService<Day1Service>;
  const createService = createServiceFactory({
    service: Day1Service,
    imports: [HttpClientTestingModule],
  });

  beforeEach(() => (spectator = createService()));

  it('should pass part 1', () => {
    expect(spectator.service.getBlockAwaysFromHq(['R2', 'L3'])).toBe(5);
    expect(spectator.service.getBlockAwaysFromHq(['R2', 'R2', 'R2'])).toBe(2);
    expect(
      spectator.service.getBlockAwaysFromHq(['R5', 'L5', 'R5', 'R3'])
    ).toBe(12);
  });

  it('should pass part 2', () => {
    expect(
      spectator.service.getBlockAwaysFromHq(['R8', 'R4', 'R4', 'R8'], true)
    ).toBe(4);
  });
});
