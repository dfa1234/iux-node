# iux-node

How to setup on server (debian/ubuntu)
Install node 10 LTS, and yarn, then:

```bash
cd iux-node
cp config.ts.sample config.ts
nano config.ts
#setup config
yarn global add typescript ts-node pm2
#add export PATH="$PATH:$(yarn global bin)" to your ~/.bash_profile or ~/.bashrc or whatever
pm2 install typescript
yarn
cd tls
./update-tls-certificates-prod.sh
cd ../
pm2 start index
pm2 log
```
