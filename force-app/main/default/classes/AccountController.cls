public with sharing class AccountController {

    @AuraEnabled(cacheable=true)
    public static Object getFinancialAccounts(String searchByNameTerm) {
        try {
            Map<String, Object> res = new Map<String, Object>();
            List<Object> rows = new List<Object>();


            Map<Id, Account> accountsMap = getFinancialServicesAccountsMap(searchByNameTerm);
            Set<Id> editableAccounts = getEditableAccountIds(accountsMap.keySet());

            for(Account account : accountsMap.values()) {
                rows.add(
                    new Map<String, Object>{
                        'id' => account.Id,
                        'name' => account.Name,
                        'recordUrl' => '/' + account.Id,
                        'ownerId' => account.OwnerId,
                        'ownerName' => account.Owner.Name,
                        'phone' => account.Phone,
                        'website' => account.Website,
                        'annualRevenue' => account.AnnualRevenue,
                        'editable' => editableAccounts.contains(account.Id)
                    }
                );
            }
            res.put('rows', rows);
            //TODO: res.put('columns', getFinancialServicesAccountsColumns());// just in case we want load columns definition from the backend

            return res; 
        } catch (Exception e) {
            AuraHandledException ahEx = new AuraHandledException(e.getMessage());
            ahEx.setMessage(e.getMessage());
            throw ahEx;
        }
    }

    @TestVisible
    static Map<Id, Account> getFinancialServicesAccountsMap(String searchByNameTerm) {
        searchByNameTerm = '%' + searchByNameTerm + '%';
        return new  Map<Id, Account>([
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
            with    SECURITY_ENFORCED
            limit   2000
            for     VIEW
        ]);
    }

    @TestVisible
    static Set<Id> getEditableAccountIds(Set<Id> accountsIds) {
        return new Map<Id, UserRecordAccess>([
            select 
                    RecordId 
            from 
                    UserRecordAccess 
            where 
                    UserId = :UserInfo.getUserId() 
                and 
                    HasEditAccess = true 
                and 
                    RecordId in :accountsIds
        ]).keySet();
    }
}