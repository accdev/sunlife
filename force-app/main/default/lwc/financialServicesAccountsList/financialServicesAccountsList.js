import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getFinancialAccounts from '@salesforce/apex/AccountController.getFinancialAccounts';

export default class FinancialServicesAccountsList extends LightningElement {
    searchByNameTerm;
    columns;

    @wire(getFinancialAccounts, { name: '$searchByNameTerm' })
    loadAccounts({ error, data }) {
        if (data) {
            //this.columns = data.columns;
            this.rows = data.rows;
        } else if (error) {

        }
    }
}