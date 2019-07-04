# iux-node

How to setup on server (debian/ubuntu)  
Install node 10 LTS, and yarn.
For yarn do not forget to add 
export PATH="$PATH:$(yarn global bin)" 
to your ~/.bash_profile or ~/.bashrc or whatever


In your repo now:
```bash
cd iux-node
cp config.ts.sample config.ts
nano config.ts
#setup config
yarn
#after creating certificates with certbot, in your repo:
cd tls
./update-tls-certificates-prod.sh
cd ../
#For managing the server now:
yarn pm2-start
yarn pm2-log
yarn pm2-restart
yarn pm2-stop
```
