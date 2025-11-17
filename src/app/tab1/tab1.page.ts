import { Component, OnInit } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

const REMINDER_ON_KEY = 'water_reminder_on';
const REMINDER_IDS_KEY = 'water_reminder_ids';
const BASE_NOTIFICATION_ID = 9000;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  remindersOn = false;
  scheduledIds: number[] = [];

  constructor() {}

  async ngOnInit() {
    const { value } = await Preferences.get({ key: REMINDER_ON_KEY });
    this.remindersOn = value === 'true';
    if (this.remindersOn) {
      const ids = await Preferences.get({ key: REMINDER_IDS_KEY });
      this.scheduledIds = ids.value ? JSON.parse(ids.value) : [];
    }
  }

  async startReminders() {
    try {
      const perm = await LocalNotifications.requestPermissions();
      // permissões podem ter formato { display: 'granted' }
      if (!perm || (perm as any).display !== 'granted') {
        alert('Permissão de notificações não concedida');
        return;
      }

      await this.scheduleNotifications();
      this.remindersOn = true;
      await Preferences.set({ key: REMINDER_ON_KEY, value: 'true' });
      await Preferences.set({ key: REMINDER_IDS_KEY, value: JSON.stringify(this.scheduledIds) });
      alert('Lembretes ativados (próximas notificações agendadas)');
    } catch (e: any) {
      console.error('Erro ao iniciar lembretes', e);
      alert('Erro ao iniciar lembretes: ' + e?.message ?? e);
    }
  }

  async stopReminders() {
    try {
      if (!this.scheduledIds || this.scheduledIds.length === 0) {
        // tentar buscar ids em preferences
        const ids = await Preferences.get({ key: REMINDER_IDS_KEY });
        this.scheduledIds = ids.value ? JSON.parse(ids.value) : [];
      }

      if (this.scheduledIds.length > 0) {
        await LocalNotifications.cancel({ notifications: this.scheduledIds.map(id => ({ id })) });
      }

      this.remindersOn = false;
      this.scheduledIds = [];
      await Preferences.remove({ key: REMINDER_ON_KEY });
      await Preferences.remove({ key: REMINDER_IDS_KEY });
      alert('Lembretes desativados');
    } catch (e: any) {
      console.error('Erro ao parar lembretes', e);
      alert('Erro ao parar lembretes: ' + e?.message ?? e);
    }
  }

  private async scheduleNotifications() {
    // agendar 30 notificações nos próximos 60 minutos, a cada 2 minutos
    const notifications: any[] = [];
    const now = Date.now();
    const intervalMs = 2 * 60 * 1000; // 2 minutos
    const count = 30;

    this.scheduledIds = [];
    for (let i = 1; i <= count; i++) {
      const id = BASE_NOTIFICATION_ID + i;
      const scheduledAt = new Date(now + i * intervalMs);
      notifications.push({
        id,
        title: 'Hora de beber água',
        body: 'Beba um copo de água 💧',
        smallIcon: undefined,
        schedule: { at: scheduledAt }
      });
      this.scheduledIds.push(id);
    }

    // agendar com o plugin
    await LocalNotifications.schedule({ notifications });
  }

}
