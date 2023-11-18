# This is a sample shell script
folder_path="./client"

if [ -d "$folder_path" ]; then
   
   cd "$folder_path"

   npm start
else
    echo "Not valid"
fi       
