import { LightningElement } from 'lwc';
//Import Utility
import DataTableUtil from 'c/dataTableUtil';
import getContacts from '@salesforce/apex/DataTablesController.getContacts';

export default class DataTableUtilExample extends LightningElement {
    util;
    columns;
    pageData;

    constructor(){
        super();
        this.util = new DataTableUtil();
    }


    connectedCallback(){
        getContacts().then(result => {
            console.log(result);
            this.util.dataList = [...result];
            //for search
            this.util.originalDataList = [...result];
            //for button list
            this.util.setNumberOfPages(this.util.dataList.length);
            this.util.setPageData("1");
            this.pageData = this.util.pageData;
        })
    }

    changePage(event){
        this.util.changePage(event);
        this.pageData = this.util.pageData;
    }

    handleSort(event){
        //break the sort method
        this.util.sortedBy = event.detail.fieldName;
        this.util.sortDirection = event.detail.sortDirection;
        let fieldName = this.util.sortedBy;
        
        //sort using your own methods
        if(fieldName == 'Name' || fieldName == 'Email')
        this.util.sortData(null,this.exampleSortText);
        
        //sort using util methods
        if(fieldName == 'Phone')
        this.util.sortData(null,'number',this.util.removeNonnumberCharacters);

        if(fieldName == 'Birthdate')
        this.util.sortData(null,'number',this.util.parseIntoDateYYYYDDMM);



        this.pageData = this.util.pageData;
    }

    searchTable(event){
        this.util.searchTable(event);
        this.pageData = this.util.pageData;
    }

    exampleSortText(field,reverse,primer){
        const key = primer ? function(x){
            return primer(x);
        } : function(x){
            return x;
        }
        return function(a,b){
            let x = a[field] ? a[field].toLowerCase() : '';
            let y = b[field] ? b[field].toLowerCase() : '';
            if(x<y){return -1*reverse;}
            if(x>y){return 1*reverse;}
            return 0;
        }
    }

    columns = [
        {
            label : 'Name',
            fieldName : 'Name',
            type : 'text',
            sortable : true
            
        },
        {
            label : 'Phone',
            fieldName : 'Phone',
            type : 'phone',
            sortable : true
        },
        {
            label : 'Email',
            fieldName : 'Email',
            type : 'email',
            sortable : true
        },
        {
            label : 'Birth Date',
            fieldName : 'Birthdate',
            type : 'date',
            typeAttributes:{
                month: "2-digit",
                day: "2-digit",
                year: "numeric" 
            },
            sortable : true
        }
    ];

}