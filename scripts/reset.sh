#!/bin/bash
echo "Destroying database"
mysql -u root -p -e 'drop database souschef';
echo "Creating new database"
mysql -u root -p -e 'create database souschef';
echo "Making tables"
node ../bookshelf.js &
sleep 2
echo "Hopefully that was enough time, killing node process"
killall node
echo "Creating functions and procedures"
mysql souschef < score.sql
