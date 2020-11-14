Write-Host "-------------------------------------------------------------------"
Write-Host "MONGODB IMPORT SCRIPT"
Write-Host "-------------------------------------------------------------------"
Write-Host "This script will import data into the MongoDB service."
Write-Host "The MongoDB service is configured to be persistent out-of-box,
so you only need to run this once."

Write-Host ""
Write-Host "START:"
Write-Host ""

$POD = $(kubectl get pod -l component=mongo-deployment -o jsonpath="{.items[0].metadata.name}") 2>&1
$STATUS = $(kubectl get pod -l component=mongo-deployment -o jsonpath="{.items[0].status.phase}") 2>&1

$podHasError = !$POD -or $POD.contains("error")
$statusHasError = !$STATUS -or $STATUS.contains("error")

if((!$podHasError -and !$statusHasError ) -and ($STATUS -eq "Running")){
  Write-Host "Running `mongoimport` command..."
  kubectl exec -it $POD -- mongoimport --db=ustrending --collection=locations --file=locations.json  --jsonArray
  kubectl exec -it $POD -- mongoimport --db=ustrending --collection=places --file=places.json  --jsonArray
  kubectl exec -it $POD -- mongoimport --db=ustrending --collection=zipcodes --file=zipcodes.json  --jsonArray
}
else{
  Write-Verbose ($POD | Out-String)
  Write-Verbose ($STATUS | Out-String)
  Write-Error "MongoDB pod is not found or running. Please ensure it is running, and try again..."
}

Write-Host "DONE."