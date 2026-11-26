import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Oportunidades } from './oportunidades';

describe('Oportunidades', () => {
  let component: Oportunidades;
  let fixture: ComponentFixture<Oportunidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Oportunidades],
    }).compileComponents();

    fixture = TestBed.createComponent(Oportunidades);
    component = fixture.componentInstance;
        fixture.componentRef.setInput('solicitudes', []);
    fixture.componentRef.setInput('perfil', null);
    fixture.componentRef.setInput('cotizaciones', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

