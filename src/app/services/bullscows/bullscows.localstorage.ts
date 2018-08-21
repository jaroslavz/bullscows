import {Injectable} from "@angular/core";
import {Observable} from "rxjs/rx"
import {Bullscows} from ".//bullscows"

@Injectable()
export class BullscowsLocalStorageService {
  storageKey: string = "bullscows";

  fetch(): Observable<Bullscows[]> {
    return Observable.of(this.fetchRaw());
  }

  add(title: number[], tags: string[], tags2: string[]): Observable<boolean> {
    let data: Bullscows = {
      name: title,
      tags: tags,
      tags2: tags2,
      done: false,
    };

    let bullscows: Bullscows[] = this.fetchRaw();
    bullscows.unshift(data);

    return Observable.of(this.saveBullscows(bullscows));
  }

  saveAll(bullscows: Bullscows[]): Observable<boolean> {
    let saved: boolean = this.saveBullscows(bullscows);

    return Observable.of(saved);
  }

  private fetchRaw(): Bullscows[] {
    let bullscows: any = localStorage.getItem('bullscows');
    let items: Bullscows[] = bullscows ? JSON.parse(bullscows) : [];

    return items;
  }

  private saveBullscows(bullscows: Bullscows[]): boolean {
    if (!bullscows || bullscows.length <= 0) {
      return false;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(bullscows));
    return true;
  }
}
