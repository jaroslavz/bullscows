import { Injectable } from "@angular/core"
import { Observable } from "rxjs/rx"
import { Bullscows, BullscowsLocalStorageService } from ".//bullscows"

@Injectable()
export class BullscowsService {
  constructor(private driver: BullscowsLocalStorageService) {
  }

  fetch(): Observable<Bullscows[]> {
    return this.driver.fetch()
  }

  add(title: number[], tags: string[], tags2: string[]): Observable<boolean> {
    return this.driver.add(title, tags, tags2);
  }

  saveAll(bullscows: Bullscows[]): Observable<boolean> {
    return this.driver.saveAll(bullscows);
  }
}
