import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFinancialAccounts from '@salesforce/apex/AccountController.getFinancialAccounts';

const COLUMNS = [
    {
        label: 'Account Name', fieldName: 'recordUrl', type: 'url', sortable: true,
        typeAttributes: { label: { fieldName: 'name' } },
        editable: true
    },
    {
        label: 'Account Owner', fieldName: 'ownerName', sortable: true,
        displayReadOnlyIcon: true
    },
    {
        label: 'Phone', fieldName: 'phone', type: 'phone', editable: true
    },
    {
        label: 'Website', fieldName: 'website', type: 'url', editable: true
    },
    {
        label: 'Annual Revenue', fieldName: 'annualRevenue', type: 'number', editable: true
    }
];//Account Name, Account Owner, Phone, Website, and Annual Revenue

const FIELDNAME_SORTINGCOLUMN = {
    'recordUrl': 'name',
}

export default class FinancialServicesAccountsList extends LightningElement {
    searchByNameTerm = '';
    columns = COLUMNS;
    rows = [];
    displayedRows = [];

    sortBy;
    sortDirection;

    searchTerm = '';
    debounceTimer;

    draftValues;


    @wire(getFinancialAccounts, { searchByNameTerm: '$searchByNameTerm' })
    wiredAccounts({ error, data }) {
        if (data) {
            //this.columns = data.columns;
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

    getSortingFieldName(field) {
        return FIELDNAME_SORTINGCOLUMN[field] ? FIELDNAME_SORTINGCOLUMN[field] : field;
    }

    sortData(fieldName, sortDirection) {
        const rowsToSort = JSON.parse(JSON.stringify(this.rows));

        const isReverse = sortDirection === 'asc' ? 1 : -1;

        const getValue = (data) => {
            return data[fieldName];
        }

        rowsToSort.sort((a, b) => {
            a = getValue(a) ? getValue(a) : '';
            b = getValue(b) ? getValue(b) : '';

            return isReverse * ((a > b) - (b > a));
        });

        this.displayedRows = rowsToSort;
    }
    // search methods
    handleSearch(event) {
        const { value } = event.target;

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.searchTerm = value.toUpperCase();
            this.filterRecords();
        }, 300);
    }

    filterRecords() {
        if (this.searchTerm) {
            //filter
            const filteredRows = this.rows.filter(item => item.name?.toUpperCase().includes(this.searchTerm));
            this.displayedRows = JSON.parse(JSON.stringify(filteredRows));
        } else { // show all records
            this.displayedRows = JSON.parse(JSON.stringify(this.rows));
        }
    }

    //edit/save methods
    handleSave(event) {

    }

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