import { inject, Injectable, Renderer2, RendererFactory2 } from "@angular/core";
import { Alert } from "../../types/alert";

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _r2: Renderer2;
  constructor(rendererFactory: RendererFactory2) {
    this._r2 = rendererFactory.createRenderer(null, null)
  }
  createToast(alert: Alert, message: string) {
    let alertClass = '';
    switch (alert) {
      case Alert.SUCCESS:
        alertClass = 'alert-success';
        break;
      case Alert.ERROR:
        alertClass = 'alert-error';
        break;
      case Alert.INFO:
        alertClass = 'alert-info';
        break;
      case Alert.WARNING:
        alertClass = 'alert-warning';
        break;
    }
    const toastContainer = this._r2.createElement('div');
    this._r2.addClass(toastContainer, 'toast');
    this._r2.addClass(toastContainer, 'toast-end');
    const alertDiv = this._r2.createElement('div');
    this._r2.addClass(alertDiv, 'alert');
    this._r2.addClass(alertDiv, alertClass);
    const text = this._r2.createText(message);
    this._r2.appendChild(alertDiv, text);
    this._r2.appendChild(toastContainer, alertDiv);
    this._r2.appendChild(document.body, toastContainer);
    setTimeout(() => {
      this._r2.removeChild(document.body, toastContainer);
    }, 3000)
  }
}

