import { Injectable } from '@angular/core';
import { SocketStock } from '../../../app.module';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { Stock } from '../models/stock.model';
import {ChatMessage} from '../../../chat/shared/models/chat-message.model';
import {ChatClient} from '../../../chat/shared/models/chat-client.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private socketStock: SocketStock) { }

  sendUpdateStockPrice(stockID: string, newPrice: number): void {
    this.socketStock.emit('stockPriceUpdated', stockID, newPrice );
  }

  listenForAllStocks(): Observable<Stock[]>{
    return this.socketStock
      .fromEvent<Stock[]>('allStocks');
  }

  listenForStockPriceUpdated(): Observable<Stock>{
    return this.socketStock
      .fromEvent<Stock>('stockPriceUpdated');
  }

  listenForConnect(): Observable<string>{
    return this.socketStock
      .fromEvent<string>('connect')
      .pipe(map( () =>
        {
          return this.socketStock.ioSocket.id;
        })
      );
  }

  listenForDisconnect(): Observable<string>{
    return this.socketStock
      .fromEvent<string>('disconnect')
      .pipe(map( () =>
        {
          return this.socketStock.ioSocket.id;
        })
      );
  }

  disconnect(): void {
    this.socketStock.disconnect();
  }

  connect(): void {
    this.socketStock.connect();
  }

  listenForErrors(): Observable<string>{
    return this.socketStock
      .fromEvent<string>('error');
  }
}
