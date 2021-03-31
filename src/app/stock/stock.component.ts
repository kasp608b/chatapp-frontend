import { Component, OnDestroy, OnInit } from '@angular/core';
import { StockService } from './shared/services/stock.service';
import {Observable, Subject, Subscription} from 'rxjs';
import { Stock } from './shared/models/stock.model';
import {debounceTime, take, takeUntil} from 'rxjs/operators';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit, OnDestroy {
  stocks$: Observable<Stock[]> | undefined;
  selectedStock: Stock | undefined;
  unsubscriber$ = new Subject();
  errorMessage: string | undefined;
  socketId: string | undefined;
  isUpdating: boolean;
  isAdding: boolean;
  newStockFG = new FormGroup({
    nameFC: new FormControl('', Validators.required),
    priceFC: new FormControl('', Validators.required),
    descFC: new FormControl('', Validators.required),
  });

  constructor(private stockService: StockService) { }

  get nameFC(): AbstractControl { return this.newStockFG.get('nameFC'); }
  get priceFC(): AbstractControl { return this.newStockFG.get('priceFC'); }
  get descFC(): AbstractControl { return this.newStockFG.get('descFC'); }

  ngOnInit(): void {
    this.isUpdating = false;
    this.isAdding = false;
    this.stocks$ = this.stockService.listenForAllStocks();
    this.stockService.listenForErrors()
      .pipe(
        takeUntil(this.unsubscriber$)
      ).subscribe((error) => {
       this.errorMessage = error;
    });

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
    this.isUpdating = false;
    this.isAdding = false;
    this.errorMessage = undefined;
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

  addStock(): void {
    this.selectedStock = undefined;
    this.isAdding = true;
  }

  save(): void {
    console.log('saving');
    if (this.newStockFG.valid){
      const newStock =
        {
          name: this.nameFC.value,
          price: this.priceFC.value,
          init_price: this.priceFC.value,
          desc: this.descFC.value
        };
      this.stockService.sendAddStock(newStock);
      this.errorMessage = undefined;
    } else {
      this.errorMessage = 'Invalid input, try again';
    }
  }
}
