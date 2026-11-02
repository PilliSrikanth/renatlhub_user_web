import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavortComponent } from './favort.component';

describe('FavortComponent', () => {
  let component: FavortComponent;
  let fixture: ComponentFixture<FavortComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FavortComponent]
    });
    fixture = TestBed.createComponent(FavortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
