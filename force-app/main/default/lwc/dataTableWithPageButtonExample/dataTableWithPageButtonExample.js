import { LightningElement } from 'lwc';
//Import the Utility
import DataTableUtil from 'c/dataTableUtil';
import getContacts from '@salesforce/apex/DataTablesController.getContacts';

export default class DataTableUtilExample extends LightningElement {
    util;
    columns;
    pageData;
    rowsPerPageOptions;
    pageButtonArray = [];

    constructor(){
        super();
        this.util = new DataTableUtil(10);
    }


    connectedCallback(){
        getContacts().then(result => {
            this.util.dataList = [...result];
            //for search
            this.util.originalDataList = [...result];
            //for button list
            this.util.setNumberOfPages(this.util.dataList.length);
            this.util.setPageData("1");
            this.setPageButtons();
            this.pageData = this.util.pageData;
        })
    }

    changePage(event){
        let newPageNum = event.target.label;
        this.util.setPageData(newPageNum);
        this.setPageButtons();
        this.pageData = this.util.pageData;
    }

    nextPage(event){
        this.util.nextPage();
        this.pageData = this.util.pageData;
    }

    prevPage(event){
        this.util.prevPage();
        this.pageData = this.util.pageData;
    }

    changeRowsPerPage(event){
        let newRpp = parseInt(event.target.value);
        this.util.changeRowsPerPage(newRpp);
        this.setPageButtons();
        this.pageData = this.util.pageData;
    }
    // use the pageList array to set the buttons on page
    // each pageList object has a num attribute and a selected attribute
    setPageButtons(){
        this.pageButtonArray=[];
        this.util.pageList.forEach(element=>{
            this.pageButtonArray.push({
                num : element.num,
                variantType : element.selected ? "brand" : "neutral"
            });
        });
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
        this.util.sortData(this.util.removeNonnumberCharacters,'number');

        if(fieldName == 'Birthdate')
        this.util.sortData(this.util.parseIntoDateYYYYDDMM,'date');



        this.pageData = this.util.pageData;
    }

    searchTable(event){
        let searchText = event.target.value;
        this.util.searchTable(searchText);
        this.setPageButtons();
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

    rowsPerPageOptions = [
        {
            value : "10",
            label : "10"
        },
        {
            value : "20",
            label : "20"
        },
        {
            value : "30",
            label : "30"
        } 

    ];

    

}