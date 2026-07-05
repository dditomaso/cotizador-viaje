import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioVentas } from './formulario-ventas';

describe('FormularioVentas', () => {
  let component: FormularioVentas;
  let fixture: ComponentFixture<FormularioVentas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioVentas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioVentas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
