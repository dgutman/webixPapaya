# webixPapaya
Integration Demo using Papaya.js and Webix


## Getting started

### Installing node through nvm (node version manager):
* https://github.com/creationix/nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

### Source nvm:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

### install node using nvm:
nvm install stable

### install npm and nodejs:
* https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
wget -qO- https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install nodejs

### initialize repo (within repository):
npm init

### install webix with npm:
npm install --save webix

### install jquery with npm:
npm install --save jquery

### Run app (within githib repository):
http-server -a localhost -p 8080 -c-1
