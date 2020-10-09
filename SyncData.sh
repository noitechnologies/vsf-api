# This command requires "jq" -> https://stedolan.github.io/jq/
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed. Please download it from https://stedolan.github.io/jq/' >&2
  exit 1  
fi

echo "Starting import........."

cd $1

if [ $4 = 'all' ]; then

  cd var

  apiUrl="${2}products?productStoreId=${3}"
  curl -X GET $apiUrl -H 'authorization: Basic YXBpLnVzZXI6Iyojc2FsZGlzdEAxMjM='   -H 'cache-control: no-cache'   -H 'content-type: application/json' | jq ".data[]" | jq  -M \ > catalog_product.json
  sed -i 's/"null"/null/g' catalog_product.json

  apiUrl="${2}attributes?productStoreId=${3}"
  curl -X GET $apiUrl -H 'authorization: Basic YXBpLnVzZXI6Iyojc2FsZGlzdEAxMjM='   -H 'cache-control: no-cache'   -H 'content-type: application/json' | jq ".data[]" | jq  -M \ > catalog_attribute.json
  sed -i 's/"null"/null/g' catalog_attribute.json

  apiUrl="${2}categories?productStoreId=${3}"
  curl -X GET $apiUrl -H 'authorization: Basic YXBpLnVzZXI6Iyojc2FsZGlzdEAxMjM='   -H 'cache-control: no-cache'   -H 'content-type: application/json' | jq ".data[]" | jq  -M \ > catalog_category.json
  sed -i 's/"null"/null/g' catalog_category.json

  apiUrl="${2}reviews?productStoreId=${3}"
  curl -X GET $apiUrl -H 'authorization: Basic YXBpLnVzZXI6Iyojc2FsZGlzdEAxMjM='   -H 'cache-control: no-cache'   -H 'content-type: application/json' | jq ".data[]" | jq  -M \ > catalog_review.json
  sed -i 's/"null"/null/g' catalog_review.json

  cd ..

  echo "Dumping all into Elastic Server"

  yarn restore

 else

  cd var
  if [ $4 = 'product' ]; then
    if [ ! -z "$5" ]; then 
      apiUrl="${2}products?productStoreId=${3}&productId=${5}"
    else
      apiUrl="${2}products?productStoreId=${3}"
    fi
  fi

  if [ $4 = 'category' ]; then
    if [ ! -z "$5" ]; then 
      apiUrl="${2}categories?productStoreId=${3}&productCategoryId=${5}"
    else
      apiUrl="${2}categories?productStoreId=${3}"
    fi
  fi

  if [ $4 = 'review' ]; then
    if [ ! -z "$5" ]; then
      echo "product review id is not empty" 
      apiUrl="${2}reviews?productStoreId=${3}&productReviewId=${5}"
    else
      echo "product review id is empty"
      apiUrl="${2}reviews?productStoreId=${3}"
    fi
  fi
  
  curl -X GET $apiUrl -H 'authorization: Basic YXBpLnVzZXI6Iyojc2FsZGlzdEAxMjM='   -H 'cache-control: no-cache'   -H 'content-type: application/json' | jq ".data[]" | jq  -M \ > catalog_$4.json
  sed -i 's/"null"/null/g' catalog_$4.json
  cd ..
  echo "Dumping data into Elastic Server"
  yarn restore-$4

fi

echo "Imported Successfully........."