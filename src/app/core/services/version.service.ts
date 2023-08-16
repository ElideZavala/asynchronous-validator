import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map } from 'rxjs/operators';
import { vLog } from 'src/app/interfaces/vLog';
import { compareVersion } from 'src/app/utils';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  constructor(private http: HttpClient) {}

  versionValidator(appNameControl: AbstractControl): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      // si no tiene un app seleccionada, no valida
      if (!appNameControl.value) {
        return of(null);
      }
      return this.getVersionLog().pipe(
        map((vLog) => {
          const newVersion = control.value;
          const previousVersion = vLog[appNameControl.value];
          // Verificamos si la version es mayor a la anterior
          return compareVersion(newVersion, previousVersion) === 1
            ? null
            : {
                newVersionRequired: previousVersion,
              };
        })
      );
    };
  }

  getVersionLog() {
    return this.http.get<{ vLog: vLog }>('assets/data.json').pipe(
      map((res) => res.vLog),
      delay(2000)
    );
  }
}
