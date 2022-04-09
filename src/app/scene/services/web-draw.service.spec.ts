import { TestBed, inject } from '@angular/core/testing';

import { WebDrawService } from './web-draw.service';

describe('WebDrawService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebDrawService]
    });
  });

  it('should be created', inject([WebDrawService], (service: WebDrawService) => {
    expect(service).toBeTruthy();
  }));
});
