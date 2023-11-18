#!/bin/bash

folder_path1="./ui"

if [ -d "$folder_path1" ]; then
   
   cd "$folder_path1"

   ./node_modules/.bin/tsc --watch
else
    echo "Issue in ui (monorepo)"
fi 


folder_path2="./api"

if [ -d "$folder_path2" ]; then
   
   cd "$folder_path2"

   ./node_modules/.bin/tsc --watch
else
    echo "Unable to convert api ts to js"
fi 

folder_path3="./api"

if [ -d "$folder_path3" ]; then
   
   cd "$folder_path3"

   npm run script1
else
    echo "Unable to run script1"
fi 

folder_path4="./ui"

if [ -d "$folder_path4" ]; then
   
   cd "$folder_path4"

   npm run script2
else
    echo "Unable to run script2"
fi 


folder_path5="./ui"

if [ -d "$folder_path5" ]; then
   
   cd "$folder_path5"

   npm start
else
    echo "Client Couldn't be started"
fi 

