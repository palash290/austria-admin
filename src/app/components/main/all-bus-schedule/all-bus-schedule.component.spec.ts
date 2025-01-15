import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllBusScheduleComponent } from './all-bus-schedule.component';

describe('AllBusScheduleComponent', () => {
  let component: AllBusScheduleComponent;
  let fixture: ComponentFixture<AllBusScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllBusScheduleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllBusScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
