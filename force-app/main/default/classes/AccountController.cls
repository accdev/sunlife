public with sharing class AccountController {

    @AuraEnabled(cacheable=true)
    public static Object getFinancialAccounts(String searchByNameTerm){
        try {
            Map<String, Object> res = new Map<String, Object>();

            res.put('rows', getFinancialServicesAccountsList(searchByNameTerm ));
            //TODO: res.put('columns', getFinancialServicesAccountsColumns());

            return res; 
        } catch (Exception e) {
            AuraHandledException ahEx = new AuraHandledException(e.getMessage());
            ahEx.setMessage(e.getMessage());
            throw ahEx;
        }
    }
    
    @TestVisible
    static List<Account> getFinancialServicesAccountsList(String searchByNameTerm) {
        searchByNameTerm = '%' + searchByNameTerm + '%';
        return [
            select
                    Name,
                    OwnerId,
                    Owner.Name,
                    Phone,
                    Website, 
                    AnnualRevenue
            from
                    Account
            where
                    Industry = 'Financial Services'
                and
                   Name like :searchByNameTerm
            limit 2000
            for view
        ];
    }
}