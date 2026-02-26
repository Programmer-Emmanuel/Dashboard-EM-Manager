import { Component } from '@angular/core';
import { Nav } from '../../components/nav/nav';
import { RouterModule } from '@angular/router';
import Footer from '../../components/footer/footer';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterModule, Nav, Footer, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
}) 
export default class Home {
  constructor(public authService: AuthService) {}
}
