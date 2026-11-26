import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardLayout } from './dashboard-layout';

describe('DashboardLayout', () => {
  let component: DashboardLayout;
  let fixture: ComponentFixture<DashboardLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardLayout);
    component = fixture.componentInstance;
        fixture.componentRef.setInput('nombre', 'Carlos');
    fixture.componentRef.setInput('menu', []);
    fixture.componentRef.setInput('titulo', 'Panel de prueba');
    fixture.componentRef.setInput('correo', 'cliente@example.com');
    fixture.componentRef.setInput('seccion', 'resumen');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

