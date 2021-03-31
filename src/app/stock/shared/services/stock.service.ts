import { Injectable } from '@angular/core';
import { SocketStock } from '../../../app.module';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { Stock } from '../models/stock.model';
import {ChatMessage} from '../../../chat/shared/models/chat-message.model';
import {ChatClient} from '../../../chat/shared/models/chat-client.model';
import {StockDTO} from '../dtos/stock.dto';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private socketStock: SocketStock) { }

  sendUpdateStock(stock: Stock): void {
    const stockDTO: StockDTO = {
      name: stock.name,
      price: stock.price,
      init_price: stock.init_price,
      desc: stock.desc,
    };
    this.socketStock.emit('updateStock', stockDTO);
  }

  sendAddStock(stock: Stock): void {
    const stockDTO: StockDTO = {
      name: stock.name,
      price: stock.price,
      init_price: stock.init_price,
      desc: stock.desc,
    };
    this.socketStock.emit('addStock', stockDTO);
  }

  sendDeleteStock(stock: Stock): void {
    const stockDTO: StockDTO = {
      name: stock.name,
      price: stock.price,
      init_price: stock.init_price,
      desc: stock.desc,
    };
    this.socketStock.emit('deleteStock', stockDTO);
  }

  listenForAllStocks(): Observable<Stock[]>{
    return this.socketStock
      .fromEvent<StockDTO[]>('allStocks')
      .pipe(map(stocks => JSON.parse(JSON.stringify(stocks))));
  }


  listenForStockPriceUpdated(): Observable<Stock>{
    return this.socketStock
      .fromEvent<StockDTO>('stockPriceUpdated')
      .pipe(map(stocks => JSON.parse(JSON.stringify(stocks))));
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
