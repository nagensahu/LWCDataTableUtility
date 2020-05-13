export default class DataTableUtil {
    dataList;
    columns;
    //Pagination variables BEGIN
    pageData;
    rowsPerPage;
    rowsPerPageText;
    pageButtonArray = [];
    currentPage;
    startRowNumber;
    lastRowNumber;
    totalRows;
    noPrev = false;
    noNext = false;
    rowsPerPageOptions;
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
    constructor(rpp){
        this.rowsPerPage = rpp;
        this.rowsPerPageText = String(this.rowsPerPage);
    }

    /***Pagination functions BEGIN******************************************************************************/
    setNumberOfPages(size){
        let numberOfPages = Math.ceil(size/this.rowsPerPage);
        this.pageButtonArray = [];
        for(var i=1; i <= numberOfPages; i++){
            this.pageButtonArray.push({
                "num":i,
                "variantType": i==1 ? "brand" :"neutral"
            });
        }
    }

   /* changePage(event){
        this.currentPage = event.target.label;
        console.log('button clicked was'+this.currentPage);
        this.setPageData(this.currentPage);
        this.pageButtonArray.forEach(element =>{
            element.num == this.currentPage ? element.variantType = "brand" : element.variantType = "neutral";
        })
    }*/

    setPageData(pageNum){
        this.currentPage = pageNum;
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
        if(pageNum == this.pageButtonArray.length){
            this.noNext = true;
        }
        if(pageNum == "1"){
            this.noPrev = true;
        }
    }

    changeRowsPerPage(event){
        this.rowsPerPage = parseInt(event.target.value);
        this.setNumberOfPages(this.dataList.length);
        this.setPageData("1");
    }

    changePage(event){
        let newPageNum;
        event.target.label == "Next" ? newPageNum = parseInt(this.currentPage)+1 : newPageNum = parseInt(this.currentPage)-1;
        this.setPageData(newPageNum.toString());
    }

    /****Pagination Functions END*************************/
    /*****************************************************/
    /****Sorting Functions BEGIN**************************/

    handleSort(event){
        this.sortData(this.sortedBy, this.sortDirection);
    }

    sortData(primer,sortFunc){
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
    }

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

    parseIntoDateYYYYDDMM(stringDate){
        let arr = stringDate.split('-');
                        // Year             //Month             //Day
        return new Date(parseInt(arr[0]), parseInt(arr[2])-1, parseInt(arr[1]));
    }

    removeNonnumberCharacters(numString){
        let num = numString.replace(/\D/g,'');
        return parseInt(num);
    }

    /****Sorting Functions END***************************/
    /****************************************************/
    /****Search Functions BEGIN**************************/
    searchTable(event){
        console.log('search term is '+event.target.value);
        if(event.target.value){
            this.searchText = event.target.value;
            this.dataList = this.originalDataList.filter(row => {return this.searchRow(row,this.searchText)});
        }else{
            this.dataList = [...this.originalDataList];
        }
        this.setNumberOfPages(this.dataList.length);
        this.setPageData("1");
        console.log(this.originalDataList);
    }

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