/*****************************************************
 * @fileoverview This is the Datatable Util class which is a helper utility for 
 * Lightning Datatable component in the Lightning Web Components framework. 
 * It contains 3 features as of now- Search, Sort and Pagination. 
 * The class has variables which have to be wired into html for the results to be available.
 * 
 * To get started- import and instantiate the class in your JS, set rowsPerPage in the constructor
 * and dataList with the full data set and columns with column information
 * 
 * Then call the setPageData & setNumberOfPages to set the pages. 
 * The variable pageData will contain the first page data if everything went well. Copy this variable and wire to the html.
 */
export default class DataTableUtil {
    /**
     * The total list of data
     * @type {Array} array of objects as needed by lightning datatable
     */
    dataList;

    /**
     * The column information
     * @type {Array} array of objects as needed by lightning datatable
     */
    columns;

    /**
     * The error, if any in the util
     * @type {Object}
     */
    error;
    
    //Pagination variables BEGIN

    /**
     * The rows to display on the current page
     * @type {Array} array of objects as needed by lightning datatable
     */
    pageData;

    rowsPerPage;

    /**
     * The current rows per page value. Use this for the combobox value attribute
     * @type {String} array of objects as needed by lightning datatable
     */
    rowsPerPageText;

    /**
    *Array of all the page numbers and the current page
    *@type {Array} array of object. Properties - num,selected
    */
    pageList = [];

    currentPage;
    startRowNumber;
    lastRowNumber;
    totalRows;
    /**
     * boolean to specify whether there are any more pages to paginate backward
     * @type {Boolean}
     */
    noPrev = false;

    /**
     * boolean to specify whether there are any more pages to paginate forward
     * @type {Boolean}
     */
    noNext = false;
    
    //Pagination Variables END

    //Sorting variables BEGIN
    defaultSortDirection;
    sortDirection;
    sortedBy;
    //Sorting Variables END

    //Search Variables BEGIN
    searchText;
    searchSpinner = false;
    originalDataList;
    //Search Variables END

    /*****************************************************
     * @param {Number} rpp -Rows Per page
     * 
     ****************************************************/
    constructor(rpp){
        this.rowsPerPage = rpp;
        this.rowsPerPageText = String(this.rowsPerPage);
    }

    /***Pagination functions BEGIN******************************************************************************/

    /*****************************************************
     * @param {Number} size - total number of rows 
     * 
     ****************************************************/
    setNumberOfPages(size){
        let numberOfPages = Math.ceil(size/this.rowsPerPage);
        this.pageList = [];
        for(var i=1; i <= numberOfPages; i++){
            this.pageList.push({
                num : i,
                selected : null 
            });
        }
    }

    /*****************************************************
     * @param {String} pageNum - page number 
     * 
     * sets pageData variable
     ****************************************************/
    setPageData(pageNum){
        try{
            //set current page number
            this.currentPage = pageNum;
            //set selected page in pageList
            this.pageList.forEach(element=>{
                element.selected = parseInt(this.currentPage) ==  element.num ? true : false
            });
            //get the page data to be shown on table
            let totalRows = this.dataList.length;
            let rowsToOffset = (pageNum-1)*this.rowsPerPage;
            let lastRowOfPage = pageNum*this.rowsPerPage;
            this.pageData = this.dataList.slice(rowsToOffset,lastRowOfPage);
            this.startRowNumber = rowsToOffset+1;
            this.lastRowNumber = totalRows > lastRowOfPage ? lastRowOfPage : totalRows;
            this.totalRows = totalRows;

            //check if its the last or first page
            this.noNext = false;
            this.noPrev = false;
            if(pageNum == this.pageCount.length){
                this.noNext = true;
            }
            if(pageNum == "1"){
                this.noPrev = true;
            }
        }catch(e){
            this.error = e;
        }
    }

    /*****************************************************
     * @param {Nmmber} rowsPerPage - Rows per page value
     * 
     ****************************************************/
    changeRowsPerPage(rowsPerPage){
        this.rowsPerPage = rowsPerPage;
        this.setNumberOfPages(this.dataList.length);
        this.setPageData("1");
    }

    /*****************************************************
     * sets pageData to the next page records
     ****************************************************/
    nextPage(){
        if(!this.noNext){
            let newPageNum = parseInt(this.currentPage)+1;
            this.setPageData(newPageNum.toString());
        }
    }

    /*****************************************************
     * sets pageData to the previous page records
     ****************************************************/
    prevPage(){
        if(!this.noPrev){
        let newPageNum = parseInt(this.currentPage)-1;
        this.setPageData(newPageNum.toString());
        }
    }

    /****Pagination Functions END*************************/

    /****Sorting Functions BEGIN**************************/

    /*****************************************************
     * @param {Function} primer - primer function that the user can pass 
     * to be used on the field before being used in a sort function.
     * @param {Function/String} sortFunc - The sorting function can passed as an argument here.
     * The Utility has basic methods to sort text, number and date. To use these, 
     * pass the string, 'date'/'text'/'date' in sortFunc instead of a function.
     * 
     ****************************************************/
    sortData(primer,sortFunc){
        try{
            let fieldName = this.sortedBy;
            let sortDirection = this.sortDirection;
            const cloneData = [...this.dataList];

            if(typeof sortFunc=== 'string'){
                if(sortFunc=='text'){
                    cloneData.sort(this.sortText(fieldName,sortDirection === 'asc' ? 1 : -1,primer));
                }
                if(sortFunc=='number'){
                    cloneData.sort(this.sortNumber(fieldName, sortDirection === 'asc' ? 1 : -1, primer));
                }
                if(sortFunc=='date'){
                    cloneData.sort(this.sortDate(fieldName,sortDirection === 'asc' ? 1 : -1, primer));
                }
            }else if(typeof sortFunc==='function'){
                cloneData.sort(sortFunc(fieldName,sortDirection === 'asc' ? 1 : -1, primer));
            }


            this.dataList =[];
            this.dataList = cloneData;
            this.sortedBy = fieldName;
            this.sortDirection = sortDirection;
            this.setNumberOfPages(this.dataList.length);
            this.setPageData("1");
        }catch(e){
            this.error = e;
        }
    }

    /*****************************************************
     * @param {String} field - fieldName from columns
     * @param {NUmber} reverse - 1 (asc) or -1 (desc)
     * @param {Function} primer - primer function to be executed before sorting
     * 
     ****************************************************/
    sortText(field,reverse,primer){
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

    /*****************************************************
     * @param {String} field - fieldName from columns
     * @param {NUmber} reverse - 1 (asc) or -1 (desc)
     * @param {Function} primer - primer function to be executed before sorting
     * 
     ****************************************************/
    sortNumber(field,reverse,primer){
        const key = primer ? function(x){
            return primer(x);
        } : function(x){
            return x;
        }
        return function(a,b){
            let x = a[field] ? key(a[field]) : null;
            let y = b[field] ? key(b[field]) : null;
            if(x<y){return -1*reverse;}
            if(x>y){return 1*reverse;}
            return 0;
        }
    }

    /*****************************************************
     * @param {String} field - fieldName from columns
     * @param {NUmber} reverse - 1 (asc) or -1 (desc)
     * @param {Function} primer - primer function to be executed before sorting
     ****************************************************/
    sortDate(field, reverse, primer){
        const key = primer ? function(x){
            return primer(x);
        } : function(x){
            return x;
        }
        return function(a,b){
            let x = a[field] ? key(a[field]).getTime() : '';
            let y = b[field] ? key(b[field]).getTime() : '';
            if(x<y){return -1*reverse;}
            if(x>y){return 1*reverse;}
            return 0;
        }
    }

    /*****************************************************
     * @param {String} stringDate - Date string in the YYYY-DD-MM format
     * @returns {Date} JS Date object
     ****************************************************/
    parseIntoDateYYYYDDMM(stringDate){
        let arr = stringDate.split('-');
                        // Year             //Month             //Day
        return new Date(parseInt(arr[0]), parseInt(arr[2])-1, parseInt(arr[1]));
    }

    /*****************************************************
     * @param {String} numString - the Number as a String value
     * @returns {Number} Number with non numeric characters removed
     ****************************************************/
    removeNonnumberCharacters(numString){
        let num = numString.replace(/\D/g,'');
        return parseInt(num);
    }

    /****Sorting Functions END***************************/

    /****Search Functions BEGIN**************************/

    /*****************************************************
     * @param {String} searchText
     ****************************************************/
    searchTable(searchText){
        try{
            if(searchText){
                this.searchText = searchText;
                this.dataList = this.originalDataList.filter(row => {return this.searchRow(row,this.searchText)});
            }else{
                this.dataList = [...this.originalDataList];
            }
            this.setNumberOfPages(this.dataList.length);
            this.setPageData("1");
        }catch(e){
            this.error = e;
        }
    }

    /*****************************************************
     * @param {Object} rowObject Object corresponding to one row
     * @param {String} searchKey - the string to be searched
     * This is an internal method for the searchTable method.
     ****************************************************/
    searchRow(rowObject,searchKey){
        return Object.values(rowObject).some(element =>{
            return element.toLowerCase().includes(searchKey.toLowerCase());
        });
    }
    // this needs improvement
    /*arrayClone(item) {
        let i, copy;
        //if item is an array, create a slice (which will be shallow)
        if(Array.isArray(item)) {
            copy = item.slice(0);
            for(i=0; i<copy.length; i++) {
                copy[i] = arrayClone(copy[i]);
            }
            return copy;
        } else if( typeof item === 'object' ) {
            throw 'Cannot clone array containing an object!';
        } else {
            return item;
        }
    }*/

    /****Search Functions END**************************/
    
}