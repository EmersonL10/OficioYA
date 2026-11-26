import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Resumen } from './resumen';

describe('Resumen', () => {
  let component: Resumen;
  let fixture: ComponentFixture<Resumen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Resumen],
    }).compileComponents();

    fixture = TestBed.createComponent(Resumen);
    component = fixture.componentInstance;
        fixture.componentRef.setInput('perfil', null);
    fixture.componentRef.setInput('nombre', 'Miguel');
    fixture.componentRef.setInput('solicitudes', []);
    fixture.componentRef.setInput('cotizaciones', []);
    fixture.componentRef.setInput('contrataciones', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

