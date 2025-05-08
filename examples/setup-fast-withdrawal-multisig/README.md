

## Multisig ownership
Beware: At least one of the signers needs to be an EOA account so that it can propose transactions through this script.
If you want to use this script then you need to make sure the owner of the Rollup has been transfered to a Multisig contract and it has execution rights on L1 Executor Contract.

1. Build this example: yarn dev
2. This step will create a new Safe on the parent chain and add fast confirmation validators as owners.
```
node ./dist/1-create_multisig.js
```
3. The validators list is expanded with the Safe created with step 1 (1-create_multisig). That's why you need to provide FC_VALIDATORS_SAFE_ADDRESS. 
```
node ./dist/2-add_validators.js
```

4. We also add Safe as `fast confirmer`.
```
node ./dist/3-set-any-trust-fast-confirmer.js
```


5. Configure minimum assertion period. The default is 75 (~15 minutes) 
```
node ./dist/4-configure-minimum-assertion-period.js
```
