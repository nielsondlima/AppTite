import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';

// Angular
import { CommonModule, NgIf, NgForOf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Ionic standalone components
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonListHeader,
  IonThumbnail
} from '@ionic/angular/standalone';

interface Meal {
  id: number;
  photo: string;
  description: string;
  date: string;
}

const MEALS_KEY = 'meals';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgForOf,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonList,
    IonListHeader,
    IonThumbnail
  ]
})
export class Tab3Page implements OnInit {

  meals: Meal[] = [];
  newDescription = '';
  newPhoto: string | null = null;
  loading = false;
  lastProbe = '';

  constructor() {}

  async ngOnInit() {
    await this.loadMeals();
  }

  private async loadMeals() {
    const { value } = await Preferences.get({ key: MEALS_KEY });
    this.meals = value ? JSON.parse(value) : [];
  }

  async takePhoto() {
  try {
    console.log('CLIQUEI no botão de tirar foto');

    // 1. Verificar/perguntar permissão antes
    const perm = await Camera.requestPermissions();
    // Em plataformas nativas o retorno pode incluir a propriedade 'camera'
    if (perm && (perm as any).camera && (perm as any).camera !== 'granted') {
      alert('Permissão de câmera não concedida');
      return;
    }

    const image = await Camera.getPhoto({
      quality: 70,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    this.newPhoto = image.dataUrl || null;
    console.log('Foto OK');
  } catch (err: any) {
    console.log('Erro ao usar câmera:', err);
    alert('Erro ao usar câmera: ' + JSON.stringify(err));
  }

  }

  probe(ev: PointerEvent) {
    try {
      const x = Math.round(ev.clientX || 0);
      const y = Math.round(ev.clientY || 0);
      const els: Element[] = (document as any).elementsFromPoint ? (document as any).elementsFromPoint(x, y) : [document.elementFromPoint(x, y) as Element].filter(Boolean);
      if (!els || els.length === 0) {
        this.lastProbe = `x:${x} y:${y} → (no elements)`;
        return;
      }

      const max = Math.min(els.length, 12);
      const rows: string[] = [];
      rows.push(`x:${x} y:${y} → top ${els.length} element(s) (showing ${max})`);
      for (let i = 0; i < max; i++) {
        const el = els[i];
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className ? `.${String(el.className).replace(/\s+/g, '.')}` : '';
        const tag = el.tagName.toLowerCase();
        const sr = (el as any).shadowRoot ? ' [shadowRoot]' : '';
        const style = window.getComputedStyle ? window.getComputedStyle(el as Element) : null;
        const pos = style ? style.position : '';
        const z = style ? style.zIndex : '';
        const pe = style ? style.pointerEvents : '';
        const disp = style ? style.display : '';
        const vis = style ? style.visibility : '';
        const op = style ? style.opacity : '';
        const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
        rows.push(`${i+1}. ${tag}${id}${cls}${sr} — pos:${pos} z:${z} pe:${pe} display:${disp} vis:${vis} op:${op} txt:"${txt}"`);
      }

      this.lastProbe = rows.join('\n');
      setTimeout(()=>{ this.lastProbe = this.lastProbe; }, 2000);
    } catch (e) {
      console.error('probe error', e);
      this.lastProbe = 'probe error';
    }
  }


  async saveMeal() {
    if (!this.newPhoto) return;

    this.loading = true;

    const meal: Meal = {
      id: Date.now(),
      photo: this.newPhoto,
      description: this.newDescription || 'Refeição sem descrição',
      date: new Date().toISOString(),
    };

    this.meals = [meal, ...this.meals];

    await Preferences.set({
      key: MEALS_KEY,
      value: JSON.stringify(this.meals),
    });

    this.newDescription = '';
    this.newPhoto = null;
    this.loading = false;
  }
}
