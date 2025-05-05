import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesGenresComponent } from './categories-genres.component';

describe('CategoriesGenresComponent', () => {
  let component: CategoriesGenresComponent;
  let fixture: ComponentFixture<CategoriesGenresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesGenresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesGenresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
