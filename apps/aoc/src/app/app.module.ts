import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import {
  HttpCacheInterceptorModule,
  useHttpCacheLocalStorage,
} from '@ngneat/cashew';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpCacheInterceptorModule.forRoot(),
    FormsModule,
  ],
  providers: [useHttpCacheLocalStorage],
  bootstrap: [AppComponent],
})
export class AppModule {}
