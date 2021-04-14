import { Component, OnDestroy, OnInit } from '@angular/core';
import { StockService } from './shared/services/stock.service';
import {Observable, Subject, Subscription} from 'rxjs';
import { Stock } from './shared/models/stock.model';
import {debounceTime, take, takeUntil, withLatestFrom} from 'rxjs/operators';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import { StockState } from './shared/state/stock.state';
import { Select, Store } from '@ngxs/store';
import {
  AddStock,
  ListenForErrors,
  ListenForStockPriceUpdated,
  ListenForStocks,
  SendUpdateStock,
  StopListeningForStocks
} from './shared/state/stock.actions';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit, OnDestroy {
  @Select(StockState.stocks)
  stocks$: Observable<Stock[]> | undefined;
  @Select(StockState.updatedStock)
  updatedStock$: Observable<Stock>;
  selectedStock: Stock | undefined;
  unsubscriber$ = new Subject();
  @Select(StockState.error)
  errorMessage$: Observable<string>;
  errorMessage: string | undefined;
  socketId: string | undefined;
  isUpdating: boolean;
  isAdding: boolean;
  newStockFG = new FormGroup({
    nameFC: new FormControl('', Validators.required),
    priceFC: new FormControl('', Validators.required),
    descFC: new FormControl('', Validators.required),
  });

  constructor( private store: Store ) { }

  get nameFC(): AbstractControl { return this.newStockFG.get('nameFC'); }
  get priceFC(): AbstractControl { return this.newStockFG.get('priceFC'); }
  get descFC(): AbstractControl { return this.newStockFG.get('descFC'); }

  ngOnInit(): void {
    this.isUpdating = false;
    this.isAdding = false;
    this.store.dispatch(new ListenForStocks());
    this.store.dispatch(new ListenForErrors());
    this.errorMessage$
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(error => {
        this.errorMessage = error;
      });
    /*this.stockService.listenForErrors()
      .pipe(
        takeUntil(this.unsubscriber$)
      ).subscribe((error) => {
       this.errorMessage = error;
    });*/

   /* this.stockService.listenForConnect()
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
      });*/

    /*this.stockService.listenForStockPriceUpdated()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(stock => {
        this.selectStock(stock);
      });*/

    this.store.dispatch(new ListenForStockPriceUpdated());
    this.updatedStock$
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(stock => {
        this.selectedStock = stock;
      });
  }

  ngOnDestroy(): void {
    console.log('Destroyed');
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
    this.store.dispatch(new StopListeningForStocks());
  }

  selectStock(selectedStock: Stock): void {
    this.isUpdating = false;
    this.isAdding = false;
    this.errorMessage = undefined;
    this.selectedStock = selectedStock;
  }

  increaseStockPrice(): void {
    const updatedStock =
      {name: this.selectedStock.name,
        price: this.selectedStock.price,
        init_price: this.selectedStock.init_price,
        desc: this.selectedStock.desc};
    updatedStock.price++;
    this.store.dispatch(new SendUpdateStock(updatedStock));

  }

  decreaseStockPrice(): void {
    const updatedStock =
      {name: this.selectedStock.name,
        price: this.selectedStock.price,
        init_price: this.selectedStock.init_price,
        desc: this.selectedStock.desc};
    updatedStock.price--;
    this.store.dispatch(new SendUpdateStock(updatedStock));

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
      this.store.dispatch(new AddStock(newStock));
      this.errorMessage = undefined;
    } else {
      this.errorMessage = 'Invalid input, try again';
    }
  }
}
