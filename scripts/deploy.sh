cd ./$1
docker run --privileged --rm tonistiigi/binfmt --install all
docker build --no-cache --platform=linux/arm64 -f Dockerfile -t $1:latest .
docker save $1:latest -o $1.tar
echo "$SSH_KEY" > key.pem
chmod 600 key.pem
scp -o StrictHostKeyChecking=no -i key.pem -P 500 ./$1.tar $USERNAME@$HOSTNAME:~
ssh -o StrictHostKeyChecking=no -i key.pem -p 500 $USERNAME@$HOSTNAME "
    cd ~
    sudo docker stop $1
    sudo docker rm $1
    sudo docker rmi $1:latest
    sudo chmod 777 $1.tar
    sudo docker load -i $1.tar
    sudo docker run -d -p 4000:4000 --name $1 --restart unless-stopped $1:latest
    sudo rm -f ./$1.tar
"
rm -f key.pem
rm -f ./$1.tar