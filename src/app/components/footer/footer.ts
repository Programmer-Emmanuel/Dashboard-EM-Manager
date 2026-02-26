import { Component } from '@angular/core';
import { image } from '../../constant/image';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export default class Footer {

  constructor(
      public authService: AuthService,
      private router: Router
    ) {}


  image = image

  date = new Date()
}
