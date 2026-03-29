import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaEmpresasPage } from './lista-empresas.page';

describe('ListaEmpresasPage', () => {
  let component: ListaEmpresasPage;
  let fixture: ComponentFixture<ListaEmpresasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaEmpresasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
