import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDriversComponent } from './my-drivers.component';

describe('MyDriversComponent', () => {
  let component: MyDriversComponent;
  let fixture: ComponentFixture<MyDriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDriversComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
