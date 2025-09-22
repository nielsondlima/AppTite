import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormclientePage } from './formcliente.page';

describe('FormclientePage', () => {
  let component: FormclientePage;
  let fixture: ComponentFixture<FormclientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormclientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
