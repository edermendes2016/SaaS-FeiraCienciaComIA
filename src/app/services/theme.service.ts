import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme: 'light' | 'dark' = 'dark';

  constructor() {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) {
      this.theme = saved;
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      this.theme = 'light';
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  get currentTheme() {
    return this.theme;
  }

  private applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }
}
