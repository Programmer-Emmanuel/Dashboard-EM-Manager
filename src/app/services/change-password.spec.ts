import { TestBed } from '@angular/core/testing';

import { ChangePassword } from './change-password';

describe('ChangePassword', () => {
  let service: ChangePassword;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangePassword);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
