import { TestBed } from '@angular/core/testing';
import { Contratacion } from './contratacion';

describe('Contratacion', () => {
  let service: Contratacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Contratacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
