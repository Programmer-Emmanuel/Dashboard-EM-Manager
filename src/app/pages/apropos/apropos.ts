import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Nav } from '../../components/nav/nav';
import Footer from '../../components/footer/footer';

@Component({
  selector: 'app-apropos',
  imports: [CommonModule, RouterModule, Nav, Footer],
templateUrl: './apropos.html',
  styleUrl: './apropos.css',
})
export default class Apropos {

}
