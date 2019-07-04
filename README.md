# iux-node

How to setup on server (debian/ubuntu)  
Install node 10 LTS, and yarn, then:

```bash

yarn global add typescript ts-node pm2
#add export PATH="$PATH:$(yarn global bin)" to your ~/.bash_profile or ~/.bashrc or whatever
pm2 install typescript
```

In your repo now:
```
cd iux-node
cp config.ts.sample config.ts
nano config.ts
#setup config
yarn
#setup certbot then
./tls/update-tls-certificates-prod.sh
pm2 start index
pm2 log
```
