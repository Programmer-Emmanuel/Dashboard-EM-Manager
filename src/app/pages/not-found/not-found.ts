import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule, CommonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export default class NotFound {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
