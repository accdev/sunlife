import { LightningElement, wire } from 'lwc';
//import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFinancialAccounts from '@salesforce/apex/AccountController.getFinancialAccounts';

const COLUMNS = [
    {
        label: 'Account Name', fieldName: 'recordUrl', type: 'url', sortable: true,
        typeAttributes: { label: { fieldName: 'name' } },
    },
    {
        label: 'Account Owner', fieldName: 'ownerName', sortable: true
    },
    {
        label: 'Phone', fieldName: 'phone', type: 'phone'
    },
    {
        label: 'Website', fieldName: 'website', type: 'url'
    },
    {
        label: 'Annual Revenue', fieldName: 'annualRevenue', type: 'number'
    }
];//Account Name, Account Owner, Phone, Website, and Annual Revenue

const FIELDNAME_SORTINGCOLUMN = {
    'recordUrl': 'name',
}

export default class FinancialServicesAccountsList extends LightningElement {
    searchByNameTerm = '';
    columns = COLUMNS;
    rows = [];

    sortBy;
    sortDirection;


    @wire(getFinancialAccounts, { searchByNameTerm: '$searchByNameTerm' })
    wiredAccounts({ error, data }) {
        if (data) {
            //this.columns = data.columns;
            this.rows = data.rows;
        } else if (error) {
            this.rows = [];
        }
    }

    handleSortData(event) {
        console.log('handleSortData');
        if (this.rows && this.rows.length > 0) {
            console.log('handleSortData.2');
            const fieldName = this.getSortingFieldName(event.detail.fieldName);
            console.log('handleSortData.fieldName:', fieldName);
            this.sortBy = event.detail.fieldName;
            console.log('handleSortData.sortBy:', this.sortBy);
            this.sortDirection = event.detail.sortDirection;

            this.sortData(fieldName, event.detail.sortDirection);
        }
    }

    getSortingFieldName(field) {
        return FIELDNAME_SORTINGCOLUMN[field] ? FIELDNAME_SORTINGCOLUMN[field] : field;
    }

    sortData(fieldName, sortDirection) {
        const rowsToSort = JSON.parse(JSON.stringify(this.rows));

        const isReverse = sortDirection === 'asc' ? 1 : -1;

        const getValue = (data) => {
            console.log('getValue.val:', data[fieldName]);
            return data[fieldName];
        }

        rowsToSort.sort((a, b) => {
            a = getValue(a) ? getValue(a) : '';
            b = getValue(b) ? getValue(b) : '';

            return isReverse * ((a > b) - (b > a));
        });

        this.rows = rowsToSort;
    }
}