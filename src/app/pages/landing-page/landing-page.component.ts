import { Component, HostListener, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPage implements OnInit, OnDestroy {
  isScrolled = false;
  displayPrompt = '';
  fullPrompt = 'Quero criar um projeto sobre vulcões para a minha feira de ciências...';

  // Anti-Physics Elements
  @ViewChild('physicsContainer') physicsContainer!: ElementRef;
  elements: any[] = [];
  mouseX = 0;
  mouseY = 0;
  scrollY = 0;

  private animationId: number | null = null;

  ngOnInit() {
    this.startTypingEffect();
    this.initAntiPhysicsElements();
    this.startAnimationLoop();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private startAnimationLoop() {
    const animate = () => {
      this.updateRepulsion();
      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  private initAntiPhysicsElements() {
    const colors = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#a78bfa'];
    
    for (let i = 0; i < 40; i++) { // Increase count for bubble field
      this.elements.push({
        id: i,
        type: 'shape',
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 50 + Math.random() * 150, // Larger bubbles
        left: Math.random() * 100, 
        top: Math.random() * 100,
        speed: 0.02 + Math.random() * 0.1, // Slower, more fluid motion
        offsetX: 0,
        offsetY: 0,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 5
      });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
    this.scrollY = window.scrollY;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  private updateRepulsion() {
    const repulsionRadius = 200;
    const repulsionStrength = 5;
    const friction = 0.95;

    this.elements.forEach(el => {
      // Elements are positioned absolute with percentage left/top in a fixed container
      const elX = (el.left / 100) * window.innerWidth;
      const elY = (el.top / 100) * window.innerHeight;
      
      const dx = elX - this.mouseX;
      const dy = elY - this.mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < repulsionRadius) {
        const force = (repulsionRadius - distance) / repulsionRadius;
        // Directional repulsion with accumulation
        el.offsetX += (dx / distance) * force * repulsionStrength;
        el.offsetY += (dy / distance) * force * repulsionStrength;
      }
      
      // Apply friction
      el.offsetX *= friction;
      el.offsetY *= friction;
    });
  }

  private startTypingEffect() {
    let index = 0;
    const interval = setInterval(() => {
      this.displayPrompt += this.fullPrompt[index];
      index++;
      if (index === this.fullPrompt.length) {
        clearInterval(interval);
        setTimeout(() => {
          this.displayPrompt = '';
          this.startTypingEffect();
        }, 3000);
      }
    }, 50);
  }
}
