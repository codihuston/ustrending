#!/bin/bash

echo "-------------------------------------------------------------------"
echo "MONGODB IMPORT SCRIPT"
echo "-------------------------------------------------------------------"
echo "This script will import data into the MongoDB service."
echo "The MongoDB service is configured to be persistent out-of-box, so you only need to run this once."

echo ""
echo "START:"
echo ""

POD=`kubectl get pod -l component=mongo-deployment -o jsonpath={.items[0].metadata.name}`
STATUS=`kubectl get pod -l component=mongo-deployment -o jsonpath={.items[0].status.phase}`

echo "Found pod: $POD"
echo "Pod status: $STATUS"

if [[ $POD && $STATUS == "Running" ]]
then
  echo "Running 'mongoimport' command..."
  kubectl exec -it $POD -- mongoimport --db=ustrending --collection=zipcodes --file=zipcodes.json  --jsonArray
  Write-Host "Creating indexes..."
  kubectl exec -it $POD -- mongo --eval "db = db.getSiblingDB('ustrending'); printjson(db.zipcodes.createIndex({geometry: '2dsphere' }))"
else
  echo "MongoDB pod is not found or running. Please ensure it is running, and try again..."
fi