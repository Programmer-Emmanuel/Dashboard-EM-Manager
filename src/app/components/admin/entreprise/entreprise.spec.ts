import { ComponentFixture, TestBed } from '@angular/core/testing';
import EntrepriseComponent from './entreprise';

describe('Entreprise', () => {
  let component: EntrepriseComponent;
  let fixture: ComponentFixture<EntrepriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrepriseComponent]
    })

    .compileComponents();

    fixture = TestBed.createComponent(EntrepriseComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
