import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';

@Component({
  imports: [RouterOutlet, RouterLinkWithHref, MatToolbar, MatButton],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly navItems = [
    {
      path: 'menu',
      label: 'Menu',
    },
  ];
}
