# LWCDataTableUtility
Utility JS to provide generic Sorting, Searching and Pagination in &lt;lightning-datatable> component

Works only for read only mode

DO NOT use the methods of the utility directly in your html. Instead wire the util methods from the current component methods (see examples)

**Step 1** - Instantiate utility in constructor with a rows per page value
```javascript
constructor(){
    super();
    this.util = new DataTableUtil(10);
    this.util.columns = this.columns;
}
```
**Step 2** - Initialize util with total number of rows as input and set the first page.
```javascript
getContacts().then(result => {
  //Here
  this.util.initializeUtil(result);
  this.util.setPageData("1");
  //more logic here
}
```
**Step 3**- Access the pageData variable from the util to get the current page data for the lightning datatable
```javascript
getContacts().then(result => {
  this.util.initializeUtil(result);
  this.util.setPageData("1");
  //Here
  this.pageData = this.util.pageData;
}
```
the util can be used to search sort and paginate data (check example component for code). The result of any operation is stored in the pageData variable. In case of an error, the error will be stored in the error variable of the utility.

