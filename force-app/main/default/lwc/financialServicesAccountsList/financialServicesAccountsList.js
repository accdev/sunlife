import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFinancialAccounts from '@salesforce/apex/AccountController.getFinancialAccounts';

//Display columns: Account Name, Account Owner, Phone, Website, and Annual Revenue
const COLUMNS = [
    {
        label: 'Account Name', fieldName: 'recordUrl', type: 'url', sortable: true,
        typeAttributes: { label: { fieldName: 'name' } },
        editable: false// this column cannot be easily editable since it's actual value is URL, not an account name
    },
    {
        label: 'Account Owner', fieldName: 'ownerName', sortable: true,
        displayReadOnlyIcon: true
    },
    {
        label: 'Phone', fieldName: 'phone', type: 'phone', editable: { fieldName: 'editable' }
    },
    {
        label: 'Website', fieldName: 'website', type: 'url', editable: { fieldName: 'editable' }
    },
    {
        label: 'Annual Revenue', fieldName: 'annualRevenue', type: 'number', editable: { fieldName: 'editable' }
    },
    // {
    //     label: 'Editable', fieldName: 'editable', editable: false// just to see which records user can modify
    // }
];

//mapping for sortable columns if it's value and label are different fields
const FIELDNAME_SORTINGCOLUMN = {
    'recordUrl': 'name',
}

export default class FinancialServicesAccountsList extends LightningElement {

    wiredAccountsResult;
    searchByNameTerm = '';
    columns = COLUMNS;
    rows = [];
    @track displayedRows = [];

    sortBy;
    sortDirection;

    debounceTimer;

    draftValues;

    // fetch accounts from backend
    @wire(getFinancialAccounts, { searchByNameTerm: '$searchByNameTerm' })
    wiredAccounts(result) {
        this.wiredAccountsResult = result;
        const { error, data } = result;
        if (data) {
            this.rows = data.rows;
            this.displayedRows = JSON.parse(JSON.stringify(this.rows));
        } else if (error) {
            this.rows = [];
            this.showError(error);
        }
    }
    //sort methods
    handleSortData(event) {
        if (this.rows && this.rows.length > 0) {
            const fieldName = this.getSortingFieldName(event.detail.fieldName);
            this.sortBy = event.detail.fieldName;
            this.sortDirection = event.detail.sortDirection;
            this.sortData(fieldName, event.detail.sortDirection);
        }
    }

    // get actual sorting field name from map
    getSortingFieldName(field) {
        return FIELDNAME_SORTINGCOLUMN[field] ? FIELDNAME_SORTINGCOLUMN[field] : field;
    }

    sortData(fieldName, sortDirection) {
        const rowsToSort = JSON.parse(JSON.stringify(this.displayedRows));
        const isReverse = sortDirection === 'asc' ? 1 : -1;

        rowsToSort.sort((a, b) => {
            let v1 = a[fieldName] ? a[fieldName] : '';
            let v2 = b[fieldName] ? b[fieldName] : '';

            return isReverse * ((v1 > v2) - (v2 > v1));
        });
        this.displayedRows = rowsToSort;
    }
    // search methods
    handleSearch(event) {
        const { value } = event.target;

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.searchByNameTerm = value;
            refreshApex(this.wiredAccountsResult);
        }, 300);
    }

    //edit/save methods
    handleSave(event) {
        // just a stub
    }
    //utils
    showError(error) {
        const msg = error?.message || error?.body?.message || error;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: msg,
                variant: 'error'
            })
        );
    }
}