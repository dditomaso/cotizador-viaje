import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDestinos } from './search-destinos';

describe('SearchDestinos', () => {
  let component: SearchDestinos;
  let fixture: ComponentFixture<SearchDestinos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchDestinos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchDestinos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
