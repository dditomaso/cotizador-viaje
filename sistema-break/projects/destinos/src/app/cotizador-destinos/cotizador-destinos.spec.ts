import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotizadorDestinos } from './cotizador-destinos';

describe('CotizadorDestinos', () => {
  let component: CotizadorDestinos;
  let fixture: ComponentFixture<CotizadorDestinos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CotizadorDestinos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CotizadorDestinos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
