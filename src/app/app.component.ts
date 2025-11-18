import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    try {
      // Enable debug overlays disable in development (hosts like localhost or when running ionic serve)
      const host = location.hostname;
      const isDevHost = host === 'localhost' || host === '127.0.0.1' || host === '' || host === '::1' || host.endsWith('.local');
      if (isDevHost) {
        document.body.classList.add('debug-disable-overlays');
        console.info('[debug] debug-disable-overlays enabled');
      }
    } catch (e) {
      // ignore in environments without DOM
    }
  }
}
