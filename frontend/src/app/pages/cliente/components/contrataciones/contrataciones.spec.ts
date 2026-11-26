import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Contrataciones } from './contrataciones';

describe('Contrataciones', () => {
  let component: Contrataciones;
  let fixture: ComponentFixture<Contrataciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contrataciones],
    }).compileComponents();

    fixture = TestBed.createComponent(Contrataciones);
    component = fixture.componentInstance;
        fixture.componentRef.setInput('contrataciones', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

