public with sharing class AccountController {

    @AuraEnabled(cacheable=true)
    public static Object getFinancialAccounts(String searchByNameTerm) {
        try {
            Map<String, Object> res = new Map<String, Object>();
            List<Object> rows = new List<Object>();
            res.put('rows', rows);

            Map<Id, Account> accountsMap = getFinancialServicesAccountsMap(searchByNameTerm);
            Set<Id> editableAccounts = getEditableAccountIds(accountsMap.keySet());

            for(Account account : accountsMap.values()) {
                rows.add(
                    new Map<String, Object>{
                        'id' => account.Id,
                        'name' => account.Name,
                        'recordUrl' => '/' + account.Id,
                        'ownerName' => account.Owner.Name,
                        'phone' => account.Phone,
                        'website' => account.Website,
                        'annualRevenue' => account.AnnualRevenue,
                        'editable' => editableAccounts.contains(account.Id)
                    }
                );
            }

            return res; 
        } catch (Exception e) {
            AuraHandledException ahEx = new AuraHandledException(e.getMessage());
            ahEx.setMessage(e.getMessage());// to display real error message, not a 'Script-thrown exception'
            throw ahEx;
        }
    }
    /**
     * returns Map of Financial Services accounts
     */
    @TestVisible
    static Map<Id, Account> getFinancialServicesAccountsMap(String searchByNameTerm) {
        searchByNameTerm = '%' + searchByNameTerm + '%';
        return new  Map<Id, Account>([
            SELECT
                    Name,
                    Owner.Name,
                    Phone,
                    Website, 
                    AnnualRevenue
            FROM
                    Account
            WHERE
                    Industry = 'Financial Services'
                AND
                    Name like :searchByNameTerm
            WITH    SECURITY_ENFORCED
            LIMIT   2000
            FOR     VIEW
        ]);
    }

    /**
     * returns set of account Ids which user can edit
     */
    @TestVisible
    static Set<Id> getEditableAccountIds(Set<Id> accountsIds) {
        return new Map<Id, UserRecordAccess>([
            SELECT 
                    RecordId 
            FROM 
                    UserRecordAccess 
            WHERE 
                    UserId = :UserInfo.getUserId() 
                AND 
                    HasEditAccess = true 
                AND 
                    RecordId in :accountsIds
        ]).keySet();
    }
}