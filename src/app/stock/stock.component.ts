import { Component, OnDestroy, OnInit } from '@angular/core';
import { StockService } from './shared/services/stock.service';
import {Observable, Subject, Subscription} from 'rxjs';
import { Stock } from './shared/models/stock.model';
import {debounceTime, take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit, OnDestroy {
  stocks$: Observable<Stock[]> | undefined;
  selectedStock: Stock | undefined;
  unsubscriber$ = new Subject();
  errorMessage$: Observable<string> | undefined;
  socketId: string | undefined;

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.stocks$ = this.stockService.listenForAllStocks();
    this.errorMessage$ = this.stockService.listenForErrors();

    this.stockService.listenForConnect()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe((id) => {
        this.socketId = id;
      });

    this.stockService.listenForDisconnect()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe((id) => {
        this.socketId = id;
      });

    this.stockService.listenForStockPriceUpdated()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(stock => {
        this.selectStock(stock);
      });
  }

  ngOnDestroy(): void {
    console.log('Destroyed');
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  selectStock(selectedStock: Stock): void {
    this.selectedStock = selectedStock;
  }

  increaseStockPrice(): void {
    this.selectedStock.price++;
    const stock = this.selectedStock;
    this.stockService.sendUpdateStock(stock);

  }

  decreaseStockPrice(): void {
    this.selectedStock.price--;
    const stock = this.selectedStock;
    this.stockService.sendUpdateStock(stock);

  }
}
