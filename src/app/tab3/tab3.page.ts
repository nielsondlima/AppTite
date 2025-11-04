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
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      this.newPhoto = image.dataUrl || null;
    } catch (err) {
      console.log('Câmera cancelada ou erro:', err);
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
