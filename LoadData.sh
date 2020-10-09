# This command requires "jq" -> https://stedolan.github.io/jq/
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed. Please download it from https://stedolan.github.io/jq/' >&2
  exit 1
fi

echo "Starting import........."

cd $1

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

echo "Dumping data into Elastic Server"

cd ..

yarn restore

echo "Imported Successfully........."