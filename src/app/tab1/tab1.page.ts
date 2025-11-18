import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const REMINDER_ON_KEY = 'water_reminder_on';
const REMINDER_IDS_KEY = 'water_reminder_ids';
const BASE_NOTIFICATION_ID = 9000;
const WATER_GOAL_KEY = 'water_goal_liters';
const WATER_CURRENT_KEY = 'water_current_liters';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {

  remindersOn = false;
  scheduledIds: number[] = [];
  goalLiters = 2.0;
  currentLiters = 0.5;
  lastProbe = '';

  constructor() {}

  async ngOnInit() {
    const { value } = await Preferences.get({ key: REMINDER_ON_KEY });
    this.remindersOn = value === 'true';
    if (this.remindersOn) {
      const ids = await Preferences.get({ key: REMINDER_IDS_KEY });
      this.scheduledIds = ids.value ? JSON.parse(ids.value) : [];
    }
    // carregar meta diária e consumo atual
    const g = await Preferences.get({ key: WATER_GOAL_KEY });
    if (g.value) {
      const v = parseFloat(g.value);
      if (!isNaN(v)) this.goalLiters = v;
    }
    const c = await Preferences.get({ key: WATER_CURRENT_KEY });
    if (c.value) {
      const v = parseFloat(c.value);
      if (!isNaN(v)) this.currentLiters = v;
    }
  }

  async saveGoal(ev: any) {
    try {
      const inputVal = ev?.target?.value ?? ev?.detail ?? ev?.value ?? ev;
      const val = parseFloat(inputVal);
      if (!isNaN(val) && val > 0) {
        this.goalLiters = val;
        await Preferences.set({ key: WATER_GOAL_KEY, value: String(this.goalLiters) });
      } else {
        // reset input to current value if invalid
      }
    } catch (e) {
      console.warn('Erro ao salvar meta', e);
    }
  }

  async startReminders() {
    try {
      // obter plugin em tempo de execução para não quebrar o build web
      const win: any = window as any;
      const LocalNotifications = win.Capacitor?.Plugins?.LocalNotifications || win.LocalNotifications || null;

      if (!LocalNotifications) {
        alert('Plugin de notificações não disponível neste ambiente. Teste em um dispositivo real.');
        return;
      }

      const perm = await LocalNotifications.requestPermissions();
      // permissões podem ter formato { display: 'granted' }
      if (!perm || (perm as any).display !== 'granted') {
        alert('Permissão de notificações não concedida');
        return;
      }

      await this.scheduleNotifications(LocalNotifications);
      this.remindersOn = true;
      await Preferences.set({ key: REMINDER_ON_KEY, value: 'true' });
      await Preferences.set({ key: REMINDER_IDS_KEY, value: JSON.stringify(this.scheduledIds) });
      alert('Lembretes ativados (próximas notificações agendadas)');
    } catch (e: any) {
      console.error('Erro ao iniciar lembretes', e);
      alert('Erro ao iniciar lembretes: ' + (e?.message ?? e));
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
        const win: any = window as any;
        const LocalNotifications = win.Capacitor?.Plugins?.LocalNotifications || win.LocalNotifications || null;
        if (LocalNotifications) {
          await LocalNotifications.cancel({ notifications: this.scheduledIds.map(id => ({ id })) });
        }
      }

      this.remindersOn = false;
      this.scheduledIds = [];
      await Preferences.remove({ key: REMINDER_ON_KEY });
      await Preferences.remove({ key: REMINDER_IDS_KEY });
      alert('Lembretes desativados');
    } catch (e: any) {
      console.error('Erro ao parar lembretes', e);
      alert('Erro ao parar lembretes: ' + (e?.message ?? e));
    }
  }

  async onToggleChange(event: any) {
    const checked = event?.detail?.checked;
    const win: any = window as any;
    const LocalNotifications = win.Capacitor?.Plugins?.LocalNotifications || win.LocalNotifications || null;
    if (!LocalNotifications) {
      // plugin não disponível — manter toggle no estado anterior
      this.remindersOn = false;
      alert('Notificações nativas não disponíveis neste ambiente. Teste em um dispositivo real.');
      return;
    }

    if (checked) {
      await this.startReminders();
    } else {
      await this.stopReminders();
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
      // keep visible briefly
      setTimeout(()=>{ this.lastProbe = this.lastProbe; }, 2000);
    } catch (e) {
      console.error('probe error', e);
      this.lastProbe = 'probe error';
    }
  }

  private async scheduleNotifications(LocalNotifications?: any) {
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

    // agendar com o plugin (assume-se que já foi passado)
    if (!LocalNotifications) {
      const win: any = window as any;
      LocalNotifications = win.Capacitor?.Plugins?.LocalNotifications || win.LocalNotifications || null;
    }
    if (!LocalNotifications) {
      console.warn('LocalNotifications plugin não disponível. Não foi possível agendar notificações.');
      return;
    }
    await LocalNotifications.schedule({ notifications });
  }

}
