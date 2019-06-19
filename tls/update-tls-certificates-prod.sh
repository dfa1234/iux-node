#!/bin/bash

# sudo certbot renew

# copy keys

export PATH_KEY=/etc/letsencrypt/live/dev.iaskin.fr

sudo cp ${PATH_KEY}/privkey.pem ./privkey.pem
sudo cp ${PATH_KEY}/fullchain.pem ./fullchain.pem
sudo cp ${PATH_KEY}/chain.pem ./chain.pem
sudo cp ${PATH_KEY}/cert.pem ./cert.pem

