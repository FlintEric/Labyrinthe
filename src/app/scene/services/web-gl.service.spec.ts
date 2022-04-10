import { TestBed, inject } from '@angular/core/testing';

import { WebGLService } from './web-gl.service';

describe('WebGLService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebGLService]
    });
  });

  it('should be created', inject([WebGLService], (service: WebGLService) => {
    expect(service).toBeTruthy();
  }));
});
