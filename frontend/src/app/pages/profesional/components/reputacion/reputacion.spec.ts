import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Reputacion } from './reputacion';

describe('Reputacion', () => {
  let component: Reputacion;
  let fixture: ComponentFixture<Reputacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reputacion],
    }).compileComponents();

    fixture = TestBed.createComponent(Reputacion);
    component = fixture.componentInstance;
        fixture.componentRef.setInput('perfil', null);
    fixture.componentRef.setInput('calificaciones', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

